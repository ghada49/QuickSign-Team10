from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import cv2, numpy as np, os, tempfile, mediapipe as mp

mp_drawing  = mp.solutions.drawing_utils
mp_holistic = mp.solutions.holistic
mp_face_mesh = mp.solutions.face_mesh

actions = [
    '0088','0095','0115','0125','0131','0157','0159','0160','0161','0162',
    '0171','0172','0173','0174','0175','0176','0177','0178','0184','0187',
    '0195','0196','0197','0255','0256','0260','0287','0288','0289','0293'
]

# ---- keypoint extraction (unchanged) ----
def _safe_xy(lmk):
    return (getattr(lmk, 'x', 0.0), getattr(lmk, 'y', 0.0))

def extract_keypoints(results):
    POSE_NOSE, POSE_LEFT_EYE_OUTER, POSE_RIGHT_EYE_OUTER = 0, 3, 6
    if results.pose_landmarks:
        pose_lm = results.pose_landmarks.landmark
        le_x, le_y = _safe_xy(pose_lm[POSE_LEFT_EYE_OUTER])
        re_x, re_y = _safe_xy(pose_lm[POSE_RIGHT_EYE_OUTER])
        nose_x, nose_y = _safe_xy(pose_lm[POSE_NOSE])
        fc_x = (le_x + re_x)/2.0 if (le_x or re_x) else nose_x
        fc_y = (le_y + re_y)/2.0 if (le_y or re_y) else nose_y
        face_scale = np.hypot(le_x - re_x, le_y - re_y) or 1e-3
    else:
        pose_lm = []
        fc_x = fc_y = 0.0
        face_scale = 1e-3

    def norm_xy(arr):
        arr = arr.copy()
        arr[:,0] = (arr[:,0] - fc_x) / face_scale
        arr[:,1] = (arr[:,1] - fc_y) / face_scale
        return arr

    if results.pose_landmarks:
        pose_xyz = np.array([[l.x, l.y, l.z] for l in results.pose_landmarks.landmark], dtype=np.float32)
        pose_xyz = norm_xy(pose_xyz)
        pose_vis = np.array([[l.visibility] for l in results.pose_landmarks.landmark], dtype=np.float32)
        pose = np.concatenate([pose_xyz, pose_vis], axis=1).flatten()
    else:
        pose = np.zeros(33*4, dtype=np.float32)

    lh_raw = np.array([[l.x, l.y, l.z] for l in results.left_hand_landmarks.landmark], dtype=np.float32) if results.left_hand_landmarks else np.zeros((21,3), dtype=np.float32)
    rh_raw = np.array([[l.x, l.y, l.z] for l in results.right_hand_landmarks.landmark], dtype=np.float32) if results.right_hand_landmarks else np.zeros((21,3), dtype=np.float32)

    lh = norm_xy(lh_raw).flatten()
    rh = norm_xy(rh_raw).flatten()
    return np.concatenate([pose, lh, rh]).astype(np.float32)

# ---- prediction from bytes ----
def predict_from_bytes(video_bytes, model, actions, seq_len=60, flip_try=True):
    buf = np.frombuffer(video_bytes, dtype=np.uint8)

    # Write to a temp file (must close before cv2.VideoCapture)
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(buf)
        tmp.flush()
        path = tmp.name

    def process(path, do_flip=False):
        seq = []
        cap = cv2.VideoCapture(path)
        with mp_holistic.Holistic(
            static_image_mode=False,  # use video mode
            model_complexity=1,
            smooth_landmarks=True,
            refine_face_landmarks=False
        ) as hol:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                if do_flip:
                    frame = cv2.flip(frame, 1)

                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = hol.process(image)

                key = extract_keypoints(results)
                seq.append(key)
                if len(seq) >= seq_len:
                    break
        cap.release()

        if not seq:
            return None

        if len(seq) < seq_len:
            seq.extend([seq[-1]] * (seq_len - len(seq)))

        X = np.expand_dims(np.array(seq[:seq_len], dtype=np.float32), axis=0)
        print("size of X:", X.shape)
        return model.predict(X, verbose=0)[0]

    p1 = process(path, do_flip=False)
    p2 = process(path, do_flip=True) if flip_try else None

    os.remove(path)  # cleanup

    if p1 is None and p2 is None:
        return "Too short", 0.0, None

    probs = p1 if (p2 is None or p1.max() >= p2.max()) else p2
    idx = int(np.argmax(probs))
    pred_word = actions[idx]
    conf = float(probs[idx])

    if conf < 0.3:
        pred_word = "unknown"

    return pred_word, conf, probs

# ---- Flask app ----
app = Flask(__name__)
model = load_model("Model - 93.32% Training Acc - 94.16% Testing Acc.h5")

@app.route("/predict", methods=["POST"])
def predict():
    video_bytes = request.files["video"].read()
    print(f"Received video: {len(video_bytes) / (1024*1024):.2f} MB")

    pred_word, prob, _ = predict_from_bytes(video_bytes, model, actions)

    mapping = {
        "0088":"قلب","0095":"حروق","0115":"صداع","0125":"تساقط الشعر","0131":"حكة / هرش",
        "0157":"مناعة","0159":"معافى","0160":"يأكل","0161":"يشرب","0162":"ينام",
        "0171":"يبني","0172":"يكسر","0173":"يمشي","0174":"يحب","0175":"يكره",
        "0176":"يشوي","0177":"يحرث","0178":"يزرع","0184":"يدعم","0187":"يتنامى",
        "0195":"أب","0196":"أم","0197":"أخت","0255":"تعب","0256":"بكاء","0260":"ثقيل",
        "0287":"يسار","0288":"يمين","0289":"مرحبا","0293":"شكراً"
    }
    pred_word = mapping.get(pred_word, pred_word)

    print("Predicted:", pred_word, "conf:", prob)
    return jsonify({"text": pred_word, "confidence": prob})

if __name__ == "__main__":
    app.run(port=6000, debug=True)
