"""Remplit un modèle à emplacements avec NOS rushs et NOTRE musique.
1) recalage : chaque case est en temps musicaux → on la replace sur les temps de la nouvelle musique,
   en faisant tomber le drop de l'original sur le drop de la nouvelle (la durée suit le nouveau tempo) ;
2) choix des images : pour chaque case, le passage de la banque qui correspond le mieux à ce qu'elle doit montrer
   (cadrage, geste, mouvement, lumière), sans reprendre deux fois le même passage, le geste calé au début de la case ;
3) le résultat est un plan de montage au même format que plan.construire : mêmes exports (Remotion, DaVinci, CapCut).
graine 0 = le meilleur choix ; graine 1, 2… = variantes (autres rushs parmi les bons candidats)."""
import os
import numpy as np
from . import banque as bq, musique as mus
from .plan import TRANS_OK
from .recette import recette
from .sfx_lib import DEPUIS_ANALYSE

ZOOMS = ('punch-in', 'poussée lente', 'dézoom rapide', 'recul lent')
RECADRAGE = ('jump cut', 'coupe avec recadrage')


def _t_de(b, tb):
    """Instant (s) du temps musical fractionnaire b, avec prolongement au tempo médian hors de la musique."""
    per = float(np.median(np.diff(tb)))
    if b <= 0: return tb[0] + b * per
    if b >= len(tb) - 1: return tb[-1] + (b - (len(tb) - 1)) * per
    i = int(b); return tb[i] + (b - i) * (tb[i + 1] - tb[i])


def _b_de(t, tb):
    per = float(np.median(np.diff(tb)))
    if t <= tb[0]: return (t - tb[0]) / per
    if t >= tb[-1]: return len(tb) - 1 + (t - tb[-1]) / per
    i = int(np.searchsorted(tb, t)) - 1; return i + (t - tb[i]) / (tb[i + 1] - tb[i])


def charger_musique(path):
    import librosa
    y, sr = librosa.load(path, sr=22050, mono=True)
    M = mus.analyse(y, sr); M['duree_s'] = round(len(y) / sr, 2); return M


def recaler(T, M, duree_max=None):
    """Renvoie (bornes, debut_musique_s, explication). bornes[k] = (début, fin) de la case k dans le montage (s), None si la case saute."""
    cases = T['cases']; Tm = T.get('musique')
    tb = (M or {}).get('temps_s') or []
    if Tm and len(tb) >= 4 and cases[0].get('debut_temps') is not None:
        off = 0.0; quoi = 'premier temps de l\'original sur le premier temps de la nouvelle musique'
        d_old = Tm.get('drops_temps') or []; d_new = [_b_de(d['t'], tb) for d in (M.get('drops') or [])]
        if d_old and d_new:
            # le drop de l'original sur le drop de la nouvelle musique qui fait perdre le moins de cases au début
            first = cases[0]['debut_temps']
            cand = sorted(d_new, key=lambda k: (max(0, -(first + k - d_old[0])), abs(k - d_old[0])))
            off = cand[0] - d_old[0]; quoi = f"drop {'du script' if T.get('source') == 'script' else 'de l original'.replace(' l ', " l'")} (temps {d_old[0]:.1f}) sur le drop de la nouvelle musique ({_t_de(cand[0], tb):.2f} s)"
        elif d_new and not d_old and (cases[0].get('partie') or '') in ('refrain / partie forte', 'drop'):
            # l'original est intense dès le début (pas de montée) : on le pose sur le drop de notre musique, pas sur son intro calme
            off = d_new[0] - cases[0]['debut_temps']; quoi = f"original intense dès le début : posé sur le drop de la nouvelle musique ({_t_de(d_new[0], tb):.2f} s)"
        off = round(off)                                         # nombre entier de temps : on garde la place dans la mesure
        brut = [(_t_de(c['debut_temps'] + off, tb), _t_de(c['debut_temps'] + c['duree_temps'] + off, tb)) for c in cases]
        # finition : chaque coupe calée sur un temps de l'original est aimantée au coup le plus proche de la nouvelle musique
        coups = sorted(set((M.get('grosse_caisse_s') or []) + (M.get('premiers_temps_s') or []) + [d['t'] for d in M.get('drops', [])]))
        def aimante(t, c):
            if not coups or (c.get('calee_sur') in (None, 'hors temps')): return t
            k = min(coups, key=lambda x: abs(x - t)); return k if abs(k - t) < 0.06 else t
        brut = [(aimante(a, c), b) for (a, b), c in zip(brut, cases)]
        brut = [(a, brut[k + 1][0] if k + 1 < len(brut) else b) for k, (a, b) in enumerate(brut)]
        fin_mus = M.get('duree_s') or brut[-1][1]
        debut = max(0.0, brut[0][0])
        bornes = []
        for a, b in brut:
            a2, b2 = max(a, debut), min(b, fin_mus)
            if duree_max: b2 = min(b2, debut + duree_max)
            bornes.append((round(a2 - debut, 3), round(b2 - debut, 3)) if b2 - a2 > 0.08 else None)
        tempo = M.get('tempo_bpm'); expl = f"recalé en temps musicaux : {quoi}" + (f" ; tempo {Tm.get('tempo_bpm')} → {tempo} BPM" if T.get('source') != 'script' else f" ; {tempo} BPM")
        # fin propre : le montage s'arrête sur le premier temps d'une mesure (pas au milieu d'une phrase musicale)
        pt = [x - debut for x in (M.get('premiers_temps_s') or [])]; vis = [k_ for k_, b_ in enumerate(bornes) if b_]
        if pt and vis:
            fin = bornes[vis[-1]][1]; per_ = float(np.median(np.diff(tb)))
            lim = min(fin_mus - debut, duree_max if duree_max else 1e9)
            # la mesure la plus proche de la fin voulue, sans dépasser la musique ni la durée imposée
            cand = [x for x in pt if 0.5 < x <= lim + 1e-3 and abs(x - fin) <= 4 * per_ + 1e-3]
            if cand:
                x = min(cand, key=lambda x: (abs(x - fin), -x))
                for k_ in vis:
                    a_, b_ = bornes[k_]
                    if a_ >= x - 0.3: bornes[k_] = None                       # case qui commencerait après la fin (ou trop court)
                    elif b_ > x or k_ == max(j for j in vis if bornes[j] and bornes[j][0] < x - 0.3): bornes[k_] = (a_, round(x, 3))
                expl += " ; fin sur le premier temps d'une mesure"
        return bornes, round(debut, 3), expl
    # pas de musique dans l'original (ou pas de temps dans la nouvelle) : on garde les durées en secondes
    t0 = cases[0]['debut_s']; bornes = []
    for c in cases:
        a, b = c['debut_s'] - t0, c['debut_s'] - t0 + c['duree_s']
        if duree_max: b = min(b, duree_max)
        bornes.append((round(a, 3), round(b, 3)) if b - a > 0.08 else None)
    return bornes, 0.0, 'durées de l\'original gardées en secondes' + (' (la nouvelle musique n\'a pas de temps nets)' if Tm else '')


def mode_cadrage(r, W, H, cadrage='auto'):
    """Comment poser un rush dans le cadre du montage.
    'recadre' : on remplit l'écran et on coupe les bords, centré sur le sujet (horizontal → vertical, comme TikTok) ;
    'flou'    : l'image entière au centre, sur un fond flouté d'elle-même (vertical ou carré → horizontal : sinon énorme zoom) ;
    'auto'    : 'recadre' si on perd moins de 45 % de l'image ou si le rush est plus large que le cadre, sinon 'flou'."""
    if cadrage in ('recadre', 'flou'): return cadrage
    rs = (r.get('largeur') or 16) / max(1, r.get('hauteur') or 9); ro = W / H
    if rs >= ro: return 'recadre'                               # rush plus large que le cadre : on coupe les côtés en suivant le sujet
    return 'recadre' if rs / ro > 0.8 else 'flou'               # rush plus étroit : on ne zoome pas de plus de 25 %


ZOOM_MAX = {'aucun': 0, 'doux': 0.08, 'garder': 0.25}


def remplir(T, P, banque, musique=None, M=None, textes=None, graine=0, duree_max=None, format_=None, log=print,
            cadrage='auto', zooms_mode='doux', melange='libre'):
    """cadrage : auto | recadre | flou. zooms_mode : doux (petits zooms, un par case au plus) | garder (comme l'original) | aucun.
    melange : libre (le meilleur rush pour chaque case) | ordre (on avance dans nos rushs dans l'ordre, sans revenir en arrière) | un (un seul rush pour tout l'edit)."""
    rng = np.random.default_rng(graine)
    R = recette(P) if P else {'lufs': T.get('volume_lufs')}
    if musique and M is None: M = charger_musique(musique)
    bornes, debut_mus, expl = recaler(T, M if musique else None, duree_max)
    log('  ' + expl)
    fmt = format_ or ('vertical' if 'vertical' in (T.get('format') or '') else 'carre' if 'carr' in (T.get('format') or '') else 'horizontal')
    W, H = (1080, 1920) if fmt == 'vertical' else (1920, 1080) if fmt == 'horizontal' else (1080, 1080)
    fps = round(T.get('fps') or 30)
    utilises = []; clips = []; transitions = []; zooms = []; incr = []; effets = []; rapport = []
    textes = list(textes or []); a_remplacer = []; niveau = 0; prev_rush = None
    ordre_rushs = [r['chemin'] for r in banque]; pos = (0, 0.0)            # pour melange='ordre' : rush courant, instant courant
    seul = None
    if melange == 'un':                                              # le rush qui contient le plus de matière utile
        seul = max(banque, key=lambda r: (r['duree_s'], sum(1 for e in r['echantillons'] if e.get('personnes'))))['chemin']
    for c, bo in zip(T['cases'], bornes):
        if bo is None: continue
        t0, t1 = bo; d = round(t1 - t0, 3); k = d / max(c['duree_s'], 1e-3)           # k : étirement de la case
        besoin = {kk: v for kk, v in c['besoin'].items() if v is not None and kk != 'type_de_plan'}
        if besoin.get('requete'): besoin['_sens'] = bq.preparer_requete(banque, besoin['requete'])
        if c.get('vitesse') and besoin.get('mouvement') == 'calme': besoin['mouvement'] = 'moyen'
        cands = []
        for r in banque:
            if seul and r['chemin'] != seul: continue
            ri = ordre_rushs.index(r['chemin'])
            if melange == 'ordre' and not (ri == pos[0] or ri == pos[0] + 1): continue
            vl = c.get('vitesse_lecture') or 1.0                    # ralenti / accéléré demandé : on prend plus ou moins de rush
            for w0, wd, vit in bq.fenetres(r, round(d * vl, 3)):
                vit = round(vit * vl, 3) if vl != 1 else vit
                if melange == 'ordre' and ri == pos[0] and w0 < pos[1] - 1e-3: continue
                s, why, tg = bq.score_fenetre(r, w0, wd, besoin)
                rec = sum(min(w0 + wd, b_) - max(w0, a_) for ch, a_, b_ in utilises if ch == r['chemin'] and min(w0 + wd, b_) > max(w0, a_))
                if rec / wd > 0.15 and not seul: continue            # jamais deux fois le même passage (interdit, pas seulement déconseillé)
                s -= 3 * rec / wd
                proche = min([max(0.0, max(a_, w0) - min(b_, w0 + wd)) for ch, a_, b_ in utilises if ch == r['chemin']] + [99])
                if proche < 1.0 and not seul: s -= 1.0 * (1 - proche)   # à moins d'1 s d'un passage déjà pris : c'est la même action
                if r['chemin'] == prev_rush: s -= 0.8               # deux cases de suite dans le même rush : moins bien
                if vit < vl - 1e-6: s -= 2 * (1 - vit / vl)        # rush trop court → ralenti en plus
                if (r['orientation'] == 'horizontal') != (fmt == 'horizontal') and r['orientation'] != 'carré': s -= 0.3
                cands.append((s, r, w0, wd, vit, why, tg))
        if not cands and melange == 'ordre':                        # fin des rushs : on recommence au premier
            pos = (0, 0.0)
            for r in banque[:1]:
                for w0, wd, vit in bq.fenetres(r, d):
                    s, why, tg = bq.score_fenetre(r, w0, wd, besoin); cands.append((s, r, w0, wd, vit, why, tg))
        if not cands: continue
        cands.sort(key=lambda x: -x[0])
        if graine:                                                  # variante : tirage parmi les bons candidats (pas deux fois le même passage)
            top = []
            for x in cands:
                if all(not (x[1]['chemin'] == y[1]['chemin'] and abs(x[2] - y[2]) < d) for y in top): top.append(x)
                if len(top) >= 4: break
            p = np.exp(np.array([x[0] for x in top]) - top[0][0]); pick = top[int(rng.choice(len(top), p=p / p.sum()))]
        else: pick = cands[0]
        s, r, w0, wd, vit, why, tg = pick
        if tg is not None and vit >= (c.get('vitesse_lecture') or 1.0) - 1e-6:                             # geste : on le fait arriver tôt dans la case (sur la coupe / le temps)
            lead = min(0.25 * d, 0.4); seg = next(sg for sg in r['segments'] if sg['de'] - 1e-3 <= w0 <= sg['a'])
            w0 = round(float(np.clip(tg - lead * (c.get('vitesse_lecture') or 1.0), seg['de'], seg['a'] - wd)), 3)
        utilises.append((r['chemin'], w0, w0 + wd)); prev_rush = r['chemin']; pos = (ordre_rushs.index(r['chemin']), w0 + wd)
        mode = mode_cadrage(r, W, H, cadrage)
        # recadrage vers le sujet (format différent) : centre horizontal du sujet à ce moment
        E = [e for e in r['echantillons'] if w0 <= e['t'] <= w0 + wd and e.get('sujet_boite_pct')]
        cx = round(float(np.median([e['sujet_boite_pct'][0] + e['sujet_boite_pct'][2] / 2 for e in E])), 1) if E else 50.0
        ent = c.get('entree') or {}
        if ent.get('type') in RECADRAGE: niveau = 1 - niveau
        zmax = ZOOM_MAX.get(zooms_mode, 0.08)
        clip = dict(src=r['chemin'], nom=r['nom'], role='B', src_in=round(w0, 3), src_out=round(w0 + wd, 3), t0=t0, t1=t1, mots=[],
                    zoom=round(1 + min(0.12, zmax) * niveau, 3), case=c['n'], cadrage=mode, centre_x_pct=cx, note=round(s, 2), pourquoi=why)
        if abs(vit - 1) > 1e-3: clip['vitesse'] = vit
        if ent.get('type') in TRANS_OK:
            fr = int(ent.get('images') or (2 if ent['type'] == 'flash blanc' else 8))
            clip['transition_entree'] = dict(type=ent['type'], images=fr)
            transitions.append(dict(plan=len(clips), t=t0, type=ent['type'], images=fr, direction=ent.get('direction') or 'vers la gauche'))
        a_faire = list(c.get('a_faire_script') or [])               # ce que le moteur de rendu n'applique pas encore tout seul (étape 4)
        if ent.get('type') and ent['type'] not in TRANS_OK and ent['type'] not in RECADRAGE + ('coupe sèche',): a_faire.append(ent['type'])
        for m in c['masques']: a_faire.append(m['type'])
        if c.get('vitesse'): clip['velocity'] = c['vitesse']; a_faire.append('rampe de vitesse (velocity) ' + (c['vitesse'].get('forme') or ''))
        z_cur = clip['zoom']; n_z = 0
        for m in c['mouvements']:
            if m['type'] in ZOOMS and m.get('zoom_pct'):
                if zmax <= 0 or (zooms_mode == 'doux' and (n_z >= 1 or d < 0.6)): continue
                zt = round(t0 + m['debut_rel_s'] * k, 3); zd = round(min(t1 - zt, max(0.1, (m.get('dur_s') or 0.3) * min(k, 1.5))), 3)
                if zd < (0.25 if zooms_mode == 'doux' else 0.08): continue
                amp = min(zmax, abs(m['zoom_pct']) / 100 * (0.5 if zooms_mode == 'doux' else 1))
                if m['type'] in ('punch-in', 'poussée lente'): de, a = z_cur, z_cur * (1 + amp)
                else: de, a = z_cur * (1 + amp), z_cur                   # dézoom : on part plus serré et on revient (jamais de bords noirs)
                zooms.append(dict(t0=zt, dur_s=zd, de=round(de, 3), a=round(a, 3), courbe=m.get('courbe') or 'freine à la fin (ease-out)', plan=len(clips)))
                z_cur = a; n_z += 1
            elif m['type'].startswith('secousse'):                  # shake sur le temps : rendu directement
                clip.setdefault('secousses', []).append(dict(t=round(m['debut_rel_s'] * k, 3), dur_s=max(0.1, m.get('dur_s') or 0.13),
                                                             amplitude_pct=min(4.0, m.get('amplitude_px') or 2.5)))
            elif m['type'] not in ZOOMS: a_faire.append(m['type'])
        clip['effets_image'] = [dict(e, debut_rel_s=round(e['debut_rel_s'] * k, 3), duree_s=round(e['duree_s'] * k, 3)) for e in c['effets']]
        TEINTES = {'rouge': '#e0202a', 'orange': '#ff8a1c', 'jaune': '#ffd21c', 'vert': '#2fbf4a', 'cyan': '#1cc8e0', 'bleu': '#2a5cff', 'violet': '#8a3cff', 'rose': '#ff3c9e', 'or': '#d4a017'}
        for e in c['effets']:
            if e['type'].startswith('teinte unique') and TEINTES.get((e.get('couleurs') or '').split(' ')[0]) and e['duree_s'] > 0.25 * c['duree_s']:
                clip['teinte'] = TEINTES[e['couleurs'].split(' ')[0]]           # rendu : couleur posée sur l'image
            else: a_faire.append(e['type'])
        if a_faire: clip['a_faire'] = sorted(set(a_faire))
        for o in c['incrustations']:
            if o['type'] in ('bandeau', 'forme (flèche…)', 'sticker / émoji', 'encart / image', 'texte animé') and (o.get('confiance') or 1) >= 0.75:
                incr.append(dict(type=o['type'], t0=round(t0 + o['debut_rel_s'] * k, 3), t1=round(min(t1 + 1.5, t0 + o['debut_rel_s'] * k + 2), 3),
                                 centre_pct=o.get('centre_pct') or [50, 40], entree=o.get('entree') or 'pop avec rebond', texte=o.get('texte')))
            elif o['type'] not in ('barre de progression',): clip.setdefault('a_faire', []).append(o['type'] + (' (peu sûr)' if (o.get('confiance') or 1) < 0.75 else ''))
        for tx in c['textes']:
            nouveau = tx['texte_original'] if tx.get('notre') else (textes.pop(0) if textes else None)
            tt0 = round(t0 + tx['debut_rel_s'] * k, 3)
            o = dict(type='texte animé', t0=tt0, t1=round(min(tt0 + max(0.4, tx['duree_s'] * k), t1 + 2 * d), 3),
                     centre_pct=[tx['position'][0] or 50, tx['position'][1] or 40], entree=tx.get('animation') or 'apparition sèche',
                     texte_original=tx['texte_original'], derriere_le_sujet=tx['derriere_le_sujet'], suit_le_sujet=tx['suit_le_sujet'],
                     hauteur_pct=tx.get('hauteur_pct'), case=c['n'])
            if nouveau is not None:                                 # notre texte, à la place et dans le style de l'original
                o['texte'] = nouveau.upper() if tx.get('majuscules') or tx['texte_original'].isupper() else nouveau
                incr.append(o)
            else: a_remplacer.append(o)                             # pas de texte à nous : on n'affiche pas celui de l'original
        for sx in c['sons']:
            nom = DEPUIS_ANALYSE.get(sx['type'])
            if nom: effets.append(dict(t=round(max(0, t0 + sx['debut_rel_s'] * k), 3), type=nom, fichier=f'sfx/{nom}.wav'))
        rapport.append(dict(case=c['n'], t0=t0, t1=t1, rush=r['nom'], de=clip['src_in'], a=clip['src_out'], note=round(s, 2), ok=why.get('ok', []),
                            manque=why.get('manque', []), besoin={kk: v for kk, v in besoin.items() if not kk.startswith('_')}, role=c['role'], vitesse=vit, a_faire=clip.get('a_faire', [])))
        # velocity : le plan passe du ralenti à l'accéléré (ou l'inverse) sans coupe visible : deux morceaux du même passage
        V = {'lent puis rapide': (0.6, 0.45, 1.6), 'rapide puis lent': (0.4, 1.6, 0.45)}
        if clip.get('velocity') and d >= 0.45 and abs(vit - 1) < 1e-3:
            fr_, v1, v2 = V.get(clip['velocity'].get('forme') or '', (0.6, 0.45, 1.6))
            tc = round(t0 + fr_ * d, 3); sc_ = round(clip['src_in'] + (tc - t0) * v1, 3)
            sec = dict(clip, t0=tc, src_in=sc_, src_out=round(sc_ + (t1 - tc) * v2, 3), vitesse=v2, suite_de_velocity=True)
            sec.pop('transition_entree', None)
            clip.update(t1=tc, src_out=sc_, vitesse=v1)
            clip['a_faire'] = [x for x in clip.get('a_faire', []) if not x.startswith('rampe de vitesse')]
            sec['a_faire'] = clip['a_faire']
            clips.append(clip); clips.append(sec); rapport[-1]['a_faire'] = clip['a_faire']; rapport[-1]['velocity'] = f"ralenti ×{v1} puis ×{v2}"
            for z in zooms:                                          # un zoom qui déborde sur le 2e morceau est raccourci
                if z['plan'] == len(clips) - 2 and z['t0'] + z['dur_s'] > tc: z['dur_s'] = round(max(0.05, tc - z['t0']), 3)
            continue
        clips.append(clip)
    duree = clips[-1]['t1'] if clips else 0
    musd = None
    if musique:
        musd = dict(src=os.path.abspath(musique), nom=os.path.basename(musique), src_in=debut_mus, tempo_bpm=M.get('tempo_bpm'),
                    temps_s=[round(x - debut_mus, 3) for x in M.get('temps_s', []) if debut_mus <= x < debut_mus + duree],
                    drops_s=[round(x['t'] - debut_mus, 3) for x in M.get('drops', []) if debut_mus <= x['t'] < debut_mus + duree],
                    niveau_db=0.0, baisse_sous_voix_db=0.0, passages_voix=[], fondu_fin_s=0.15)
    if T.get('barre_de_progression'): incr.append(dict(type='barre de progression', position='haut', couleur='#ff2d2d'))
    img = R.get('image') or {}
    etal = None
    if img:
        cur = dict(luminosite=float(np.mean([e['lum'] for r in banque for e in r['echantillons']] or [50])), saturation=float(np.mean([e['sat'] for r in banque for e in r['echantillons']] or [30])))
        etal = dict(cible=img, nos_rushs={k_: round(v, 1) for k_, v in cur.items()},
                    luminosite_x=round(float(np.clip(img.get('luminosite', cur['luminosite']) / max(cur['luminosite'], 1), 0.6, 1.6)), 2), contraste_x=1.0,
                    saturation_x=round(float(np.clip(img.get('saturation', cur['saturation']) / max(cur['saturation'], 1), 0.5, 1.8)), 2),
                    vignettage=img.get('vignettage', 0), ombres=img.get('ombres'), hautes_lumieres=img.get('hautes_lumieres'))
    st = T.get('style_sous_titres')
    lufs = R.get('lufs'); lufs = float(np.clip(lufs, -24, -9)) if isinstance(lufs, (int, float)) else -14.0
    effets.sort(key=lambda e: e['t'])
    return dict(version=1, mode='modele', pattern_source=T.get('source'), volume_cible_lufs=round(lufs, 1), fps=fps, largeur=W, hauteur=H, format=fmt,
                duree_s=round(duree, 3), clips=clips, illustrations=[], transitions=transitions, zooms=zooms, sous_titres=[],
                style_sous_titres=dict(position_y_pct=(st or {}).get('position_y_pct') or 70, hauteur_texte_pct=(st or {}).get('hauteur_texte_pct') or 4,
                                       couleur_surlignage=(st or {}).get('couleur_surlignage'), majuscules=bool((st or {}).get('majuscules')),
                                       contour_noir=bool((st or {}).get('contour_noir')), animation='apparition sèche'),
                effets=effets, musique=musd, incrustations=incr, etalonnage=etal, recalage=expl, graine=graine, textes_a_remplacer=a_remplacer,
                rushs=[dict(nom=r['nom'], chemin=r['chemin'], duree_s=r['duree_s'], role='B') for r in banque], recette=R, remplissage=rapport)


def ecrire_rapport(plan, T, path):
    L = [f"# Remplissage du modèle — variante {plan['graine']}", '', f"D'après {T['source']} · {len(plan['clips'])} cases remplies sur {len(T['cases'])} · {plan['duree_s']:.1f} s", '',
         f"**Recalage** : {plan['recalage']}", '', '| Case | Montage | Rush choisi | Passage | Note | Correspond | Manque | À faire à la main (pour l\'instant) |', '|---|---|---|---|---|---|---|---|']
    for x in plan['remplissage']:
        L.append(f"| {x['case']} | {x['t0']:.2f}–{x['t1']:.2f} s | {x['rush']} | {x['de']:.2f}–{x['a']:.2f} s" + (f" (ralenti ×{x['vitesse']})" if x['vitesse'] < 1 else '') +
                 f" | {x['note']} | {', '.join(x['ok'])} | {', '.join(x['manque'])} | {', '.join(x['a_faire'])} |")
    manque = [x for x in plan['remplissage'] if x['manque'] or x['note'] < 2]
    if manque:
        L += ['', '## Plans à tourner pour coller encore mieux', '', 'Aucun de vos rushs ne correspond parfaitement à ces cases :', '']
        for x in manque:
            b = x['besoin']
            L.append(f"- **case {x['case']}** ({x['t1'] - x['t0']:.1f} s, {x['role'] or 'sans rôle particulier'}) : "
                     + ', '.join(str(v) for v in (f"« {b['requete']} »" if b.get('requete') else None, b.get('cadrage'), b.get('geste'), b.get('expression'), f"mouvement {b['mouvement']}" if b.get('mouvement') else None) if v)
                     + (f" — il manque : {', '.join(x['manque'])}" if x['manque'] else ''))
    tx = plan.get('textes_a_remplacer') or []
    if tx:
        L += ['', '## Textes à écrire', '', "L'original a un texte à ces moments (non affiché dans notre montage) : donnez les vôtres avec `--textes \"A|B|…\"`, dans cet ordre.", '']
        L += [f"- case {o['case']} à {o['t0']:.2f} s : « {o['texte_original']} »" for o in tx]
    open(path, 'w', encoding='utf-8').write('\n'.join(L) + '\n')


def comparer_variantes(plans, path):
    L = ['# Variantes A/B', '', 'Même modèle, même musique, des rushs différents dans les cases. Publiez-en deux et gardez la meilleure.', '',
         '| Case | ' + ' | '.join(f"variante {p['graine']}" for p in plans) + ' |', '|---|' + '---|' * len(plans)]
    par_case = {}
    for j, p in enumerate(plans):
        for x in p['remplissage']: par_case.setdefault(x['case'], [''] * len(plans))[j] = f"{x['rush']} {x['de']:.1f} s ({x['note']})"
    for k in sorted(par_case): L.append(f"| {k} | " + ' | '.join(par_case[k]) + ' |')
    L += ['', '| | ' + ' | '.join(f"variante {p['graine']}" for p in plans) + ' |', '|---|' + '---|' * len(plans),
          '| note moyenne | ' + ' | '.join(f"{np.mean([x['note'] for x in p['remplissage']]):.2f}" for p in plans) + ' |',
          '| rushs différents | ' + ' | '.join(str(len({x['rush'] for x in p['remplissage']})) for p in plans) + ' |']
    open(path, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
