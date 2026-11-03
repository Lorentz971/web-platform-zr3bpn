"""Résumé chiffré d'un pattern (« recette ») : les réglages à reproduire, comparables d'une vidéo à l'autre.

Utilisé par agreger.py (style d'un créateur sur plusieurs vidéos), comparer.py (conformité de notre montage)
et appliquer_pattern.py (fabrication du montage)."""
import numpy as np

COUPES = ('coupe sèche', 'coupe avec recadrage', 'jump cut')


def _per_min(n, dur): return round(n / max(dur, 1e-6) * 60, 1)


def _num(x):
    try: return float(str(x).split()[0])
    except (ValueError, IndexError): return None


def recette(P):
    dur = P['duree_s']; tr = P.get('transitions', []); pl = P.get('plans', []); mv = P.get('mouvements', [])
    so = P.get('son', {}) or {}; st = P.get('sous_titres_resume', {}) or {}; ov = P.get('incrustations', [])
    durs = [p['dur_s'] for p in pl if p.get('dur_s')]
    cuts = [e for e in tr if e['type'] in COUPES]; trans = [e for e in tr if e['type'] not in COUPES]
    R = dict(source=P.get('video'), format=P.get('format'), duree_s=dur)
    # rythme
    R['plans_par_minute'] = P.get('rythme', {}).get('plans_par_minute')
    R['duree_plan_mediane_s'] = round(float(np.median(durs)), 2) if durs else None
    R['duree_plan_p25_s'] = round(float(np.percentile(durs, 25)), 2) if durs else None
    R['duree_plan_p75_s'] = round(float(np.percentile(durs, 75)), 2) if durs else None
    R['repartition_types_de_plan'] = P.get('rythme', {}).get('repartition_types_de_plan', {})
    r5 = (P.get('structure') or {}).get('rythme_par_5s', [])
    R['courbe_plans_par_min_5s'] = [x['plans_par_min'] for x in r5]
    acc = (P.get('structure') or {}).get('accroche') or {}
    R['accroche'] = dict(duree_s=acc.get('duree_s'), coupes=acc.get('coupes'), elements=acc.get('elements'))
    R['premiere_coupe_s'] = min([e['start_s'] for e in tr], default=None)
    # coupes et transitions
    R['coupes_par_minute'] = _per_min(len(cuts), dur)
    R['types_de_coupe_pct'] = {t: round(100 * sum(e['type'] == t for e in cuts) / len(cuts)) for t in COUPES if cuts and any(e['type'] == t for e in cuts)}
    zp = [abs(e['zoom_pct']) for e in cuts if e.get('zoom_pct')]
    R['recadrage_zoom_pct'] = round(float(np.median(zp)), 1) if zp else None
    R['transitions_par_minute'] = _per_min(len(trans), dur)
    R['part_transitions_pct'] = round(100 * len(trans) / max(1, len(tr)))
    R['types_de_transition'] = {t: sum(e['type'] == t for e in trans) for t in sorted(set(e['type'] for e in trans))}
    R['duree_transition_images'] = {t: int(np.median([e['dur_frames'] for e in trans if e['type'] == t])) for t in R['types_de_transition']}
    # mouvements de caméra / vitesse
    zooms = [m for m in mv if m['type'] in ('punch-in', 'dézoom rapide', 'poussée lente', 'recul lent')]
    R['zooms_par_minute'] = _per_min(len(zooms), dur)
    R['zoom_amplitude_pct'] = round(float(np.median([abs(m.get('zoom_pct') or 0) for m in zooms])), 1) if zooms else None
    R['zoom_duree_s'] = round(float(np.median([m['dur_s'] for m in zooms])), 2) if zooms else None
    R['zoom_courbe'] = max(set(m.get('courbe') for m in zooms), key=[m.get('courbe') for m in zooms].count) if zooms else None
    R['mouvements_par_type'] = {t: sum(m['type'] == t for m in mv) for t in sorted(set(m['type'] for m in mv))}
    # sous-titres
    R['sous_titres'] = {k: st.get(k) for k in ('mots_par_sous_titre', 'duree_moyenne_s', 'position_y_pct', 'hauteur_texte_pct', 'couleur_surlignage',
                                                'part_avec_mot_surligne_pct', 'majuscules', 'contour_noir', 'animations')} if st.get('nombre') else None
    # incrustations
    R['incrustations_par_minute'] = _per_min(sum(o['type'] not in ('barre de progression', 'écran partagé') for o in ov), dur)
    R['incrustations_par_type'] = {t: sum(o['type'] == t for o in ov) for t in sorted(set(o['type'] for o in ov))}
    ent = [o.get('entree') for o in ov if o.get('entree')]
    R['animation_entree_principale'] = max(set(ent), key=ent.count) if ent else None
    R['barre_de_progression'] = any(o['type'] == 'barre de progression' for o in ov)
    # son
    fx = so.get('effets_sonores', [])
    R['effets_sonores_par_minute'] = _per_min(len(fx), dur)
    R['effets_par_type'] = {t: sum(x['type'] == t for x in fx) for t in sorted(set(x['type'] for x in fx))}
    R['part_effets_synchronises_pct'] = round(100 * sum(1 for x in fx if x.get('synchronise_avec')) / len(fx)) if fx else None
    R['mots_par_min'] = so.get('mots_par_min'); R['temps_de_parole_pct'] = so.get('temps_de_parole_pct')
    R['tempo_bpm'] = so.get('tempo_bpm'); R['musique_baissee_sous_voix_db'] = so.get('baisse_musique_sous_voix_db')
    cst = so.get('coupes_sur_le_temps')
    if isinstance(cst, str) and 'sur' in cst:
        a_, b_ = cst.split(' coupes sur ')
        R['coupes_sur_le_temps_pct'] = round(100 * int(a_) / max(1, int(b_)))
    R['coupures_musique'] = len(so.get('coupures_musique', []))
    R['lufs'] = so.get('lufs_integre')
    cp = so.get('coupes_et_parole') or {}
    tot = sum(cp.values()) if cp else 0
    R['coupes_pendant_pause_pct'] = round(100 * cp.get('pendant_une_pause', 0) / tot) if tot else None
    # image
    if pl:
        w = np.array([p['dur_s'] for p in pl], float)
        avg = lambda k: round(float(np.average([p.get(k, 0) or 0 for p in pl], weights=w)), 1)
        R['image'] = dict(luminosite=avg('luminosite'), contraste=avg('contraste'), saturation=avg('saturation'), vignettage=avg('vignettage'),
                          ombres=max(set(p.get('ombres') for p in pl), key=[p.get('ombres') for p in pl].count),
                          hautes_lumieres=max(set(p.get('hautes_lumieres') for p in pl), key=[p.get('hautes_lumieres') for p in pl].count),
                          bandes_noires_pct=max(p.get('bandes_noires_pct', 0) for p in pl))
    vis = P.get('visages') or {}
    R['visage'] = dict(taille_pct_ecran=vis.get('taille_moyenne_pct_ecran'), position_pct=vis.get('position_moyenne_pct')) if vis.get('present_s') else None
    return R


# mesures numériques comparables (clé, libellé, tolérance relative)
CRITERES = [
    ('plans_par_minute', 'Plans par minute', 0.25), ('duree_plan_mediane_s', 'Durée médiane d\'un plan (s)', 0.3),
    ('coupes_par_minute', 'Coupes par minute', 0.3), ('transitions_par_minute', 'Transitions par minute', 0.4),
    ('zooms_par_minute', 'Zooms par minute', 0.4), ('zoom_amplitude_pct', 'Amplitude des zooms (%)', 0.35),
    ('recadrage_zoom_pct', 'Recadrage aux coupes (%)', 0.35), ('incrustations_par_minute', 'Incrustations par minute', 0.5),
    ('effets_sonores_par_minute', 'Effets sonores par minute', 0.4), ('mots_par_min', 'Débit de parole (mots/min)', 0.15),
    ('musique_baissee_sous_voix_db', 'Musique baissée sous la voix (dB)', 0.35), ('coupes_sur_le_temps_pct', 'Coupes sur le temps (%)', 0.3),
    ('coupes_pendant_pause_pct', 'Coupes pendant une pause (%)', 0.25), ('lufs', 'Volume intégré (LUFS)', 0.12),
]
