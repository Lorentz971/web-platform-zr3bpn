#!/usr/bin/env python3
"""Analyse le « pattern de montage » d'une vidéo (YouTube, TikTok, Shorts, Reels…).

Usage : python3 analyse_montage.py VIDEO.mp4 [DOSSIER_SORTIE]

Produit pattern.json (toutes les mesures, réutilisables par les outils d'application), rapport.md et timeline.png.
"""
import os, sys, time
from difflib import SequenceMatcher
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from montage import video_pass, transitions, motion, overlays, text, look, audio, structure, report


def analyse(video, out='.', quiet=False, cache=None):
    os.makedirs(out, exist_ok=True); t0 = time.time()
    import pickle
    log = (lambda *a: None) if quiet else (lambda *a: print(f'[{time.time() - t0:5.0f} s]', *a, flush=True))
    log('1/6 Lecture de la vidéo image par image…')
    if cache and os.path.exists(cache + '.scan.pkl'): S = pickle.load(open(cache + '.scan.pkl', 'rb'))
    else:
        S = video_pass.scan(video, progress=not quiet)
        if cache: pickle.dump(S, open(cache + '.scan.pkl', 'wb'))
    FPS, NF, W0, H0 = S['FPS'], S['NF'], S['W0'], S['H0']
    if not S['has_ocr']: log('⚠️  Tesseract introuvable : les textes ne seront pas lus (voir README).')
    log('2/6 Coupes et transitions…')
    events, used = transitions.detect(S)
    shots = motion.make_shots(S, events, used)
    log('3/6 Incrustations, textes, mouvements…')
    capt, capt_sum, others = text.detect(S, events)
    by_f = {}
    for c in S['cap_samples']:
        st_ = max(3, S.get('OCR_STEP', 3))
        for q in range(c['f'] - st_, c['f'] + st_ + 1): by_f.setdefault(q, []).append(tuple(c['box']))
    cap_box = lambda k: by_f.get(k, [])                     # seulement les textes confirmés par l'OCR
    ovl = overlays.progress_bar(S) + overlays.split_and_pip(S, shots)
    cap_txt = [(c['text'], c['start_s']) for c in capt]
    ovl += [o for o in overlays.appearing(S, shots, cap_box, events)          # un sous-titre qui « pop » n'est pas une incrustation
            if not (o.get('texte') and any(o['texte'] == t and abs(o['start_s'] - t0) < 0.6 for t, t0 in cap_txt))
            and not (o.get('texte') and any(SequenceMatcher(None, o['texte'].upper(), t.upper()).ratio() > 0.75
                                            for t in (capt_sum.get('textes_de_la_scene') or []) + (capt_sum.get('filigranes') or [])))   # un logo filmé
            and not (not o.get('texte') and o.get('taille_pct_ecran', 1) < 0.3)]                                                             # trop petit pour être un graphique
    ovl.sort(key=lambda o: o['start_s'])
    def exclude(k):
        rects = list(cap_box(k))
        for s in shots:
            if s['_a'] <= k < s['_b']: rects += s.get('pip', [])
        for o in ovl:
            if 'centre_pct' in o and o['start_s'] <= k / FPS <= o['end_s']:
                cx, cy = o['centre_pct']; sz = (o['taille_pct_ecran'] / 100 * W0 * H0) ** 0.5
                rects.append((cx / 100 * W0 - sz, cy / 100 * H0 - sz, 2 * sz, 2 * sz))
        return rects
    moves = motion.detect(S, shots, exclude)
    shots = look.per_shot(S, shots, capt, others, ovl)
    log('4/6 Son (voix, musique, effets)…')
    if cache and os.environ.get('SKIP_AUDIO') and os.path.exists(cache + '.audio.pkl'): so, beat_t = pickle.load(open(cache + '.audio.pkl', 'rb'))
    else:
        so, beat_t = audio.analyse(video, events, moves, ovl)
        if cache: pickle.dump((so, beat_t), open(cache + '.audio.pkl', 'wb'))
    log('5/6 Rythme et structure…')
    st = structure.analyse(S, events, shots, moves, so, ovl, capt)
    durs = [s['dur_s'] for s in shots]
    for s in shots: s.pop('_a', None); s.pop('_b', None); s.pop('pip', None)
    P = dict(video=os.path.basename(video), format='vertical 9:16' if H0 > W0 * 1.3 else 'horizontal 16:9' if W0 > H0 * 1.3 else 'carré / autre',
             duree_s=round(NF / FPS, 2), fps=round(FPS, 2), resolution=[W0, H0],
             rythme=dict(nombre_de_plans=len(shots), duree_moyenne_plan_s=round(float(np.mean(durs)), 2) if durs else None,
                         duree_mediane_plan_s=round(float(np.median(durs)), 2) if durs else None, plans_par_minute=round(len(shots) / (NF / FPS) * 60, 1),
                         repartition_types_de_plan={t: round(sum(s['dur_s'] for s in shots if s.get('type_de_plan') == t) / max(1e-6, sum(durs)) * 100) for t in set(s.get('type_de_plan') for s in shots)}),
             transitions=events, plans=shots, mouvements=moves, incrustations=ovl, sous_titres=capt, sous_titres_resume=capt_sum, textes_a_l_ecran=others,
             visages=look.faces_summary(S), son=so, structure=st, duree_analyse_s=round(time.time() - t0))
    log('6/6 Écriture du rapport…')
    report.write(P, S, out, beat_t)
    log(f"Terminé en {P['duree_analyse_s']} s → {out}/pattern.json, rapport.md, timeline.png")
    return P


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    analyse(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.', cache=os.environ.get('MONTAGE_CACHE'))
