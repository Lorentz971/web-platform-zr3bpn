#!/usr/bin/env python3
"""Monter un edit à partir d'un script : on écrit les plans, l'outil trouve les moments dans nos rushs (par le sens),
cale tout sur notre musique et exporte (Remotion, DaVinci, CapCut).

Usage :
  python3 monter_script.py SCRIPT.txt RUSHS... --musique MUSIQUE [--sons DOSSIER_SONS] [--variantes 2]
                           [--format vertical|horizontal|carre] [--duree 30] [--sortie DOSSIER] [--rendu]

Exemple de SCRIPT.txt (un plan par ligne : durée | ce qu'on voit | texte | effets et sons) :

  format: vertical
  2 temps | LeBron marche dans le tunnel | THE KING
  2 temps | gros plan visage concentré
  --- drop ---
  1 temps | dunk | | flash, impact
  1 temps | foule qui crie | | zoom
  2 temps | célébration bras levés | GOAT | whoosh
  4 temps | LeBron sourit | | ralenti

  « --- drop --- » : la ligne suivante tombe sur le drop de la musique.
  Effets : flash, fondu, glissement, glitch, zoom, dézoom, ralenti, accéléré, secousse ;
  sons : whoosh, impact, pop, riser, clic, ding, glitch (avec --sons, ce sont VOS fichiers).
  Les descriptions peuvent être en français ou en anglais.
"""
import argparse, json, os, sys
os.environ.setdefault('GLOG_minloglevel', '2'); os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from montage import banque as bq, remplir as rp, script as sc, sens, modele


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('script'); ap.add_argument('rushs', nargs='+')
    ap.add_argument('--musique'); ap.add_argument('--sons'); ap.add_argument('--variantes', type=int, default=1)
    ap.add_argument('--format', choices=['vertical', 'horizontal', 'carre']); ap.add_argument('--duree', type=float)
    ap.add_argument('--cadrage', choices=['auto', 'recadre', 'flou'], default='auto'); ap.add_argument('--zooms', choices=['doux', 'garder', 'aucun'], default='garder')
    ap.add_argument('--melange', choices=['libre', 'ordre', 'un'], default='libre')
    ap.add_argument('--sortie', default='edit-script'); ap.add_argument('--rendu', action='store_true')
    ap.add_argument('--node-modules'); ap.add_argument('--navigateur')
    a = ap.parse_args()
    regl, lignes = sc.lire(open(a.script, encoding='utf-8').read())
    if not lignes: raise SystemExit('Le script ne contient aucun plan.')
    musique = a.musique or regl.get('musique')
    if not sens.disponible(): print('Attention : modèle CLIP absent (python3 telecharger_modeles.py) : la recherche se fera seulement sur le cadrage et les gestes.')
    M = rp.charger_musique(musique) if musique else None
    if M: print(f"Notre musique : {M.get('tempo_bpm')} BPM, drops à {[d['t'] for d in M.get('drops', [])]}")
    T = sc.modele(regl, lignes, M)
    out = os.path.abspath(a.sortie); os.makedirs(out, exist_ok=True)
    json.dump(T, open(os.path.join(out, 'modele.json'), 'w'), ensure_ascii=False, indent=1); modele.ecrire_md(T, os.path.join(out, 'modele.md'))
    print(f"Script : {len(T['cases'])} plans")
    B = bq.indexer(a.rushs)
    if not B: raise SystemExit('Aucun rush lisible.')
    from appliquer_pattern import exporter
    from montage import sons as sons_mod
    S = sons_mod.classer(a.sons) if a.sons else None
    plans = []
    for g in range(max(1, a.variantes)):
        print(f'\nVariante {g} :')
        plan = rp.remplir(T, None, B, musique=musique, M=M, graine=g, duree_max=a.duree, format_=a.format,
                          cadrage=a.cadrage, zooms_mode=a.zooms, melange=a.melange)
        d = os.path.join(out, f'variante-{g}')
        exporter(plan, d, None, rendu=a.rendu, navigateur=a.navigateur, node_modules=a.node_modules, sons=S)
        rp.ecrire_rapport(plan, T, os.path.join(d, 'remplissage.md')); plans.append(plan)
    if len(plans) > 1: rp.comparer_variantes(plans, os.path.join(out, 'variantes.md'))
    print(f'\nTerminé → {out}')


if __name__ == '__main__':
    main()
