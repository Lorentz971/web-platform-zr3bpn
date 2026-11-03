#!/usr/bin/env python3
"""Refaire un edit avec NOS images : le pattern d'une vidéo devient un modèle à cases, rempli avec nos rushs et recalé sur notre musique.

Usage :
  python3 remplir_modele.py PATTERN RUSHS... [--musique MUSIQUE] [--variantes 3] [--textes "TEXTE 1|TEXTE 2"]
                            [--duree 30] [--format vertical|horizontal|carre] [--sortie DOSSIER] [--rendu]
  python3 remplir_modele.py PATTERN --modele-seul             le modèle seul (modele.json + modele.md), sans rush
  python3 remplir_modele.py --chercher "gros plan bras levés" RUSHS...     chercher dans la banque de rushs

  PATTERN : pattern.json (ou son dossier) produit par analyse_montage.py.
  RUSHS   : fichiers vidéo ou dossiers. Ils sont indexés une fois (cache .banque-rushs.json), puis c'est instantané.
  --musique   : notre musique. Les cases sont en temps musicaux : le drop de l'original tombe sur le drop de la nôtre.
                Sans --musique, les durées de l'original sont gardées.
  --variantes : N montages différents (A/B), comparés dans variantes.md.
  --textes    : nos textes, dans l'ordre des textes de l'original (même place, même animation). Séparés par |.

Produit dans DOSSIER (par défaut ./edit) : modele.json, modele.md, puis par variante (variante-0, variante-1…) :
  remplissage.md (quel rush dans quelle case, et les plans à tourner), plan-de-montage.json, remotion/, davinci/, capcut/, marqueurs.csv.
"""
import argparse, json, os, sys
os.environ.setdefault('GLOG_minloglevel', '2'); os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')   # journaux de MediaPipe
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from montage import modele, banque as bq, remplir as rp


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('pattern', nargs='?'); ap.add_argument('rushs', nargs='*')
    ap.add_argument('--musique'); ap.add_argument('--variantes', type=int, default=1); ap.add_argument('--textes')
    ap.add_argument('--duree', type=float); ap.add_argument('--format', choices=['vertical', 'horizontal', 'carre'])
    ap.add_argument('--sortie', default='edit'); ap.add_argument('--rendu', action='store_true'); ap.add_argument('--modele-seul', action='store_true')
    ap.add_argument('--chercher', help='recherche libre dans la banque de rushs')
    ap.add_argument('--cadrage', choices=['auto', 'recadre', 'flou'], default='auto', help="rush d'un autre format : recadré sur le sujet, ou entier sur fond flouté (auto : selon la perte)")
    ap.add_argument('--zooms', choices=['doux', 'garder', 'aucun'], default='doux', help="zooms de l'original : doux (par défaut), garder, aucun")
    ap.add_argument('--melange', choices=['libre', 'ordre', 'un'], default='libre', help="libre : le meilleur rush par case ; ordre : on avance dans nos rushs dans l'ordre ; un : un seul rush")
    ap.add_argument('--node-modules'); ap.add_argument('--navigateur')
    ap.add_argument('--sons', help='dossier de nos effets sonores (whoosh, impacts…) à la place des sons fabriqués')
    a = ap.parse_args()
    if a.chercher:
        rushs = ([a.pattern] if a.pattern else []) + a.rushs
        B = bq.indexer(rushs)
        print(f"\nCritères compris : {bq.besoin_depuis_texte(a.chercher)}")
        for x in bq.chercher(B, a.chercher, duree=1.5, n=10):
            print(f"  {x['note']:5.2f}  {x['nom']}  {x['de']:.2f}–{x['a']:.2f} s  " + ', '.join(x['pourquoi'].get('ok', [])))
        return
    if not a.pattern: ap.error('PATTERN manquant')
    P = json.load(open(os.path.join(a.pattern, 'pattern.json') if os.path.isdir(a.pattern) else a.pattern))
    out = os.path.abspath(a.sortie); os.makedirs(out, exist_ok=True)
    T = modele.construire(P)
    json.dump(T, open(os.path.join(out, 'modele.json'), 'w'), ensure_ascii=False, indent=1)
    modele.ecrire_md(T, os.path.join(out, 'modele.md'))
    print(f"Modèle : {len(T['cases'])} cases → {os.path.join(out, 'modele.md')}")
    if a.modele_seul: return
    if not a.rushs: ap.error('donnez des rushs (fichiers ou dossiers)')
    B = bq.indexer(a.rushs)
    if not B: raise SystemExit('Aucun rush lisible.')
    M = rp.charger_musique(a.musique) if a.musique else None
    if M: print(f"Notre musique : {M.get('tempo_bpm')} BPM, {len(M.get('temps_s', []))} temps, drops à {[d['t'] for d in M.get('drops', [])]}")
    textes = [t.strip() for t in a.textes.split('|')] if a.textes else None
    from appliquer_pattern import exporter
    from montage import sons as sons_mod
    S = sons_mod.classer(a.sons) if a.sons else None
    plans = []
    for g in range(max(1, a.variantes)):
        print(f'\nVariante {g} :')
        plan = rp.remplir(T, P, B, musique=a.musique, M=M, textes=textes, graine=g, duree_max=a.duree, format_=a.format,
                         cadrage=a.cadrage, zooms_mode=a.zooms, melange=a.melange)
        d = os.path.join(out, f'variante-{g}')
        exporter(plan, d, a.pattern, rendu=a.rendu, navigateur=a.navigateur, node_modules=a.node_modules, sons=S)
        rp.ecrire_rapport(plan, T, os.path.join(d, 'remplissage.md'))
        plans.append(plan)
    if len(plans) > 1: rp.comparer_variantes(plans, os.path.join(out, 'variantes.md'))
    print(f"\nTerminé → {out}")


if __name__ == '__main__':
    main()
