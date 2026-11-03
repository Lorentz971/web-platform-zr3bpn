"""Plans et mouvements : zooms, rotations, panoramiques, tremblements, vitesse du sujet (ralenti, accéléré,
accélération progressive), marche arrière, arrêts sur image."""
import math, os
import numpy as np, cv2
from .common import runs, smooth, ncc


def make_shots(S, events, used):
    NF, FPS = S['NF'], S['FPS']
    bounds = [0]
    for e in events:
        a = int(round(e['start_s'] * FPS)); bounds += [a, a + max(1, e['dur_frames'])]
    bounds.append(NF); bounds = sorted(set(x for x in bounds if 0 <= x <= NF))
    shots = []
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        if b - a < 3 or used[a:b].mean() > 0.5: continue
        shots.append(dict(start_s=round(a / FPS, 2), end_s=round(b / FPS, 2), dur_s=round((b - a) / FPS, 2), _a=a, _b=b))
    return shots


def _in_rects(x, y, rects):
    for (rx, ry, rw, rh) in rects:
        if rx <= x <= rx + rw and ry <= y <= ry + rh: return True
    return False


def detect(S, shots, exclude):
    """exclude(f) -> liste de rectangles (pleine résolution) à ignorer pour la vitesse du sujet."""
    rows, NF, FPS, W0, H0, SC, AW, AH, grays = S['rows'], S['NF'], S['FPS'], S['W0'], S['H0'], S['SC'], S['AW'], S['AH'], S['grays']
    T = lambda f: round(f / FPS, 2)
    moves = []
    for s in shots:
        a, b = s['_a'], s['_b']
        if s.get('split'): continue
        Ms = [rows[k]['M'] for k in range(a + 1, b)]
        if any(m is None for m in Ms) or len(Ms) < 10: continue
        Ms = [np.vstack([np.array(m), [0, 0, 1]]) for m in Ms]
        sc = np.array([math.hypot(m[0, 0], m[1, 0]) for m in Ms]); rot = np.array([math.degrees(math.atan2(m[1, 0], m[0, 0])) for m in Ms])
        tx = np.array([m[0, 2] for m in Ms]) * SC; ty = np.array([m[1, 2] for m in Ms]) * SC
        seg = lambda m, k=2: [(i, j) for i, j in runs(m) if j - i + 1 >= k]
        # zooms
        scs = smooth(sc - 1, 9); fast = np.abs(sc - 1) > 0.005
        near_fast = smooth(fast.astype(float), 9) > 0
        slow = (np.abs(scs) > 0.0004) & ~near_fast
        zoom_ok = np.zeros(len(sc), bool)
        for i, j in seg(fast, 2) + seg(slow, 12):
            stepv = np.abs(sc[i:j + 1] - 1); tot = float(np.prod(sc[i:j + 1]))
            if abs(tot - 1) < 0.02: continue
            zoom_ok[i:j + 1] = True
            A = np.eye(3)
            for m in Ms[i:j + 1]: A = m @ A
            tgt = np.linalg.inv(A) @ np.array([AW / 2, AH / 2, 1])
            prog = np.cumsum(stepv) / stepv.sum(); half = int(np.argmax(prog >= 0.5)) + 1; L = j - i + 1
            # courbe : position normalisée image par image (pour la rejouer à l'identique)
            curve = [round(float(x), 3) for x in prog]
            overshoot = bool(np.any(np.sign(sc[i:j + 1] - 1) != np.sign(tot - 1)) and L <= 12)
            moves.append(dict(type='punch-in' if L <= 10 and tot > 1 else 'dézoom rapide' if L <= 10 else 'poussée lente' if tot > 1 else 'recul lent',
                              start_s=T(a + 1 + i), dur_frames=L, dur_s=round(L / FPS, 2), zoom_pct=round((tot - 1) * 100, 1),
                              vitesse_max_pct_par_image=round(float(stepv.max()) * 100, 1),
                              courbe='freine à la fin (ease-out)' if half / L <= 0.45 else 'constante' if half / L < 0.6 else 'accélère (ease-in)',
                              rebond=overshoot, point_vise_pct=[round(float(tgt[0]) / AW * 100), round(float(tgt[1]) / AH * 100)], progression=curve))
        # rotations
        rmask = np.abs(rot) > 0.04
        for i, j in seg(rmask, 4):
            tot = float(rot[i:j + 1].sum())
            if abs(tot) >= 1:
                moves.append(dict(type='rotation', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2), degres=round(abs(tot), 1),
                                  sens='antihoraire' if tot > 0 else 'horaire'))
        # tremblements (oscillation rapide) et panoramiques (déplacement régulier)
        px, py = np.cumsum(tx), np.cumsum(ty)
        rx, ry = px - smooth(px, 7), py - smooth(py, 7)
        rms = np.sqrt(smooth(rx ** 2 + ry ** 2, 7))
        shk = (rms > 2.0) & ~zoom_ok & ~rmask; shk_ok = np.zeros_like(shk)
        for i, j in seg(shk, 6):
            zc = np.sum(np.diff(np.sign(rx[i:j + 1])) != 0) + np.sum(np.diff(np.sign(ry[i:j + 1])) != 0)
            if zc < 0.6 * (j - i + 1): continue
            idx = np.arange(j - i + 1)
            X = px[i:j + 1] - np.polyval(np.polyfit(idx, px[i:j + 1], 1), idx); Y = py[i:j + 1] - np.polyval(np.polyfit(idx, py[i:j + 1], 1), idx)
            amp = float(max(X.std(), Y.std()) * math.sqrt(2))
            spec = np.abs(np.fft.rfft(np.hanning(len(X)) * X, n=256)); fr = np.fft.rfftfreq(256, 1 / FPS)
            fq = float(fr[np.argmax(spec[1:]) + 1])
            if amp < 1.5 or fq < 4: continue
            shk_ok[i:j + 1] = True
            moves.append(dict(type='tremblement', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2), amplitude_px=round(amp, 1), frequence_hz=round(fq, 1)))
        pan = np.hypot(smooth(tx, 7), smooth(ty, 7))
        pm = (pan > 1.2) & ~shk_ok & ~zoom_ok & ~rmask
        for i, j in seg(pm, 8):
            dx, dy = float(tx[i:j + 1].sum()), float(ty[i:j + 1].sum())
            if math.hypot(dx, dy) > 0.04 * min(W0, H0):
                moves.append(dict(type='panoramique', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2), deplacement_px=[round(dx), round(dy)],
                                  part_de_l_ecran_pct=round(math.hypot(dx, dy) / min(W0, H0) * 100),
                                  direction=('gauche' if dx < 0 else 'droite') if abs(dx) > abs(dy) else ('haut' if dy < 0 else 'bas')))
        # vitesse du sujet (hors incrustations) et sens du mouvement
        v = np.zeros(len(Ms)); vx = np.zeros(len(Ms)); vy = np.zeros(len(Ms))
        for idx, k in enumerate(range(a + 1, b)):
            mv = rows[k]['mov']
            if len(mv) == 0: continue
            rects = exclude(k)
            keep = [p for p in mv if not _in_rects(p[0], p[1], rects)]
            if len(keep) >= 4 and len(keep) / max(1, len(mv) / max(rows[k]['mov_frac'], 1e-3)) < 0.5:
                kp = np.array(keep); mag = np.hypot(kp[:, 2], kp[:, 3])
                v[idx] = float(np.median(mag)); vx[idx] = float(np.median(kp[:, 2])); vy[idx] = float(np.median(kp[:, 3]))
        cam = np.hypot(tx, ty) + np.abs(sc - 1) * W0 + np.abs(rot) * 10
        chg = np.array([rows[k]['chg'] for k in range(a + 1, b)])
        for i, j in seg(chg < 0.0003, 6):
            before = v[max(0, i - 20):i]; camb = cam[max(0, i - 20):i]
            if len(before) >= 15 and np.mean(before > 1.5) >= 0.85 and np.mean(camb) < 1.0:
                moves.append(dict(type='arrêt sur image', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2)))
        if os.environ.get('DEBUG_MOTION'):
            print('PLAN', T(a), T(b)); print(' v ', np.round(v, 1).tolist()); print(' vx', np.round(vx, 1).tolist())
        act = v > 1.5
        for k in range(1, len(act) - 2):                         # une ou deux images immobiles (image doublée) ne coupent pas le mouvement
            if not act[k] and act[k - 1] and (act[k + 1] or act[k + 2]): act[k] = True
        vm = np.array([np.median(v[max(0, k - 1):k + 2]) for k in range(len(v))])
        jump = np.zeros(len(v), bool)                            # saut brutal de vitesse = nouveau segment
        for k in range(2, len(v) - 2):
            lo_, hi_ = np.median(vm[max(0, k - 4):k]), np.median(vm[k:k + 4])
            if abs(hi_ - lo_) > max(3, 0.45 * max(lo_, hi_)): jump[k] = True
        pieces = []
        for i, j in seg(act, 20):
            cuts_ = [k for k in range(i + 1, j + 1) if jump[k] and not jump[k - 1]]
            bounds = [i] + cuts_ + [j + 1]
            pcs = [(p0, p1 - 1) for p0, p1 in zip(bounds, bounds[1:])]
            for (i1, j1), (i2, j2) in zip(pcs, pcs[1:]):         # saut net de vitesse entre deux morceaux = ralenti / accéléré
                if j1 - i1 >= 8 and j2 - i2 >= 8:
                    v1_, v2_ = float(np.median(v[i1:j1 + 1])), float(np.median(v[i2:j2 + 1])); ratio = v2_ / max(v1_, 1e-6)
                    if ratio < 0.7 or ratio > 1.4:
                        moves.append(dict(type='ralenti' if ratio < 1 else 'accéléré', start_s=T(a + 1 + i2), vitesse_avant_px_img=round(v1_, 1),
                                          vitesse_apres_px_img=round(v2_, 1), facteur=round(ratio, 2)))
            pieces += [(p0, p1) for p0, p1 in pcs if p1 - p0 + 1 >= 12]
        for i, j in pieces:
            seg_v = smooth(v[i:j + 1], 5); tt = np.arange(len(seg_v))
            # marche arrière : le sujet repart dans l'autre sens en repassant par les mêmes images
            vv = np.stack([smooth(vx[i:j + 1], 5), smooth(vy[i:j + 1], 5)], 1)
            rev_at = None
            for k in range(6, len(vv) - 6):
                d1, d2 = vv[k - 6:k - 1].mean(0), vv[k + 1:k + 6].mean(0)
                if np.dot(d1, d2) < -0.6 * np.linalg.norm(d1) * np.linalg.norm(d2) and np.linalg.norm(d1) > 1.5:
                    f0 = a + 1 + i + k
                    for off in (1, 2, 3):                        # l'image d'après = l'image d'avant, en miroir (à une image doublée près)
                        em = [np.abs(grays[f0 + q].astype(np.float32) - grays[f0 - off - q]).mean() for q in range(1, 6) if f0 + q < NF and f0 - off - q >= 0]
                        ec = [np.abs(grays[f0 + q].astype(np.float32) - grays[min(NF - 1, f0 + q + q + off)]).mean() for q in range(1, 6) if f0 + q < NF and f0 - off - q >= 0]
                        if em and np.mean(ec) > 0.3 and np.mean(em) < 0.35 * np.mean(ec): rev_at = k; break
                    if rev_at is not None: break
            if rev_at is not None:
                moves.append(dict(type='marche arrière', start_s=T(a + 1 + i + rev_at), dur_s=round((j - i - rev_at + 1) / FPS, 2)))
                continue
            # accélération progressive (speed ramp) ou changement de vitesse net (ralenti / accéléré)
            p = np.polyfit(tt, seg_v, 1); fit = np.polyval(p, tt)
            r2 = 1 - ((seg_v - fit) ** 2).sum() / (((seg_v - seg_v.mean()) ** 2).sum() + 1e-9)
            v0, v1 = max(0.1, fit[0]), max(0.1, fit[-1])
            if r2 > 0.85 and (v1 / v0 > 1.6 or v1 / v0 < 0.6):
                moves.append(dict(type='accélération progressive' if v1 > v0 else 'décélération progressive', start_s=T(a + 1 + i), dur_s=round((j - i + 1) / FPS, 2),
                                  vitesse_debut_px_img=round(float(v0), 1), vitesse_fin_px_img=round(float(v1), 1)))
                continue
            levels = []; k = 0; sm = seg_v
            while k < len(sm):
                i2 = k
                while k + 1 < len(sm) and abs(sm[k + 1] - np.median(sm[i2:k + 1])) / (np.median(sm[i2:k + 1]) + 1e-6) < 0.3: k += 1
                if k - i2 >= 8: levels.append((i2, k, float(np.median(v[i + i2:i + k + 1]))))
                k += 1
            for (i1, j1, v1_), (i2, j2, v2_) in zip(levels, levels[1:]):
                ratio = v2_ / v1_
                if ratio < 0.7 or ratio > 1.4:
                    moves.append(dict(type='ralenti' if ratio < 1 else 'accéléré', start_s=T(a + 1 + i + i2), vitesse_avant_px_img=round(v1_, 1),
                                      vitesse_apres_px_img=round(v2_, 1), facteur=round(ratio, 2)))
    moves += vitesse_image(S, shots)
    moves.sort(key=lambda m: m['start_s'])
    return moves


def _vitesse_profil(S, a, b):
    """Vitesse apparente de l'image, image par image (flux optique dense sur une petite image) :
    caméra + sujet, en % de la largeur de l'écran par image. Marche même avec du flou de bougé."""
    G = S['grays']; out = []
    w = 160; h = max(16, int(round(G[a].shape[0] * w / G[a].shape[1])))
    prev = cv2.resize(G[a], (w, h), interpolation=cv2.INTER_AREA)
    for k in range(a + 1, b):
        cur = cv2.resize(G[k], (w, h), interpolation=cv2.INTER_AREA)
        fl = cv2.calcOpticalFlowFarneback(prev, cur, None, 0.5, 2, 9, 2, 5, 1.1, 0)
        mag = np.hypot(fl[..., 0], fl[..., 1])
        out.append(float(np.percentile(mag, 75)) / w * 100); prev = cur
    return np.array(out)


def vitesse_image(S, shots):
    """« Velocity » des edits : l'image ralentit fortement puis repart (ou l'inverse) à l'intérieur d'un plan,
    et vitesse moyenne de chaque plan (pour reproduire l'énergie)."""
    FPS = S['FPS']; T = lambda f: round(f / FPS, 2); out = []
    for s in shots:
        a, b = s['_a'], s['_b']
        if b - a < 8: continue
        v = _vitesse_profil(S, a, b)
        s['vitesse_image_pct_par_image'] = round(float(np.median(v)), 2)
        if len(v) < 8 or v.max() < 0.6: continue
        vs = smooth(v, 3); hi = vs.max(); lo = vs.min()
        if lo > 0.3 * hi: continue
        lent = vs < 0.35 * hi; rap = vs > 0.7 * hi
        # suite de phases (lent / rapide) d'au moins 3 images
        ph = []
        for i, j in runs(lent): ph.append((i, j, 'lent')) if j - i + 1 >= 3 else None
        for i, j in runs(rap): ph.append((i, j, 'rapide')) if j - i + 1 >= 2 else None
        ph.sort()
        if len(ph) < 2 or len(set(p[2] for p in ph)) < 2: continue
        forme = ' puis '.join(p[2] for k, p in enumerate(ph) if k == 0 or p[2] != ph[k - 1][2])
        out.append(dict(type='rampe de vitesse (velocity)', start_s=T(a + 1 + ph[0][0]), dur_s=round((ph[-1][1] - ph[0][0] + 1) / FPS, 2),
                        forme=forme, vitesse_max_pct=round(float(hi), 2), vitesse_min_pct=round(float(lo), 2), rapport=round(float(hi / max(lo, 0.01)), 1),
                        profil=[round(float(x), 2) for x in vs]))
    return out
