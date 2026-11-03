# Mesurer le pattern de montage d'une vidéo

## L'outil

`python3 analyse_montage.py VIDEO.mp4 DOSSIER_SORTIE` produit trois fichiers :
- `pattern.json` : toutes les mesures, à réutiliser dans Remotion ou dans l'app de montage ;
- `rapport.md` : la même chose, lisible ;
- `timeline.png` : une frise avec les plans, le zoom, les sous-titres, le visage, le son et l'intensité.

**À installer** : `pip install "opencv-python-headless<5" numpy librosa pyloudnorm scipy matplotlib pytesseract`, plus `tesseract-ocr` (pour lire les sous-titres) et `ffmpeg`.

## Ce qui est mesuré

| Famille | Paramètres |
|---|---|
| **Rythme** | Coupes sèches, durée des plans (moyenne et médiane), plans par minute |
| **Transitions** | Coupe sèche, fondu enchaîné (durée), flash blanc, fondu au noir, glissement (durée et direction) |
| **Caméra** | Punch-in et dézoom rapide (%, durée, vitesse max, courbe d'accélération, point visé), poussée et recul lents, panoramiques (px et % de l'écran), rotations (degrés), tremblements (amplitude en px, fréquence en Hz) |
| **Vitesse** | Ralentis et accélérés (vitesse du sujet avant/après, facteur), arrêts sur image |
| **Couleurs** | Par plan : luminosité, contraste, saturation, teinte dominante, température (chaude/froide) |
| **Sous-titres** | Texte (lu par OCR), moment et durée, nombre de mots, position, taille, mot surligné et sa couleur |
| **Visages** | Moments de présence, taille moyenne à l'écran, position |
| **Son** | Volume intégré (LUFS) et volume par seconde, tempo (BPM), coupes calées sur les temps, passages de voix, pauses, débit (syllabes/s, mots/min estimés), baisse de la musique sous la voix (dB), effets sonores (whoosh / boum) et l'événement visuel sur lequel ils tombent |
| **Synthèse** | Indice d'intensité de 0 à 100, seconde par seconde |

## La vérification

`video-test-complete.py` fabrique une vidéo de 24 s qui contient tous ces effets, avec des réglages connus. `verifier.py` compare ensuite la mesure à la réalité.

**Résultat : 23 paramètres justes sur 23** (voir `verification.md`). Sur la première vidéo de test (`video-test-zooms.py`), sans son, les mesures restent justes : punch-in +39,8 % pour +40 %, coupe à 4,2 s, panoramique de 397 px pour 400 px, sans fausse détection.

Exemple de résultat : `rapport-exemple.md`, `pattern-exemple.json`, `timeline-exemple.png`.

## Les limites (à garder en tête)

- **Débit de parole** et **baisse de la musique** : ce sont des estimations faites sans transcription ni séparation des pistes, car les modèles ne sont pas téléchargeables dans cette session. C'est exact sur la vidéo de test, mais moins précis sur une vraie voix avec de la musique dans les mêmes fréquences.
- **Effets sonores** : seuls deux types sont reconnus, le souffle (« whoosh ») et l'impact grave (« boum »).
- **Ralenti** : on mesure la vitesse d'un objet qui bouge dans le plan. Un ralenti sur un plan sans objet en mouvement n'est pas détectable.
- **Visages** : détecteur classique, efficace de face, moins de profil.
- **Vraies vidéos** : la vidéo de test est propre. Sur des vidéos réelles (flou, compression, foule), il faut s'attendre à quelques erreurs, à vérifier sur les premières analyses.
- `mesure-zoom.py` est la première version, limitée aux zooms. Elle est remplacée par `analyse_montage.py`.
