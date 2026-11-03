#!/usr/bin/env python3
"""Analyse le « pattern de montage » d'une vidéo.

Usage : python3 analyse_montage.py VIDEO.mp4 [DOSSIER_SORTIE]

Mesure : coupes et rythme, transitions (coupe sèche, fondu enchaîné, flash, fondu au noir,
glissement), zooms (punch-in, poussée lente), panoramiques, rotations, tremblements,
vitesse du sujet (ralentis / accélérés), arrêts sur image, couleurs par plan, sous-titres
(OCR : texte, position, taille, mots par sous-titre, mot surligné), visages (présence, taille),
son (volume, LUFS), tempo et calage des coupes sur les temps, voix (segments, pauses, débit
estimé), baisse de la musique sous la voix, effets sonores et leur synchronisation, indice
d'intensité. Écrit pattern.json, rapport.md et timeline.png.
"""
import sys, os, json, math, subprocess, tempfile
import numpy as np, cv2

VIDEO = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
os.makedirs(OUT, exist_ok=True)

cap = cv2.VideoCapture(VIDEO)
FPS = cap.get(cv2.CAP_PROP_FPS) or 30
W0 = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H0 = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
AW = 640; AH = int(round(H0 * AW / W0)); SC = W0 / AW            # résolution d'analyse et facteur d'échelle

try:
    import pytesseract, shutil
    if not shutil.which('tesseract'):                       # Windows : emplacement d'installation habituel
        for cand in [r'C:\Program Files\Tesseract-OCR\tesseract.exe', r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe']:
            if os.path.exists(cand): pytesseract.pytesseract.tesseract_cmd = cand
    _langs = pytesseract.get_languages(config='')
    OCR_LANG = '+'.join(l for l in ('eng', 'fra') if l in _langs) or 'eng'
    HAS_OCR = True
except Exception:
    HAS_OCR = False
    print('⚠️  Tesseract introuvable : les sous-titres ne seront pas lus (voir README).')
FACE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml') if hasattr(cv2, 'CascadeClassifier') else None

# ---------------------------------------------------------------------------
# 1. Passage image par image
# ---------------------------------------------------------------------------
def hsv_hist(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1], None, [30, 16], [0, 180, 0, 256]); cv2.normalize(h, h, 1, 0, cv2.NORM_L1)
    return h

def estimate(pg, cg):
    """Mouvement global entre deux images : matrice 2x3 (zoom, rotation, translation) et part de points cohérents."""
    pts = []
    gh, gw = pg.shape[0] // 4, pg.shape[1] // 4
    for gy in range(4):
        for gx in range(4):
            q = cv2.goodFeaturesToTrack(pg[gy * gh:(gy + 1) * gh, gx * gw:(gx + 1) * gw], 50, 0.02, 6)
            if q is not None: pts.append(q + np.float32([gx * gw, gy * gh]))
    p0 = np.concatenate(pts).astype(np.float32) if pts else None
    if p0 is not None and len(p0) >= 20:
        p1, st, _ = cv2.calcOpticalFlowPyrLK(pg, cg, p0, None, winSize=(21, 21), maxLevel=4)
        g = st.ravel() == 1
        if g.sum() >= 20:
            M, inl = cv2.estimateAffinePartial2D(p0[g], p1[g], method=cv2.RANSAC, ransacReprojThreshold=1.5)
            if M is not None and inl.sum() >= 0.35 * len(p0):
                a, b = p0[g].reshape(-1, 2), p1[g].reshape(-1, 2)
                res = b - (a @ M[:, :2].T + M[:, 2])
                mag = np.linalg.norm(res, axis=1)
                mov = mag[mag > 1.2]
                frac = len(mov) / len(mag)
                subj = float(np.median(mov)) if len(mov) >= 4 and 0.01 < frac < 0.5 else 0.0
                return M, float(inl.sum() / len(p0)), subj
    orb = cv2.ORB_create(2000)
    k1, d1 = orb.detectAndCompute(pg, None); k2, d2 = orb.detectAndCompute(cg, None)
    if d1 is not None and d2 is not None and len(k1) > 30 and len(k2) > 30:
        m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2)
        if len(m) > 30:
            a = np.float32([k1[x.queryIdx].pt for x in m]); b = np.float32([k2[x.trainIdx].pt for x in m])
            M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.5)
            if M is not None and inl.sum() >= max(30, 0.2 * len(m)):
                return M, float(inl.sum() / len(m)), 0.0
    return None, 0.0, 0.0

def ncc(a, b):
    a = a.astype(np.float32) - a.mean(); b = b.astype(np.float32) - b.mean()
    d = math.sqrt(float((a * a).sum() * (b * b).sum())) + 1e-6
    return float((a * b).sum() / d)

def text_boxes(bgr):
    """Zones candidates de texte incrusté (fort contraste, forme allongée)."""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    grad = cv2.morphologyEx(g, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
    _, bw = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    bw = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (max(9, W0 // 60), 3)))
    cnts, _ = cv2.findContours(bw, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bs = [cv2.boundingRect(c) for c in cnts]
    bs = [b for b in bs if 0.025 * H0 < b[3] < 0.2 * H0 and b[2] > 0.4 * b[3]]
    bs.sort(key=lambda b: (b[1], b[0]))
    lines = []
    for b in sorted(bs, key=lambda b: b[0]):
        for L in lines:
            if abs((L[1] + L[3] / 2) - (b[1] + b[3] / 2)) < 0.4 * max(L[3], b[3]) and b[0] - (L[0] + L[2]) < 1.5 * max(L[3], b[3]):
                x1, y1 = min(L[0], b[0]), min(L[1], b[1]); x2, y2 = max(L[0] + L[2], b[0] + b[2]), max(L[1] + L[3], b[1] + b[3])
                L[:] = [x1, y1, x2 - x1, y2 - y1]; break
        else:
            lines.append(list(b))
    out = [tuple(L) for L in lines if L[2] > 0.8 * L[3] and L[2] < 0.95 * W0 and g[L[1]:L[1] + L[3], L[0]:L[0] + L[2]].std() > 45]
    return sorted(out, key=lambda b: -b[2] * b[3])[:5]

COLOR_NAMES = [(0, 'rouge'), (15, 'orange'), (30, 'jaune'), (60, 'vert'), (90, 'cyan'), (120, 'bleu'), (150, 'violet'), (175, 'rouge')]
def hue_name(h):
    return min(COLOR_NAMES, key=lambda c: min(abs(c[0] - h), 180 - abs(c[0] - h)))[1]

def ocr_caption(bgr, box):
    x, y, w, h = box
    pad = int(h * 0.25)
    crop = bgr[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad]
    if crop.size == 0: return None
    g = cv2.resize(crop.max(axis=2), None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    _, b1 = cv2.threshold(g, 170, 255, cv2.THRESH_BINARY_INV)          # texte clair (blanc ou coloré) sur contour sombre
    d = pytesseract.image_to_data(b1, lang=OCR_LANG, config='--psm 7', output_type=pytesseract.Output.DICT)
    words = [(d['text'][i].strip(), int(float(d['conf'][i])), d['left'][i] // 2, d['width'][i] // 2) for i in range(len(d['text'])) if d['text'][i].strip()]
    words = [w for w in words if w[1] > 55 and sum(ch.isalnum() for ch in w[0]) >= max(1, len(w[0]) // 2)]
    if not words: return None
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    hi_idx, hi_col = None, None
    for i, (t, _, lx, lw) in enumerate(words):
        sub = hsv[:, max(0, lx):lx + lw]
        sat = (sub[..., 1] > 110) & (sub[..., 2] > 150)
        if sat.mean() > 0.12:
            hi_idx, hi_col = i, hue_name(float(np.median(sub[..., 0][sat])))
    return dict(text=' '.join(w[0] for w in words), n_words=len(words), highlight_word=words[hi_idx][0] if hi_idx is not None else None, highlight_color=hi_col)

rows = []; grays = []; hists = []
prev = None; prev_bgr = None; n = 0
cap_samples = []; face_samples = []
last_cap_sig = None; last_cap_res = None
while True:
    ok, fr = cap.read()
    if not ok: break
    small = cv2.resize(fr, (AW, AH), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    h = hsv_hist(small)
    r = dict(f=n, luma=float(g.mean()), contrast=float(g.std()), sat=float(hsv[..., 1].mean()),
             warm=float(small[..., 2].astype(np.float32).mean() - small[..., 0].astype(np.float32).mean()),
             hue_x=float((np.cos(hsv[..., 0] * np.pi / 90) * hsv[..., 1]).mean()), hue_y=float((np.sin(hsv[..., 0] * np.pi / 90) * hsv[..., 1]).mean()))
    if prev is not None:
        ad = cv2.absdiff(g, prev)
        r['diff'] = float(ad.mean()); r['chg'] = float((ad > 12).mean())
        r['hd'] = float(cv2.compareHist(hists[-1], h, cv2.HISTCMP_BHATTACHARYYA))
        M, inl, subj = estimate(prev, g)
        r['inl'] = inl; r['subj'] = subj * SC
        if M is not None:
            warped = cv2.warpAffine(prev, M, (AW, AH))
            mask = cv2.warpAffine(np.ones_like(prev), M, (AW, AH)) > 0
            r['ncc_comp'] = ncc(warped[mask], g[mask]) if mask.sum() > 1000 else 0.0
            r['cover'] = float(mask.mean())
            r['M'] = M.tolist()
        else:
            r['ncc_comp'] = ncc(prev, g); r['M'] = None; r['cover'] = 0.0
        r['ncc_raw'] = ncc(prev, g)
    else:
        r.update(diff=0, chg=0, hd=0, inl=1, subj=0, ncc_comp=1, ncc_raw=1, M=None, cover=1.0)
    # sous-titres (une image sur 3)
    if HAS_OCR and n % 3 == 0:
        boxes = text_boxes(fr)
        found = []
        for b in boxes:
            x, y, w, hh = b
            sig = (n // 3, round(y / 8))
            res = ocr_caption(fr, b)
            if res: found.append(dict(f=n, box=b, **res))
        cap_samples.extend(found)
    if n % 3 == 0 and FACE is not None:
        faces = FACE.detectMultiScale(g, 1.1, 8, minSize=(40, 40))
        ycc = cv2.cvtColor(small, cv2.COLOR_BGR2YCrCb)
        faces = [q for q in faces if (cv2.inRange(ycc[q[1]:q[1] + q[3], q[0]:q[0] + q[2]], (0, 135, 85), (255, 175, 130)) > 0).mean() > 0.3]
        if len(faces):
            x, y, w, hh = max(faces, key=lambda q: q[2] * q[3])
            face_samples.append(dict(f=n, area_pct=100 * w * hh / (AW * AH), cx=(x + w / 2) / AW * 100, cy=(y + hh / 2) / AH * 100))
        else:
            face_samples.append(dict(f=n, area_pct=0))
    rows.append(r); grays.append(g); hists.append(h); prev = g; n += 1
NF = n
T = lambda f: round(f / FPS, 2)

# ---------------------------------------------------------------------------
# 2. Transitions et coupes
# ---------------------------------------------------------------------------
luma = np.array([r['luma'] for r in rows]); cstd = np.array([r['contrast'] for r in rows])
diff = np.array([r['diff'] for r in rows]); hd = np.array([r['hd'] for r in rows])
ncc_c = np.array([r['ncc_comp'] for r in rows]); ncc_r = np.array([r['ncc_raw'] for r in rows])
flash = (luma > 225) & (cstd < 15)
black = (luma < 18) & (cstd < 10)
# image « de rupture » : contenu inexpliqué par un mouvement de caméra
brk = np.zeros(NF, bool)
for k in range(1, NF):
    if flash[k] or black[k] or flash[k - 1] or black[k - 1]: brk[k] = True
    elif ncc_c[k] < 0.55: brk[k] = True
    elif rows[k].get('M') and abs(math.log(math.hypot(rows[k]['M'][0][0], rows[k]['M'][1][0]))) > math.log(1.25): brk[k] = True
# changements progressifs (fondus) : petite variation continue de l'histogramme
grad = np.zeros(NF, bool)
for k in range(1, NF):
    if 0.012 < hd[k] and ncc_c[k] < 0.995 and not brk[k]: grad[k] = True
def runs(mask):
    out = []; k = 0
    while k < NF:
        if mask[k]:
            a = k
            while k + 1 < NF and mask[k + 1]: k += 1
            out.append((a, k))
        k += 1
    return out
events = []
used = np.zeros(NF, bool)
# fondus enchaînés : séquence d'images qui sont un mélange des images avant / après
for a, b in runs(grad | brk):
    if b - a + 1 < 3: continue
    A = grays[max(0, a - 1)].astype(np.float32); B = grays[min(NF - 1, b + 1)].astype(np.float32)
    D = A - B; dd = float((D * D).sum())
    if dd < 1e5: continue
    al, rs = [], []
    for k in range(a, b + 1):
        f = grays[k].astype(np.float32)
        x = float(((f - B) * D).sum() / dd); al.append(x)
        rs.append(float(np.abs(f - (x * A + (1 - x) * B)).mean() / (np.abs(D).mean() + 1e-6)))
    if np.mean(rs) < 0.2 and al[0] > al[-1] + 0.4 and not flash[a:b + 1].any():
        def blend_ok(k, A0, B0):
            f = grays[k].astype(np.float32); D0 = A0 - B0; d0 = float((D0 * D0).sum())
            x = float(((f - B0) * D0).sum() / d0)
            return 0.03 < x < 0.97 and np.abs(f - (x * A0 + (1 - x) * B0)).mean() / (np.abs(D0).mean() + 1e-6) < 0.2
        for _ in range(30):
            A0 = grays[max(0, a - 2)].astype(np.float32); B0 = grays[min(NF - 1, b + 1)].astype(np.float32)
            if a > 1 and blend_ok(a - 1, A0, B0): a -= 1
            else: break
        for _ in range(30):
            A0 = grays[max(0, a - 1)].astype(np.float32); B0 = grays[min(NF - 1, b + 2)].astype(np.float32)
            if b < NF - 2 and blend_ok(b + 1, A0, B0): b += 1
            else: break
        events.append(dict(type='fondu enchaîné', start_s=T(a), dur_frames=b - a + 1, dur_s=round((b - a + 1) / FPS, 2)))
        used[a:b + 1] = True
# flashs et fondus au noir
for m, name in [(flash, 'flash blanc'), (black, 'fondu au noir')]:
    for a, b in runs(m):
        events.append(dict(type=name, start_s=T(a), dur_frames=b - a + 1, dur_s=round((b - a + 1) / FPS, 2)))
        used[max(0, a - 1):b + 2] = True
# glissements : plusieurs ruptures consécutives où l'image précédente se décale latéralement
for a, b in runs(brk & ~used):
    if b - a + 1 >= 3:
        A = grays[max(0, a - 1)].astype(np.float32); shifts = []
        for k in range(a, b + 1):
            f = grays[k].astype(np.float32); best = (1e9, 0)
            for s in range(-AW + 16, AW - 16, 4):
                if s >= 0: e = np.abs(f[:, :AW - s] - A[:, s:]).mean() if s < AW - 16 else 1e9
                else: e = np.abs(f[:, -s:] - A[:, :AW + s]).mean()
                if e < best[0]: best = (e, s)
            shifts.append(best[1])
        if all(abs(s) > 8 for s in shifts) and (np.all(np.diff(shifts) > 0) or np.all(np.diff(shifts) < 0)):
            events.append(dict(type='glissement', start_s=T(a), dur_frames=b - a + 1, dur_s=round((b - a + 1) / FPS, 2),
                               direction='vers la gauche' if shifts[-1] > 0 else 'vers la droite'))
            used[a:b + 1] = True
tx_full = np.array([abs(r['M'][0][2]) * SC if r.get('M') else 0 for r in rows])
cover = np.array([r.get('cover', 1.0) for r in rows])
whip = (tx_full > 0.04 * W0) & (cover < 0.97) & ~used
for a, b in runs(whip):
    if b - a + 1 >= 3:
        sgn = np.sign(sum(rows[k]['M'][0][2] for k in range(a, b + 1)))
        events.append(dict(type='glissement', start_s=T(a), dur_frames=b - a + 1, dur_s=round((b - a + 1) / FPS, 2),
                           direction='vers la gauche' if sgn < 0 else 'vers la droite'))
        used[max(0, a - 1):b + 2] = True
# coupes sèches : ruptures isolées restantes
for a, b in runs(brk & ~used):
    for k in range(a, b + 1):
        events.append(dict(type='coupe sèche', start_s=T(k), dur_frames=0, dur_s=0)); used[k] = True
events.sort(key=lambda e: e['start_s'])
cut_times = [e['start_s'] for e in events]

# plans
bounds = [0]
for e in events:
    a = int(round(e['start_s'] * FPS)); b = a + max(1, e['dur_frames'])
    bounds += [a, b]
bounds.append(NF); bounds = sorted(set(bounds))
shots = []
for i in range(len(bounds) - 1):
    a, b = bounds[i], bounds[i + 1]
    if b - a < 3 or used[a:b].mean() > 0.5: continue
    sl = rows[a:b]
    hx = np.mean([r['hue_x'] for r in sl]); hy = np.mean([r['hue_y'] for r in sl])
    hue = (math.degrees(math.atan2(hy, hx)) % 360) / 2
    warm = np.mean([r['warm'] for r in sl]); sat = np.mean([r['sat'] for r in sl])
    shots.append(dict(start_s=T(a), end_s=T(b), dur_s=round((b - a) / FPS, 2),
                      luminosite=round(float(np.mean(luma[a:b])) / 2.55), contraste=round(float(np.mean(cstd[a:b])) / 2.55),
                      saturation=round(sat / 2.55), teinte=hue_name(hue) if sat > 40 else 'neutre',
                      temperature='chaude' if warm > 15 else 'froide' if warm < -15 else 'neutre', _a=a, _b=b))
durs = [s['dur_s'] for s in shots]

# ---------------------------------------------------------------------------
# 3. Mouvements dans chaque plan
# ---------------------------------------------------------------------------
moves = []
for s in shots:
    a, b = s['_a'], s['_b']
    Ms = [rows[k]['M'] for k in range(a + 1, b)]
    if any(m is None for m in Ms) or len(Ms) < 10: continue
    Ms = [np.vstack([np.array(m), [0, 0, 1]]) for m in Ms]
    sc = np.array([math.hypot(m[0, 0], m[1, 0]) for m in Ms])
    rot = np.array([math.degrees(math.atan2(m[1, 0], m[0, 0])) for m in Ms])
    tx = np.array([m[0, 2] for m in Ms]) * SC; ty = np.array([m[1, 2] for m in Ms]) * SC
    # zoom compensé du décalage induit par le zoom autour du centre
    ztx = tx - (1 - sc) * W0 / 2 * 0; zty = ty
    def segs(mask, minlen=2):
        return [(i, j) for i, j in runs_local(mask) if j - i + 1 >= minlen]
    def runs_local(mask):
        out = []; k = 0
        while k < len(mask):
            if mask[k]:
                i = k
                while k + 1 < len(mask) and mask[k + 1]: k += 1
                out.append((i, k))
            k += 1
        return out
    # zooms
    scs = np.convolve(np.pad(sc - 1, 4, mode='edge'), np.ones(9) / 9, 'valid')
    fast = np.abs(sc - 1) > 0.005
    near_fast = np.convolve(fast.astype(float), np.ones(9), 'same') > 0
    slow = (np.abs(scs) > 0.0004) & ~near_fast
    zm = fast | slow
    zoom_ok = np.zeros_like(fast)
    for i, j in segs(fast, 2) + segs(slow, 12):
        stepv = np.abs(sc[i:j + 1] - 1); tot = float(np.prod(sc[i:j + 1]))
        if abs(tot - 1) < 0.02: continue
        zoom_ok[i:j + 1] = True
        A = np.eye(3)
        for m in Ms[i:j + 1]: A = m @ A
        tgt = np.linalg.inv(A) @ np.array([AW / 2, AH / 2, 1])
        prog = np.cumsum(stepv) / stepv.sum(); half = int(np.argmax(prog >= 0.5)) + 1; L = j - i + 1
        moves.append(dict(type='punch-in' if L <= 10 and tot > 1 else 'dézoom rapide' if L <= 10 else 'poussée lente' if tot > 1 else 'recul lent',
                          start_s=T(a + 1 + i), dur_frames=L, dur_s=round(L / FPS, 2), zoom_pct=round((tot - 1) * 100, 1),
                          vitesse_max_pct_par_image=round(float(stepv.max()) * 100, 1),
                          courbe='freine à la fin (ease-out)' if half / L <= 0.45 else 'constante' if half / L < 0.6 else 'accélère (ease-in)',
                          point_vise_pct=[round(float(tgt[0]) / AW * 100), round(float(tgt[1]) / AH * 100)]))
    # rotations
    rm = np.abs(rot) > 0.04
    for i, j in segs(rm, 4):
        tot = float(rot[i:j + 1].sum())
        if abs(tot) >= 1:
            moves.append(dict(type='rotation', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2), degres=round(tot, 1)))
    # panoramiques (déplacement lent régulier) et tremblements (oscillation rapide)
    px = np.cumsum(tx); py = np.cumsum(ty)
    k5 = np.ones(7) / 7
    sx = np.convolve(np.pad(px, 3, mode='edge'), k5, 'valid'); sy = np.convolve(np.pad(py, 3, mode='edge'), k5, 'valid')
    rx, ry = px - sx, py - sy
    rms = np.sqrt(np.convolve(rx ** 2 + ry ** 2, np.ones(7) / 7, 'same'))
    rmask = np.abs(rot) > 0.04
    shk = (rms > 2.0) & ~zm & ~rmask
    shk_ok = np.zeros_like(shk)
    for i, j in segs(shk, 6):
        i2, j2 = i, j
        zc = np.sum(np.diff(np.sign(rx[i:j + 1])) != 0) + np.sum(np.diff(np.sign(ry[i:j + 1])) != 0)
        if zc < 0.6 * (j - i + 1): continue
        X = px[i2:j2 + 1] - np.polyval(np.polyfit(np.arange(j2 - i2 + 1), px[i2:j2 + 1], 1), np.arange(j2 - i2 + 1))
        Y = py[i2:j2 + 1] - np.polyval(np.polyfit(np.arange(j2 - i2 + 1), py[i2:j2 + 1], 1), np.arange(j2 - i2 + 1))
        amp = float(max(X.std(), Y.std()) * math.sqrt(2))
        spec = np.abs(np.fft.rfft(np.hanning(len(X)) * X, n=256)); fr = np.fft.rfftfreq(256, 1 / FPS)
        if amp < 1.5 or fr[np.argmax(spec[1:]) + 1] < 4: continue
        shk_ok[i:j + 1] = True
        moves.append(dict(type='tremblement', start_s=T(a + 1 + i2), dur_s=round((j2 - i2 + 1) / FPS, 2), amplitude_px=round(amp, 1),
                          frequence_hz=round(float(fr[np.argmax(spec[1:]) + 1]), 1)))
    pan = np.hypot(np.convolve(tx, k5, 'same'), np.convolve(ty, k5, 'same'))
    pm = (pan > 1.2) & ~shk_ok & ~zoom_ok & ~rmask
    for i, j in segs(pm, 8):
        dx, dy = float(tx[i:j + 1].sum()), float(ty[i:j + 1].sum())
        if math.hypot(dx, dy) > 0.04 * H0:
            moves.append(dict(type='panoramique', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2), deplacement_px=[round(dx), round(dy)],
                              part_de_l_ecran_pct=round(math.hypot(dx, dy) / H0 * 100)))
    # vitesse du sujet (objets qui bougent dans le plan) et arrêts sur image
    subj = np.array([rows[k]['subj'] for k in range(a + 1, b)])
    chg = np.array([rows[k]['chg'] for k in range(a + 1, b)])
    still = chg < 0.0003
    cam = np.hypot(tx, ty) + np.abs(sc - 1) * W0 + np.abs(rot) * 10
    for i, j in segs(still, 6):
        before = subj[max(0, i - 15):i]; camb = cam[max(0, i - 15):i]
        if len(before) and np.median(before) > 1.5 and np.mean(camb) < 1.0:
            moves.append(dict(type='arrêt sur image', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2)))
    act = subj > 1.5
    if act.sum() > 20:
        sm = np.array([np.median(subj[max(0, k - 4):k + 5][act[max(0, k - 4):k + 5]]) if act[max(0, k - 4):k + 5].any() else 0 for k in range(len(subj))])
        levels = []; k = 0
        while k < len(sm):
            if sm[k] > 1.5:
                i = k
                while k + 1 < len(sm) and sm[k + 1] > 1.5 and abs(sm[k + 1] - np.median(sm[i:k + 1])) / np.median(sm[i:k + 1]) < 0.3: k += 1
                if k - i >= 8 and np.median(subj[i:k + 1]) > 1.5: levels.append((i, k, float(np.median(subj[i:k + 1]))))
            k += 1
        for (i1, j1, v1), (i2, j2, v2) in zip(levels, levels[1:]):
            ratio = v2 / v1
            if ratio < 0.7 or ratio > 1.4:
                moves.append(dict(type='ralenti' if ratio < 1 else 'accéléré', start_s=T(a + 1 + i2), vitesse_avant_px_img=round(v1, 1),
                                  vitesse_apres_px_img=round(v2, 1), facteur=round(ratio, 2)))
moves.sort(key=lambda m: m['start_s'])
for s in shots: s.pop('_a'); s.pop('_b')

# ---------------------------------------------------------------------------
# 4. Sous-titres et visages
# ---------------------------------------------------------------------------
captions = []
for smp in cap_samples:
    if captions and captions[-1]['text'] == smp['text'] and smp['f'] - captions[-1]['_last'] <= 6:
        captions[-1]['_last'] = smp['f']; continue
    x, y, w, hh = smp['box']
    captions.append(dict(text=smp['text'], start_s=T(smp['f']), _last=smp['f'], mots=smp['n_words'],
                         mot_surligne=smp['highlight_word'], couleur_surlignage=smp['highlight_color'],
                         centre_x_pct=round((x + w / 2) / W0 * 100), centre_y_pct=round((y + hh / 2) / H0 * 100), hauteur_pct=round(hh / H0 * 100, 1)))
for c in captions:
    c['dur_s'] = round((c.pop('_last') + 3) / FPS - c['start_s'], 2)
captions = [c for c in captions if c['dur_s'] >= 0.15]
face_on = [s for s in face_samples if s['area_pct'] > 0]
face_runs = []
for s in face_samples:
    on = s['area_pct'] > 0
    if on and face_runs and s['f'] - face_runs[-1][1] <= 6: face_runs[-1][1] = s['f']
    elif on: face_runs.append([s['f'], s['f']])
faces = dict(present_s=[[T(a), T(b + 3)] for a, b in face_runs if b - a >= 6],
             taille_moyenne_pct_ecran=round(float(np.mean([s['area_pct'] for s in face_on])), 1) if face_on else 0,
             position_moyenne_pct=[round(float(np.mean([s['cx'] for s in face_on]))), round(float(np.mean([s['cy'] for s in face_on])))] if face_on else None)

# ---------------------------------------------------------------------------
# 5. Son
# ---------------------------------------------------------------------------
import librosa, pyloudnorm
from scipy.signal import find_peaks
tmp = tempfile.mktemp(suffix='.wav')
rc = subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', VIDEO, '-vn', '-ac', '1', '-ar', '22050', tmp]).returncode
if rc == 0 and os.path.exists(tmp):
    y, SR = librosa.load(tmp, sr=22050); os.remove(tmp)
else:
    y, SR = np.zeros(10), 22050                     # vidéo sans piste son
audio = {}
if len(y) > SR and np.abs(y).max() > 1e-4:
    audio['lufs_integre'] = round(float(pyloudnorm.Meter(SR).integrated_loudness(y)), 1)
    hop = 512; S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)) ** 2; freqs = librosa.fft_frequencies(sr=SR, n_fft=2048)
    tt = librosa.frames_to_time(np.arange(S.shape[1]), sr=SR, hop_length=hop)
    band = lambda lo, hi: S[(freqs >= lo) & (freqs < hi)].sum(0)
    db = lambda x: 10 * np.log10(x + 1e-12)
    rms_db = db(S.sum(0) / S.shape[0])
    # voix : énergie 300-3400 Hz modulée au rythme des syllabes
    vb = band(300, 3400); vdb = db(vb)
    vth = np.percentile(vdb, 20) + 12
    Sv = S[(freqs >= 300) & (freqs < 3400)]
    flat = np.exp(np.log(Sv + 1e-12).mean(0)) / (Sv.mean(0) + 1e-12)
    von = np.convolve(((vdb > vth) & (flat < 0.15)).astype(float), np.ones(5) / 5, 'same') > 0.5
    vseg = []; k = 0
    while k < len(von):
        if von[k]:
            i = k
            while k + 1 < len(von) and von[k + 1]: k += 1
            vseg.append([float(tt[i]), float(tt[k])])
        k += 1
    vseg = [v for v in vseg if v[1] - v[0] >= 0.1]          # on ignore les clics très courts
    merged = []
    for a, b in vseg:
        if merged and a - merged[-1][1] < 0.25: merged[-1][1] = b
        else: merged.append([a, b])
    vseg = [[round(a, 2), round(b, 2)] for a, b in merged if b - a > 0.3]
    pauses = [round(vseg[i + 1][0] - vseg[i][1], 2) for i in range(len(vseg) - 1)]
    # effets sonores : attaques dans les aigus (> 4 kHz), au-dessus du bruit de fond
    hb = db(band(4000, 11000)); flux = np.maximum(0, np.diff(hb, prepend=hb[0]))
    pk, _ = find_peaks(np.convolve(hb, np.ones(3) / 3, 'same'), prominence=15, distance=int(0.25 * SR / hop))
    lo = db(band(20, 120)); lon = np.maximum(0, np.diff(lo, prepend=lo[0]))
    lpk, _ = find_peaks(lon, height=10, distance=int(0.2 * SR / hop))
    # tempo à partir des basses (composante percussive)
    perc = librosa.effects.percussive(y)
    oenv = librosa.onset.onset_strength(y=perc, sr=SR, hop_length=hop, fmax=200)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=SR, hop_length=hop)
    beat_t = librosa.frames_to_time(beats, sr=SR, hop_length=hop)
    ac = np.correlate(oenv - oenv.mean(), oenv - oenv.mean(), 'full')[len(oenv) - 1:]
    fps_a = SR / hop; lo_l, hi_l = int(0.3 * fps_a), int(1.2 * fps_a)
    from scipy.signal import find_peaks as _fp
    cands, _ = _fp(ac[lo_l:hi_l]); cands = cands + lo_l
    L0 = int(min([c for c in cands if ac[c] >= 0.8 * ac[cands].max()], default=lo_l + int(np.argmax(ac[lo_l:hi_l]))))
    if 1 <= L0 < len(ac) - 1:
        d = (ac[L0 - 1] - ac[L0 + 1]) / (2 * (ac[L0 - 1] - 2 * ac[L0] + ac[L0 + 1]) + 1e-9); L0 = L0 + d
    period = L0 / fps_a; tempo = 60 / period
    ph = np.arange(0, period, 1 / fps_a)
    score = [oenv[np.clip(np.round((p + np.arange(0, len(y) / SR, period)) * fps_a).astype(int), 0, len(oenv) - 1)].sum() for p in ph]
    beat_t = ph[int(np.argmax(score))] + np.arange(0, len(y) / SR, period)
    sfx = []
    hb_floor = np.percentile(hb, 99) - 15
    for p in pk:
        if hb[p] < hb_floor: continue
        t0 = float(tt[p]); w = (tt > t0 - 0.2) & (tt < t0 + 0.3)
        low = float(db(band(20, 120)[w].mean())); high = float(db(band(4000, 11000)[w].mean()))
        if len(beat_t) and np.min(np.abs(beat_t - t0)) < 0.04 and high < low: continue
        sfx.append(dict(t=round(t0, 2), type='impact grave (boum)' if low - high > 12 else 'souffle (whoosh)'))
    lvl = lon[lpk] if len(lpk) else np.array([0.0])
    for p in lpk:
        t0 = float(tt[p])
        if len(beat_t) and np.min(np.abs(beat_t - t0)) < 0.05 and lon[p] < 14: continue
        if not any(abs(s['t'] - t0) < 0.25 for s in sfx): sfx.append(dict(t=round(t0, 2), type='impact grave (boum)'))
    sfx.sort(key=lambda s: s['t'])
    vis_events = [(e['start_s'], e['type']) for e in events] + [(m['start_s'], m['type']) for m in moves if m['type'] in ('punch-in', 'dézoom rapide')]
    for s in sfx:
        near = [v for v in vis_events if abs(v[0] - s['t']) <= 0.2]
        s['synchronise_avec'] = near[0][1] if near else None
    # baisse de la musique sous la voix (basses 30-150 Hz), hors effets sonores
    mus = db(band(30, 150)); vm = np.zeros_like(tt, bool)
    for a, b in vseg: vm |= (tt >= a + 0.1) & (tt <= b - 0.1)
    away = np.ones_like(tt, bool)
    for s in sfx: away &= np.abs(tt - s['t']) > 0.6
    edge = np.ones_like(tt, bool)
    for a, b in vseg: edge &= (np.abs(tt - a) > 0.3) & (np.abs(tt - b) > 0.3)
    m_in = mus[vm & away & edge]; m_out = mus[~vm & away & edge]
    ducking = round(float(np.median(m_out) - np.median(m_in)), 1) if len(m_in) > 20 and len(m_out) > 20 else None
    # débit : noyaux syllabiques dans la bande de la voix
    env = np.convolve(vb, np.ones(3) / 3, 'same')
    sp, _ = find_peaks(db(env), prominence=6, distance=int(0.12 * SR / hop))
    in_v = [p for p in sp if any(a <= tt[p] <= b for a, b in vseg)]
    vdur = sum(b - a for a, b in vseg)
    syl = len(in_v) / vdur if vdur > 0 else 0
    hard = [e['start_s'] for e in events if e['type'] == 'coupe sèche']
    on_beat = [c for c in hard if len(beat_t) and np.min(np.abs(beat_t - c)) <= 2 / FPS]
    audio.update(dict(
        tempo_bpm=round(tempo), temps_s=[round(float(b), 2) for b in beat_t[:8]] + (['…'] if len(beat_t) > 8 else []),
        coupes_sur_le_temps=f"{len(on_beat)} coupes sèches sur {len(hard)}", hasard_attendu_pct=round(min(100, 2 * 2 / FPS / (60 / tempo) * 100)) if tempo else None,
        voix_segments_s=vseg, pauses_s=pauses, pause_moyenne_s=round(float(np.mean(pauses)), 2) if pauses else None,
        syllabes_par_s=round(syl, 1), mots_par_min_estimes=round(syl * 60 / 1.5) if syl else None,
        baisse_musique_sous_voix_db=ducking, effets_sonores=sfx,
        volume_db_par_seconde=[round(float(np.mean(rms_db[(tt >= s) & (tt < s + 1)])), 1) for s in range(int(tt[-1]))]))
else:
    audio['silence'] = True
    beat_t = np.array([]); rms_db = None

# ---------------------------------------------------------------------------
# 6. Indice d'intensité (0-100 par seconde) et synthèse
# ---------------------------------------------------------------------------
secs = int(NF / FPS)
cuts_ps = np.array([sum(1 for c in cut_times if s <= c < s + 1) for s in range(secs)], float)
mot = np.array([np.mean([abs(math.log(max(1e-3, math.hypot(r['M'][0][0], r['M'][1][0])))) * 100 + math.hypot(r['M'][0][2], r['M'][1][2]) * SC / 10
                         if r.get('M') else 3 for r in rows[int(s * FPS):int((s + 1) * FPS)]]) for s in range(secs)])
vol = np.zeros(secs); _v = audio.get('volume_db_par_seconde', [])[:secs]; vol[:len(_v)] = _v
norm = lambda v: (v - v.min()) / (v.max() - v.min() + 1e-9)
intensity = np.round(100 * (0.45 * norm(cuts_ps) + 0.35 * norm(mot) + 0.2 * norm(vol))).astype(int).tolist()

pattern = dict(
    video=os.path.basename(VIDEO), duree_s=round(NF / FPS, 2), fps=round(FPS, 2), resolution=[W0, H0],
    rythme=dict(nombre_de_plans=len(shots), duree_moyenne_plan_s=round(float(np.mean(durs)), 2) if durs else None,
                duree_mediane_plan_s=round(float(np.median(durs)), 2) if durs else None,
                plans_par_minute=round(len(shots) / (NF / FPS) * 60, 1)),
    transitions=events, plans=shots, mouvements=moves, sous_titres=captions,
    sous_titres_resume=dict(nombre=len(captions), mots_par_sous_titre=round(float(np.mean([c['mots'] for c in captions])), 1) if captions else None,
                            duree_moyenne_s=round(float(np.mean([c['dur_s'] for c in captions])), 2) if captions else None,
                            position_y_pct=round(float(np.median([c['centre_y_pct'] for c in captions]))) if captions else None,
                            hauteur_texte_pct=round(float(np.median([c['hauteur_pct'] for c in captions])), 1) if captions else None,
                            couleur_surlignage=max(set(c['couleur_surlignage'] for c in captions if c['couleur_surlignage']), key=lambda x: sum(1 for c in captions if c['couleur_surlignage'] == x)) if any(c['couleur_surlignage'] for c in captions) else None),
    visages=faces, son=audio, intensite_par_seconde=intensity)
json.dump(pattern, open(os.path.join(OUT, 'pattern.json'), 'w'), indent=2, ensure_ascii=False)
if os.environ.get('DEBUG'): json.dump([{k: v for k, v in r.items()} for r in rows], open(os.path.join(OUT, 'rows.json'), 'w'))

# ---------------------------------------------------------------------------
# 7. Frise visuelle
# ---------------------------------------------------------------------------
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
fig, ax = plt.subplots(5, 1, figsize=(14, 9), dpi=100, sharex=True, gridspec_kw=dict(height_ratios=[1.2, 1, 1, 1, 1]))
dur = NF / FPS
for s in shots: ax[0].axvspan(s['start_s'], s['end_s'], color=plt.cm.tab20(hash(s['teinte'] + s['temperature']) % 20), alpha=.5)
for e in events: ax[0].axvline(e['start_s'], color='k', lw=1.5); ax[0].text(e['start_s'], 1.02, e['type'], rotation=40, fontsize=7, va='bottom')
ax[0].set_ylim(0, 1); ax[0].set_yticks([]); ax[0].set_ylabel('Plans')
z = [1.0]
for r in rows[1:]: z.append(z[-1] * (math.hypot(r['M'][0][0], r['M'][1][0]) if r.get('M') else 1) if r['ncc_comp'] >= 0.55 else 1.0)
ax[1].plot(np.arange(NF) / FPS, np.array(z) * 100, color='#1d2b4f'); ax[1].set_ylabel('Zoom %')
for m in moves:
    if m['type'] in ('tremblement', 'rotation', 'panoramique', 'ralenti', 'accéléré', 'arrêt sur image'):
        ax[1].annotate(m['type'], (m['start_s'], 100), fontsize=7, color='#e2574c')
for c in captions: ax[2].broken_barh([(c['start_s'], c['dur_s'])], (0, 1), color='#ffd166'); ax[2].text(c['start_s'], 0.3, c['text'], fontsize=6)
for a, b in faces['present_s']: ax[2].broken_barh([(a, b - a)], (1.2, 0.6), color='#5aa9ff')
ax[2].set_yticks([0.5, 1.5]); ax[2].set_yticklabels(['sous-titres', 'visage']); ax[2].set_ylim(0, 2)
if 'volume_db_par_seconde' in audio:
    ax[3].plot(np.arange(len(audio['volume_db_par_seconde'])) + .5, audio['volume_db_par_seconde'], color='#2a9d8f')
    for a, b in audio['voix_segments_s']: ax[3].axvspan(a, b, color='#2a9d8f', alpha=.15)
    for b in beat_t: ax[3].axvline(b, color='#999', lw=.4)
    for s in audio['effets_sonores']: ax[3].plot(s['t'], max(audio['volume_db_par_seconde']), 'v', color='#e2574c')
ax[3].set_ylabel('Son (dB)\nzones = voix')
ax[4].bar(np.arange(len(intensity)) + .5, intensity, color='#ff8a3d'); ax[4].set_ylabel('Intensité'); ax[4].set_xlabel('Temps (s)')
plt.tight_layout(); plt.savefig(os.path.join(OUT, 'timeline.png'))

# ---------------------------------------------------------------------------
# 8. Rapport lisible
# ---------------------------------------------------------------------------
L = [f"# Pattern de montage : {pattern['video']}", '', f"Durée {pattern['duree_s']} s · {len(shots)} plans · {pattern['rythme']['plans_par_minute']} plans/min · plan moyen {pattern['rythme']['duree_moyenne_plan_s']} s (médiane {pattern['rythme']['duree_mediane_plan_s']} s)", '',
     '## Transitions', '| Temps | Type | Durée |', '|---|---|---|']
L += [f"| {e['start_s']} s | {e['type']}{' ' + e.get('direction', '') if e.get('direction') else ''} | {e['dur_frames']} images |" for e in events]
L += ['', '## Mouvements', '| Temps | Type | Détails |', '|---|---|---|']
for m in moves:
    det = ', '.join(f"{k} : {v}" for k, v in m.items() if k not in ('type', 'start_s'))
    L.append(f"| {m['start_s']} s | {m['type']} | {det} |")
L += ['', '## Plans (couleurs)', '| Début | Durée | Luminosité | Contraste | Saturation | Teinte | Température |', '|---|---|---|---|---|---|---|']
L += [f"| {s['start_s']} s | {s['dur_s']} s | {s['luminosite']} % | {s['contraste']} % | {s['saturation']} % | {s['teinte']} | {s['temperature']} |" for s in shots]
st = pattern['sous_titres_resume']
L += ['', '## Sous-titres', f"{st['nombre']} sous-titres · {st['mots_par_sous_titre']} mots en moyenne · {st['duree_moyenne_s']} s chacun · centre à {st['position_y_pct']} % de la hauteur · texte haut de {st['hauteur_texte_pct']} % · surlignage : {st['couleur_surlignage']}", '']
L += [f"- {c['start_s']} s : « {c['text']} »" + (f" (mot surligné : {c['mot_surligne']}, {c['couleur_surlignage']})" if c['mot_surligne'] else '') for c in captions]
L += ['', '## Visages', f"Présents : {faces['present_s']} · taille moyenne {faces['taille_moyenne_pct_ecran']} % de l'écran · position moyenne {faces['position_moyenne_pct']} (en % de l'écran)"]
if 'tempo_bpm' in audio:
    L += ['', '## Son', f"- Volume intégré : {audio['lufs_integre']} LUFS",
          f"- Tempo : {audio['tempo_bpm']} BPM · coupes sur le temps : {audio['coupes_sur_le_temps']} (au hasard, on en attendrait ≈ {audio['hasard_attendu_pct']} %)",
          f"- Voix : {len(audio['voix_segments_s'])} passages · pauses {audio['pauses_s']} s (moyenne {audio['pause_moyenne_s']} s)",
          f"- Débit estimé : {audio['syllabes_par_s']} syllabes/s ≈ {audio['mots_par_min_estimes']} mots/min (estimation sans transcription)",
          f"- Baisse de la musique sous la voix : {audio['baisse_musique_sous_voix_db']} dB (estimation sans séparation des pistes)",
          '- Effets sonores : ' + ', '.join(f"{s['t']} s {s['type']}" + (f" → calé sur {s['synchronise_avec']}" if s['synchronise_avec'] else '') for s in audio['effets_sonores'])]
L += ['', '## Intensité (0-100, par seconde)', ' '.join(str(v) for v in intensity), '', '![frise](timeline.png)']
open(os.path.join(OUT, 'rapport.md'), 'w').write('\n'.join(L))
print('\n'.join(L))
