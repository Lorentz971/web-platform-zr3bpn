#!/usr/bin/env python3
"""Télécharge les modèles d'écoute (une seule fois, ~600 Mo) dans ~/.cache/analyse-montage
(ou dans le dossier indiqué par la variable MONTAGE_MODELS) :
  - Parakeet TDT 0.6b v3 : transcription horodatée mot par mot, 25 langues dont le français et l'anglais
  - Silero VAD : repérage précis des passages de voix
  - Spleeter 2 pistes : séparation voix / musique (mesure de la musique baissée sous la voix)
  - MediaPipe : personnes, pose, visage et expression, détourage du sujet
Sans ces modèles, l'outil marche quand même, mais estime la voix au lieu de la transcrire et ne reconnaît pas les gestes."""
import os, sys, tarfile, urllib.request

DEST = os.environ.get('MONTAGE_MODELS', os.path.join(os.path.expanduser('~'), '.cache', 'analyse-montage'))
BASE = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/'
MP = 'https://storage.googleapis.com/mediapipe-models/'
MODELES = [
    ('sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8', BASE + 'asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2', 'tokens.txt'),
    ('sherpa-onnx-spleeter-2stems-fp16', BASE + 'source-separation-models/sherpa-onnx-spleeter-2stems-fp16.tar.bz2', 'vocals.fp16.onnx'),
    ('silero_vad.onnx', BASE + 'asr-models/silero_vad.onnx', None),
    # comprendre l'image : personnes, pose (bras levés…), visage et expression, détourage du sujet (MediaPipe, Google)
    ('efficientdet_lite0.tflite', MP + 'object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite', None),
    ('pose_landmarker_full.task', MP + 'pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task', None),
    ('face_landmarker.task', MP + 'face_landmarker/face_landmarker/float16/latest/face_landmarker.task', None),
    ('selfie_multiclass_256x256.tflite', MP + 'image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite', None),
]


_dernier = [-1]
def barre(n, bs, total):
    if total > 0:
        p = min(100, n * bs * 100 // total)
        if p // 10 != _dernier[0]:                      # une ligne tous les 10 %
            _dernier[0] = p // 10; sys.stdout.write(f'\r    {p:3d} %'); sys.stdout.flush()


def main():
    os.makedirs(DEST, exist_ok=True); print('Dossier des modèles :', DEST)
    for nom, url, temoin in MODELES:
        cible = os.path.join(DEST, nom)
        if os.path.exists(os.path.join(cible, temoin) if temoin else cible):
            print(f'  ✅ {nom} (déjà là)'); continue
        print(f'  ⬇️  {nom}')
        tmp = cible + ('.tar.bz2' if temoin else '.part')
        _dernier[0] = -1; urllib.request.urlretrieve(url, tmp, barre); print()
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
