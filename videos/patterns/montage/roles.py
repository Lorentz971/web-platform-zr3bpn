"""Couche « rôles » : pour chaque élément du montage, sa place dans la structure, son lien avec la musique,
sa fonction probable et un degré de confiance ; puis une lecture du montage en clair, partie par partie."""
import numpy as np
from . import musique as mus, glossaire

CONF = {'coupe sèche': 0.95, 'jump cut': 0.8, 'coupe avec recadrage': 0.85, 'fondu enchaîné': 0.85, 'flash blanc': 0.9, 'fondu au noir': 0.9,
        'glissement': 0.75, 'panoramique filé': 0.75, 'rideau': 0.8, 'glitch': 0.7, 'zoom de transition': 0.7, 'rotation de transition': 0.8,
        'transition (autre)': 0.4, 'changement de fond (sujet détouré)': 0.7, "silhouette (sujet rempli d'une couleur)": 0.7,
        'collage (panneaux qui se posent)': 0.6, 'rampe de vitesse (velocity)': 0.7}


def _fonction(typ, t, M, contexte):
    base = glossaire.role(typ) or ''
    l = mus.lien(t, M); p = mus.partie(t, M)
    extra = []
    drops = [d['t'] for d in (M or {}).get('drops', [])]
    if l == 'sur le drop': extra.append("marque le drop (l'explosion de la musique)")
    elif any(0 < d - t <= 1.2 for d in drops): extra.append('prépare le drop (tension juste avant)')
    elif l in ('sur la caisse claire', 'sur la grosse caisse', 'sur le premier temps de la mesure'): extra.append(f'ponctue le rythme ({l})')
    if t < 3.0: extra.append("fait partie de l'accroche (3 premières secondes)")
    if contexte.get('cache_coupe'): extra.append('cache la coupe')
    if contexte.get('phrase'): extra.append(f"met en valeur la phrase dite « {contexte['phrase']} »")
    return dict(partie_musicale=p, lien_musique=l, fonction=base + ((' ; ' + ' ; '.join(extra)) if extra else ''))


def annoter(P, M):
    """Ajoute 'role' à chaque élément de P (transitions, mouvements, incrustations, sous-titres, textes, effets sonores)
    et construit P['lecture'] (le montage raconté partie par partie)."""
    P['musique_detaillee'] = M
    phrases = (P.get('son') or {}).get('phrases', [])
    coupes = [e['start_s'] for e in P['transitions']]
    for e in P['transitions']:
        e['role'] = _fonction(e['type'], e['start_s'], M, dict(cache_coupe=e['type'] in ('flash blanc', "silhouette (sujet rempli d'une couleur)", 'glitch')))
        e['confiance'] = CONF.get(e['type'], 0.6)
    for m in P['mouvements']:
        m['role'] = _fonction(m['type'], m['start_s'], M, {}); m['confiance'] = CONF.get(m['type'], 0.7)
    for o in P['incrustations']:
        o['role'] = _fonction(o['type'], o['start_s'], M, {}); o['confiance'] = CONF.get(o['type'], 0.6)
    for c in P.get('sous_titres', []) + P.get('textes_a_l_ecran', []):
        ph = next((p['text'] for p in phrases if p['start_s'] - 0.5 <= c['start_s'] <= p['end_s'] + 0.3), None)
        typ = 'texte derrière le sujet' if c.get('derriere_le_sujet') else 'sous-titre'
        c['role'] = _fonction(typ, c['start_s'], M, dict(phrase=ph)); c['confiance'] = 0.6 if c.get('derriere_le_sujet') else 0.75
    for x in (P.get('son') or {}).get('effets_sonores', []):
        x['role'] = dict(lien_musique=mus.lien(x['t'], M), partie_musicale=mus.partie(x['t'], M),
                         fonction='souligne ' + x['synchronise_avec'] if x.get('synchronise_avec') else 'habille le son')
    P['lecture'] = lecture(P, M)
    return P


def lecture(P, M):
    """Le montage raconté en clair, partie musicale par partie musicale."""
    parties = (M or {}).get('parties') or [dict(de_s=0, a_s=P['duree_s'], nom='vidéo entière')]
    L = []
    hard = ('coupe sèche', 'jump cut', 'coupe avec recadrage')
    for p in parties:
        a, b = p['de_s'], p['a_s']; d = max(0.01, b - a)
        tr = [e for e in P['transitions'] if a <= e['start_s'] < b]
        n_coupes = sum(e['type'] in hard for e in tr)
        eff = {}
        for e in tr + [m for m in P['mouvements'] if a <= m['start_s'] < b] + [o for o in P['incrustations'] if a <= o['start_s'] < b and o['type'] != 'barre de progression']:
            if e['type'] in hard: continue
            eff[e['type']] = eff.get(e['type'], 0) + 1
        txt = [c['text'] for c in P.get('sous_titres', []) + P.get('textes_a_l_ecran', []) if a <= c['start_s'] < b]
        sur_temps = sum(1 for e in tr if (e.get('role') or {}).get('lien_musique') not in (None, 'hors temps'))
        rythme = round(len(tr) / d * 60)
        s = f"**{a:.1f}–{b:.1f} s · {p['nom']}** : {len(tr)} changements de plan ({rythme}/min"
        s += f", {sur_temps} calés sur la musique)" if tr else ")"
        if eff: s += ' ; ' + ', '.join(f"{k} ×{v}" for k, v in sorted(eff.items(), key=lambda x: -x[1]))
        if txt: s += ' ; textes : ' + ' / '.join(f"« {t} »" for t in txt[:4])
        pl = [x for x in P.get('plans', []) if a <= x['start_s'] < b and x.get('contenu')]
        if pl:
            from collections import Counter
            cad = Counter(x['contenu'].get('cadrage') for x in pl).most_common(1)[0][0]
            gest = Counter(x['contenu'].get('geste') for x in pl if x['contenu'].get('geste') not in (None, 'debout, neutre'))
            pluriel = {'gros plan': 'gros plans', 'plan moyen': 'plans moyens', 'plan large': 'plans larges'}
            s += f" ; surtout des {pluriel.get(cad, cad)}" if cad not in (None, 'sans personne') else ' ; surtout des plans sans personne'
            if gest: s += ' (' + ', '.join(g for g, _ in gest.most_common(2)) + ')'
        if p['nom'] == 'drop': s += " → l'image explose avec la musique"
        elif 'étouffée' in p['nom']: s += ' → la musique est étouffée : on installe, on retient'
        elif p['nom'] == 'montée': s += ' → la tension monte vers la suite'
        elif p['nom'] == 'pause / silence': s += ' → respiration, place à la voix ou à la fin'
        L.append(s)
    L += narration(P, M)
    for d_ in (M or {}).get('drops', []):
        at = [e for e in P['transitions'] + P['incrustations'] + P['mouvements'] if abs(e['start_s'] - d_['t']) <= 0.12]
        if at: L.append(f"**Sur le drop à {d_['t']} s** : " + ', '.join(sorted({e['type'] for e in at})) + (' (précédé d\'un silence)' if d_.get('silence_avant') else ''))
    return L



def narration(P, M):
    """L'histoire racontée : phrase clé, arc d'énergie, boucle."""
    L = []
    so = P.get('son') or {}
    ph = [p for p in so.get('phrases', []) if len(p['text'].split()) >= 2]
    if ph:
        L.append('**Phrase clé** : ' + ' / '.join(f"« {p['text']} » ({p['start_s']} s)" for p in ph[:3]) +
                 (f" — la musique est baissée de {so.get('baisse_musique_sous_voix_db')} dB pour la laisser entendre" if (so.get('baisse_musique_sous_voix_db') or 0) >= 4 else ''))
    st = (P.get('structure') or {}).get('intensite_par_seconde') or []
    if len(st) >= 6:
        n = len(st); t1, t2, t3 = np.mean(st[:n // 3]), np.mean(st[n // 3:2 * n // 3]), np.mean(st[2 * n // 3:])
        pic = int(np.argmax(st))
        forme = 'montée continue' if t1 < t2 < t3 else 'explosion puis retombée' if t2 > t1 and t2 > t3 else 'démarrage fort puis calme' if t1 > t2 >= t3 else 'énergie constante'
        L.append(f"**Arc d'énergie** : {forme} (début {round(t1)}, milieu {round(t2)}, fin {round(t3)} sur 100) ; sommet vers {pic} s")
    if P.get('boucle'): L.append(f"**Boucle** : {P['boucle']}")
    return L
