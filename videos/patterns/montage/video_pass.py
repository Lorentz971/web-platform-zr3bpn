"""Passage image par image : toutes les mesures brutes nécessaires aux analyses."""
import math, os, shutil
import numpy as np, cv2
from .common import ncc

os.environ.setdefault('OMP_THREAD_LIMIT', '1')          # Tesseract plus rapide sur une seule tâche à la fois
try:
    import pytesseract
    if not shutil.which('tesseract'):
        for cand in [r'C:\Program Files\Tesseract-OCR\tesseract.exe', r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe']:
            if os.path.exists(cand): pytesseract.pytesseract.tesseract_cmd = cand
    _langs = pytesseract.get_languages(config='')
    OCR_LANG = '+'.join(l for l in ('eng', 'fra') if l in _langs) or 'eng'
    HAS_OCR = True
except Exception:
    HAS_OCR = False; OCR_LANG = 'eng'


_VIDE = dict(text=[], conf=[], left=[], top=[], width=[], height=[])


def _ocr(img, cfg, timeout=4):
    """Lecture Tesseract avec garde-fous : image limitée en taille, 5 s maximum (une image bruitée peut le bloquer longtemps)."""
    h, w = img.shape[:2]
    if w > 2400:
        k = 2400 / w; img = cv2.resize(img, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        sc = 1 / k
    else: sc = 1.0
    try:
        d = pytesseract.image_to_data(img, lang=OCR_LANG, config=cfg, output_type=pytesseract.Output.DICT, timeout=timeout)
    except RuntimeError:
        return dict(_VIDE)
    if sc != 1.0:
        for key in ('left', 'top', 'width', 'height'): d[key] = [int(v * sc) for v in d[key]]
    return d


def estimate(pg, cg):
    """Mouvement global (zoom, rotation, translation) + points qui bougent autrement (sujets)."""
    pts = []
    gh, gw = pg.shape[0] // 4, pg.shape[1] // 4
    for gy in range(4):
        for gx in range(4):
            q = cv2.goodFeaturesToTrack(pg[gy * gh:(gy + 1) * gh, gx * gw:(gx + 1) * gw], 50, 0.02, 5)
            if q is not None: pts.append(q + np.float32([gx * gw, gy * gh]))
    p0 = np.concatenate(pts).astype(np.float32) if pts else None
    res = dict(M=None, inl=0.0, pts=None, flow=None, resid=None)
    if p0 is not None and len(p0) >= 20:
        p1, st, _ = cv2.calcOpticalFlowPyrLK(pg, cg, p0, None, winSize=(21, 21), maxLevel=4)
        g = st.ravel() == 1
        if g.sum() >= 20:
            a, b = p0[g].reshape(-1, 2), p1[g].reshape(-1, 2)
            res['pts'] = a; res['flow'] = b - a
            M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=1.5)
            if M is not None and inl.sum() >= 0.35 * len(p0):
                res.update(M=M, inl=float(inl.sum() / len(p0)), resid=b - (a @ M[:, :2].T + M[:, 2]))
                return res
    orb = cv2.ORB_create(2000)
    k1, d1 = orb.detectAndCompute(pg, None); k2, d2 = orb.detectAndCompute(cg, None)
    if d1 is not None and d2 is not None and len(k1) > 30 and len(k2) > 30:
        m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2)
        if len(m) > 30:
            a = np.float32([k1[x.queryIdx].pt for x in m]); b = np.float32([k2[x.trainIdx].pt for x in m])
            M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.5)
            if M is not None and inl.sum() >= max(30, 0.2 * len(m)):
                res.update(M=M, inl=float(inl.sum() / len(m)), orb=True)
    return res


def text_bands(fr):
    """Repérage rapide des lignes de texte incrustées : lettres claires bordées de sombre (contour, ombre)
    ou très contrastées sur leur fond. Renvoie des boîtes (x, y, l, h) en pixels de l'image d'origine."""
    H0, W0 = fr.shape[:2]; k = min(1.0, 960 / max(H0, W0))
    sm = cv2.resize(fr, None, fx=k, fy=k, interpolation=cv2.INTER_AREA) if k < 1 else fr
    mx = sm.max(axis=2); mn = sm.min(axis=2); h, w = mx.shape
    bright = (mx > 170) & (mn > 120)
    dark = (mx < 70).astype(np.uint8)
    stroke = bright & (cv2.dilate(dark, np.ones((5, 5), np.uint8)) > 0)
    loc = cv2.blur(mx, (41, 41)).astype(np.int16)
    contrast = bright & (mx.astype(np.int16) - loc > 70)
    out = []
    for m in (stroke, contrast):
        m = m.astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(m, np.ones((3, 3), np.uint8)))
        comps = [st[i] for i in range(1, n) if 0.012 * h < st[i][3] < 0.12 * h and st[i][2] < 0.6 * w and st[i][4] > 0.15 * st[i][2] * st[i][3]]
        lines = []
        for c in sorted(comps, key=lambda c: c[0]):
            x, y, cw, ch = c[:4]
            for L in lines:
                if abs((L[1] + L[3] / 2) - (y + ch / 2)) < 0.35 * max(L[3], ch) and x - (L[0] + L[2]) < 1.2 * max(L[3], ch) and 0.5 < ch / L[4] < 2:
                    x1, y1 = min(L[0], x), min(L[1], y); x2, y2 = max(L[0] + L[2], x + cw), max(L[1] + L[3], y + ch)
                    L[:4] = [x1, y1, x2 - x1, y2 - y1]; L[5] += 1; break
            else:
                lines.append([x, y, cw, ch, ch, 1])
        out += [L for L in lines if L[5] >= 3 and L[2] > 1.5 * L[3]]
    res = []
    for L in sorted(out, key=lambda L: -L[5]):
        b = (int(L[0] / k), int(L[1] / k), int(L[2] / k), int(L[3] / k))
        if not any(abs((b[1] + b[3] / 2) - (r[1] + r[3] / 2)) < 0.5 * max(b[3], r[3]) for r in res): res.append(b)
    return res[:6]


def text_boxes(bgr, W0, H0):
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    grad = cv2.morphologyEx(g, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
    _, bw = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    bw = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (max(9, W0 // 60), 3)))
    cnts, _ = cv2.findContours(bw, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bs = [cv2.boundingRect(c) for c in cnts]
    bs = [b for b in bs if 0.015 * H0 < b[3] < 0.2 * H0 and b[2] > 0.4 * b[3]]
    lines = []
    for b in sorted(bs, key=lambda b: b[0]):
        for L in lines:
            if abs((L[1] + L[3] / 2) - (b[1] + b[3] / 2)) < 0.4 * max(L[3], b[3]) and b[0] - (L[0] + L[2]) < 1.5 * max(L[3], b[3]):
                x1, y1 = min(L[0], b[0]), min(L[1], b[1]); x2, y2 = max(L[0] + L[2], b[0] + b[2]), max(L[1] + L[3], b[1] + b[3])
                L[:] = [x1, y1, x2 - x1, y2 - y1]; break
        else:
            lines.append(list(b))
    out = [tuple(L) for L in lines if L[2] > 0.8 * L[3] and L[2] < 0.97 * W0 and g[L[1]:L[1] + L[3], L[0]:L[0] + L[2]].std() > 45]
    return sorted(out, key=lambda b: -b[2] * b[3])[:6]


def ocr_box(bgr, box):
    x, y, w, h = box
    pad = int(h * 0.25)
    crop = bgr[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad]
    if crop.size == 0: return None
    mx = cv2.resize(crop.max(axis=2), None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    best = None
    for inv in (True, False):                                   # texte clair sur fond sombre, puis l'inverse
        _, b1 = cv2.threshold(mx, 170 if inv else 110, 255, cv2.THRESH_BINARY_INV if inv else cv2.THRESH_BINARY)
        d = _ocr(b1, '--psm 7')
        words = [(d['text'][i].strip(), int(float(d['conf'][i])), d['left'][i] // 2, d['width'][i] // 2) for i in range(len(d['text'])) if d['text'][i].strip()]
        words = [w for w in words if w[1] > 55 and sum(ch.isalnum() for ch in w[0]) >= max(1, len(w[0]) // 2)]
        if words and (best is None or sum(w[1] for w in words) > sum(w[1] for w in best)): best = words
    if not best: return None
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    hi_idx, hi_col = None, None
    from .common import hue_name
    for i, (t, _, lx, lw) in enumerate(best):
        sub = hsv[:, max(0, lx):lx + lw]
        sat = (sub[..., 1] > 110) & (sub[..., 2] > 150)
        if sat.mean() > 0.12: hi_idx, hi_col = i, hue_name(float(np.median(sub[..., 0][sat])))
    text = ' '.join(w[0] for w in best)
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    outline = bool((gray < 40).mean() > 0.08 and (gray > 200).mean() > 0.05)
    letters = [c for c in text if c.isalpha()]
    return dict(text=text, n_words=len(best), highlight_word=best[hi_idx][0] if hi_idx is not None else None, highlight_color=hi_col,
                majuscules=bool(letters) and sum(c.isupper() for c in letters) / len(letters) > 0.8, contour=outline)


def find_text_lines(fr):
    """Repère et lit les mots dans toute l'image (Tesseract, mode « texte épars », sur deux versions de l'image),
    puis les regroupe en lignes. Renvoie [(boîte, [(mot, confiance, x, y, l, h), …]), …]."""
    H0, W0 = fr.shape[:2]; k = min(1.0, 800 / max(H0, W0))
    small = cv2.resize(fr, None, fx=k, fy=k) if k < 1 else fr
    words = []
    for img in (small.max(axis=2), cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)):
        d = _ocr(img, '--psm 11', timeout=3)
        for i in range(len(d['text'])):
            t = d['text'][i].strip(); c = float(d['conf'][i])
            if not t or c < 70: continue
            core = ''.join(ch for ch in t if ch.isalnum() or ch in "'’-")
            if not core or (len(core) == 1 and not (core.isdigit() or core.isupper())) or (len(core) == 1 and c < 90): continue
            box = (d['left'][i] / k, d['top'][i] / k, d['width'][i] / k, d['height'][i] / k)
            for wd in words:                                              # même mot vu dans les deux versions : on garde le meilleur
                ox = min(wd[2] + wd[4], box[0] + box[2]) - max(wd[2], box[0]); oy = min(wd[3] + wd[5], box[1] + box[3]) - max(wd[3], box[1])
                if ox > 0.5 * min(wd[4], box[2]) and oy > 0.5 * min(wd[5], box[3]):
                    if c > wd[1]: words.remove(wd); break
                    else: box = None; break
            if box: words.append((core.strip("-"), c) + box)
    lines = []
    for wd in sorted(words, key=lambda b: b[2]):
        x, y, w, h = wd[2:]
        for L in lines:
            bx = L[0]
            if abs((bx[1] + bx[3] / 2) - (y + h / 2)) < 0.5 * max(bx[3], h) and x - (bx[0] + bx[2]) < 2.0 * max(bx[3], h):
                x1, y1 = min(bx[0], x), min(bx[1], y); x2, y2 = max(bx[0] + bx[2], x + w), max(bx[1] + bx[3], y + h)
                L[0] = [x1, y1, x2 - x1, y2 - y1]; L[1].append(wd); break
        else:
            lines.append([[x, y, w, h], [wd]])
    return [(tuple(int(v) for v in b), ws) for b, ws in lines]


def read_band(fr, box):
    """Relit toute la bande horizontale d'une ligne de texte, en isolant les lettres claires
    (avec ou sans contour noir), et renvoie la meilleure lecture : [(mot, confiance, x, y, l, h)]."""
    H0, W0 = fr.shape[:2]; x, y, w, h = box
    y0, y1 = max(0, int(y - 0.5 * h)), min(H0, int(y + 1.5 * h))
    band = fr[y0:y1]; mx = band.max(axis=2)
    bright = (mx > 170).astype(np.uint8); dark = (mx < 60).astype(np.uint8)
    best = None
    for m in (bright & cv2.dilate(dark, np.ones((7, 7), np.uint8)), bright):
        n, lab, st, _ = cv2.connectedComponentsWithStats(m)
        hs = [st[i][3] for i in range(1, n) if st[i][4] > 20]
        if not hs: continue
        mh = np.median(hs); keep = np.zeros(n, bool)
        for i in range(1, n):
            bx, by, bw, bh, ar = st[i]
            if ar > 20 and 0.4 * mh < bh < 1.8 * mh and by > 0 and by + bh < m.shape[0]: keep[i] = True
        mm = keep[lab].astype(np.uint8)
        img = cv2.resize(255 - mm * 255, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
        d = _ocr(img, '--psm 7')
        ws = []
        for i in range(len(d['text'])):
            t = d['text'][i].strip(); c = float(d['conf'][i])
            core = ''.join(ch for ch in t if ch.isalnum() or ch in "'’-,.!?:")
            if not core or c < 55 or not any(ch.isalnum() for ch in core): continue
            ws.append((core.strip('-'), c, d['left'][i] / 2, y0 + d['top'][i] / 2, d['width'][i] / 2, d['height'][i] / 2))
        if ws:
            sc = np.mean([w_[1] for w_ in ws]) * min(1.0, len(ws) / 3 + 0.5)
            if best is None or sc > best[0]: best = (sc, ws)
    return best[1] if best else []


def describe_line(fr, box, ws):
    """Texte, mot surligné (couleur), majuscules, contour noir."""
    from .common import hue_name
    hsv = cv2.cvtColor(fr, cv2.COLOR_BGR2HSV); gray = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    hi_w, hi_c = None, None
    for t, c, x, y, w, h in ws:
        sub = hsv[int(y):int(y + h), int(x):int(x + w)]
        if sub.size == 0: continue
        sat = (sub[..., 1] > 110) & (sub[..., 2] > 150)
        if sat.mean() > 0.12: hi_w, hi_c = t, hue_name(float(np.median(sub[..., 0][sat])))
    x, y, w, h = box; crop = gray[max(0, y):y + h, max(0, x):x + w]
    text = ' '.join(t for t, *_ in ws); letters = [ch for ch in text if ch.isalpha()]
    return dict(text=text, n_words=len(ws), conf=float(np.mean([c for _, c, *_ in ws])), highlight_word=hi_w, highlight_color=hi_c,
                majuscules=bool(letters) and sum(ch.isupper() for ch in letters) / len(letters) > 0.8,
                contour=bool(crop.size and (crop < 40).mean() > 0.08 and (crop > 200).mean() > 0.05))


try:                                                     # moteur de lecture principal : RapidOCR (modèles PP-OCR, inclus dans le paquet)
    import threading
    from rapidocr_onnxruntime import RapidOCR as _RapidOCR
    _rapid_local = threading.local(); HAS_RAPID = True
except Exception:
    HAS_RAPID = False


def _rapid():
    if not hasattr(_rapid_local, 'eng'): _rapid_local.eng = _RapidOCR()
    return _rapid_local.eng


def _rapid_frame(fr, n):
    """Lecture de toute l'image avec RapidOCR : bien meilleur que Tesseract sur les polices stylisées (contour lumineux,
    lettres espacées ou abîmées, texte sur image chargée)."""
    H0, W0 = fr.shape[:2]; k = min(1.0, 960 / max(H0, W0))
    img = cv2.resize(fr, None, fx=k, fy=k, interpolation=cv2.INTER_AREA) if k < 1 else fr
    try: res, _ = _rapid()(img)
    except Exception: res = None
    pieces = []
    for pts, txt, sc in res or []:
        txt = txt.strip(); conf = float(sc) * 100
        core = ''.join(ch for ch in txt if ch.isalnum())
        if conf < 60 or len(core) < 2: continue
        xs = [p[0] / k for p in pts]; ys = [p[1] / k for p in pts]
        x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
        if (y1 - y0) > 0.25 * H0 or (x1 - x0) < 4: continue
        words = txt.split() or [txt]; tot = sum(len(w) + 1 for w in words); cx = x0
        for w in words:                                  # position approximative de chaque mot (proportionnelle aux lettres)
            ww = (x1 - x0) * (len(w) + 1) / tot
            pieces.append((w, conf, cx, y0, ww * len(w) / (len(w) + 1), y1 - y0)); cx += ww
    # morceaux d'une même ligne (mots lus séparément) : on les regroupe
    lines = []
    for wd in sorted(pieces, key=lambda q: q[2]):
        x, y, w, h = wd[2:]
        for L in lines:
            lx, ly, lw, lh = L[0]
            if abs((ly + lh / 2) - (y + h / 2)) < 0.45 * max(lh, h) and 0.6 < h / lh < 1.6 and x - (lx + lw) < 1.3 * max(lh, h):
                x1_, y1_ = min(lx, x), min(ly, y); x2_, y2_ = max(lx + lw, x + w), max(ly + lh, y + h)
                L[0] = [x1_, y1_, x2_ - x1_, y2_ - y1_]; L[1].append(wd); break
        else:
            lines.append([[x, y, w, h], [wd]])
    from difflib import SequenceMatcher
    norm = lambda t: ''.join(ch for ch in t.upper() if ch.isalnum())
    samples = []
    for (x, y, w, h), ws in lines:
        bb = (int(x), int(y), int(w), int(h))
        txt = ' '.join(q[0] for q in ws)
        if HAS_OCR:                                      # relecture Tesseract : meilleure pour les espaces entre les mots
            tw = read_band(fr, bb)
            if tw and np.mean([q[1] for q in tw]) >= 80 and SequenceMatcher(None, norm(txt), norm(' '.join(q[0] for q in tw))).ratio() >= 0.75:
                ws = [q for q in tw if x - h <= q[2] <= x + w + h] or ws
        r = describe_line(fr, bb, ws)
        wl = [sum(ch.isalnum() for ch in q[0]) for q in ws]
        grand_mot = len(wl) == 1 and wl[0] == 2 and r['conf'] >= 85 and h >= 0.04 * H0 and ws[0][0].isalpha()   # « IS », « ON », « GO » en gros
        grand_mot = grand_mot or (len(wl) == 1 and ws[0][0].strip('.,!?').isdigit() and r['conf'] >= 80 and h >= 0.035 * H0)   # « 1 », « 2 », « 10 » en gros
        if r['conf'] >= 70 and (max(wl) >= 3 or len(wl) >= 2 or grand_mot):
            samples.append(dict(f=n, box=bb, moteur='rapidocr', **r))
    samples += _gros_chiffres(fr, n, [s['box'] for s in samples] + [(int(x), int(y), int(w), int(h)) for (x, y, w, h), _ in lines])
    return dict(bands=[], samples=samples)


def _gros_chiffres(fr, n, deja):
    """Gros chiffres isolés (« 1 », « 2 », « 3 »… pour compter, souvent synchronisés avec les doigts) que la détection de
    texte rate : on cherche les grandes formes blanches isolées et on les lit une par une (Tesseract, chiffres seulement)."""
    if not HAS_OCR: return []
    H0, W0 = fr.shape[:2]; out = []
    m = (fr.min(axis=2) > 200).astype(np.uint8)
    nb, lab, st, _ = cv2.connectedComponentsWithStats(m)
    comps = [tuple(int(v) for v in st[i]) for i in range(1, nb) if 0.03 * H0 < st[i][3] < 0.12 * H0 and 0.2 < st[i][2] / st[i][3] < 1.0 and st[i][4] > 0.2 * st[i][2] * st[i][3]]
    inter = lambda a, b: not (a[0] + a[2] < b[0] or b[0] + b[2] < a[0] or a[1] + a[3] < b[1] or b[1] + b[3] < a[1])
    for x, y, w, h, a in comps[:8]:
        if any(inter((x, y, w, h), d) for d in deja): continue
        voisins = [c for c in comps if c[:2] != (x, y) and abs(c[1] - y) < 0.3 * h and abs(c[0] - x) < 1.6 * h and 0.6 < c[3] / h < 1.5]
        if voisins or x <= 2 or y <= 2 or x + w >= W0 - 2 or y + h >= H0 - 2: continue     # une lettre d'un mot, ou un bord : pas un chiffre isolé
        crop = (m[max(0, y - 6):y + h + 6, max(0, x - 8):x + w + 8] * 255)
        img = cv2.resize(cv2.copyMakeBorder(255 - crop, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=255), None, fx=2, fy=2)
        d = _ocr(img, '--psm 10 -c tessedit_char_whitelist=0123456789', timeout=2)
        ws = [(d['text'][i].strip(), float(d['conf'][i])) for i in range(len(d['text'])) if d['text'][i].strip()]
        if ws and ws[0][0].isdigit() and ws[0][1] >= 85:
            out.append(dict(f=n, box=(x, y, w, h), text=ws[0][0], n_words=1, conf=ws[0][1], highlight_word=None, highlight_color=None,
                            majuscules=False, contour=False, moteur='tesseract-chiffre'))
        if len(out) >= 2: break
    return out


def _ocr_frame(fr, n, full, plan_b):
    """Lecture des textes d'une image (exécutée en parallèle). plan_b : [(boîte, (lecture_précédente, y) ou None)]."""
    H0 = fr.shape[0]
    cands = [(b, [], reuse) for b, reuse in plan_b]
    if full: cands = [(b, ws, None) for b, ws in find_text_lines(fr)] + cands
    seen, bands_out, samples = [], [], []
    for b, ws, reuse in sorted(cands, key=lambda q: -q[0][3]):
        yc = b[1] + b[3] / 2
        if any(abs(yc - z) < 0.6 * b[3] for z in seen): continue
        seen.append(yc)
        if reuse is not None:
            prev = reuse[0].result()['bands']
            ws2 = next((w for y, w in prev if abs(y - reuse[1]) < 1), None)
            if ws2 is None: ws2 = read_band(fr, b) or ws
        else:
            ws2 = read_band(fr, b) or ws
        bands_out.append((yc, ws2))
        if ws2 and not ws and reuse is None and np.mean([w_[1] for w_ in ws2]) < 75: ws2 = []   # zone trouvée par la forme seule : lecture sûre exigée
        if ws2:
            xs = [w_[2] for w_ in ws2]; ys = [w_[3] for w_ in ws2]
            bb = (int(min(xs)), int(min(ys)), int(max(w_[2] + w_[4] for w_ in ws2) - min(xs)), int(max(w_[3] + w_[5] for w_ in ws2) - min(ys)))
            res = describe_line(fr, bb, ws2)
            wl = [sum(ch.isalnum() for ch in t) for t, *_ in ws2]
            plausible = res['conf'] >= 80 and (max(wl) >= 4 or (max(wl) >= 3 and res['conf'] >= 88) or (min(wl) >= 2 and res['conf'] >= 90 and len(wl) >= 2))
            if plausible: samples.append(dict(f=n, box=bb, **res))
    return dict(bands=bands_out, samples=samples)


def scan(video, progress=True):
    cap = cv2.VideoCapture(video)
    FPS = cap.get(cv2.CAP_PROP_FPS) or 30
    W0 = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H0 = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    s = 640 / max(W0, H0); AW, AH = int(round(W0 * s)), int(round(H0 * s)); SC = W0 / AW
    OCR_STEP = int(os.environ.get('MONTAGE_OCR_STEP', max(1, round(FPS / 3))))
    FACE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml') if hasattr(cv2, 'CascadeClassifier') else None
    rows, grays, boxes_all, cap_samples, face_samples = [], [], [], [], []
    prev_bands, ocr_i, ocr_jobs, last_rapid = [], 0, [], None
    from concurrent.futures import ThreadPoolExecutor
    pool = ThreadPoolExecutor(max_workers=max(1, (os.cpu_count() or 2) // (2 if HAS_RAPID else 1)))   # lecture des textes en parallèle des images
    prev = None; prev_hist = None; n = 0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    while True:
        ok, fr = cap.read()
        if not ok: break
        small = cv2.resize(fr, (AW, AH), interpolation=cv2.INTER_AREA)
        g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(small, cv2.COLOR_BGR2LAB).astype(np.float32)
        L = lab[..., 0]; lo, hi = np.percentile(L, 15), np.percentile(L, 85)
        sh = L <= lo; hl = L >= hi
        hh, ww = g.shape
        cy0, cy1, cx0, cx1 = int(hh * .3), int(hh * .7), int(ww * .3), int(ww * .7)
        ch, cw = int(hh * .15), int(ww * .15)
        corners = np.concatenate([g[:ch, :cw].ravel(), g[:ch, -cw:].ravel(), g[-ch:, :cw].ravel(), g[-ch:, -cw:].ravel()])
        mids = np.concatenate([g[:ch, cw:2 * cw].ravel(), g[:ch, -2 * cw:-cw].ravel(), g[-ch:, cw:2 * cw].ravel(), g[-ch:, -2 * cw:-cw].ravel(),
                               g[ch:2 * ch, :cw].ravel(), g[ch:2 * ch, -cw:].ravel(), g[-2 * ch:-ch, :cw].ravel(), g[-2 * ch:-ch, -cw:].ravel()])
        # grain : bruit fin sur une zone pleine résolution du centre, dans les zones lisses
        cz = cv2.cvtColor(fr[H0 // 2 - 128:H0 // 2 + 128, W0 // 2 - 128:W0 // 2 + 128], cv2.COLOR_BGR2GRAY).astype(np.float32)
        hp = cz - cv2.GaussianBlur(cz, (0, 0), 1.2); gradm = cv2.morphologyEx(cv2.GaussianBlur(cz, (0, 0), 2), cv2.MORPH_GRADIENT, np.ones((5, 5)))
        flat_mask = gradm < np.percentile(gradm, 40)
        grain = float(hp[flat_mask].std()) if flat_mask.sum() > 100 else 0.0
        # bandes noires
        rowm = fr[:, ::8].mean(axis=(1, 2)); rows_dark = rowm < 10
        def bar_len(rd):
            lim = int(0.03 * H0)                                   # on tolère une fine barre (progression) tout au bord
            st = next((i for i in range(lim) if rd[i]), None)
            if st is None: return 0
            e = st
            while e < len(rd) and rd[e]: e += 1
            return e if e - st > 0.02 * H0 else 0
        top_bar = H0 if rows_dark.all() else bar_len(rows_dark); bot_bar = H0 if rows_dark.all() else bar_len(rows_dark[::-1])
        # barres fines en haut et en bas (barre de progression)
        strip = {}
        sh_ = max(4, int(H0 * .01))
        for name, sl in [('haut', slice(0, sh_)), ('bas', slice(H0 - sh_, H0))]:
            sh_hsv = cv2.cvtColor(fr[sl], cv2.COLOR_BGR2HSV)
            col = ((sh_hsv[..., 1] > 100) & (sh_hsv[..., 2] > 100)).mean(0) > 0.6
            run_l = int(np.argmax(~col)) if not col.all() else W0
            strip[name] = run_l
        g2 = cv2.cvtColor(fr[::2, ::2], cv2.COLOR_BGR2GRAY).astype(np.float32)
        if top_bar or bot_bar: g2 = g2[top_bar // 2 + 1: g2.shape[0] - bot_bar // 2 - 1]
        if g2.size and min(g2.shape) >= 3:                                     # image entièrement noire : rien à mesurer
            mu = cv2.blur(g2, (3, 3)); var = cv2.blur(g2 * g2, (3, 3)) - mu * mu
            flat2 = float((var < 0.6).mean())                                  # aplats parfaits (graphiques, interfaces)
        else:
            flat2 = 1.0
        q = (small // 32).reshape(-1, 3); _, cnt = np.unique(q[:, 0] * 64 + q[:, 1] * 8 + q[:, 2], return_counts=True)
        flatness = float(np.sort(cnt)[::-1][:8].sum() / cnt.sum())
        edges = cv2.Canny(g, 60, 160)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 60, minLineLength=int(ww * .15), maxLineGap=4)
        hvl = 0
        if lines is not None:
            for x1, y1, x2, y2 in lines[:, 0]:
                ang = abs(math.degrees(math.atan2(y2 - y1, x2 - x1))) % 180
                if ang < 2 or ang > 178 or abs(ang - 90) < 2: hvl += 1
        gxs = float(np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0)).mean()); gys = float(np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1)).mean())
        rb = cv2.phaseCorrelate(small[..., 2].astype(np.float32), small[..., 0].astype(np.float32))[0][0]
        hist = cv2.calcHist([hsv], [0, 1], None, [30, 16], [0, 180, 0, 256]); cv2.normalize(hist, hist, 1, 0, cv2.NORM_L1)
        r = dict(f=n, luma=float(g.mean()), contrast=float(g.std()), sat=float(hsv[..., 1].mean()),
                 warm=float(small[..., 2].astype(np.float32).mean() - small[..., 0].astype(np.float32).mean()),
                 hue_x=float((np.cos(hsv[..., 0] * np.pi / 90) * hsv[..., 1]).mean()), hue_y=float((np.sin(hsv[..., 0] * np.pi / 90) * hsv[..., 1]).mean()),
                 sh_a=float(lab[..., 1][sh].mean() - 128), sh_b=float(lab[..., 2][sh].mean() - 128), hl_a=float(lab[..., 1][hl].mean() - 128), hl_b=float(lab[..., 2][hl].mean() - 128),
                 vign=float(1 - corners.mean() / (mids.mean() + 1e-6)), grain=grain, flat2=flat2, top_bar=top_bar, bot_bar=bot_bar, strip=strip,
                 flat=flatness, hvl=hvl, sharp_x=gxs, sharp_y=gys, lap=float(cv2.Laplacian(g, cv2.CV_32F).var()), rb_shift=float(rb))
        if prev is not None:
            ad = cv2.absdiff(g, prev)
            r['diff'] = float(ad.mean()); r['chg'] = float((ad > 12).mean())
            r['hd'] = float(cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA))
            e = estimate(prev, g)
            M = e['M']; r['inl'] = e['inl']; r['orb'] = bool(e.get('orb'))
            if M is not None:
                warped = cv2.warpAffine(prev, M, (AW, AH)); mask = cv2.warpAffine(np.ones_like(prev), M, (AW, AH)) > 0
                r['ncc_comp'] = ncc(warped[mask], g[mask]) if mask.sum() > 1000 else 0.0
                r['cover'] = float(mask.mean()); r['M'] = M.tolist()
            else:
                r['ncc_comp'] = ncc(prev, g); r['M'] = None; r['cover'] = 0.0
            r['ncc_raw'] = ncc(prev, g)
            if e['pts'] is not None:
                P, F = e['pts'], e['flow']
                left = P[:, 0] < AW / 2; top = P[:, 1] < AH / 2
                med = lambda m: [float(np.median(F[m, 0])) * SC, float(np.median(F[m, 1])) * SC] if m.sum() >= 8 else None
                r['halves'] = dict(g=med(left), d=med(~left), h=med(top), b=med(~top))
                if e['resid'] is not None:
                    Rr = e['resid']; mag = np.linalg.norm(Rr, axis=1); mv = mag > 1.2
                    r['mov'] = np.hstack([P[mv] * SC, Rr[mv] * SC]).astype(np.float32) if mv.any() else np.zeros((0, 4), np.float32)
                    r['mov_frac'] = float(mv.mean())
        else:
            r.update(diff=0, chg=0, hd=0, inl=1, ncc_comp=1, ncc_raw=1, M=None, cover=1.0)
        r.setdefault('mov', np.zeros((0, 4), np.float32)); r.setdefault('mov_frac', 0.0)
        boxes_all.append([])
        if HAS_RAPID and n % OCR_STEP == 0:
            # image presque identique à la précédente lecture : même texte, on ne relit pas
            if last_rapid is not None and np.abs(g.astype(np.int16) - last_rapid[0]).mean() < 1.5:
                ocr_jobs.append(('copie', n, last_rapid[1]))
            else:
                fut = pool.submit(_rapid_frame, fr, n); last_rapid = (g.astype(np.int16), fut); ocr_jobs.append(fut)
        elif HAS_OCR and n % OCR_STEP == 0:
            ocr_i += 1
            bands = [tuple(bx_) for bx_ in text_bands(fr)] + [tuple(bx_) for bx_ in text_boxes(fr, W0, H0)]
            full = ocr_i % 3 == 1 or not bands                 # lecture de toute l'image une fois par seconde (textes sans contour)
            plan_b, sigs = [], []
            for b in sorted(bands, key=lambda q: -q[3]):
                yc = b[1] + b[3] / 2
                if any(abs(yc - z[0]) < 0.6 * b[3] for z in sigs): continue
                y0b, y1b = max(0, int(b[1] - .5 * b[3])), min(H0, int(b[1] + 1.5 * b[3]))
                sig = cv2.resize((fr[y0b:y1b].max(axis=2) > 170).astype(np.uint8), (160, 16), interpolation=cv2.INTER_AREA).astype(np.float32)
                hit = next((q for q in prev_bands if abs(q[0] - yc) < 0.3 * b[3] and np.abs(q[1] - sig).mean() < 0.04), None)
                sigs.append((yc, sig)); plan_b.append((b, (hit[2], hit[0]) if hit else None))   # même texte qu'avant : on ne relit pas
            fut = pool.submit(_ocr_frame, fr, n, full, plan_b)
            prev_bands = [(yc, sig, fut) for yc, sig in sigs]
            ocr_jobs.append(fut)
        if n % 6 == 0 and FACE is not None:
            faces = FACE.detectMultiScale(g, 1.1, 8, minSize=(int(AW * .06), int(AW * .06)))
            ycc = cv2.cvtColor(small, cv2.COLOR_BGR2YCrCb)
            faces = [q for q in faces if (cv2.inRange(ycc[q[1]:q[1] + q[3], q[0]:q[0] + q[2]], (0, 135, 85), (255, 175, 130)) > 0).mean() > 0.3]
            if len(faces):
                x, y, w, hh2 = max(faces, key=lambda q: q[2] * q[3])
                face_samples.append(dict(f=n, area_pct=100 * w * hh2 / (AW * AH), cx=(x + w / 2) / AW * 100, cy=(y + hh2 / 2) / AH * 100, top=y / AH * 100))
            else:
                face_samples.append(dict(f=n, area_pct=0))
        rows.append(r); grays.append(g); prev = g; prev_hist = hist; n += 1
        if progress and n % 150 == 0: print(f'  … {n}/{total} images', flush=True)
    for fut in ocr_jobs:
        if isinstance(fut, tuple):                          # copie de la lecture précédente, pour l'image n
            cap_samples += [dict(s, f=fut[1]) for s in fut[2].result()['samples']]
        else:
            cap_samples += fut.result()['samples']
    pool.shutdown()
    return dict(FPS=FPS, W0=W0, H0=H0, AW=AW, AH=AH, SC=SC, NF=n, OCR_STEP=OCR_STEP if (HAS_OCR or HAS_RAPID) else 0, video=video, rows=rows, grays=grays, boxes=boxes_all, cap_samples=cap_samples, face_samples=face_samples, has_ocr=HAS_OCR or HAS_RAPID, moteur_ocr='rapidocr' if HAS_RAPID else 'tesseract' if HAS_OCR else None)
