"""Recherche par le sens : CLIP (ViT-B/32, OpenAI, version ONNX) relie une image et une phrase.
On peut chercher « dunk », « foule qui crie », « voiture sous la pluie » dans nos rushs.
Aucune image n'est générée : le modèle compare seulement des images et des phrases.
Modèles : ~/.cache/analyse-montage/clip/{visual,textual}.onnx (telecharger_modeles.py).
Le vocabulaire du découpeur de mots (clip_bpe_vocab.txt.gz) vient d'OpenAI CLIP (licence MIT)."""
import gzip, html, os, re
import numpy as np
import cv2

DOSSIER = os.path.join(os.environ.get('MONTAGE_MODELS', os.path.join(os.path.expanduser('~'), '.cache', 'analyse-montage')), 'clip')
VOCAB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clip_bpe_vocab.txt.gz')
_s = {}


def disponible():
    return all(os.path.exists(os.path.join(DOSSIER, f)) for f in ('visual.onnx', 'textual.onnx'))


def _session(nom):
    if nom not in _s:
        import onnxruntime as ort
        o = ort.SessionOptions(); o.intra_op_num_threads = max(1, (os.cpu_count() or 2) // 2); o.log_severity_level = 3
        _s[nom] = ort.InferenceSession(os.path.join(DOSSIER, nom + '.onnx'), o, providers=['CPUExecutionProvider'])
    return _s[nom]


# ---------------- découpeur de mots (BPE de CLIP)
def _octets():
    bs = list(range(ord('!'), ord('~') + 1)) + list(range(ord('¡'), ord('¬') + 1)) + list(range(ord('®'), ord('ÿ') + 1))
    cs = bs[:]; n = 0
    for b in range(256):
        if b not in bs: bs.append(b); cs.append(256 + n); n += 1
    return dict(zip(bs, [chr(c) for c in cs]))


class _BPE:
    def __init__(self):
        self.be = _octets()
        merges = gzip.open(VOCAB).read().decode('utf-8').split('\n')[1:49152 - 256 - 2 + 1]
        merges = [tuple(m.split()) for m in merges]
        vocab = list(self.be.values()); vocab += [v + '</w>' for v in vocab] + [''.join(m) for m in merges] + ['<|startoftext|>', '<|endoftext|>']
        self.enc = dict(zip(vocab, range(len(vocab)))); self.rangs = dict(zip(merges, range(len(merges)))); self.cache = {}
        self.pat = re.compile(r"'s|'t|'re|'ve|'m|'ll|'d|[^\W\d_]+|\d|[^\s\w]+", re.IGNORECASE)

    def _bpe(self, tok):
        if tok in self.cache: return self.cache[tok]
        w = tuple(tok[:-1]) + (tok[-1] + '</w>',)
        while len(w) > 1:
            paires = {(w[i], w[i + 1]) for i in range(len(w) - 1)}
            p = min(paires, key=lambda x: self.rangs.get(x, 1e18))
            if p not in self.rangs: break
            nw = []; i = 0
            while i < len(w):
                if i < len(w) - 1 and (w[i], w[i + 1]) == p: nw.append(w[i] + w[i + 1]); i += 2
                else: nw.append(w[i]); i += 1
            w = tuple(nw)
        self.cache[tok] = w; return w

    def encode(self, texte, n=77):
        texte = re.sub(r'\s+', ' ', html.unescape(texte)).strip().lower()
        ids = [49406]
        for t in self.pat.findall(texte):
            t = ''.join(self.be[b] for b in t.encode('utf-8'))
            ids += [self.enc[x] for x in self._bpe(t) if x in self.enc]
        ids = ids[:n - 1] + [49407]
        return ids + [0] * (n - len(ids)), [1] * len(ids) + [0] * (n - len(ids))


_bpe = None

# français → anglais pour les mots du montage et du sport (CLIP comprend surtout l'anglais)
FR = {'feux de départ': 'race starting lights', 'drapeau à damier': 'checkered flag', 'ligne d\'arrivée': 'finish line', 'tour d\'honneur': 'victory lap',
      'sortie de piste': 'car crash', 'accident': 'crash', 'dépassement': 'overtaking', 'lancer franc': 'free throw', 'sur le banc': 'on the bench',
      'dunk': 'slam dunk', 'dunke': 'slam dunk', 'dunker': 'slam dunk', 'smash': 'slam dunk', 'smashe': 'slam dunk', 'tire': 'shooting', 'shoote': 'shooting', 'marque': 'scoring',
      'gagne': 'winning', 'victoire': 'victory', 'défaite': 'defeat', 'perd': 'losing', 'sautent': 'jumping', 'courent': 'running', 'célèbrent': 'celebrating', 'crient': 'cheering', 'panier': 'basket shot', 'tir': 'shooting the ball', 'trois points': 'three point shot', 'dribble': 'dribbling the ball',
      'passe': 'passing the ball', 'contre': 'blocking a shot', 'ballon': 'ball', 'balle': 'ball', 'basket': 'basketball', 'terrain': 'court', 'match': 'game',
      'joueur': 'player', 'joueurs': 'players', 'équipe': 'team', 'coéquipiers': 'teammates', 'entraîneur': 'coach', 'arbitre': 'referee', 'banc': 'bench',
      'foule': 'crowd', 'public': 'crowd', 'supporters': 'fans', 'qui crie': 'cheering', 'crie': 'shouting', 'célébration': 'celebration', 'célèbre': 'celebrating',
      'bras levés': 'arms raised', 'poing': 'fist', 'sourire': 'smiling', 'pleure': 'crying', 'triste': 'sad', 'en colère': 'angry', 'concentré': 'focused',
      'visage': 'face', 'gros plan': 'close-up', 'plan large': 'wide shot', 'de dos': 'from behind', 'portrait': 'portrait', 'sueur': 'sweat',
      'voiture': 'car', 'course': 'race', 'circuit': 'race track', 'pilote': 'driver', 'casque': 'helmet', 'podium': 'podium', 'trophée': 'trophy', 'champagne': 'champagne',
      'stand': 'pit stop', 'départ': 'race start', 'feux': 'lights', 'drapeau': 'flag', 'pluie': 'rain', 'nuit': 'night', 'jour': 'day', 'soleil': 'sun', 'coucher de soleil': 'sunset',
      'ville': 'city', 'rue': 'street', 'plage': 'beach', 'mer': 'sea', 'montagne': 'mountain', 'ciel': 'sky', 'neige': 'snow', 'route': 'road', 'stade': 'stadium',
      'vestiaire': 'locker room', 'tunnel': 'tunnel', 'arrivée': 'arrival', 'entrée': 'entrance', 'interview': 'interview', 'micro': 'microphone', 'conférence': 'press conference',
      'saute': 'jumping', 'saut': 'jump', 'court': 'running', 'tombe': 'falling', 'chute': 'falling', 'marche': 'walking', 'danse': 'dancing', 'enlace': 'hugging', 'câlin': 'hug',
      'ralenti': 'slow motion', 'action': 'action', 'rapide': 'fast', 'lumières': 'lights', 'fumée': 'smoke', 'feu': 'fire', 'écran': 'screen', 'téléphone': 'phone',
      'homme': 'man', 'femme': 'woman', 'enfant': 'child', 'chien': 'dog', 'main': 'hand', 'mains': 'hands', 'yeux': 'eyes', 'chaussures': 'sneakers', 'maillot': 'jersey',
      'qui': '', 'le': '', 'la': '', 'les': '', 'un': 'a', 'une': 'a', 'des': '', 'de': '', 'du': '', 'avec': 'with', 'sur': 'on', 'dans': 'in', 'et': 'and', 'en': 'in'}


def traduire(q):
    q = ' ' + q.lower().strip() + ' '
    for fr in sorted(FR, key=len, reverse=True):
        q = re.sub(r'(?<![\w])' + re.escape(fr) + r'(?![\w])', (' ' + FR[fr] + ' ') if FR[fr] else ' ', q)
    return re.sub(r'\s+', ' ', q).strip()


def texte(phrases):
    """Vecteurs (normés) de phrases. Chaque phrase est traduite puis moyennée sur deux formulations."""
    global _bpe
    if _bpe is None: _bpe = _BPE()
    out = []
    for p in phrases:
        en = traduire(p)
        ids, m = zip(*[_bpe.encode(x) for x in (f'a photo of {en}', f'a video frame of {en}', en)])
        v = _session('textual').run(None, {'input_ids': np.array(ids, np.int32), 'attention_mask': np.array(m, np.int32)})[0]
        v = v / np.linalg.norm(v, axis=1, keepdims=True); v = v.mean(0); out.append(v / np.linalg.norm(v))
    return np.array(out, np.float32)


MOY = np.array([0.48145466, 0.4578275, 0.40821073], np.float32); ECT = np.array([0.26862954, 0.26130258, 0.27577711], np.float32)


def images(frames_bgr):
    """Vecteurs (normés) d'images BGR, par lots."""
    xs = []
    for f in frames_bgr:
        h, w = f.shape[:2]; s = 224 / min(h, w)
        r = cv2.resize(f, (max(224, round(w * s)), max(224, round(h * s))), interpolation=cv2.INTER_CUBIC)
        y0, x0 = (r.shape[0] - 224) // 2, (r.shape[1] - 224) // 2
        r = cv2.cvtColor(r[y0:y0 + 224, x0:x0 + 224], cv2.COLOR_BGR2RGB).astype(np.float32) / 255
        xs.append(((r - MOY) / ECT).transpose(2, 0, 1))
    if not xs: return np.zeros((0, 512), np.float32)
    out = []
    for i in range(0, len(xs), 16):
        v = _session('visual').run(None, {'pixel_values': np.stack(xs[i:i + 16])})[0]; out.append(v / np.linalg.norm(v, axis=1, keepdims=True))
    return np.concatenate(out).astype(np.float32)


def vers_texte(v):
    import base64
    return base64.b64encode(np.asarray(v, np.float16).tobytes()).decode()


def depuis_texte(s):
    import base64
    return np.frombuffer(base64.b64decode(s), np.float16).astype(np.float32).reshape(-1, 512)
