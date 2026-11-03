"""Fabrique le plan de montage (liste des plans, cadrages, transitions, zooms, sous-titres, effets, musique)
de NOS rushs en suivant la recette d'un pattern. Le plan est neutre : il est ensuite exporté vers
Remotion, DaVinci Resolve / Premiere (FCPXML, EDL) et CapCut (SRT + recette pas à pas)."""
import json, math, os, subprocess
import numpy as np
import cv2
from . import audio
from .recette import recette
from .sfx_lib import DEPUIS_ANALYSE

WHOOSH_TRANS = {'panoramique filé', 'glissement', 'zoom de transition', 'rotation de transition', 'rideau'}
TRANS_OK = ['fondu enchaîné', 'glissement', 'panoramique filé', 'zoom de transition', 'rotation de transition', 'flash blanc',
            'fondu au noir', 'glitch', 'rideau']


def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate:format=duration', '-of', 'json', path],
                         capture_output=True, text=True).stdout
    j = json.loads(out or '{}'); v = next((s for s in j.get('streams', []) if s['codec_type'] == 'video'), None)
    fps = None
    if v and v.get('r_frame_rate') and v['r_frame_rate'] != '0/0':
        a, b = v['r_frame_rate'].split('/'); fps = float(a) / float(b)
    return dict(duree_s=float(j.get('format', {}).get('duration', 0) or 0), largeur=v and v.get('width'), hauteur=v and v.get('height'),
                fps=fps, a_du_son=any(s['codec_type'] == 'audio' for s in j.get('streams', [])))


def look(path, n=12):
    """Luminosité, contraste, saturation moyens d'un rush (mêmes définitions que l'analyse)."""
    cap = cv2.VideoCapture(path); N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1; L, C, Sa = [], [], []
    for i in range(n):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int((i + 0.5) * N / n)); ok, f = cap.read()
        if not ok: continue
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY); hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        L.append(g.mean() / 2.55); C.append(g.std() / 2.55); Sa.append(hsv[..., 1].mean() / 2.55)
    return dict(luminosite=float(np.mean(L)), contraste=float(np.mean(C)), saturation=float(np.mean(Sa))) if L else None


def analyser_rush(path, log=print):
    info = probe(path); info['chemin'] = os.path.abspath(path); info['nom'] = os.path.basename(path)
    info['voix'] = []; info['mots'] = []
    if info['a_du_son']:
        y = audio.load(path)
        if y is not None:
            import librosa
            m16 = librosa.resample(y.mean(0), orig_sr=44100, target_sr=16000).astype(np.float32)
            segs = audio.vad_segments(m16)
            if segs is None:                                     # modèles absents : détection d'énergie simple
                rms = librosa.feature.rms(y=m16, frame_length=800, hop_length=160)[0]; thr = max(0.01, np.percentile(rms, 30) * 3)
                on = rms > thr; segs = []; t = np.arange(len(on)) * 0.01
                k = 0
                while k < len(on):
                    if on[k]:
                        j = k
                        while j + 1 < len(on) and (on[j + 1] or (j + 25 < len(on) and on[j + 1:j + 25].any())): j += 1
                        if t[j] - t[k] > 0.25: segs.append([round(t[k], 2), round(t[j] + 0.01, 2)])
                        k = j + 1
                    else: k += 1
            info['voix'] = segs
            tr = audio.transcribe(m16, segs) if segs else None
            if tr:
                for w in tr['mots']:                              # fin du mot = fin du passage de voix s'il s'arrête avant le mot suivant
                    seg = next((s for s in segs if s[0] - 0.05 <= w['t'] <= s[1]), None)
                    if seg: w['fin'] = round(min(w['fin'], seg[1]), 2)
                info['mots'] = tr['mots']; info['texte'] = tr['texte']
    parole = sum(b - a for a, b in info['voix'])
    info['role'] = 'A' if parole > 0.25 * max(1, info['duree_s']) else 'B'      # A = on parle, B = illustration
    info['look'] = look(path)
    log(f"  {info['nom']} : {info['duree_s']:.1f} s, {'parole' if info['role'] == 'A' else 'illustration (B-roll)'}, {len(info['mots'])} mots")
    return info


def _beats(path):
    import librosa
    y, sr = librosa.load(path, sr=22050, mono=True)
    tempo, b = librosa.beat.beat_track(y=y, sr=sr)
    return float(np.atleast_1d(tempo)[0]), librosa.frames_to_time(b, sr=sr).tolist()


def _ref(R, k, default):
    v = R.get(k); return default if v is None else v


def _decouper(pieces, voulue, beats, caler, duree_max):
    clips = []; t = 0.0
    for r, a, b, ws in pieces:
        if duree_max and t >= duree_max: break
        pos = a
        while pos < b - 0.05:
            want = voulue(t)
            end = min(b, pos + want)
            if end < b - 0.3 and ws:
                gaps = [w['fin'] for w in ws if pos + 0.35 < w['fin'] < b - 0.3]
                if caler:                                         # parmi les fins de mot, préférer celles qui tombent sur un temps
                    near = [g for g in gaps if min(abs(t + g - pos - bt) for bt in beats) < 0.06 and abs(g - (pos + want)) < want * 0.6]
                    gaps = near or gaps
                if gaps: end = min(gaps, key=lambda g: abs(g - (pos + want)))
            elif caler and not ws:                                # pas de parole : coupe sur le temps le plus proche
                bt = min(beats, key=lambda x: abs(x - (t + want))); end = min(b, pos + max(0.3, bt - t))
            if b - end < 0.35: end = b
            if duree_max: end = min(end, pos + (duree_max - t))
            clips.append(dict(src=r['chemin'], nom=r['nom'], role=r['role'], src_in=round(pos, 3), src_out=round(end, 3), t0=round(t, 3), t1=round(t + end - pos, 3),
                              mots=[w for w in ws if pos <= w['t'] < end], debut_de_piece=pos == a))
            t += end - pos; pos = end
            if duree_max and t >= duree_max - 1e-3: break
    return clips, t


def construire(P, rushes, musique=None, duree_max=None, format_=None, graine=0, log=print):
    """P : pattern.json ou style.json (agreger.py). rushes : liste de chemins. Renvoie le plan de montage (dict)."""
    rng = np.random.default_rng(graine)
    if 'mesures' in P:                                          # style combiné → on prend les cibles
        R = {k: v['cible'] for k, v in P['mesures'].items()}
        for k in ('types_de_transition', 'types_de_coupe_pct', 'duree_transition_images', 'sous_titres', 'effets_par_type', 'incrustations_par_type',
                  'repartition_types_de_plan', 'image', 'animation_entree_principale', 'zoom_courbe', 'courbe_rythme_10_points'):
            R[k] = P.get(k)
        bar = P.get('barre_de_progression', '0/1'); R['barre_de_progression'] = int(bar.split('/')[0]) * 2 > int(bar.split('/')[1].split()[0])
        R['format'] = P.get('format'); R['duree_s'] = R.get('duree_s', 60)
        R['effets_par_type'] = {t: n / P['nombre_de_videos'] for t, n in (P.get('effets_par_type') or {}).items()}
        R['types_de_transition'] = {t: n / P['nombre_de_videos'] for t, n in (P.get('types_de_transition') or {}).items()}
        R['incrustations_par_type'] = {t: n / P['nombre_de_videos'] for t, n in (P.get('incrustations_par_type') or {}).items()}
        dur_ref = R['duree_s']
    else:
        R = recette(P); dur_ref = R['duree_s']
    log('Analyse de nos rushs…')
    infos = [analyser_rush(p, log) for p in rushes]
    A = [i for i in infos if i['role'] == 'A']; B = [i for i in infos if i['role'] == 'B']
    if not A and not B: raise SystemExit('Aucun rush lisible.')
    base = (A or B)[0]
    fps = round(base['fps'] or 30)
    fmt = format_ or ('vertical' if 'vertical' in (R.get('format') or '') else 'horizontal' if 'horizontal' in (R.get('format') or '') else
                      ('vertical' if (base['hauteur'] or 0) > (base['largeur'] or 1) else 'horizontal'))
    W, H = (1080, 1920) if fmt == 'vertical' else (1920, 1080) if fmt == 'horizontal' else (1080, 1080)

    # 1) pistes A : on garde la parole, on retire les silences (comme le pattern)
    pause_max = 0.12 if _ref(R, 'coupes_pendant_pause_pct', 0) >= 50 and _ref(R, 'mots_par_min', 0) >= 150 else 0.35
    pieces = []                                                  # (rush, in, out, [mots])
    for r in A:
        for a, b in r['voix']:
            a2, b2 = max(0, a - 0.06), min(r['duree_s'], b + 0.10)
            ws = [w for w in r['mots'] if a2 <= w['t'] < b2]
            # on recoupe à l'intérieur du passage si un silence entre deux mots dépasse pause_max
            cur_in = a2; cur = []
            for w0, w1 in zip(ws, ws[1:] + [None]):
                cur.append(w0)
                if w1 is not None and w1['t'] - w0['fin'] > pause_max + 0.15:
                    pieces.append((r, cur_in, min(b2, w0['fin'] + 0.08), cur)); cur_in = max(a2, w1['t'] - 0.06); cur = []
            pieces.append((r, cur_in, b2, cur))
    if not A:                                                    # pas de parole : montage d'illustrations sur la musique
        for r in B: pieces.append((r, 0.0, r['duree_s'], []))
    pieces = [p for p in pieces if p[2] - p[1] > 0.2]
    total = sum(p[2] - p[1] for p in pieces)
    if duree_max: total = min(total, duree_max)

    # 2) durée des plans : distribution du pattern, modulée par sa courbe de rythme
    med = _ref(R, 'duree_plan_mediane_s', 2.0); p25 = _ref(R, 'duree_plan_p25_s', med * 0.7); p75 = _ref(R, 'duree_plan_p75_s', med * 1.4)
    courbe = R.get('courbe_rythme_10_points') or R.get('courbe_plans_par_min_5s') or []
    courbe = [c for c in courbe if c] or [1]
    cm = float(np.mean(courbe))
    def duree_voulue(t):
        c = float(np.interp(t / max(total, 1e-6) * (len(courbe) - 1), range(len(courbe)), courbe)) if len(courbe) > 1 else cm
        d = float(np.exp(rng.uniform(np.log(max(0.3, p25)), np.log(max(p25 + 0.05, p75)))))
        return float(np.clip(d * cm / max(c, 1e-6), 0.35, 8.0))

    bpm, beats = _beats(musique) if musique else (None, [])
    caler = bool(beats) and _ref(R, 'coupes_sur_le_temps_pct', 0) >= 50

    # 3) découpe en plans aux frontières de mots (jamais au milieu d'un mot), ou sur les temps de la musique.
    #    On recommence avec des plans plus longs ou plus courts tant que le nombre de plans par minute s'écarte du pattern.
    cible_ppm = _ref(R, 'plans_par_minute', None)
    echelle = 1.0
    for essai in range(6):
        rng = np.random.default_rng(graine)
        clips, t = _decouper(pieces, lambda t_: duree_voulue(t_) * echelle, beats, caler, duree_max)
        ppm = len(clips) / max(t, 1e-6) * 60
        if not cible_ppm or abs(ppm - cible_ppm) <= 0.12 * cible_ppm: break
        echelle *= float(np.clip(ppm / cible_ppm, 0.5, 2.0))
    duree = round(t, 3)
    log(f'  {len(clips)} plans, {duree:.1f} s de montage')

    # 4) cadrage : changement de cadre aux coupes (punch-in alterné) comme dans le pattern
    tc = R.get('types_de_coupe_pct') or {}
    zc = (_ref(R, 'recadrage_zoom_pct', 12) or 12) / 100
    part_recadrage = (tc.get('coupe avec recadrage', 0) + 0.5 * tc.get('jump cut', 0)) / 100
    n_rec = int(round(part_recadrage * max(0, len(clips) - 1)))
    bascules = set(np.round(np.linspace(1, len(clips) - 1, n_rec + 2)[1:-1]).astype(int).tolist()) if n_rec else set()
    niveau = 0                                                   # changements de cadre répartis régulièrement, au nombre voulu
    for i, c in enumerate(clips):
        # une coupe au milieu d'un passage continu est invisible si le cadre ne change pas : on change le cadre
        if c['role'] == 'A' and i > 0 and (i in bascules or not c['debut_de_piece']): niveau = 1 - niveau
        c['zoom'] = round(1 + zc * niveau, 3)

    # 5) zooms animés (punch-in / poussée lente) sur les mots forts
    nz = int(round(_ref(R, 'zooms_par_minute', 0) * duree / 60))
    za = (_ref(R, 'zoom_amplitude_pct', 10) or 10) / 100; zd = _ref(R, 'zoom_duree_s', 0.3) or 0.3
    zooms = []
    if nz:
        cand = []
        for i, c in enumerate(clips):
            for w in c['mots']:
                sc = len(w['w']) + (4 if w['w'].endswith(('!', '?')) else 0) + (3 if any(ch.isdigit() for ch in w['w']) else 0)
                cand.append((sc + rng.random(), i, w))
        cand.sort(key=lambda x: -x[0]); used = set()
        for _, i, w in cand:
            if len(zooms) >= nz: break
            if i in used: continue
            used.add(i); c = clips[i]
            t0 = c['t0'] + (w['t'] - c['src_in'])
            zooms.append(dict(t0=round(t0, 3), dur_s=round(min(zd, c['t1'] - t0), 3), de=c['zoom'], a=round(c['zoom'] * (1 + za), 3),
                              courbe=R.get('zoom_courbe') or 'freine à la fin (ease-out)', mot=w['w'], plan=i))

    # 6) illustrations (B-roll) par-dessus la voix, à la part du pattern
    rep = R.get('repartition_types_de_plan') or {}
    part_b = (100 - rep.get('face caméra', 100 if A else 0)) / 100 if rep else 0
    broll = []
    if A and B and part_b > 0.05:
        cible = part_b * duree; couvert = 0.0; bi = 0; bpos = {r['chemin']: 0.0 for r in B}
        ordre = sorted(range(1, len(clips)), key=lambda i: (i % 3 != 1, rng.random()))   # un plan sur trois en priorité, jamais le premier
        for i in ordre:
            if couvert >= cible: break
            c = clips[i]; d = c['t1'] - c['t0']
            if d < 0.5: continue
            r = B[bi % len(B)]; bi += 1                          # on alterne les illustrations, sans jamais reprendre le même passage
            if d > r['duree_s']: continue
            p0 = bpos[r['chemin']]
            if p0 + d > r['duree_s']: p0 = 0.0
            broll.append(dict(src=r['chemin'], nom=r['nom'], src_in=round(p0, 3), src_out=round(p0 + d, 3), t0=c['t0'], t1=c['t1'], plan=i))
            bpos[r['chemin']] = p0 + d + 0.7; couvert += d
        broll.sort(key=lambda x: x['t0'])

    # 7) transitions aux changements de passage (fin de phrase / long silence)
    types = {k: v for k, v in (R.get('types_de_transition') or {}).items() if k in TRANS_OK}
    dti = R.get('duree_transition_images') or {}
    n_tr = int(round(_ref(R, 'transitions_par_minute', 0) * duree / 60))
    transitions = []
    if n_tr and types:
        bornes = [i for i in range(1, len(clips)) if clips[i]['debut_de_piece']] or list(range(1, len(clips)))
        rng.shuffle(bornes); bornes = sorted(bornes[:n_tr])
        noms = list(types); poids = np.array([types[k] for k in noms], float); poids /= poids.sum()
        for i in bornes:
            typ = str(rng.choice(noms, p=poids)); fr = int(dti.get(typ, 8 if typ != 'flash blanc' else 2))
            transitions.append(dict(plan=i, t=clips[i]['t0'], type=typ, images=fr, direction='vers la gauche'))
            clips[i]['transition_entree'] = dict(type=typ, images=fr)

    # 8) sous-titres : groupes de N mots, mot surligné, style du pattern
    st = R.get('sous_titres')
    subs = []
    if st and any(c['mots'] for c in clips):
        n = max(1, int(round(st.get('mots_par_sous_titre') or 3)))
        tw = []                                                   # mots replacés sur la ligne de temps du montage
        for c in clips:
            for x in c['mots']:
                tw.append(dict(w=x['w'], t0=round(c['t0'] + x['t'] - c['src_in'], 3), t1=round(c['t0'] + min(x['fin'], c['src_out']) - c['src_in'], 3)))
        grp = []
        for k, w in enumerate(tw):
            grp.append(w)
            fin_phrase = w['w'].endswith(('.', '!', '?'))
            if len(grp) >= n or fin_phrase or k == len(tw) - 1 or tw[k + 1]['t0'] - w['t1'] > 0.35:
                hi = max(range(len(grp)), key=lambda q: len(grp[q]['w'].strip('.,!?'))) if (st.get('part_avec_mot_surligne_pct') or 0) >= 40 else None
                subs.append(dict(t0=grp[0]['t0'], t1=round(max(grp[-1]['t1'], grp[0]['t0'] + 0.25), 3), texte=' '.join(x['w'] for x in grp), mots=list(grp), mot_surligne=hi))
                grp = []
        for a_, b_ in zip(subs, subs[1:]):                        # pas de trou d'une fraction de seconde entre deux sous-titres
            if 0 < b_['t0'] - a_['t1'] < 0.3: a_['t1'] = b_['t0']
        anim = max((st.get('animations') or {'apparition sèche': 1}).items(), key=lambda x: x[1])[0]
        style = dict(position_y_pct=st.get('position_y_pct') or 70, hauteur_texte_pct=st.get('hauteur_texte_pct') or 4, couleur_surlignage=st.get('couleur_surlignage'),
                     majuscules=bool(st.get('majuscules')), contour_noir=bool(st.get('contour_noir')), animation=anim)
    else:
        style = None

    # 9) effets sonores : même densité et mêmes déclencheurs que le pattern
    fx = R.get('effets_par_type') or {}
    effets = []
    def place(typ, t_):
        if all(abs(e['t'] - t_) > 0.15 for e in effets): effets.append(dict(t=round(max(0, t_), 3), type=typ, fichier=f'sfx/{typ}.wav'))
    for typ_a, n_ref in fx.items():
        nom = DEPUIS_ANALYSE.get(typ_a)
        if not nom: continue
        n_ = int(round(n_ref / max(dur_ref, 1) * duree))
        if n_ <= 0: continue
        if nom == 'whoosh': anchors = [tr['t'] - 0.15 for tr in transitions if tr['type'] in WHOOSH_TRANS] + [z['t0'] - 0.1 for z in zooms]
        elif nom == 'glitch': anchors = [tr['t'] for tr in transitions if tr['type'] == 'glitch']
        elif nom in ('declencheur', 'impact'): anchors = [tr['t'] for tr in transitions if tr['type'] in ('flash blanc', 'fondu au noir')] + [z['t0'] for z in zooms]
        elif nom == 'pop': anchors = [s['t0'] for s in subs if style and 'pop' in style['animation']] + [b['t0'] for b in broll]
        elif nom == 'clic': anchors = [c['t0'] for c in clips if not c['debut_de_piece']]
        elif nom == 'riser': anchors = [tr['t'] - 1.4 for tr in transitions]
        elif nom == 'ding': anchors = [s['t0'] for s in subs if any(ch.isdigit() for ch in s['texte'])] + [b['t0'] for b in broll]
        else: anchors = [c['t0'] for c in clips]
        anchors = [a for a in anchors if 0 <= a < duree]
        if len(anchors) > n_: anchors = sorted(rng.choice(anchors, n_, replace=False).tolist())
        for a in anchors: place(nom, a)
    effets.sort(key=lambda e: e['t'])

    # 10) musique : niveau sous la voix comme dans le pattern, coupes calées sur les temps si le pattern le fait
    mus = None
    if musique:
        voix = []
        for c in clips:
            if c['role'] == 'A':
                for w in c['mots']:
                    a_ = c['t0'] + w['t'] - c['src_in']; b_ = c['t0'] + min(w['fin'], c['src_out']) - c['src_in']
                    if voix and a_ - voix[-1][1] < 0.4: voix[-1][1] = round(b_, 3)
                    else: voix.append([round(a_, 3), round(b_, 3)])
        mus = dict(src=os.path.abspath(musique), nom=os.path.basename(musique), tempo_bpm=round(bpm), temps_s=[round(b, 3) for b in beats if b < duree],
                   niveau_db=-12.0, baisse_sous_voix_db=float(_ref(R, 'musique_baissee_sous_voix_db', 10) or 10), passages_voix=voix)

    # 11) incrustations et étalonnage
    incr = []
    if R.get('barre_de_progression'): incr.append(dict(type='barre de progression', position='haut', couleur='#ff2d2d'))
    img = R.get('image') or {}
    lk = [i['look'] for i in infos if i.get('look')]
    etal = None
    if img and lk:
        cur = {k: float(np.mean([l[k] for l in lk])) for k in ('luminosite', 'contraste', 'saturation')}
        etal = dict(cible=img, nos_rushs={k: round(v, 1) for k, v in cur.items()},
                    luminosite_x=round(float(np.clip(img.get('luminosite', cur['luminosite']) / max(cur['luminosite'], 1), 0.6, 1.6)), 2),
                    contraste_x=round(float(np.clip(img.get('contraste', cur['contraste']) / max(cur['contraste'], 1), 0.6, 1.6)), 2),
                    saturation_x=round(float(np.clip(img.get('saturation', cur['saturation']) / max(cur['saturation'], 1), 0.5, 1.8)), 2),
                    vignettage=img.get('vignettage', 0), ombres=img.get('ombres'), hautes_lumieres=img.get('hautes_lumieres'))
    for c in clips: c.pop('debut_de_piece', None)
    lufs = R.get('lufs'); lufs = float(np.clip(lufs, -24, -9)) if isinstance(lufs, (int, float)) else -14.0
    return dict(version=1, pattern_source=R.get('source') or 'style combiné', volume_cible_lufs=round(lufs, 1), fps=fps, largeur=W, hauteur=H, format=fmt, duree_s=duree,
                clips=clips, illustrations=broll, transitions=transitions, zooms=zooms, sous_titres=subs, style_sous_titres=style,
                effets=effets, musique=mus, incrustations=incr, etalonnage=etal, rushs=[{k: v for k, v in i.items() if k != 'mots'} for i in infos],
                recette=R)
