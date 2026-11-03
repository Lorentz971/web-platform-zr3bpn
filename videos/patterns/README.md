# Patterns de montage : mesurer une vidéo, puis l'appliquer à nos rushs

Trois étapes, trois commandes :

```
1. MESURER    python3 analyse_montage.py VIDEO.mp4 DOSSIER          → pattern.json, rapport.md, timeline.png
2. COMBINER   python3 agreger.py style.json DOSSIER1 DOSSIER2 …     → le « style » d'un créateur sur plusieurs vidéos
3. APPLIQUER  python3 appliquer_pattern.py pattern.json NOS_RUSHS…  → projet Remotion, timeline DaVinci, recette CapCut
   VÉRIFIER   python3 comparer.py pattern.json notre/pattern.json   → conformité de notre montage, mesure par mesure
```

Pour récupérer une vidéo YouTube ou TikTok : `yt-dlp -f "bv*+ba/b" -o video.mp4 URL`
(seulement pour étudier le montage ; on ne réutilise ni les images ni le son des autres).

## 1. Mesurer le pattern d'une vidéo

`python3 analyse_montage.py VIDEO.mp4 DOSSIER` (environ 2 à 3 min de calcul par minute de vidéo).

| Famille | Ce qui est mesuré |
|---|---|
| **Rythme** | Plans (durée moyenne, médiane), plans par minute, rythme toutes les 5 s, répartition des types de plan (face caméra, illustration, capture d'écran, carton de texte, graphique, écran partagé) |
| **Coupes** | Coupe sèche, jump cut, coupe avec recadrage (% de zoom entre les deux cadres) |
| **Transitions** | Fondu enchaîné, flash blanc, fondu au noir, glissement (direction), panoramique filé, rideau (direction), glitch, zoom de transition, rotation de transition — avec leur durée en images |
| **Caméra** | Punch-in, dézoom, poussée et recul lents (%, durée, courbe d'accélération, rebond, point visé, progression image par image), panoramiques, rotations, tremblements (amplitude, fréquence) |
| **Vitesse** | Ralenti, accéléré, accélération / décélération progressive (speed ramp), marche arrière, arrêt sur image |
| **Incrustations** | Sticker / émoji, flèche ou forme, bandeau (lower third), encart, texte animé, image dans l'image, écran partagé, barre de progression — position, taille, animation d'entrée et de sortie |
| **Textes** | Sous-titres lus (anglais et français) : moment, mots par sous-titre, position, taille, majuscules, contour noir, mot surligné et sa couleur, animation (pop, pop avec rebond, mot par mot, agrandissement) ; titres et textes d'interface |
| **Image** | Par plan : luminosité, contraste, saturation, teinte, température, teinte des ombres et des hautes lumières (étalonnage), vignettage, grain, bandes noires ; visage (taille, position, espace au-dessus, règle des tiers) |
| **Son** | Volume (LUFS), voix transcrite mot par mot avec les temps (25 langues), pauses, débit (mots/min), temps de parole, tempo, coupes sur le temps, musique baissée sous la voix (dB), coupures de musique avant une révélation, effets sonores classés (whoosh, pop, clic, ding, impact, montée, glitch, déclencheur photo, clavier) et l'événement image sur lequel ils tombent, coupes pendant les pauses ou sur la parole |
| **Structure** | Intensité seconde par seconde, accroche (durée, ce qu'elle contient), chapitres, relances |

## 2. Combiner plusieurs vidéos (le style d'un créateur)

`python3 agreger.py style.json out_video1 out_video2 out_video3` : pour chaque mesure, la valeur à viser (médiane),
la fourchette et la régularité (« constant » = un vrai choix du créateur ; « variable » = ça dépend de la vidéo).
`style.md` le présente en tableau. Un style s'utilise partout comme un pattern.

## 3. Appliquer le pattern à nos rushs

```
python3 appliquer_pattern.py style.json face-cam.mp4 broll1.mp4 broll2.mp4 --musique musique.mp3 --sortie montage [--duree 60] [--rendu]
```

- Les rushs **où l'on parle** deviennent la piste principale : silences retirés, coupes entre les mots (jamais au milieu
  d'un mot), durée des plans tirée de celle du pattern et de sa courbe de rythme, changement de cadre aux coupes.
- Les rushs **sans parole** deviennent des illustrations par-dessus la voix, dans la proportion du pattern.
- Transitions, zooms sur les mots forts, sous-titres (même style), effets sonores (même densité, mêmes déclencheurs,
  fabriqués par calcul dans `sfx/`), musique baissée sous la voix, barre de progression, étalonnage, volume final.

Dans le dossier de sortie :

| Pour | Fichier | Comment l'utiliser |
|---|---|---|
| **Remotion** | `remotion/` | `npm install` puis `npm run apercu` (studio) ou `npm run rendu`. Tout le montage est dans `src/montage-data.json` : on retouche ce fichier, pas le code. |
| **DaVinci Resolve** (et Final Cut) | `davinci/montage.fcpxml` | Fichier → Importer → Timeline. Les coupes, les illustrations, les cadrages, les effets sonores et la musique sont placés ; les transitions et les zooms sont des marqueurs nommés. Sous-titres : importer `sous-titres.srt`. |
| **Premiere, Avid** | `davinci/montage_V1.edl`, `_V2.edl` | Import EDL (coupes et illustrations). |
| **CapCut** (ou n'importe quel logiciel) | `capcut/recette.md` + `sous-titres.srt` + `marqueurs.csv` | La recette pas à pas, chaque action avec son timecode. CapCut : Texte → Sous-titres locaux → importer le .srt. |
| **Tout** | `plan-de-montage.json` | Toutes les décisions, lisibles. |

`--rendu` rend la vidéo avec Remotion, la normalise au volume du pattern, **la ré-analyse et la compare au pattern**
(`conformite.md` : chaque écart avec ce qu'il faut corriger). Options : `--navigateur CHEMIN` (Chrome déjà installé),
`--node-modules DOSSIER` (réutiliser un projet Remotion existant), `--graine N` (autre tirage des mêmes règles).

## Installation (une seule fois par ordinateur)

| Où | Quoi faire |
|---|---|
| **Windows** | Clic droit sur `installer-windows.ps1` → « Exécuter avec PowerShell ». |
| **Mac** | Installer [Homebrew](https://brew.sh), puis : `bash installer.sh` |
| **Linux** | `bash installer.sh` |
| **Session Claude Code (cloud)** | Demander à Claude : « lance `bash videos/patterns/installer.sh` » (à refaire à chaque nouvelle session cloud, ~5 min avec les modèles). |

L'installateur met : ffmpeg, Tesseract (anglais + français), les modules Python (`requirements.txt`), espeak-ng (vidéo de test),
Node.js (rendu Remotion), puis télécharge une fois les **modèles d'écoute** (~600 Mo, `telecharger_modeles.py`, dans
`~/.cache/analyse-montage`) : Parakeet (transcription mot par mot), Silero (voix), Spleeter (voix / musique). Sans les
modèles, l'outil marche quand même mais estime la voix au lieu de la transcrire.

**Vérifier** : `python3 verifier_installation.py` (installations + auto-test, doit donner **23 / 23**) ; `--rapide` pour les installations seules.

## La vérification (vidéos de test à réglages connus)

| Vidéo de test | Contenu | Résultat |
|---|---|---|
| `video-test-complete.py` → `verifier.py` | 24 s horizontale : coupes sur le temps, fondu, flash, glissement, tremblement, punch-in, poussée, rotation, ralenti, arrêt sur image, sous-titres, visage, couleurs, voix, musique, effets | **23 / 23** |
| `video-test-v2.py` → `verifier_v2.py` | 40 s verticale : coupe avec recadrage, panoramique filé, glitch, zoom de transition, rideau, rotation, flash, speed ramp, marche arrière, sticker, flèche, bandeau, émoji, image dans l'image, écran partagé, barre de progression, sous-titres pop / mot par mot, carton de texte, capture d'écran, étalonnage, bandes noires, voix transcrite, 26 effets sonores | **41 / 42** (`verification_v2.md`) |
| La même vidéo n° 2, abîmée | très compressée / caméra à la main / bruit et flou | **36 / 32 / 27 sur 42** (détail dans `verification_v2.md`) |
| `video-test-rushs.py` | Faux rushs (face caméra + 2 illustrations + musique) pour tester `appliquer_pattern.py --rendu` de bout en bout | conformité de notre montage au pattern : **58 à 61 %** (`conformite-exemple.md`) ; rythme, coupes, débit, sous-titres, barre de progression justes |

## Les limites (à garder en tête)

- **Grain fin** : effacé par la compression des plateformes, il n'est plus mesurable (seul point faux du test n° 2).
- **Effets sonores sous la voix** : un bruit de clavier pendant qu'on parle n'est pas toujours repéré.
- **Transcription** : très bonne sur une vraie voix ; sur une voix de synthèse sous musique, environ 8 % de mots faux.
- **Ralenti / speed ramp** : se mesurent sur un objet qui bouge dans le plan ; sur un plan sans mouvement, rien à mesurer.
- **Visages** : détecteur classique, efficace de face, moins de profil.
- **Transitions dans DaVinci / CapCut** : placées comme marqueurs nommés (le type et la durée), à appliquer avec l'effet du logiciel ; Remotion les rend directement.
- **Vraies vidéos** : voir la section robustesse de `verification_v2.md` ; vérifiez les premières analyses à l'œil sur `timeline.png`.
- **Ré-analyse de nos montages Remotion** : quelques effets fabriqués sont mal reconnus (petites incrustations posées sur une image très animée, zoom de transition lu comme un zoom) : la conformité affichée est donc un peu pessimiste.
- **Coupes calées sur la musique et coupes dans les pauses** : quand on parle sans arrêt (silences retirés), les coupes tombent sur la parole ; le pattern d'une vidéo avec des passages musicaux ne peut pas être suivi à 100 %.
