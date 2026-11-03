# Vérifie que tout est installé, puis lance l'auto-test (vidéo de test + analyse + 23 vérifications).
import importlib, shutil, subprocess, sys, os
ok = True
print('Logiciels :')
for exe in ['ffmpeg', 'tesseract']:
    path = shutil.which(exe)
    if not path and exe == 'tesseract' and os.path.exists(r'C:\Program Files\Tesseract-OCR\tesseract.exe'): path = 'C:/Program Files/Tesseract-OCR'
    print(f"  {'✅' if path else '❌'} {exe}"); ok &= bool(path)
print('Modules Python :')
for m in ['cv2', 'numpy', 'scipy', 'librosa', 'pyloudnorm', 'matplotlib', 'pytesseract', 'PIL', 'skimage']:
    try: importlib.import_module(m); print(f'  ✅ {m}')
    except Exception: print(f'  ❌ {m}'); ok = False
try:
    import cv2; assert hasattr(cv2, 'CascadeClassifier'); print('  ✅ détection de visages')
except Exception: print('  ❌ détection de visages (il faut opencv < 5)'); ok = False
if not ok: sys.exit('\n❌ Il manque des éléments : relancez l\'installateur.')
if '--rapide' in sys.argv: sys.exit('\n✅ Tout est installé.')
print('\nAuto-test (environ 1 à 3 minutes)…')
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
subprocess.run([sys.executable, 'video-test-complete.py'], check=True, cwd=here)
subprocess.run([sys.executable, 'analyse_montage.py', 'full.mp4', 'autotest'], check=True, cwd=here, stdout=subprocess.DEVNULL)
out = subprocess.run([sys.executable, 'verifier.py', 'autotest/pattern.json', 'truth_full.json'], cwd=here, capture_output=True, text=True).stdout
print(out.strip().splitlines()[-1])
for f in ['full_raw.mp4', 'full.wav']:
    if os.path.exists(f): os.remove(f)
