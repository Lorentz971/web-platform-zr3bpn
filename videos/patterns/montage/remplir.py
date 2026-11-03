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
            off = cand[0] - d_old[0]; quoi = f"drop de l'original (temps {d_old[0]:.1f}) sur le drop de la nouvelle musique ({_t_de(cand[0], tb):.2f} s)"
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
        tempo = M.get('tempo_bpm'); expl = f"recalé en temps musicaux : {quoi} ; tempo {Tm.get('tempo_bpm')} → {tempo} BPM"
        return bornes, round(debut, 3), expl
    # pas de musique dans l'original (ou pas de temps dans la nouvelle) : on garde les durées en secondes
    t0 = cases[0]['debut_s']; bornes = []
    for c in cases:
        a, b = c['debut_s'] - t0, c['debut_s'] - t0 + c['duree_s']
        if duree_max: b = min(b, duree_max)
        bornes.append((round(a, 3), round(b, 3)) if b - a > 0.08 else None)
    return bornes, 0.0, 'durées de l\'original gardées en secondes' + (' (la nouvelle musique n\'a pas de temps nets)' if Tm else '')


def remplir(T, P, banque, musique=None, M=None, textes=None, graine=0, duree_max=None, format_=None, log=print):
    rng = np.random.default_rng(graine)
    R = recette(P)
    if musique and M is None: M = charger_musique(musique)
    bornes, debut_mus, expl = recaler(T, M if musique else None, duree_max)
    log('  ' + expl)
    fmt = format_ or ('vertical' if 'vertical' in (T.get('format') or '') else 'carre' if 'carr' in (T.get('format') or '') else 'horizontal')
    W, H = (1080, 1920) if fmt == 'vertical' else (1920, 1080) if fmt == 'horizontal' else (1080, 1080)
    fps = round(T.get('fps') or 30)
    utilises = []; clips = []; transitions = []; zooms = []; incr = []; effets = []; rapport = []
    textes = list(textes or []); a_remplacer = []; niveau = 0; prev_rush = None
    for c, bo in zip(T['cases'], bornes):
        if bo is None: continue
        t0, t1 = bo; d = round(t1 - t0, 3); k = d / max(c['duree_s'], 1e-3)           # k : étirement de la case
        besoin = {kk: v for kk, v in c['besoin'].items() if v is not None and kk != 'type_de_plan'}
        if c.get('vitesse') and besoin.get('mouvement') == 'calme': besoin['mouvement'] = 'moyen'
        cands = []
        for r in banque:
            for w0, wd, vit in bq.fenetres(r, d):
                s, why, tg = bq.score_fenetre(r, w0, wd, besoin)
                rec = sum(min(w0 + wd, b_) - max(w0, a_) for ch, a_, b_ in utilises if ch == r['chemin'] and min(w0 + wd, b_) > max(w0, a_))
                s -= 3 * rec / wd                                   # déjà utilisé : on évite de montrer deux fois la même chose
                if r['chemin'] == prev_rush: s -= 0.8               # deux cases de suite dans le même rush : moins bien
                if vit < 1: s -= 2 * (1 - vit)                      # rush trop court → ralenti
                if (r['orientation'] == 'horizontal') != (fmt == 'horizontal') and r['orientation'] != 'carré': s -= 0.3
                cands.append((s, r, w0, wd, vit, why, tg))
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
        if tg is not None and vit >= 1:                             # geste : on le fait arriver tôt dans la case (sur la coupe / le temps)
            lead = min(0.25 * d, 0.4); seg = next(sg for sg in r['segments'] if sg['de'] - 1e-3 <= w0 <= sg['a'])
            w0 = round(float(np.clip(tg - lead, seg['de'], seg['a'] - d)), 3)
        utilises.append((r['chemin'], w0, w0 + wd)); prev_rush = r['chemin']
        # recadrage vers le sujet (format différent) : centre horizontal du sujet à ce moment
        E = [e for e in r['echantillons'] if w0 <= e['t'] <= w0 + wd and e.get('sujet_boite_pct')]
        cx = round(float(np.median([e['sujet_boite_pct'][0] + e['sujet_boite_pct'][2] / 2 for e in E])), 1) if E else 50.0
        ent = c.get('entree') or {}
        if ent.get('type') in RECADRAGE: niveau = 1 - niveau
        clip = dict(src=r['chemin'], nom=r['nom'], role='B', src_in=round(w0, 3), src_out=round(w0 + wd, 3), t0=t0, t1=t1, mots=[],
                    zoom=round(1 + 0.12 * niveau, 3), case=c['n'], centre_x_pct=cx, note=round(s, 2), pourquoi=why)
        if vit < 1: clip['vitesse'] = vit
        if ent.get('type') in TRANS_OK:
            fr = int(ent.get('images') or (2 if ent['type'] == 'flash blanc' else 8))
            clip['transition_entree'] = dict(type=ent['type'], images=fr)
            transitions.append(dict(plan=len(clips), t=t0, type=ent['type'], images=fr, direction=ent.get('direction') or 'vers la gauche'))
        a_faire = []                                                # ce que le moteur de rendu n'applique pas encore tout seul (étape 4)
        if ent.get('type') and ent['type'] not in TRANS_OK and ent['type'] not in RECADRAGE + ('coupe sèche',): a_faire.append(ent['type'])
        for m in c['masques']: a_faire.append(m['type'])
        if c.get('vitesse'): clip['velocity'] = c['vitesse']; a_faire.append('rampe de vitesse (velocity) ' + (c['vitesse'].get('forme') or ''))
        for m in c['mouvements']:
            if m['type'] in ZOOMS and m.get('zoom_pct'):
                zt = round(t0 + m['debut_rel_s'] * k, 3); zd = round(min(t1 - zt, max(0.1, (m.get('dur_s') or 0.3) * min(k, 1.5))), 3)
                if zd > 0.05:
                    sgn = 1 if m['type'] in ('punch-in', 'poussée lente') else -1
                    zooms.append(dict(t0=zt, dur_s=zd, de=clip['zoom'], a=round(clip['zoom'] * (1 + sgn * abs(m['zoom_pct']) / 100), 3),
                                      courbe=m.get('courbe') or 'freine à la fin (ease-out)', plan=len(clips)))
            elif m['type'] not in ZOOMS: a_faire.append(m['type'])
        clip['effets_image'] = [dict(e, debut_rel_s=round(e['debut_rel_s'] * k, 3), duree_s=round(e['duree_s'] * k, 3)) for e in c['effets']]
        a_faire += [e['type'] for e in c['effets']]
        if a_faire: clip['a_faire'] = sorted(set(a_faire))
        for o in c['incrustations']:
            if o['type'] in ('bandeau', 'forme (flèche…)', 'sticker / émoji', 'encart / image', 'texte animé'):
                incr.append(dict(type=o['type'], t0=round(t0 + o['debut_rel_s'] * k, 3), t1=round(min(t1 + 1.5, t0 + o['debut_rel_s'] * k + 2), 3),
                                 centre_pct=o.get('centre_pct') or [50, 40], entree=o.get('entree') or 'pop avec rebond', texte=o.get('texte')))
            elif o['type'] not in ('barre de progression',): clip.setdefault('a_faire', []).append(o['type'])
        for tx in c['textes']:
            nouveau = textes.pop(0) if textes else None
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
                            manque=why.get('manque', []), besoin=besoin, role=c['role'], vitesse=vit, a_faire=clip.get('a_faire', [])))
        clips.append(clip)
    duree = clips[-1]['t1'] if clips else 0
    musd = None
    if musique:
        musd = dict(src=os.path.abspath(musique), nom=os.path.basename(musique), src_in=debut_mus, tempo_bpm=M.get('tempo_bpm'),
                    temps_s=[round(x - debut_mus, 3) for x in M.get('temps_s', []) if debut_mus <= x < debut_mus + duree],
                    drops_s=[round(x['t'] - debut_mus, 3) for x in M.get('drops', []) if debut_mus <= x['t'] < debut_mus + duree],
                    niveau_db=0.0, baisse_sous_voix_db=0.0, passages_voix=[])
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
                     + ', '.join(str(v) for v in (b.get('cadrage'), b.get('geste'), b.get('expression'), f"mouvement {b['mouvement']}" if b.get('mouvement') else None) if v)
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
