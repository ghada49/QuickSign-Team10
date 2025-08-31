'''
This is the code we had used to generate the avatar frames from the input video frames (taken from KArSL dataset).
It combines pose detection, face mesh detection, and custom vector graphics drawing to transform human figures into cartoon-like avatars.
This code outputs transparent PNG frames of the avatars.
Then we use FFMPEG to join the output PNGs into a single mp4 video of the specific sign.
We store the generated videos in S3.

In the same folder "Text-to-sign/Samples", we had added sample generated videos for you reference. 
'''
import os
import cv2
import numpy as np
from natsort import natsorted
import mediapipe as mp

UPSCALE     = 3
FPS         = 15
OUTPUT_SIZE = None

WHITE_A     = (255, 255, 255, 255)
NAVY_A      = (255, 0, 0, 255)
YELLOW_A    = (36, 132, 161, 255)
OUTLINE_A   = (0, 0, 0, 255)

HEAD_SCALE  = 1.3
ARM_THICK   = 10
SHOULDER_TH = 10
TORSO_PAD   = 6
SHOULDER_WIDTH_FRAC = 0.85

OUTLINE_BASE = 2

EYE_Y_FRACTION = 0.42
EYE_X_OFFSET   = 0.22
EYE_R_FRACTION = 0.07
PUPIL_R_SCALE  = 0.55
EYE_RING_THICK_FRAC = 0.28

MOUTH_Y_OFFSET_R = 0.22
MOUTH_RX_R       = 0.60
MOUTH_RY_R       = 0.20
MOUTH_SHIFT_X_R  = -0.02
STICK_SMILE_START_DEG = 25
STICK_SMILE_END_DEG   = 155
STICK_MOUTH_THICK_PX  = 2

CIRCULAR_HEAD  = True
HEAD_OUTLINE_PAD = 2

input_folder  = r"C:\Users\HP\Downloads\frames\0260\03_01_0260_(16_09_17_22_06_43)_c"
output_folder = r"avatar_frames1"
os.makedirs(output_folder, exist_ok=True)
image_files = natsorted([f for f in os.listdir(input_folder)
                         if f.lower().endswith(('.jpg', '.png', '.jpeg'))])

mp_holistic = mp.solutions.holistic
mp_face     = mp.solutions.face_mesh

def _bgr_view(img):
    bgr = img[..., :3]
    return (np.ascontiguousarray(bgr), True) if not bgr.flags['C_CONTIGUOUS'] else (bgr, False)

def _alpha_view(img):
    a = img[..., 3]
    return (np.ascontiguousarray(a), True) if not a.flags['C_CONTIGUOUS'] else (a, False)

def _split(color_a):
    return (int(color_a[0]), int(color_a[1]), int(color_a[2])), int(color_a[3])

def line_bgra(img, p1, p2, color_a, thickness, lineType=cv2.LINE_AA):
    thickness = int(thickness)
    bgr, bgr_c = _bgr_view(img); a, a_c = _alpha_view(img)
    bgr_c3, alpha = _split(color_a)
    cv2.line(bgr, p1, p2, bgr_c3, thickness, lineType=lineType)
    cv2.line(a,   p1, p2, alpha,  thickness, lineType=lineType)
    if bgr_c: img[..., :3] = bgr
    if a_c:   img[...,  3] = a

def circle_bgra(img, center, radius, color_a, thickness=-1, lineType=cv2.LINE_AA):
    radius = int(radius); thickness = int(thickness)
    bgr, bgr_c = _bgr_view(img); a, a_c = _alpha_view(img)
    bgr_c3, alpha = _split(color_a)
    cv2.circle(bgr, center, radius, bgr_c3, thickness, lineType=lineType)
    cv2.circle(a,   center, radius, alpha,  thickness, lineType=lineType)
    if bgr_c: img[..., :3] = bgr
    if a_c:   img[...,  3] = a

def ellipse_bgra(img, center, axes, angle, startAngle, endAngle, color_a, thickness=1, lineType=cv2.LINE_AA):
    thickness = int(thickness)
    bgr, bgr_c = _bgr_view(img); a, a_c = _alpha_view(img)
    bgr_c3, alpha = _split(color_a)
    cv2.ellipse(bgr, center, axes, angle, startAngle, endAngle, bgr_c3, thickness, lineType)
    cv2.ellipse(a,   center, axes, angle, startAngle, endAngle, alpha,  thickness, lineType)
    if bgr_c: img[..., :3] = bgr
    if a_c:   img[...,  3] = a

def fill_convex_bgra(img, pts, color_a, lineType=cv2.LINE_AA):
    bgr, bgr_c = _bgr_view(img); a, a_c = _alpha_view(img)
    bgr_c3, alpha = _split(color_a)
    cv2.fillConvexPoly(bgr, pts, bgr_c3, lineType)
    cv2.fillConvexPoly(a,   pts, alpha,  lineType)
    if bgr_c: img[..., :3] = bgr
    if a_c:   img[...,  3] = a

def polylines_bgra(img, pts_list, isClosed, color_a, thickness, lineType=cv2.LINE_AA):
    thickness = int(thickness)
    bgr, bgr_c = _bgr_view(img); a, a_c = _alpha_view(img)
    bgr_c3, alpha = _split(color_a)
    cv2.polylines(bgr, pts_list, isClosed, bgr_c3, thickness, lineType=lineType)
    cv2.polylines(a,   pts_list, isClosed, alpha,  thickness, lineType=lineType)
    if bgr_c: img[..., :3] = bgr
    if a_c:   img[...,  3] = a

def draw_capsule(img, p1, p2, color_a, thickness):
    thickness = int(thickness)
    line_bgra(img, p1, p2, color_a, thickness)
    r = max(2, thickness // 2)
    circle_bgra(img, p1, r, color_a, -1)
    circle_bgra(img, p2, r, color_a, -1)

def draw_capsule_bordered(img, p1, p2, fill_a, outline_a, thickness, outline_extra=0):
    thickness = int(thickness)
    out_th = max(1, thickness + max(2, int(OUTLINE_BASE * UPSCALE)) + int(outline_extra))
    line_bgra(img, p1, p2, outline_a, out_th)
    r_out = max(2, out_th // 2)
    circle_bgra(img, p1, r_out, outline_a, -1)
    circle_bgra(img, p2, r_out, outline_a, -1)
    draw_capsule(img, p1, p2, fill_a, thickness)

def expand_point(a, b, amount):
    ax, ay = a; bx, by = b
    vx, vy = ax - bx, ay - by
    n = (vx*vx + vy*vy) ** 0.5 + 1e-6
    return (int(ax + amount*vx/n), int(ay + amount*vy/n))

def shrink_towards_center(p, center, frac):
    return (int(center[0] + (p[0] - center[0]) * frac),
            int(center[1] + (p[1] - center[1]) * frac))

FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,
             152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10]

def draw_head_circular_v2look(img, face_landmarks, shape):
    h, w = shape[:2]
    lm = face_landmarks.landmark
    oval = np.array([(lm[i].x * w * UPSCALE, lm[i].y * h * UPSCALE) for i in FACE_OVAL], dtype=np.float32)
    center = oval.mean(axis=0)
    if HEAD_SCALE != 1.0:
        v = oval - center
        oval = center + v * float(HEAD_SCALE)
    hull = cv2.convexHull(oval.astype(np.int32))
    x, y, ww, hh = cv2.boundingRect(hull)
    cx = int(x + ww * 0.5)
    cy = int(y + hh * 0.5)
    r  = int(0.5 * max(ww, hh))
    outline_pad = max(2, OUTLINE_BASE * UPSCALE + HEAD_OUTLINE_PAD)
    circle_bgra(img, (cx, cy), r + outline_pad // 2, OUTLINE_A, -1)
    circle_bgra(img, (cx, cy), max(6, r), NAVY_A, -1)
    eye_y  = int(y + hh * EYE_Y_FRACTION)
    ex_off = int(ww * EYE_X_OFFSET)
    Lc = (int(cx - ex_off), eye_y)
    Rc = (int(cx + ex_off), eye_y)
    eye_r   = max(4, int(hh * EYE_R_FRACTION))
    ring_th = max(2, int(eye_r * EYE_RING_THICK_FRAC))
    pupil_r = max(2, int(eye_r - ring_th * 1.15))
    circle_bgra(img, Lc, eye_r, WHITE_A, ring_th)
    circle_bgra(img, Rc, eye_r, WHITE_A, ring_th)
    circle_bgra(img, Lc, pupil_r, OUTLINE_A, -1)
    circle_bgra(img, Rc, pupil_r, OUTLINE_A, -1)
    mouth_th = max(1, int(STICK_MOUTH_THICK_PX * UPSCALE))
    mouth_cx = int(cx + r * MOUTH_SHIFT_X_R)
    mouth_cy = int(cy + r * MOUTH_Y_OFFSET_R)
    mrx      = int(max(3, r * MOUTH_RX_R))
    mry      = int(max(2, r * MOUTH_RY_R))
    ellipse_bgra(img, (mouth_cx, mouth_cy), (mrx, mry),
                 0, STICK_SMILE_START_DEG, STICK_SMILE_END_DEG, OUTLINE_A, mouth_th)
    return (cx, cy, x, y, ww, hh)

def draw_capsule_with_outline(img, p1, p2, inner_color_a, outline_color_a, thickness):
    thickness = int(thickness)
    pad  = max(2, thickness // 3)
    r_in = max(2, thickness // 2)
    line_bgra(img, p1, p2, outline_color_a, thickness + 2*pad)
    circle_bgra(img, p1, r_in + pad, outline_color_a, -1)
    circle_bgra(img, p2, r_in + pad, outline_color_a, -1)
    line_bgra(img, p1, p2, inner_color_a, thickness)
    circle_bgra(img, p1, r_in, inner_color_a, -1)
    circle_bgra(img, p2, r_in, inner_color_a, -1)

def draw_hand_fingers(img, hand_landmarks, shape, upscale, body_scale_ref=300):
    if hand_landmarks is None: return
    def SP(lm): return (int(lm.x * shape[1] * upscale), int(lm.y * shape[0] * upscale))
    base = max(shape[0], shape[1]) * upscale
    palm_th   = max(6,  int(base / body_scale_ref))
    finger_th = max(10, int(base / (body_scale_ref/1.4)))
    pts = [SP(lm) for lm in hand_landmarks.landmark]
    palm_idx  = [0, 5, 9, 13, 17]
    palm_pts  = np.array([pts[i] for i in palm_idx], dtype=np.int32)
    palm_hull = cv2.convexHull(palm_pts)
    fill_convex_bgra(img, palm_hull, YELLOW_A)
    polylines_bgra(img, [palm_hull], True, OUTLINE_A, palm_th)
    chains = [(1,2,3,4),(5,6,7,8),(9,10,11,12),(13,14,15,16),(17,18,19,20)]
    for ch in chains:
        for a, b in zip(ch[:-1], ch[1:]):
            draw_capsule_with_outline(img, pts[a], pts[b], YELLOW_A, OUTLINE_A, finger_th)
    mcp_ids = [5, 9, 13, 17, 1]
    joint_r_in  = max(4, finger_th // 2)
    joint_r_out = joint_r_in + max(2, finger_th // 3)
    for i in mcp_ids:
        cx, cy = pts[i]
        circle_bgra(img, (cx, cy), joint_r_out, OUTLINE_A, -1)
        circle_bgra(img, (cx, cy), joint_r_in,  YELLOW_A,   -1)

with mp_holistic.Holistic(static_image_mode=True) as holistic, \
     mp_face.FaceMesh(static_image_mode=True, refine_landmarks=True, max_num_faces=1) as face_mesh:

    for idx, filename in enumerate(image_files):
        path  = os.path.join(input_folder, filename)
        image = cv2.imread(path)
        if image is None: 
            continue
        h0, w0 = image.shape[:2]
        H, W = h0 * UPSCALE, w0 * UPSCALE
        frameHR = np.zeros((H, W, 4), dtype=np.uint8)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results      = holistic.process(rgb)
        face_results = face_mesh.process(rgb)
        if not results.pose_landmarks:
            continue
        lm = results.pose_landmarks.landmark
        T_arm  = max(6,  ARM_THICK   * UPSCALE)
        T_sh   = max(6,  SHOULDER_TH * UPSCALE)
        pad    = int(TORSO_PAD * UPSCALE)
        outline_th = max(2, OUTLINE_BASE * UPSCALE + 2)
        def L(i):
            h, w = image.shape[:2]
            return (int(lm[i].x * w * UPSCALE), int(lm[i].y * h * UPSCALE))
        l_sh_raw, r_sh_raw = L(mp_holistic.PoseLandmark.LEFT_SHOULDER),  L(mp_holistic.PoseLandmark.RIGHT_SHOULDER)
        l_el, r_el = L(mp_holistic.PoseLandmark.LEFT_ELBOW),             L(mp_holistic.PoseLandmark.RIGHT_ELBOW)
        l_wr, r_wr = L(mp_holistic.PoseLandmark.LEFT_WRIST),             L(mp_holistic.PoseLandmark.RIGHT_WRIST)
        nose       = L(mp_holistic.PoseLandmark.NOSE)
        if hasattr(mp_holistic.PoseLandmark, 'LEFT_HIP'):
            l_hip, r_hip = L(mp_holistic.PoseLandmark.LEFT_HIP), L(mp_holistic.PoseLandmark.RIGHT_HIP)
        else:
            l_hip, r_hip = (l_sh_raw[0], l_sh_raw[1] + 200*UPSCALE), (r_sh_raw[0], r_sh_raw[1] + 200*UPSCALE)
        if face_results.multi_face_landmarks:
            _ = draw_head_circular_v2look(frameHR, face_results.multi_face_landmarks[0], image.shape)
        else:
            r = max(10, int(32 * UPSCALE))
            cx, cy = nose
            outline_pad = max(2, OUTLINE_BASE * UPSCALE + HEAD_OUTLINE_PAD)
            circle_bgra(frameHR, (cx, cy), r + outline_pad // 2, OUTLINE_A, -1)
            circle_bgra(frameHR, (cx, cy), r, NAVY_A, -1)
            x = cx - r; y = cy - r; ww = hh = 2 * r
            eye_y  = int(y + hh * EYE_Y_FRACTION)
            ex_off = int(ww * EYE_X_OFFSET)
            Lc = (int(cx - ex_off), eye_y)
            Rc = (int(cx + ex_off), eye_y)
            eye_r   = max(4, int(hh * EYE_R_FRACTION))
            ring_th = max(2, int(eye_r * EYE_RING_THICK_FRAC))
            pupil_r = max(2, int(eye_r - ring_th * 1.15))
            circle_bgra(frameHR, Lc, eye_r, WHITE_A, ring_th)
            circle_bgra(frameHR, Rc, eye_r, WHITE_A, ring_th)
            circle_bgra(frameHR, Lc, pupil_r, OUTLINE_A, -1)
            circle_bgra(frameHR, Rc, pupil_r, OUTLINE_A, -1)
            mouth_th = max(1, int(STICK_MOUTH_THICK_PX * UPSCALE))
            mouth_cx = int(cx + r * MOUTH_SHIFT_X_R)
            mouth_cy = int(cy + r * MOUTH_Y_OFFSET_R)
            mrx      = int(max(3, r * MOUTH_RX_R))
            mry      = int(max(2, r * MOUTH_RY_R))
            ellipse_bgra(frameHR, (mouth_cx, mouth_cy), (mrx, mry),
                         0, STICK_SMILE_START_DEG, STICK_SMILE_END_DEG, OUTLINE_A, mouth_th)
        cx_sh = (l_sh_raw[0] + r_sh_raw[0]) // 2
        cy_sh = (l_sh_raw[1] + r_sh_raw[1]) // 2
        center_sh = (cx_sh, cy_sh)
        l_sh = shrink_towards_center(l_sh_raw, center_sh, SHOULDER_WIDTH_FRAC)
        r_sh = shrink_towards_center(r_sh_raw, center_sh, SHOULDER_WIDTH_FRAC)
        l_sh_pad = expand_point(l_sh, r_sh, pad)
        r_sh_pad = expand_point(r_sh, l_sh, pad)
        l_hip_pad = (l_hip[0], l_hip[1] + pad)
        r_hip_pad = (r_hip[0], r_hip[1] + pad)
        torso_poly = np.array([l_sh_pad, r_sh_pad, r_hip_pad, l_hip_pad], dtype=np.int32)
        polylines_bgra(frameHR, [torso_poly], True, OUTLINE_A, outline_th)
        fill_convex_bgra(frameHR, torso_poly, NAVY_A)
        draw_capsule_bordered(frameHR, l_sh, r_sh, NAVY_A, OUTLINE_A, T_sh)
        draw_capsule_bordered(frameHR, l_sh, l_el, NAVY_A, OUTLINE_A, T_arm)
        draw_capsule_bordered(frameHR, l_el, l_wr, NAVY_A, OUTLINE_A, T_arm)
        draw_capsule_bordered(frameHR, r_sh, r_el, NAVY_A, OUTLINE_A, T_arm)
        draw_capsule_bordered(frameHR, r_el, r_wr, NAVY_A, OUTLINE_A, T_arm)
        draw_capsule_bordered(frameHR, l_hip, r_hip, NAVY_A, OUTLINE_A, T_sh)
        draw_hand_fingers(frameHR, results.left_hand_landmarks,  image.shape, UPSCALE)
        draw_hand_fingers(frameHR, results.right_hand_landmarks, image.shape, UPSCALE)
        if OUTPUT_SIZE:
            tmp = cv2.resize(frameHR, (w0, h0), interpolation=cv2.INTER_AREA)
            frame = cv2.resize(tmp, OUTPUT_SIZE, interpolation=cv2.INTER_CUBIC)
        else:
            frame = cv2.resize(frameHR, (w0, h0), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(output_folder, f"avatar_{idx:04d}.png"), frame)

print("Transparent PNG frames written to:", output_folder)
