"""Ce qu'il y a dans l'image, plan par plan : personnes, cadrage (gros plan, plan moyen, plan large), geste
(bras levés, poing levé, mains sur la tête…) et expression du visage (sourire, bouche ouverte).
Sert à comprendre le rôle d'un plan (« célébration en gros plan ») et à choisir NOS rushs équivalents.
Modèles MediaPipe (Google), téléchargés par telecharger_modeles.py ; sans eux, cette partie est simplement sautée."""
import os
os.environ.setdefault('GLOG_minloglevel', '2'); os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')
import numpy as np, cv2

MODELS = os.environ.get('MONTAGE_MODELS', os.path.join(os.path.expanduser('~'), '.cache', 'analyse-montage'))
_eng = {}


def _moteurs():
    if _eng: return _eng
    try:
        import mediapipe as mp
        from mediapipe.tasks import python as mpt
        from mediapipe.tasks.python import vision
        B = lambda f: mpt.BaseOptions(model_asset_path=os.path.join(MODELS, f))
        _eng['mp'] = mp
        _eng['det'] = vision.ObjectDetector.create_from_options(vision.ObjectDetectorOptions(base_options=B('efficientdet_lite0.tflite'), score_threshold=0.4, category_allowlist=['person'], max_results=6))
        _eng['pose'] = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(base_options=B('pose_landmarker_full.task'), num_poses=1))
        if os.path.exists(os.path.join(MODELS, 'face_landmarker.task')):
            _eng['face'] = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=B('face_landmarker.task'), output_face_blendshapes=True, num_faces=1))
    except Exception:
        _eng.clear(); _eng['absent'] = True
    else:
        import atexit
        atexit.register(_fermer)
    return _eng


def _fermer():
    for k in ('det', 'pose', 'face'):
        try:
            _eng[k].close(); type(_eng[k]).__del__ = lambda self: None   # évite un message d'erreur sans gravité à la fermeture
        except Exception: pass
    _eng.clear(); _eng['absent'] = True


def disponible():
    return 'absent' not in _moteurs()


def _image(rgb):
    return _eng['mp'].Image(image_format=_eng['mp'].ImageFormat.SRGB, data=np.ascontiguousarray(rgb))


def _geste(L):
    """Geste à partir des points du corps (coordonnées 0-1 dans le cadre de la personne)."""
    vis = lambda i: L[i].visibility > 0.5
    nez, epG, epD, poG, poD = L[0], L[11], L[12], L[15], L[16]
    if not (vis(11) and vis(12)): return None
    ep = (epG.y + epD.y) / 2; larg = abs(epG.x - epD.x) + 1e-6
    haut = [p for i, p in ((15, poG), (16, poD)) if vis(i) and p.y < ep - 0.3 * larg]
    if len(haut) == 2: return 'bras levés (célébration)'
    if len(haut) == 1: return 'poing ou main levée'
    if vis(0):
        pres_tete = [p for i, p in ((15, poG), (16, poD)) if vis(i) and abs(p.y - nez.y) < 0.6 * larg and abs(p.x - nez.x) < 1.0 * larg]
        if len(pres_tete) == 2: return 'mains sur la tête / le visage'
        if len(pres_tete) == 1: return 'main près du visage'
    if vis(15) and vis(16) and abs(poG.x - poD.x) < 0.5 * larg and min(poG.y, poD.y) > ep + 0.5 * larg: return 'bras croisés ou mains jointes'
    return 'debout, neutre'


def _expression(rgb):
    if 'face' not in _eng: return None
    try: r = _eng['face'].detect(_image(rgb))
    except Exception: return None
    if not r.face_blendshapes: return None
    b = {c.category_name: c.score for c in r.face_blendshapes[0]}
    sourire = (b.get('mouthSmileLeft', 0) + b.get('mouthSmileRight', 0)) / 2
    if b.get('jawOpen', 0) > 0.5: return 'bouche grande ouverte (cri, joie)'
    if sourire > 0.5: return 'sourire'
    if (b.get('browDownLeft', 0) + b.get('browDownRight', 0)) / 2 > 0.5: return 'sourcils froncés (concentration, colère)'
    return 'neutre'


def decrire(fr):
    """Description d'une image (BGR)."""
    if not disponible(): return None
    H, W = fr.shape[:2]; rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
    try: dets = _eng['det'].detect(_image(rgb)).detections
    except Exception: return None
    pers = sorted([d.bounding_box for d in dets], key=lambda b: -b.width * b.height)
    out = dict(personnes=len(pers))
    if not pers:
        out['cadrage'] = 'sans personne'; return out
    b = pers[0]; part = b.width * b.height / (W * H); hh = b.height / H
    out['cadrage'] = 'gros plan' if part > 0.45 or hh > 0.95 and b.width / W > 0.5 else 'plan moyen' if part > 0.12 else 'plan large'
    out['sujet_boite_pct'] = [round(b.origin_x / W * 100), round(b.origin_y / H * 100), round(b.width / W * 100), round(b.height / H * 100)]
    m = int(0.15 * max(b.width, b.height))
    x0, y0 = max(0, b.origin_x - m), max(0, b.origin_y - m); x1, y1 = min(W, b.origin_x + b.width + m), min(H, b.origin_y + b.height + m)
    crop = np.ascontiguousarray(rgb[y0:y1, x0:x1])
    if crop.size:
        try:
            p = _eng['pose'].detect(_image(crop))
            if p.pose_landmarks: out['geste'] = _geste(p.pose_landmarks[0])
        except Exception:
            pass
        e = _expression(crop)
        if e: out['expression'] = e
    return out


def par_plan(S, shots):
    """Ajoute 'contenu' à chaque plan (image du milieu du plan)."""
    if not S.get('video') or not disponible(): return shots
    cap = cv2.VideoCapture(S['video'])
    for s in shots:
        a, b = s['_a'], s['_b']
        if b - a < 3: continue
        cap.set(cv2.CAP_PROP_POS_FRAMES, (a + b) // 2); ok, fr = cap.read()
        if not ok: continue
        d = decrire(fr)
        if d: s['contenu'] = d
    return shots
