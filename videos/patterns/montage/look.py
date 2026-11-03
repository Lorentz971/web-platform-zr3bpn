"""Couleurs et « look » par plan (étalonnage, vignettage, grain, bandes noires), type de plan, visages et cadrage."""
import math
import numpy as np
from .common import hue_name, ab_name


def per_shot(S, shots, captions, others, overlays_list):
    rows, FPS, H0 = S['rows'], S['FPS'], S['H0']
    faces = S['face_samples']
    for s in shots:
        a, b = s['_a'], s['_b']; sl = rows[a:b]
        hx = np.mean([r['hue_x'] for r in sl]); hy = np.mean([r['hue_y'] for r in sl])
        hue = (math.degrees(math.atan2(hy, hx)) % 360) / 2; sat = np.mean([r['sat'] for r in sl]); warm = np.mean([r['warm'] for r in sl])
        sha, shb = np.median([r['sh_a'] for r in sl]), np.median([r['sh_b'] for r in sl])
        hla, hlb = np.median([r['hl_a'] for r in sl]), np.median([r['hl_b'] for r in sl])
        vign = float(np.median([r['vign'] for r in sl])); grain = float(np.median([r['grain'] for r in sl]))
        tb = int(np.median([r['top_bar'] for r in sl])); bb = int(np.median([r['bot_bar'] for r in sl]))
        s.update(luminosite=round(float(np.mean([r['luma'] for r in sl])) / 2.55), contraste=round(float(np.mean([r['contrast'] for r in sl])) / 2.55),
                 saturation=round(sat / 2.55), teinte=hue_name(hue) if sat > 40 else 'neutre', temperature='chaude' if warm > 15 else 'froide' if warm < -15 else 'neutre',
                 ombres=ab_name(sha, shb), hautes_lumieres=ab_name(hla, hlb),
                 ecart_ombres_lumieres=round(float(math.hypot(hla - sha, hlb - shb)), 1),
                 vignettage=round(vign, 2) if vign > 0.12 else 0, grain=round(grain, 1) if grain > 2.5 else 0,
                 bandes_noires_pct=round(100 * (tb + bb) / 2 / H0) if tb > 0.03 * H0 and bb > 0.03 * H0 and tb < 0.4 * H0 else 0)
        # visage et cadrage
        fs = [f for f in faces if a <= f['f'] < b and f['area_pct'] > 0]
        nfs = [f for f in faces if a <= f['f'] < b]
        face_frac = len(fs) / max(1, len(nfs))
        if fs and face_frac > 0.5:
            cy = float(np.median([f['cy'] for f in fs])); top = float(np.median([f['top'] for f in fs]))
            s['visage'] = dict(taille_pct_ecran=round(float(np.median([f['area_pct'] for f in fs])), 1), centre_pct=[round(float(np.median([f['cx'] for f in fs]))), round(cy)],
                               espace_au_dessus_pct=round(top), sur_le_tiers_haut=bool(abs(cy - 33.3) < 12))
        # type de plan
        sa, sb = a / FPS, b / FPS
        txt = [o for o in others if o['start_s'] < sb and o['start_s'] + o['dur_s'] > sa + 0.3]
        txt_words = sum(o['mots'] for o in txt); big_txt = any(o['hauteur_pct'] >= 3 for o in txt)
        flat2 = np.median([r['flat2'] for r in sl]); hvl = np.median([r['hvl'] for r in sl])
        if s.get('split'): typ = 'écran partagé'
        elif 'visage' in s and s['visage']['taille_pct_ecran'] > 2: typ = 'face caméra'
        elif flat2 > 0.5 and hvl >= 6: typ = "capture d'écran"
        elif flat2 > 0.5 and txt_words >= 1 and big_txt: typ = 'carton de texte'
        elif flat2 > 0.5: typ = 'graphique / animation'
        else: typ = 'illustration'
        s['type_de_plan'] = typ
    return shots


def faces_summary(S):
    fs = S['face_samples']; FPS = S['FPS']
    on = [s for s in fs if s['area_pct'] > 0]
    runs_ = []
    for s in fs:
        if s['area_pct'] > 0 and runs_ and s['f'] - runs_[-1][1] <= 6: runs_[-1][1] = s['f']
        elif s['area_pct'] > 0: runs_.append([s['f'], s['f']])
    return dict(present_s=[[round(a / FPS, 2), round((b + 3) / FPS, 2)] for a, b in runs_ if b - a >= 6],
                taille_moyenne_pct_ecran=round(float(np.mean([s['area_pct'] for s in on])), 1) if on else 0,
                position_moyenne_pct=[round(float(np.mean([s['cx'] for s in on]))), round(float(np.mean([s['cy'] for s in on])))] if on else None)
