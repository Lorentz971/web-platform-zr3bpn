#!/usr/bin/env python3
"""Synchroniser plusieurs caméras ou micros par le son.
Usage : python3 synchroniser.py CAMERA_A.mp4 CAMERA_B.mp4 [MICRO.wav ...] [--sortie synchro.json]
Pour chaque fichier : le décalage par rapport au premier (en secondes : + = il a commencé à filmer plus tard) et la confiance.
Dans DaVinci / Premiere / CapCut : décalez chaque piste de cette valeur (ou utilisez synchro.json)."""
import argparse, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from montage import synchro


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('fichiers', nargs='+'); ap.add_argument('--sortie', default='synchro.json')
    a = ap.parse_args()
    if len(a.fichiers) < 2: ap.error('il faut au moins deux fichiers')
    print(f'Référence : {a.fichiers[0]}')
    R = synchro.synchroniser(a.fichiers)
    json.dump(R, open(a.sortie, 'w'), ensure_ascii=False, indent=1)
    faibles = [r for r in R[1:] if r['confiance'] < 0.3]
    if faibles: print('Attention : synchro peu sûre pour ' + ', '.join(os.path.basename(r['fichier']) for r in faibles) + ' (pas de son commun ?)')
    print(f'→ {a.sortie}')


if __name__ == '__main__':
    main()
