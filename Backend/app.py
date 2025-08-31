import os
import time
import json
import logging
import boto3
import re
import base64
import uuid
from functools import wraps
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError

import requests
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from jose import jwt, JWTError

S3_BUCKET = os.getenv("S3_BUCKET", "quicksign-media")

USERS_BUCKET = "quicksign-media-users"
session = boto3.Session(profile_name="quicksigndev", region_name="eu-north-1")
dynamodb = session.resource("dynamodb")
table = dynamodb.Table("quicksign_no")
table2=dynamodb.Table("Support")


S3_KEY_PATTERNS = [
    "videos/ar/{token}.mp4",            
]
PRESIGN_EXPIRES = int(os.getenv("PRESIGN_EXPIRES", "3600"))

s3 = session.client("s3")


COGNITO_REGION='eu-north-1'
COGNITO_USER_POOL_ID='eu-north-1_6ggq7XgmG'
COGNITO_APP_CLIENT_ID='4d9aeahendp2o0i4o06k7tgo7n'

CORS_ORIGINS= os.getenv("CORS_ORIGINS", "*")
JWKS_CACHE_SECONDS   = int(os.getenv("JWKS_CACHE_SECONDS", "43200"))  # 12h

ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  
if CORS_ORIGINS == "*":
    CORS(app, supports_credentials=False, expose_headers=["Content-Type", "Authorization"])
else:
    origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
    CORS(app, origins=origins, supports_credentials=False, expose_headers=["Content-Type", "Authorization"])

logging.basicConfig(level=logging.INFO)
log = app.logger

# JWKS cache

_jwks_cache: Dict[str, Any] = {"fetched_at": 0, "keys": []}

def _refresh_jwks(force: bool = False) -> None:
    now = int(time.time())
    if force or now - _jwks_cache["fetched_at"] > JWKS_CACHE_SECONDS or not _jwks_cache["keys"]:
        resp = requests.get(JWKS_URL, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        _jwks_cache["keys"] = data.get("keys", [])
        _jwks_cache["fetched_at"] = now
        log.info("JWKS refreshed: %d keys", len(_jwks_cache["keys"]))

def _get_key_for_kid(kid: str) -> Optional[Dict[str, Any]]:
    for k in _jwks_cache.get("keys", []):
        if k.get("kid") == kid:
            return k
    _refresh_jwks(force=True)
    for k in _jwks_cache.get("keys", []):
        if k.get("kid") == kid:
            return k
    return None

from functools import lru_cache

S3_LETTER_PATTERNS = [
    "videos/ar/letters/{token}.mp4",
    "ar/letters/{token}.mp4",
    "letters/{token}.mp4",
]

ALEF_VARIANTS = set("اأإآ")
CHAR_FOLD = {
    "أ": "ا",
    "إ": "ا",
    "آ": "ا",
    "ؤ": "و",
    "ئ": "ي",
    "ى": "ي",
    "ة": "ه",
}

MAX_RETURNED_CLIPS = int(os.getenv("MAX_RETURNED_CLIPS", "200"))

@lru_cache(maxsize=8192)
def _cached_exists(key: str) -> bool:
    try:
        s3.head_object(Bucket=S3_BUCKET, Key=key)
        return True
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code in ("404", "NotFound", "NoSuchKey"):
            return False
        raise 

def _first_existing_key(patterns: list[str], token: str) -> Optional[str]:
    for pattern in patterns:
        key = pattern.format(token=token)
        if _cached_exists(key):
            return key
    return None

def _fold_char(ch: str) -> str:
    return CHAR_FOLD.get(ch, ch)

def _expand_word_to_tokens(word: str) -> list[tuple[str, str]]:
    wk = _first_existing_key(S3_KEY_PATTERNS, word)
    if wk:
        return [(word, wk)]

    out: list[tuple[str, str]] = []
    i, n = 0, len(word)

    if word.startswith("ال"):
        al_key = _first_existing_key(S3_LETTER_PATTERNS, "ال")
        if al_key:
            out.append(("ال", al_key))
            i = 2 

    while i < n:
        ch = word[i]
        if ch == "ل" and i + 1 < n and word[i + 1] in ALEF_VARIANTS:
            la_key = _first_existing_key(S3_LETTER_PATTERNS, "لا")
            if la_key:
                out.append(("لا", la_key))
            else:
                l_key = _first_existing_key(S3_LETTER_PATTERNS, "ل")
                if l_key:
                    out.append(("ل", l_key))
                a_key = _first_existing_key(S3_LETTER_PATTERNS, "ا")
                if a_key:
                    out.append(("ا", a_key))
            i += 2
            continue

        ch = _fold_char(ch)
        if ch == "ء":
            hk = _first_existing_key(S3_LETTER_PATTERNS, "ء")
            if hk:
                out.append(("ء", hk))
            i += 1
            continue
        lk = _first_existing_key(S3_LETTER_PATTERNS, ch)
        if lk:
            out.append((ch, lk))
        i += 1
    return out

class AuthError(Exception):
    def __init__(self, message: str, status: int = 401):
        super().__init__(message)
        self.status = status
        self.message = message

def _extract_bearer(auth_header: str) -> str:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise AuthError("Missing or invalid Authorization header", 401)
    return auth_header.split(" ", 1)[1].strip()

def verify_id_token(token: str) -> Dict[str, Any]:
    try:
        unverified = jwt.get_unverified_header(token)
    except JWTError:
        raise AuthError("Invalid JWT header", 401)

    kid = unverified.get("kid")
    if not kid:
        raise AuthError("Missing kid in token header", 401)

    _refresh_jwks() 
    key = _get_key_for_kid(kid)
    if not key:
        raise AuthError("Unable to find signing key", 401)

    try:
        claims = jwt.decode(
            token,
            key,
            algorithms=[key.get("alg", "RS256")],
            audience=COGNITO_APP_CLIENT_ID,
            issuer=ISSUER,
            options={
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True,
            },
        )
    except JWTError as e:
        raise AuthError(f"JWT verification failed: {str(e)}", 401)

    if claims.get("token_use") != "id":
        raise AuthError("Wrong token_use (expected 'id'). Send the ID token.", 401)

    return claims

def require_jwt(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = _extract_bearer(auth_header)
        claims = verify_id_token(token)
        g.jwt_claims = claims
        return f(*args, **kwargs)
    return wrapper

def profile_from_claims(claims: Dict[str, Any]) -> Dict[str, Any]:
    name = claims.get("name") or claims.get("given_name") or claims.get("cognito:username") or ""
    email = claims.get("email") or ""
    gender = claims.get("gender") or ""
    return {
        "sub": claims.get("sub"),
        "name": name,
        "email": email,
        "gender": gender,
    }

def json_error(message: str, status: int):
    return jsonify({"error": message, "status": status}), status

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "issuer": ISSUER}), 200


@app.route("/me", methods=["GET"])
@require_jwt
def me():
    claims = getattr(g, "jwt_claims", {})
    profile = profile_from_claims(claims)
    return jsonify(profile), 200


@app.route("/saved_phrases", methods=["GET"])
@require_jwt
def saved_phrases():
    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who["sub"]

    item = table.get_item(Key={"users": str(sub)}).get("Item", {})
    out = []
    for entry in item.get("phrases", []):
        rec = {
            "id": entry.get("id") or "", 
            "text": entry.get("text", ""),
            "created": entry.get("created"),
        }
        if entry.get("image_key"):
            rec["image_url"] = _presign(USERS_BUCKET, entry["image_key"])
        out.append(rec)

    out.sort(key=lambda r: r.get("created") or 0, reverse=True)
    return jsonify(out), 200

@app.route("/saved_delete/<item_id>", methods=["DELETE"])
@require_jwt
def saved_delete(item_id):
    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who["sub"]

    item = table.get_item(Key={"users": sub}).get("Item") or {}
    phrases = item.get("phrases", [])

    deleted_phrase = None
    new_phrases = []
    for p in phrases:
        if p.get("id") == item_id:
            deleted_phrase = p
        else:
            new_phrases.append(p)

    if deleted_phrase and deleted_phrase.get("image_key"):
        try:
            s3.delete_object(Bucket=USERS_BUCKET, Key=deleted_phrase["image_key"])
            log.info(f"Deleted image from S3: {deleted_phrase['image_key']}")
        except Exception as e:
            log.error(f"Failed to delete image from S3: {str(e)}")

    if "phrases" in item:
        table.update_item(
            Key={"users": sub},
            UpdateExpression="SET phrases = :p",
            ExpressionAttributeValues={":p": new_phrases},
        )
    else:
        table.put_item(Item={"users": sub, "phrases": new_phrases})

    return jsonify({"status": "ok", "deleted": item_id}), 200


@app.route("/emergency_phrases", methods=["GET"])
@require_jwt
def emergency_phrases():
    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who["sub"]

    item = table.get_item(Key={"users": str(sub)}).get("Item", {})
    em_list = item.get("emergency", [])
    out = []
    for i, entry in enumerate(em_list):
        text = entry.get("text") or ""
        image_key = entry.get("image_key")
        rec = {
            "id": str(i),
            "text": text,
            "created": entry.get("created"),
        }
        if image_key:
            rec["image_url"] = _presign(USERS_BUCKET, image_key)
        out.append(rec)

    out.sort(key=lambda r: r.get("created") or 0, reverse=True)
    return jsonify(out), 200

@app.route("/emergency_delete/<item_id>", methods=["DELETE"])
@require_jwt
def emergency_delete(item_id):
    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who["sub"]

    try:
        item_id_int = int(item_id)
    except ValueError:
        return jsonify({"error": "Invalid item ID"}), 400

    item = table.get_item(Key={"users": sub}).get("Item") or {}
    emergency_list = item.get("emergency", [])

    if item_id_int >= len(emergency_list):
        return jsonify({"error": "Item not found"}), 404

    deleted_item = emergency_list.pop(item_id_int)

    image_key = deleted_item.get("image_key")
    if image_key:
        try:
            s3.delete_object(Bucket=USERS_BUCKET, Key=image_key)
            log.info(f"Deleted emergency image from S3: {image_key}")
        except Exception as e:
            log.error(f"Failed to delete emergency image from S3: {str(e)}")

    if "emergency" in item:
        table.update_item(
            Key={"users": sub},
            UpdateExpression="SET emergency = :e",
            ExpressionAttributeValues={":e": emergency_list},
        )
    else:
        table.put_item(Item={"users": sub, "emergency": emergency_list})

    return jsonify({"status": "ok", "deleted": item_id, "deleted_item": deleted_item}), 200


@app.route("/emergency_add", methods=["POST"])
@require_jwt
def emergency_add():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or payload.get("ar") or "").strip()
    image_b64 = payload.get("image")

    if not text and not image_b64:
        return jsonify({"error": "Provide text and/or image"}), 400

    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who["sub"]

    image_key = None
    if image_b64:
        try:
            if "," in image_b64:
                image_b64 = image_b64.split(",", 1)[1] 
            image_bytes = base64.b64decode(image_b64)
            image_key = f"user_uploads/{sub}/emergency/{uuid.uuid4()}.jpg"
            s3.put_object(
                Bucket=USERS_BUCKET,
                Key=image_key,
                Body=image_bytes,
                ContentType="image/jpeg",
            )
        except Exception as e:
            return jsonify({"error": f"Image upload failed: {str(e)}"}), 500

    new_entry = {"created": int(time.time())}
    if text:
        new_entry["text"] = text
    if image_key:
        new_entry["image_key"] = image_key

    item = table.get_item(Key={"users": sub}).get("Item")
    if item and "emergency" in item:
        table.update_item(
            Key={"users": sub},
            UpdateExpression="SET emergency = list_append(:new, emergency)",
            ExpressionAttributeValues={":new": [new_entry]},
        )
    else:
        if item:
            item["emergency"] = [new_entry]
            table.put_item(Item=item)
        else:
            table.put_item(Item={"users": sub, "emergency": [new_entry]})

    resp = {"status": "ok", "added": new_entry}
    if image_key:
        resp["image_url"] = _presign(USERS_BUCKET, image_key)
    return jsonify(resp), 200

@app.route("/addsaved", methods=["POST"])
@require_jwt 
def addsaved():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()
    image_b64 = payload.get("image")

    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who["sub"]

    image_key = None
    if image_b64:
        try:
            if "," in image_b64:
                image_b64 = image_b64.split(",", 1)[1]
            if not image_b64.strip():
                raise ValueError("Empty image base64")
            image_bytes = base64.b64decode(image_b64)
            image_key = f"user_uploads/{sub}/saved/{uuid.uuid4()}.jpg"
            s3.put_object(
                Bucket=USERS_BUCKET,
                Key=image_key,
                Body=image_bytes,
                ContentType="image/jpeg",
            )
        except Exception as e:
            return jsonify({"error": f"Image upload failed: {str(e)}"}), 500

    new_entry = {
        "id": str(uuid.uuid4()),
        "created": int(time.time()),
    }
    if text:
        new_entry["text"] = text
    if image_key:
        new_entry["image_key"] = image_key

    item = table.get_item(Key={"users": sub}).get("Item")
    if item and "phrases" in item:
        table.update_item(
            Key={"users": sub},
            UpdateExpression="SET phrases = list_append(:new, phrases)",
            ExpressionAttributeValues={":new": [new_entry]},
        )
    else:
        if item:
            item["phrases"] = [new_entry]
            table.put_item(Item=item)
        else:
            table.put_item(Item={"users": sub, "phrases": [new_entry]})

    resp = {"status": "ok", "added": new_entry}
    if image_key:
        resp["image_url"] = _presign(USERS_BUCKET, image_key)
    return jsonify(resp), 200

_AR_DIAC = re.compile(r"[\u064B-\u0652\u0640]")  #cleaning text
_AR_PUNCT = re.compile(r"[^\u0600-\u06FF\s]")   # keep Arabic letters & space

def normalize_ar(text: str) -> str:
    t = _AR_DIAC.sub("", text)
    t = _AR_PUNCT.sub(" ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def _object_exists(bucket: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 404 or e.response.get("Error", {}).get("Code") in ("404", "NotFound", "NoSuchKey"):
            return False
        raise

def _presign(bucket: str, key: str, seconds: int = PRESIGN_EXPIRES) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=seconds,
    )

@app.post("/text-to-sign")
@require_jwt
def text_to_sign():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"videos": []}), 200

    # Normalize input and split into words
    norm = normalize_ar(text)
    words = norm.split()

    results = []
    total = 0
    for w in words:
        pairs = _expand_word_to_tokens(w)  # [(token, key), ...]
        for token, key in pairs:
            url = _presign(S3_BUCKET, key)
            results.append({"token": token, "url": url, "key": key})
            total += 1
            if total >= MAX_RETURNED_CLIPS:
                break
        if total >= MAX_RETURNED_CLIPS:
            break

    return jsonify({"videos": results}), 200

@app.route("/signtoarabic", methods=["POST"])
@require_jwt
def sign_to_arabic():
    who = profile_from_claims(getattr(g, "jwt_claims", {}))
    sub = who['sub']
    print("Received request from:", sub)

    if "video" not in request.files:
        print("No video uploaded")
        return jsonify({"error": "No video uploaded"}), 400

    video_file = request.files["video"]

    video_bytes = video_file.read()
    print(f"Received video bytes: {len(video_bytes)} bytes")

    arabic_text = send_to_ml_model(video_bytes)
    return jsonify({"text": arabic_text}), 200

def send_to_ml_model(video_bytes):
    files = {"video": ("video.mp4", video_bytes)}
    resp = requests.post("http://localhost:6000/predict", files=files)
    print("sent")
    return resp.json()["text"]

@app.route("/contact-support", methods=["POST"])
@require_jwt
def contact_support():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request data"}), 400
        
        name = data.get('name', '')
        email = data.get('email', '')
        subject = data.get('subject', '')
        message = data.get('message', '')
        
        try:
            existing_item = table2.get_item(Key={"email": email}).get("Item")
            
            new_ticket = {
                "subject": subject,
                "message": message,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            if existing_item and "tickets" in existing_item:
                table2.update_item(
                    Key={"email": email},
                    UpdateExpression="SET tickets = list_append(tickets, :new)",
                    ExpressionAttributeValues={":new": [new_ticket]}
                )
            else:
                table2.put_item(Item={
                    "email": email,
                    "name": name,
                    "tickets": [new_ticket]
                })
            
            print(f"Support ticket stored in table2 for email: {email}")
            
        except Exception as e:
            print(f"Failed to store in table2: {str(e)}")
        
        return jsonify({
            "message": "Support ticket submitted successfully"
        }), 200
        
    except Exception as e:
        log.error(f"Error in contact support: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



# Error handlers
@app.errorhandler(AuthError)
def handle_auth_error(e: AuthError):
    log.warning("Auth error: %s", e.message)
    return json_error(e.message, e.status)

@app.errorhandler(400)
def handle_400(e):
    return json_error("Bad Request", 400)

@app.errorhandler(404)
def handle_404(e):
    return json_error("Not Found", 404)

@app.errorhandler(405)
def handle_405(e):
    return json_error("Method Not Allowed", 405)

@app.errorhandler(Exception)
def handle_500(e):
    log.exception("Unhandled error: %s", e)
    return json_error("Internal Server Error", 500)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)