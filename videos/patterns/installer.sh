#!/usr/bin/env bash
# Installe tout ce qu'il faut pour analyse_montage.py (Linux Ubuntu/Debian, macOS, sessions Claude dans le cloud).
set -e
cd "$(dirname "$0")"
echo "== 1/4 Logiciels système : ffmpeg, Tesseract (anglais et français), espeak-ng (vidéo de test), Node.js (rendu Remotion)"
if command -v apt-get >/dev/null; then
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ffmpeg tesseract-ocr tesseract-ocr-eng tesseract-ocr-fra python3-pip espeak-ng
  command -v node >/dev/null || $SUDO apt-get install -y -qq nodejs npm || true
elif command -v brew >/dev/null; then
  brew install ffmpeg tesseract tesseract-lang python espeak-ng node
else
  echo "Installez ffmpeg et tesseract à la main (aucun apt-get ni brew trouvé)."; exit 1
fi
echo "== 2/4 Modules Python"
PIP="python3 -m pip install --upgrade"; $PIP -r requirements.txt >/dev/null 2>&1 || PIP="python3 -m pip install --break-system-packages --upgrade"
$PIP -r requirements.txt
# lecture des textes stylisés (RapidOCR) sans laisser remplacer OpenCV par une version 5 (qui n'a plus la détection de visages)
$PIP --no-deps rapidocr_onnxruntime
python3 -m pip uninstall -y opencv-python >/dev/null 2>&1 || python3 -m pip uninstall -y --break-system-packages opencv-python >/dev/null 2>&1 || true
echo "== 3/4 Modèles d'écoute (transcription, voix, séparation voix / musique : ~600 Mo, une seule fois)"
python3 telecharger_modeles.py
echo "== 4/4 Vérification"
python3 verifier_installation.py
