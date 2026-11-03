#!/usr/bin/env python3
"""Compare notre montage à un pattern de référence (une vidéo, ou un style combiné par agreger.py).

Usage : python3 comparer.py REFERENCE.json NOTRE_PATTERN.json [conformite.md]

REFERENCE.json : un pattern.json ou un style.json ; NOTRE_PATTERN.json : le pattern.json de notre vidéo
(analysée avec analyse_montage.py). Donne pour chaque mesure : cible, mesuré, écart, verdict et le conseil à appliquer.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from montage.recette import recette, CRITERES

CONSEILS = {
    'plans_par_minute': ('coupez plus souvent (plans plus courts)', 'laissez respirer les plans (moins de coupes)'),
    'duree_plan_mediane_s': ('allongez les plans', 'raccourcissez les plans'),
    'coupes_par_minute': ('ajoutez des coupes (jump cuts dans les silences, changements de cadre)', 'retirez des coupes'),
    'transitions_par_minute': ('ajoutez des transitions aux changements de partie', 'remplacez des transitions par des coupes sèches'),
    'zooms_par_minute': ('ajoutez des zooms (punch-in sur les mots forts)', 'retirez des zooms'),
    'zoom_amplitude_pct': ('zooms plus forts', 'zooms plus légers'),
    'recadrage_zoom_pct': ('changez davantage le cadre entre deux plans', 'changez moins le cadre entre deux plans'),
    'incrustations_par_minute': ('ajoutez des incrustations (stickers, flèches, bandeaux)', 'allégez les incrustations'),
    'effets_sonores_par_minute': ('ajoutez des effets sonores (whoosh sur les transitions, pop sur les textes)', 'retirez des effets sonores'),
    'mots_par_min': ('parlez plus vite ou coupez les silences', 'ralentissez le débit'),
    'musique_baissee_sous_voix_db': ('baissez davantage la musique sous la voix', 'baissez moins la musique sous la voix'),
    'coupes_sur_le_temps_pct': ('calez plus de coupes sur les temps de la musique', 'décalez des coupes des temps'),
    'coupes_pendant_pause_pct': ('coupez dans les pauses plutôt qu\'au milieu des mots', 'coupez davantage sur la parole'),
    'lufs': ('montez le volume général', 'baissez le volume général'),
}


def cibles(ref):
    if 'mesures' in ref:            # style combiné
        return {k: v['cible'] for k, v in ref['mesures'].items()}, ref
    R = recette(ref); return R, R


def comparer(ref, nous):
    C, Rref = cibles(ref); N = recette(nous)
    rows = []
    for k, lab, tol in CRITERES:
        c, m = C.get(k), N.get(k)
        if c is None: continue
        if m is None: rows.append((lab, c, '—', '—', '⚠️', 'mesure absente de notre vidéo')); continue
        ecart = (m - c) / (abs(c) + 1e-6) if k != 'lufs' else (m - c) / 14
        ok = abs(ecart) <= tol or abs(m - c) < 0.5
        conseil = '' if ok else CONSEILS.get(k, ('augmentez', 'diminuez'))[0 if m < c else 1]
        rows.append((lab, round(c, 2), round(m, 2), f"{'+' if ecart >= 0 else ''}{round(100 * ecart)} %", '✅' if ok else '❌', conseil))
    # choix qualitatifs
    st_r = Rref.get('sous_titres'); st_n = N.get('sous_titres')
    if st_r:
        if not st_n: rows.append(('Sous-titres', 'oui', 'non', '—', '❌', 'ajoutez des sous-titres'))
        else:
            for k, lab in (('position_y_pct', 'Position des sous-titres (% hauteur)'), ('mots_par_sous_titre', 'Mots par sous-titre')):
                if st_r.get(k) is not None and st_n.get(k) is not None:
                    ok = abs(st_n[k] - st_r[k]) <= (6 if k == 'position_y_pct' else 1)
                    rows.append((lab, st_r[k], st_n[k], f"{round(st_n[k] - st_r[k], 1)}", '✅' if ok else '❌', '' if ok else ('remontez' if st_n[k] > st_r[k] else 'descendez') + ' les sous-titres' if k == 'position_y_pct' else '' if ok else 'regroupez autrement les mots'))
            for k, lab in (('couleur_surlignage', 'Couleur du mot surligné'), ('majuscules', 'Majuscules'), ('contour_noir', 'Contour noir')):
                if st_r.get(k) is not None:
                    ok = st_r.get(k) == st_n.get(k)
                    rows.append((lab, st_r[k], st_n.get(k), '—', '✅' if ok else '❌', '' if ok else f"réglez : {st_r[k]}"))
    tr_r = set((Rref.get('types_de_transition') or {}).keys()); tr_n = set((N.get('types_de_transition') or {}).keys())
    if tr_r:
        miss = tr_r - tr_n
        rows.append(('Types de transition', ', '.join(sorted(tr_r)), ', '.join(sorted(tr_n)) or '—', '—', '✅' if not miss else '❌', ('ajoutez : ' + ', '.join(sorted(miss))) if miss else ''))
    bar = Rref.get('barre_de_progression')
    if isinstance(bar, str): bar = int(bar.split('/')[0]) * 2 > int(bar.split('/')[1].split()[0])
    if bar: rows.append(('Barre de progression', 'oui', 'oui' if N.get('barre_de_progression') else 'non', '—', '✅' if N.get('barre_de_progression') else '❌', '' if N.get('barre_de_progression') else 'ajoutez une barre de progression'))
    n_ok = sum(r[4] == '✅' for r in rows); n = sum(r[4] in '✅❌' for r in rows)
    score = round(100 * n_ok / max(1, n))
    return rows, score


if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    ref, nous = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
    rows, score = comparer(ref, nous)
    L = [f"# Conformité au pattern : {score} %", '', '| Mesure | Cible | Notre vidéo | Écart | | À faire |', '|---|---|---|---|---|---|']
    L += [f"| {' | '.join(str(x) for x in r)} |" for r in rows]
    out = sys.argv[3] if len(sys.argv) > 3 else 'conformite.md'
    open(out, 'w').write('\n'.join(L) + '\n'); print('\n'.join(L))
