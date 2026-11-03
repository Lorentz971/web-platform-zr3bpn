#!/usr/bin/env python3
"""Analyse le « pattern de montage » d'une vidéo (YouTube, TikTok, Shorts, Reels…).

Usage : python3 analyse_montage.py VIDEO.mp4 [DOSSIER_SORTIE]

Produit pattern.json (toutes les mesures, réutilisables par les outils d'application), rapport.md et timeline.png.
"""
import os, sys, time
from difflib import SequenceMatcher
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from montage import video_pass, transitions, motion, overlays, text, look, audio, structure, report, musique, roles, contenu


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
    # masques : texte derrière un sujet détouré, ou logo porté par ce sujet
    det = [e for e in events if e.get('sujet_boite_pct')]
    def _dans_sujet(c):
        for e in det:
            if not (c['start_s'] - 1.5 <= e['start_s'] <= c['start_s'] + c['dur_s'] + 1.5): continue
            bx, by, bw, bh = e['sujet_boite_pct']; cx, cy = c['centre_x_pct'], c['centre_y_pct']
            if bx <= cx <= bx + bw and by <= cy <= by + bh:
                # texte incrusté animé ou en partie caché (lecture partielle) = placé derrière le sujet ; sinon petit logo sur le sujet
                if c.get('animation') not in (None, 'apparition sèche') or c.get('largeur_pct', 0) >= 0.6 * bw: return 'derriere'
                return 'logo'
        return None
    logos_sujet = []
    for L in (capt, others):
        for c in list(L):
            r = _dans_sujet(c)
            if r == 'logo': L.remove(c); logos_sujet.append(c['text'])
            elif r == 'derriere': c['derriere_le_sujet'] = True          # texte placé entre le fond et le sujet (masque)
    if logos_sujet: capt_sum['textes_de_la_scene'] = sorted(set((capt_sum.get('textes_de_la_scene') or []) + logos_sujet))
    # texte derrière le sujet : le sujet en cache une partie, on relit plus souvent et on garde la lecture la plus complète
    if video_pass.HAS_RAPID:
        import cv2
        norm = lambda t: ''.join(ch for ch in t.upper() if ch.isalnum())
        for L in (capt, others):
            der = sorted([c for c in L if c.get('derriere_le_sujet')], key=lambda c: c['start_s'])
            groupes = []
            for c in der:
                if groupes and c['start_s'] - (groupes[-1][-1]['start_s'] + groupes[-1][-1]['dur_s']) < 1.5 and abs(c['centre_y_pct'] - groupes[-1][-1]['centre_y_pct']) < 8:
                    groupes[-1].append(c)
                else: groupes.append([c])
            cap_ = cv2.VideoCapture(video)
            for g in groupes:
                a_, b_ = round(g[0]['start_s'] * FPS), round((g[-1]['start_s'] + g[-1]['dur_s']) * FPS)
                yc = np.mean([c['centre_y_pct'] for c in g]) / 100 * H0; best = max((c['text'] for c in g), key=lambda t: len(norm(t)))
                for f_ in range(a_, b_ + 1, 3):
                    cap_.set(cv2.CAP_PROP_POS_FRAMES, f_); ok, fr = cap_.read()
                    if not ok: break
                    res_ = video_pass._rapid()(fr)[0] or []
                    # morceaux de la ligne (le sujet coupe le texte en plusieurs bouts), sans les logos
                    bouts = sorted([(min(p[0] for p in r[0]), r[1].strip()) for r in res_ if float(r[2]) > 0.5
                                    and abs((min(p[1] for p in r[0]) + max(p[1] for p in r[0])) / 2 - yc) < 0.06 * H0 and not text.est_marque(r[1])])
                    connus = [norm(c['text']) for c in g if len(norm(c['text'])) >= 3]
                    proche = lambda x: any(any(k[i:i + 3] in norm(x) for i in range(len(k) - 2)) for k in connus)
                    t_ = ' '.join(b[1] for b in bouts if proche(b[1]) and 'TIKTOK' not in norm(b[1]))
                    if len(norm(t_)) > len(norm(best)) and any(len(norm(c['text'])) >= 3 and norm(c['text'])[:4] in norm(t_) for c in g): best = t_
                g[0].update(text=best, mots=len(best.split()), dur_s=round((b_ - a_) / FPS, 2))
                for c in g[1:]: L.remove(c)
    by_f = {}
    for c in S['cap_samples']:
        st_ = max(3, S.get('OCR_STEP', 3))
        for q in range(c['f'] - st_, c['f'] + st_ + 1): by_f.setdefault(q, []).append(tuple(c['box']))
    cap_box = lambda k: by_f.get(k, [])                     # seulement les textes confirmés par l'OCR
    ovl = overlays.progress_bar(S) + overlays.split_and_pip(S, shots) + transitions.collages(S, events)
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
    shots = contenu.par_plan(S, shots)                       # personnes, cadrage, geste, expression
    contenu._fermer()
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
    log('Compréhension : musique fine et rôle de chaque élément…')
    try:
        import librosa
        y2 = audio.load(video)
        M = musique.analyse(librosa.resample(y2.mean(0), orig_sr=44100, target_sr=22050), 22050, voix=so.get('voix_segments_s')) if y2 is not None else None
    except Exception as ex:
        M = None; log('  (analyse musicale impossible :', ex, ')')
    # boucle : la fin ressemble-t-elle au début ? (on revoit la vidéo sans s'en rendre compte)
    G = S['grays']; lum = [r['luma'] for r in S['rows']]
    fin = next((k for k in range(NF - 1, NF // 2, -1) if lum[k] > 25), None)
    if fin is not None and NF > 30:
        import cv2
        a_, b_ = G[min(2, NF - 1)].astype(np.float32), G[fin].astype(np.float32)
        nc = float(cv2.matchTemplate(a_, b_, cv2.TM_CCOEFF_NORMED)[0][0])
        if nc > 0.75: P['boucle'] = f"la dernière image ressemble à la première ({round(nc * 100)} %) : la vidéo boucle, on la revoit sans s'en rendre compte"
        elif fin < NF - 0.7 * FPS: P['boucle'] = f"pas de boucle : la vidéo se termine au noir ({round((NF - fin) / FPS, 1)} s) sur la signature ou la fin"
    roles.annoter(P, M)
    report.write(P, S, out, beat_t)
    report.planche(P, S, out)
    log(f"Terminé en {P['duree_analyse_s']} s → {out}/pattern.json, rapport.md, timeline.png")
    return P


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    analyse(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.', cache=os.environ.get('MONTAGE_CACHE'))
