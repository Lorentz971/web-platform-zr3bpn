#!/usr/bin/env python3
"""Télécharge les modèles d'écoute (une seule fois, ~600 Mo) dans ~/.cache/analyse-montage
(ou dans le dossier indiqué par la variable MONTAGE_MODELS) :
  - Parakeet TDT 0.6b v3 : transcription horodatée mot par mot, 25 langues dont le français et l'anglais
  - Silero VAD : repérage précis des passages de voix
  - Spleeter 2 pistes : séparation voix / musique (mesure de la musique baissée sous la voix)
Sans ces modèles, l'outil marche quand même, mais estime la voix au lieu de la transcrire."""
import os, sys, tarfile, urllib.request

DEST = os.environ.get('MONTAGE_MODELS', os.path.join(os.path.expanduser('~'), '.cache', 'analyse-montage'))
BASE = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/'
MODELES = [
    ('sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8', BASE + 'asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2', 'tokens.txt'),
    ('sherpa-onnx-spleeter-2stems-fp16', BASE + 'source-separation-models/sherpa-onnx-spleeter-2stems-fp16.tar.bz2', 'vocals.fp16.onnx'),
    ('silero_vad.onnx', BASE + 'asr-models/silero_vad.onnx', None),
]


def barre(n, bs, total):
    if total > 0:
        p = min(100, n * bs * 100 // total); sys.stdout.write(f'\r    {p:3d} %'); sys.stdout.flush()


def main():
    os.makedirs(DEST, exist_ok=True); print('Dossier des modèles :', DEST)
    for nom, url, temoin in MODELES:
        cible = os.path.join(DEST, nom)
        if os.path.exists(os.path.join(cible, temoin) if temoin else cible):
            print(f'  ✅ {nom} (déjà là)'); continue
        print(f'  ⬇️  {nom}')
        tmp = cible + ('.tar.bz2' if temoin else '.part')
        urllib.request.urlretrieve(url, tmp, barre); print()
        if temoin:
            with tarfile.open(tmp, 'r:bz2') as t:
                kw = {'filter': 'data'} if sys.version_info >= (3, 12) else {}
                t.extractall(DEST, **kw)
            os.remove(tmp)
        else:
            os.replace(tmp, cible)
        print(f'  ✅ {nom}')
    print('Modèles prêts.')


if __name__ == '__main__':
    main()
