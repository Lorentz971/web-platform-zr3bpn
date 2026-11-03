"""Nos propres effets sonores : un dossier de sons (whoosh, impacts, risers…) remplace les sons fabriqués par calcul.
Chaque fichier est rangé par son nom (« whoosh_03.wav », « impact boom.mp3 »…) ; si le nom ne dit rien, par son écoute
(forme du volume dans le temps, son grave ou aigu, bruit ou note)."""
import os, re, shutil
import numpy as np

TYPES = ('whoosh', 'impact', 'riser', 'pop', 'clic', 'ding', 'glitch', 'declencheur', 'clavier')
NOMS = {'whoosh': r'whoosh|swoosh|swish|woosh|transition|swipe|wind|souffle|passage',
        'impact': r'impact|boom|boum|hit|punch|thud|slam|bass ?drop|sub|kick|braam|coup',
        'riser': r'riser|rise|uplifter|build|sweep ?up|montee|montée|tension|reverse',
        'pop': r'\bpop|bubble|bulle|blip|plop',
        'clic': r'click|clic|tick|tap|mouse|souris',
        'ding': r'ding|bell|cloche|chime|notif|success|coin|sparkle|ting',
        'glitch': r'glitch|static|digital|error|bug|stutter|distort',
        'declencheur': r'shutter|camera|photo|declencheur|déclencheur|snap',
        'clavier': r'keyboard|typing|clavier|type'}
EXT = ('.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac', '.aif', '.aiff')


def par_ecoute(path):
    import librosa
    y, sr = librosa.load(path, sr=22050, mono=True, duration=8)
    if len(y) < 256: return None
    d = len(y) / sr
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=256)[0]; pic = int(np.argmax(rms)) / max(1, len(rms) - 1)
    cen = float(np.median(librosa.feature.spectral_centroid(y=y, sr=sr)))
    plat = float(np.median(librosa.feature.spectral_flatness(y=y)))
    ons = librosa.onset.onset_detect(y=y, sr=sr, units='time')
    if d < 0.3: return 'clic' if cen > 3000 else 'pop'
    if pic > 0.65 and d > 1.0: return 'riser'
    if len(ons) >= 6 and d < 2.5 and plat > 0.05: return 'glitch'
    if plat < 0.01 and cen > 700 and pic < 0.3: return 'ding'                 # une note claire qui s'éteint
    if pic < 0.15 and cen < 1800: return 'impact'
    if 0.12 <= pic <= 0.75 and plat > 0.02: return 'whoosh'
    return 'impact' if cen < 1800 else 'whoosh'


def classer(dossier, log=print):
    """{type: [fichiers]} pour un dossier de sons (sous-dossiers compris ; le nom du sous-dossier compte aussi)."""
    out = {t: [] for t in TYPES}; inconnus = 0
    for racine, _, fichiers in os.walk(dossier):
        for f in sorted(fichiers):
            if not f.lower().endswith(EXT): continue
            p = os.path.join(racine, f); nom = (os.path.relpath(p, dossier)).lower().replace('_', ' ').replace('-', ' ')
            t = next((k for k, rx in NOMS.items() if re.search(rx, nom)), None)
            if t is None:
                try: t = par_ecoute(p)
                except Exception: t = None
                inconnus += 1
            if t: out[t].append(p)
    n = sum(len(v) for v in out.values())
    log(f"Nos sons : {n} fichier(s) — " + ', '.join(f'{k} {len(v)}' for k, v in out.items() if v) + (f" ({inconnus} rangés à l'écoute)" if inconnus else ''))
    return out


def appliquer(plan, banque_sons, dossier_sortie):
    """Remplace les sons fabriqués du plan par les nôtres (en alternant les fichiers d'un même type). Renvoie {nom publié: chemin source}."""
    os.makedirs(dossier_sortie, exist_ok=True); chemins = {}; compte = {}
    for e in plan.get('effets', []):
        L = banque_sons.get(e['type']) or []
        if not L: continue
        k = compte.get(e['type'], 0); compte[e['type']] = k + 1
        src = L[k % len(L)]; nom = 'perso-' + re.sub(r'[^\w.-]+', '_', os.path.basename(src))
        dst = os.path.join(dossier_sortie, nom)
        if not os.path.exists(dst): shutil.copy(src, dst)
        e['fichier'] = os.path.join(os.path.basename(dossier_sortie), nom); e['notre_son'] = os.path.basename(src); chemins[nom] = dst
    return chemins
