#!/usr/bin/env bash
# Installe tout ce qu'il faut pour analyse_montage.py (Linux Ubuntu/Debian, macOS, sessions Claude dans le cloud).
set -e
cd "$(dirname "$0")"
echo "== 1/3 Logiciels système : ffmpeg + Tesseract (anglais et français)"
if command -v apt-get >/dev/null; then
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ffmpeg tesseract-ocr tesseract-ocr-eng tesseract-ocr-fra python3-pip
elif command -v brew >/dev/null; then
  brew install ffmpeg tesseract tesseract-lang python
else
  echo "Installez ffmpeg et tesseract à la main (aucun apt-get ni brew trouvé)."; exit 1
fi
echo "== 2/3 Modules Python"
python3 -m pip install --upgrade -r requirements.txt || python3 -m pip install --break-system-packages --upgrade -r requirements.txt
echo "== 3/3 Vérification"
python3 verifier_installation.py
