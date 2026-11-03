"""Modèle à emplacements : chaque plan d'une vidéo analysée devient une « case » à remplir avec NOS images.
Le temps est exprimé en temps musicaux (s'il y a une musique) : la case se recalera sur n'importe quelle autre musique.
Chaque case dit ce qu'elle doit montrer (cadrage, geste, mouvement), ses effets et son texte."""
import numpy as np
from . import musique as mus


def _temps(t, M):
    """Position musicale : index du temps (fractionnaire) dans la musique de la vidéo d'origine."""
    tb = (M or {}).get('temps_s') or []
    if len(tb) < 2: return None
    i = int(np.searchsorted(tb, t)) - 1
    if i < 0: return round((t - tb[0]) / (tb[1] - tb[0]), 2)
    if i >= len(tb) - 1: per = tb[-1] - tb[-2]; return round(len(tb) - 1 + (t - tb[-1]) / per, 2)
    return round(i + (t - tb[i]) / (tb[i + 1] - tb[i]), 2)


def construire(P):
    M = P.get('musique_detaillee') or {}
    a_musique = bool(M.get('temps_s'))
    drops = [d['t'] for d in M.get('drops', [])]
    t_drop = drops[0] if drops else None
    cases = []
    for i, s in enumerate(P['plans']):
        a, b = s['start_s'], s['end_s']
        # transition qui ouvre la case
        entree = next((e for e in P['transitions'] if abs(e['start_s'] - a) <= 0.12 or (e.get('dur_frames') and e['start_s'] <= a <= e['start_s'] + e['dur_s'] + 0.1)), None)
        mouvements = [m for m in P['mouvements'] if a - 0.05 <= m['start_s'] < b]
        effets = [x for x in P.get('effets_image', []) if x['start_s'] < b and x['end_s'] > a and not x['type'].startswith('style global')]
        incr = [o for o in P['incrustations'] if a - 0.05 <= o['start_s'] < b and o['type'] != 'barre de progression']
        masques = [e for e in P['transitions'] if a - 0.05 <= e['start_s'] < b and e.get('sujet_boite_pct')]
        textes = [c for c in P.get('sous_titres', []) + P.get('textes_a_l_ecran', []) if a - 0.05 <= c['start_s'] < b]
        sons = [x for x in (P.get('son') or {}).get('effets_sonores', []) if a - 0.05 <= x['t'] < b]
        c = s.get('contenu') or {}
        vel = next((m for m in mouvements if 'velocity' in m['type']), None)
        case = dict(
            n=i + 1, debut_s=a, duree_s=round(b - a, 2),
            debut_temps=_temps(a, M) if a_musique else None, duree_temps=round(_temps(b, M) - _temps(a, M), 2) if a_musique else None,
            partie=mus.partie(a + 0.01, M) if a_musique else None, apres_le_drop_s=round(a - t_drop, 2) if t_drop is not None else None,
            calee_sur=mus.lien(a, M) if a_musique else None,
            besoin=dict(type_de_plan=s.get('type_de_plan'), cadrage=c.get('cadrage'), geste=c.get('geste') if c.get('geste') not in (None, 'debout, neutre') else None,
                        personnes=c.get('personnes'), mouvement='fort' if (s.get('vitesse_image_pct_par_image') or 0) > 1.2 else 'moyen' if (s.get('vitesse_image_pct_par_image') or 0) > 0.4 else 'calme',
                        lumineux=s.get('luminosite'), sature=s.get('saturation')),
            entree=dict(type=entree['type'], images=entree.get('dur_frames', 0), **{k: entree[k] for k in ('direction', 'zoom_pct', 'couleur') if entree.get(k)}) if entree else None,
            vitesse=dict(type='velocity', forme=vel.get('forme'), profil=vel.get('profil')) if vel else None,
            mouvements=[dict(type=m['type'], debut_rel_s=round(m['start_s'] - a, 2), **{k: m[k] for k in ('dur_s', 'zoom_pct', 'degres', 'courbe', 'origine', 'amplitude_px', 'frequence_hz') if m.get(k) is not None}) for m in mouvements if 'velocity' not in m['type']],
            effets=[dict(type=x['type'], debut_rel_s=round(max(0, x['start_s'] - a), 2), duree_s=round(min(b, x['end_s']) - max(a, x['start_s']), 2), **({'couleurs': x['couleurs']} if x.get('couleurs') else {})) for x in effets],
            masques=[dict(type=e['type'], debut_rel_s=round(e['start_s'] - a, 2), sujet_boite_pct=e.get('sujet_boite_pct'), couleur=e.get('couleur')) for e in masques],
            incrustations=[dict(type=o['type'], debut_rel_s=round(o['start_s'] - a, 2), **{k: o[k] for k in ('centre_pct', 'taille_pct_ecran', 'entree', 'texte', 'nombre_de_panneaux', 'penches') if o.get(k) is not None}) for o in incr],
            textes=[dict(texte_original=t['text'], debut_rel_s=round(t['start_s'] - a, 2), duree_s=t['dur_s'], animation=t.get('animation'),
                         role='sous-titre' if t in P.get('sous_titres', []) else 'titre', derriere_le_sujet=bool(t.get('derriere_le_sujet')), suit_le_sujet=bool(t.get('suit_le_sujet')),
                         position=[t.get('centre_x_pct'), t.get('centre_y_pct')], hauteur_pct=t.get('hauteur_pct'), majuscules=t.get('majuscules')) for t in textes],
            sons=[dict(type=x['type'], debut_rel_s=round(x['t'] - a, 2)) for x in sons],
            etalonnage=dict(ombres=s.get('ombres'), hautes_lumieres=s.get('hautes_lumieres'), vignettage=s.get('vignettage')),
        )
        case['role'] = _role_case(case, P, M)
        cases.append(case)
    return dict(source=P.get('video'), format=P.get('format'), duree_s=P['duree_s'], fps=P.get('fps'),
                musique=dict(tempo_bpm=M.get('tempo_bpm'), drops_s=drops, drops_temps=[_temps(d, M) for d in drops], parties=M.get('parties', []), filtres=M.get('filtres', []), cymbales_inversees=M.get('cymbales_inversees', []),
                             premier_temps_s=(M.get('temps_s') or [None])[0], nombre_de_temps=len(M.get('temps_s') or [])) if a_musique else None,
                style_sous_titres=P.get('sous_titres_resume'), style_global=[x for x in P.get('effets_image', []) if x['type'].startswith('style global')],
                barre_de_progression=any(o['type'] == 'barre de progression' for o in P['incrustations']), volume_lufs=(P.get('son') or {}).get('lufs_integre'),
                lecture=P.get('lecture'), cases=cases)


def _role_case(c, P, M):
    r = []
    if c['partie']: r.append(c['partie'])
    if c['apres_le_drop_s'] is not None and abs(c['apres_le_drop_s']) < 0.15: r.append('ouvre le drop')
    if c['debut_s'] < 3: r.append('accroche')
    if c['vitesse']: r.append('velocity (' + (c['vitesse']['forme'] or '') + ')')
    for m in c['masques']: r.append(m['type'])
    if c['besoin']['geste']: r.append(c['besoin']['geste'])
    return ' · '.join(r)


def ecrire_md(T, path):
    L = [f"# Modèle d'edit — d'après {T['source']}", '',
         f"{T['format']} · {T['duree_s']} s · {len(T['cases'])} cases" + (f" · musique {T['musique']['tempo_bpm']} BPM, drop à {T['musique']['drops_s']}" if T.get('musique') else ' · sans musique'), '']
    if T.get('lecture'): L += ['## Ce que fait l\'original'] + [f"- {x}" for x in T['lecture']] + ['']
    L += ['## Les cases à remplir', '', '| Case | Moment | Durée | À montrer | Entrée | Effets / masques | Texte | Rôle |', '|---|---|---|---|---|---|---|---|']
    for c in T['cases']:
        b = c['besoin']
        montre = ', '.join(str(x) for x in (b.get('cadrage'), b.get('geste'), f"mouvement {b.get('mouvement')}") if x)
        fx = [e['type'] for e in c['effets']] + [m['type'] for m in c['masques']] + [o['type'] for o in c['incrustations']] + [m['type'] for m in c['mouvements']] + (['velocity'] if c['vitesse'] else [])
        moment = (f"temps {c['debut_temps']}" if c['debut_temps'] is not None else f"{c['debut_s']} s") + (f" ({c['partie']})" if c['partie'] else '')
        duree = f"{c['duree_temps']} temps" if c['duree_temps'] is not None else f"{c['duree_s']} s"
        L.append(f"| {c['n']} | {moment} | {duree} | {montre} | {(c['entree'] or {}).get('type', '')} | {', '.join(sorted(set(fx)))} | {' / '.join(t['texte_original'] for t in c['textes'])} | {c['role']} |")
    open(path, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
