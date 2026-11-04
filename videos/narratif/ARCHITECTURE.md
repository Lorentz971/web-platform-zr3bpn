# Moteur de montage narratif : architecture

Document de conception pour avis. Rien n'est développé ; Media Finder n'est pas modifié.

---

## 0. Ce que l'échec de l'outil précédent nous apprend

L'outil « patterns » remplissait des cases avec le plan qui ressemblait le plus à quelques mots (« dunk », « gros plan »).
C'est exactement le comportement que ces règles interdisent. Il ne comprenait pas l'histoire, ne savait pas ce qu'était
un moment fort, et ses tests vérifiaient que la machine tournait, pas que le montage avait du sens.

Le nouveau système sépare donc strictement deux choses :

| | Qui le fait | Pourquoi |
|---|---|---|
| **Comprendre** : l'histoire, le sens de chaque passage, ce qu'il faut montrer, ce qu'il ne faut surtout pas montrer | un modèle de langage (Claude), peu de fois par vidéo | c'est la seule partie qui demande de la compréhension |
| **Exécuter** : chercher, vérifier, mesurer, caler, mixer, rendre | du code déterministe et des mesures | rapide, gratuit, reproductible, testable |

On garde de l'outil actuel ce qui marche bien : la transcription mot à mot (Parakeet), la détection de la voix (Silero),
l'index visuel par le sens (CLIP), l'analyse musicale (tempo, parties, drops, coups), le rangement des bruitages, le rendu
Remotion et les exports DaVinci et CapCut.

---

## 1. Faisabilité

| Exigence | Faisable ? | Comment | Risque réel |
|---|---|---|---|
| Comprendre le sens, les métaphores, les négations, les hypothèses, les retours en arrière | **Oui, bien** | Claude lit tout le script d'un coup, puis chapitre par chapitre, et produit une analyse structurée | Faible, si le script est clair. C'est le point fort des modèles de langage. |
| Identifier l'événement précis (pilote, saison, Grand Prix, incident) | **Oui** | Il est dans le script ou dans la « bible » de l'histoire, que le rédacteur valide | Le modèle ne doit **jamais inventer** un fait : dates et noms viennent du script ou de sources. |
| Trouver le **vrai** extrait d'un événement | **Dépend de Media Finder** | Demandes de recherche précises, construites à partir de l'événement | Si l'extrait n'existe pas dans les sources, aucun système ne le trouvera : il faut le signaler. |
| **Vérifier** qu'un extrait montre bien l'événement | **Partiellement** | Métadonnées (titre, date, description) + lecture des incrustations (score, nom, chrono) + commentaire audio transcrit + vérification visuelle sur 3 images clés | C'est **le point le plus difficile**. Vérification « sûre » seulement avec des indices concordants ; sinon « probable » et validation humaine. |
| Distinguer archive / illustration / reconstitution | **Oui** | Chaque média porte une catégorie et un niveau de vérification ; des règles interdisent les mauvaises combinaisons | Faible : c'est une règle de code, pas une intuition. |
| Caler sur la voix off réelle | **Oui, déjà fait** | Transcription mot à mot de la voix enregistrée (temps de chaque mot au centième) | Faible |
| Caler les bruitages sur une action visible | **Oui** | Animations : l'instant du contact est connu (c'est un paramètre). Archives : pic de son + pic de mouvement autour de l'instant demandé | Moyen sur les archives (bruit, foule) |
| Musique par chapitre, continuité, coupure volontaire | **Oui** | Bibliothèque musicale analysée (énergie, ambiance, tempo, parties) + règles de décision | Le choix d'une bonne musique reste subjectif : il faut proposer 2 ou 3 morceaux. |
| Animations réutilisables | **Oui** | Catalogue de composants Remotion avec paramètres, durée, points de synchro | Il faut construire le catalogue au fil des vidéos. |
| Rapidité | **Oui** | Tout est mis en cache ; environ 5 à 15 appels au modèle par vidéo (§ 8) | Le rendu final reste le poste le plus long. |

**Conclusion** : la logique demandée est réalisable. Deux points demandent de l'humain, et le système doit le dire
clairement au lieu de le cacher :
- la vérification des archives exactes quand les indices sont faibles ;
- le goût, pour choisir entre deux musiques ou deux beaux plans corrects.

---

## 2. Architecture

```
 SCRIPT ÉDITORIAL (humain)                    BIBLIOTHÈQUES (indexées une fois, en cache)
        │                                      médias · musiques · bruitages · animations · styles de chaîne
        ▼                                                           │
 ① ANALYSE NARRATIVE  ── Claude ──►  BIBLE DE L'HISTOIRE             │
        │                            (personnes, événements, dates,  │
        │                             faits / hypothèses / métaphores)│
        ▼                                                           │
 ② BESOINS AUDIOVISUELS ── Claude ─► « beats » : quoi montrer, quelle catégorie, ce qui est interdit
        │                                                           │
        ▼                                                           ▼
 ③ RECHERCHE ET VÉRIFICATION ── Media Finder (demandes par le sens) + vérificateur ──► médias classés A/B/C + confiance
        │
        ▼
 ④ PLANIFICATEUR (code) ── voix off alignée, coupes, textes, animations, bruitages, musique, transitions
        │
        ▼
 ⑤ CONTRÔLE QUALITÉ ── règles automatiques + 1 relecture Claude du plan (texte seul)
        │
        ▼
 PLAN TECHNIQUE (JSON) ──► ⑥ RENDU REMOTION (aperçu rapide, puis final) ──► ⑦ CORRECTIONS ciblées ──► ④ (seulement ce qui change)
```

### ① Analyse narrative : produire la « bible de l'histoire »

Une lecture du script entier, puis une par chapitre. Le modèle produit, sans rien inventer :
- **les entités** : personnes, équipes, lieux et objets, chacun avec un identifiant (`P_verstappen`, `E_redbull`) ;
- **les événements**, avec leur identifiant (`EV_crash_silverstone_2021`) et ce qu'on sait d'eux : qui, quoi, où, quand.
  Un événement mentionné sans date précise est marqué « à préciser » ;
- **les unités de sens** de chaque passage, chacune avec :
  - son **statut** : `fait`, `hypothèse`, `contrefactuel` (« s'il avait… »), `négation` (« il n'a jamais… »),
    `métaphore`, `rumeur`, `citation`, `retour en arrière`, `projection` ;
  - les **événements et entités auxquels elle renvoie**. Une métaphore est reliée à l'événement réel qu'elle désigne :
    « sa vie a basculé » → `EV_licenciement_2019`, d'après le contexte. Si le contexte ne permet pas de savoir lequel,
    la question est posée au rédacteur ;
  - **ce que le spectateur doit comprendre** et **ce qu'il doit ressentir**.

La bible est un fichier que le rédacteur peut corriger. Toutes les étapes suivantes s'appuient sur elle, pas sur les mots du script.

### ② Besoins audiovisuels : des « beats », pas « une phrase = un clip »

Un **beat** est une intention visuelle. Il peut couvrir une demi-phrase ou trois phrases. Chacun précise :

| Champ | Exemple |
|---|---|
| `montrer` | « la voiture de Verstappen qui sort de la piste à Copse, tour 1, GP de Grande-Bretagne 2021 » |
| `evenement` / `entites` | `EV_crash_silverstone_2021`, `P_verstappen`, `P_hamilton` |
| `fonction` | `preuve` (A) · `contexte` (B) · `explication` (C) |
| `authenticite` | `obligatoire` · `souhaitée` · `sans objet` |
| `interdits` | « ne pas montrer de victoire de Hamilton dans cette course » (négation), « pas d'image réelle présentée comme ce qui se serait passé » (hypothèse) |
| `ancrage` | les mots de la voix off sur lesquels le beat commence ou culmine, ou bien « son original seul » |
| `duree` | souhaitée, minimale, maximale |
| `repli` | ce qu'on fait si la preuve est introuvable : contexte, animation ou validation humaine |

Exemples de traduction automatique :
- **Métaphore** (« sa carrière s'est effondrée après cette décision ») : un beat `preuve` sur l'annonce de la décision,
  puis un beat `contexte` sur ses conséquences (résultats, réactions). Interdit : « effondrement littéral ».
- **Négation** (« contrairement aux rumeurs, il n'a jamais remporté cette course ») : un beat `preuve` sur le vrai
  résultat (le vrai vainqueur, le classement). Interdit : toute image de lui victorieux dans cette course, et tout texte
  « VICTOIRE ».
- **Hypothèse** (« s'il avait pris ce virage autrement… ») : un beat `explication` sous forme d'animation de
  trajectoire, avec un traitement visuel « hypothèse » (style schéma, mention « ET SI ? »). Interdit : une archive
  présentée comme ce qui se serait passé.

### ③ Recherche et vérification

1. **Demandes par le sens** envoyées à Media Finder, construites à partir du beat et de la bible, jamais à partir des mots
   du script. Pour chaque beat, la plus précise d'abord, puis des demandes plus larges :
   - précise : « crash Verstappen Copse tour 1 GP Grande-Bretagne 2021, images de la course » ;
   - plus large : « Verstappen Red Bull 2021 Silverstone » (contexte) ;
   - en dernier : « circuit de Silverstone, virage Copse » (contexte de lieu).
2. **Vérificateur**, qui classe chaque candidat :

| Indice | Outil | Coût |
|---|---|---|
| Titre, description, date, chaîne source | métadonnées de Media Finder | gratuit |
| Incrustations à l'écran (score, nom, tour, logo de diffusion, année) | OCR (déjà en place) | gratuit |
| Commentaire de l'extrait (« Verstappen est dans le mur ! ») | transcription (déjà en place) | gratuit |
| Contenu visuel par rapport à la description | CLIP (déjà en place) | gratuit |
| Contrôle final : « ces 3 images montrent-elles bien cet événement ? » | Claude avec la vue, **seulement** pour les candidats A encore douteux | 1 appel par beat douteux |

   Le résultat donne une **catégorie** et un **statut de vérification** :
   - `A vérifié` : au moins 2 indices indépendants concordent (date + incrustation, ou métadonnées + commentaire) ;
   - `A probable` : un seul indice → affiché dans la file de validation humaine ;
   - `B` : bonnes personnes, bonne période ou bon lieu, mais pas l'événement ;
   - `introuvable` → on applique le `repli` du beat, et c'est signalé.
3. **Choix du passage exact** dans le fichier : détection des plans, instant fort (pic de mouvement et de son),
   lisibilité (netteté, taille du sujet), passages déjà utilisés.

### ④ Planificateur (code déterministe)

Il construit la timeline à partir des beats et des médias retenus, en suivant les règles du § 5 (synchronisation) et
les **patterns** de la chaîne : accroche, présentation de personnage, révélation, montée en tension, etc. Un pattern
est un modèle **paramétrable** (rythme, densité de coupes, place des textes), pas une suite de coupes figée.

### ⑤ Contrôle qualité

- **Règles automatiques**, en code :
  - aucun média `B` sur un beat `preuve` sans mention ;
  - aucun interdit violé ;
  - textes vérifiés contre la bible ;
  - temps de lecture minimal des textes ;
  - aucun texte sur l'action importante (zone détectée) ;
  - plans répétés ;
  - bruitage sans événement associé ;
  - musique sous la voix au bon niveau ;
  - passages sans voix off qui ont une raison écrite.
- **Une relecture par Claude du plan entier**, en texte seul et donc peu coûteuse, avec les 11 questions du § 16 du
  cahier des charges. Elle repère surtout les erreurs de sens : une négation illustrée par l'inverse, une hypothèse
  montrée comme un fait.
- **Sortie** : un rapport « à vérifier » classé par gravité. Les erreurs bloquantes empêchent le rendu final, mais pas l'aperçu.

### ⑥ Rendu et ⑦ corrections

- **Aperçu rapide** en basse définition pour valider, puis rendu final.
- **Corrections ciblées** : chaque correction modifie le plan, et seule la partie concernée est recalculée (voir § 6).

---

## 3. Formats

### 3.1 Script éditorial (écrit par un humain, en Markdown simple)

```markdown
---
titre: La chute de Daniel Ricciardo
format: storytelling
chaine: F1 Histoires
duree_cible: 12 min
style: narratif sobre, archives d'abord, peu d'effets
contraintes: pas d'images de supporters identifiables
---

# Chapitre 1 — Le sourire de la grille
objectif: montrer qui il était au sommet
ambiance: lumineuse, attachante
musique: optimiste, montée légère
evenements: victoires 2014 avec Red Bull ; Monaco 2018

## 1.1
VO: « En 2018, à Monaco, il signe la course parfaite… malgré une voiture blessée. »
Intention: le spectateur doit sentir sa maîtrise sous la pression
Médias: Ricciardo vainqueur à Monaco 2018, problème de MGU-K pendant la course
Texte: MONACO 2018
Audio: laisser le son de la radio d'équipe si disponible

## 1.2
VO: (aucune)
Médias: le podium de Monaco 2018, son original, 4 secondes
Montage: laisser respirer

# Chapitre 2 — La décision
objectif: comprendre pourquoi il quitte Red Bull
ambiance: doute
musique: tension sourde (garder le morceau si la transition est naturelle)

## 2.1
VO: « Puis, une décision inattendue allait tout changer. »
Intention: annoncer le départ de Red Bull vers Renault, sans le dire encore
```

Toutes les rubriques sont facultatives sauf la voix off (ou « aucune ») et l'intention. Il n'y a ni chemins de fichiers,
ni pourcentages de zoom, ni images.

### 3.2 Bible de l'histoire (générée, puis corrigeable)

```json
{
  "entites": {"P_ricciardo": {"nom": "Daniel Ricciardo", "type": "pilote"}, "E_redbull": {"nom": "Red Bull Racing"}},
  "evenements": {
    "EV_monaco_2018": {"quoi": "victoire au GP de Monaco malgré une panne de MGU-K", "quand": "2018-05-27", "ou": "Monaco", "qui": ["P_ricciardo"], "source": "script"},
    "EV_depart_redbull": {"quoi": "annonce du départ de Red Bull pour Renault", "quand": "2018-08-03", "qui": ["P_ricciardo", "E_redbull"], "source": "à confirmer"}
  },
  "unites": [
    {"id": "2.1", "statut": "fait", "figure": "annonce (suspense)", "renvoie_a": ["EV_depart_redbull"],
     "comprendre": "une décision va changer sa carrière", "ressentir": "inquiétude", "reveler_maintenant": false}
  ]
}
```

### 3.3 Plan technique (généré, lu par Remotion, modifiable sans toucher au script)

```json
{
  "video": {"fps": 30, "format": "16:9", "duree_s": 731.4, "chaine": "F1 Histoires", "style": "sobre-archives"},
  "voix_off": {"fichier": "vo/ricciardo.wav", "mots": "vo/ricciardo.mots.json"},
  "pistes": {
    "visuel": [
      {"id": "v-1.1-a", "beat": "1.1-a", "debut": 12.40, "fin": 16.85,
       "media": {"id": "mf:8841", "fichier": "medias/8841.mp4", "in": 3612.2, "out": 3616.65, "provenance": "Media Finder / source X"},
       "categorie": "A", "verification": {"statut": "vérifié", "indices": ["date métadonnées", "OCR 'MONACO'", "commentaire 'Ricciardo'"]},
       "cadrage": {"mode": "suivi-sujet"}, "transition_entree": "coupe", "verrouille": false}
    ],
    "textes": [{"id": "t-1.1", "texte": "MONACO 2018", "debut": 12.9, "fin": 15.4, "style": "lieu-date", "source_fait": "EV_monaco_2018", "zone_evitee": "action"}],
    "animations": [],
    "bruitages": [],
    "son_original": [{"media": "mf:8841", "debut": 16.85, "fin": 20.9, "niveau_db": 0, "raison": "1.2 sans voix off"}],
    "musique": [{"morceau": "lib:opt_rise_03", "debut": 0, "fin": 118.2, "niveau_sous_vo_db": -18, "chapitre": 1, "fin_sur": "fin de phrase musicale", "transition_sortie": "fondu 2 s"}]
  },
  "manques": [{"beat": "1.1-b", "besoin": "image de la panne de MGU-K", "recherches": ["…"], "repli_applique": "C: animation 'schéma moteur' + mention 'illustration'"}],
  "a_verifier": [{"gravite": "moyenne", "element": "v-2.1-a", "pourquoi": "A probable : un seul indice (titre)"}]
}
```

Chaque élément garde le **pourquoi** de sa présence (`beat`, `raison`, `source_fait`) : une correction ne casse rien
d'autre, et le contrôle qualité peut tout vérifier.

---

## 4. Archives exactes, illustrations, reconstitutions

| | A : preuve | B : contexte | C : explication |
|---|---|---|---|
| **Ce que c'est** | l'événement raconté lui-même | les bonnes personnes, le bon lieu ou la bonne période, mais pas l'événement | animation, carte, chronologie, graphique, reconstitution |
| **Comment on le sait** | ≥ 2 indices concordants (§ 2.③) | entités ou période vérifiées, événement différent ou inconnu | fabriqué par nous (catalogue d'animations) |
| **Où l'utiliser** | sur l'affirmation du fait | avant ou après le fait, pour situer ; pendant le fait seulement avec mention | hypothèses, mécanismes, données, faits sans archive |
| **Interdit** | — | être placé sur un fait précis comme s'il le montrait | représenter une hypothèse comme un fait, ou imiter une vraie archive |

Règles qui en découlent :
1. Un beat `preuve` reçoit **A** en priorité. Sans A, il reçoit le repli prévu (B mentionné, ou C). La règle « un beau
   média faux vaut moins qu'un média moche mais juste » est appliquée par la note de choix : l'exactitude passe avant l'esthétique.
2. **Mentions à l'écran** (réglables par chaîne) : « Images d'illustration » quand un B accompagne un fait précis,
   « Reconstitution » pour un C qui imite un événement réel, « Et si ? » pour un contrefactuel.
3. **Statuts de phrase** :
   - `négation` / `rumeur` : on montre la réalité, ou du neutre ;
   - `hypothèse` / `contrefactuel` : C, ou B traité visuellement comme « imaginé » (schéma, désaturé) ;
   - `métaphore` : on illustre l'événement réel désigné, jamais l'image littérale.
4. **Le son aussi** : aucun bruitage ajouté sur une archive A qui ferait croire qu'il vient de la scène, comme un bruit
   de choc sur un crash muet. Si la mise en scène en veut un, il est marqué « ajouté » et reste discret ; sinon on garde
   le son original.

---

## 5. Synchronisation

**La référence du temps, c'est la voix off enregistrée.** Elle est transcrite mot à mot (au centième, déjà en place),
puis rattachée au texte du script, ce qui donne le temps de chaque mot du script. Sans voix off, la durée d'un passage
vient de son intention : durée de l'extrait, temps de lecture, ou durée de l'animation.

| Élément | Se cale sur | Règle |
|---|---|---|
| **Coupes** | fin de groupe de sens de la voix (virgule, fin de phrase, respiration) | jamais au milieu d'un mot ; un plan dure au moins le temps de lire l'action ; un beat peut contenir plusieurs plans |
| **Moment fort d'un extrait** (le choc, le passage de la ligne) | le mot qui le nomme, ou juste après lui (+0 à 0,3 s) | on choisit l'entrée dans l'extrait pour que l'instant fort tombe à cet endroit |
| **Textes** | la première mention utile de l'entité (« Monaco ») | durée ≥ 0,4 s par mot + 0,6 s ; position hors de la zone d'action détectée |
| **Animations** | leurs propres repères (contact, rupture, arrivée) | la durée de l'animation s'étire entre les ancrages de la voix |
| **Bruitages** | l'**événement visible** : repère d'animation, apparition d'un texte, impact détecté dans l'extrait | jamais sur le début d'une phrase ; un bruitage n'existe que s'il a un événement |
| **Musique** | le chapitre : changement de morceau à une fin de phrase musicale, en fondu, ou en coupure franche voulue | baissée sous la voix (–15 à –20 dB) ; coupée ou très basse quand un son original important joue ; repères forts (révélation) calés sur un temps fort de la musique |
| **Son original** | le beat qui le demande | la voix off et la musique s'écartent ; le texte reste rare |

Test G du cahier des charges : l'objet animé a deux repères, `contact` (0,82 s) et `rupture` (0,95 s). Les sons
« impact » et « casse » y sont attachés, quel que soit l'endroit où commence la phrase.

**Musique : décision à chaque chapitre.** Un score compare l'ambiance du nouveau chapitre au morceau en cours :
- ambiance proche → on garde le morceau et on fait évoluer son intensité (Test F) ;
- rupture → on change de morceau ;
- révélation en milieu de chapitre → changement ou coupure possible.

Le système propose deux ou trois morceaux par chapitre, classés ; vous pouvez trancher.

---

## 6. Exceptions et corrections

| Situation | Comportement |
|---|---|
| Archive introuvable | repli du beat (B mentionné ou C) + ligne dans « manques » avec les recherches faites |
| A seulement probable | utilisé dans l'aperçu, marqué « à vérifier » ; bloque le rendu final si le beat exige l'authenticité |
| Le contexte ne permet pas de savoir ce que désigne une métaphore | question posée au rédacteur, pas de devinette |
| Fait du script qui contredit la bible ou les sources | signalé, jamais « corrigé » en silence |
| Citation | le texte affiché doit être exactement celui de la source ; sinon on affiche une paraphrase sans guillemets |
| Retour en arrière | traitement visuel « passé » (réglable) + texte de date si utile |
| Archive longue et importante sans voix off | conservée telle quelle, avec son son ; pas de texte de remplissage (Test E) |
| Contenu sensible (accident grave, mort) | règle de chaîne : flou, coupe avant l'impact, ou validation humaine |
| Droits ou provenance douteuse | marqué ; la chaîne décide (règle de chaîne) |

**Corrections manuelles**, rapides et ciblées. On les donne en phrases simples, que Claude transforme en opérations sur le plan :
- « Remplace le média du passage 2.3 par celui-ci / par un autre résultat. »
- « Garde ce plan. » : il est verrouillé et ne sera plus touché.
- « Le texte MONACO 2018 doit rester plus longtemps. »
- « Pas de musique au chapitre 3. »
- « Ce n'est pas le bon Grand Prix. » : le média est rejeté et ajouté à une liste noire pour cet événement, puis le beat
  est recherché à nouveau.

Chaque correction ne recalcule que ce qui en dépend : un média remplacé recale ses bruitages et ses textes, pas toute la
vidéo. Les corrections sont aussi **mémorisées** (« sur cette chaîne, textes plus longs », « ce média est le crash de
2021 ») et réutilisées pour les vidéos suivantes.

---

## 7. Validation

**Étape 1 — Tests de compréhension, sur le plan et pas sur la vidéo** (rapides, sans rendu).
Une petite bibliothèque de test, avec des médias aux métadonnées connues (vrais extraits, extraits trompeurs proches,
contextes, animations), et des passages de test dont on vérifie des **propriétés**, pas un montage exact :

| Test | Passage | Ce qu'on vérifie dans le plan |
|---|---|---|
| A — métaphore | « Sa carrière s'est effondrée après cette décision. » | beats renvoyant à l'événement « décision » ; aucun média à la description littérale (effondrement, ruines) |
| B — événement précis | « Il a subi un accident lors de cette course. » | le média A choisi a l'identifiant du bon événement ; le crash du même pilote dans une autre course (piège) est refusé ; sans A → « manque » signalé |
| C — négation | « Contrairement aux rumeurs, il n'a jamais remporté cette course. » | aucun média ni texte « victoire » de ce pilote sur cette course ; le vrai résultat est montré, ou du neutre |
| D — hypothèse | « S'il avait pris ce virage autrement… » | catégorie C ou B « imaginé » ; mention « Et si ? » ; aucune archive A présentée comme le résultat |
| E — sans voix off | archive importante de 6 s | son original au niveau plein ; aucun texte ni voix ajoutés ; musique coupée ou très basse |
| F — musique | deux chapitres à l'émotion continue | même morceau conservé, avec la raison notée ; intensité qui évolue |
| G — synchro | animation : chute puis rupture | « impact » à ±1 image du contact, « casse » à ±1 image de la rupture |
| H — pièges en plus | homonyme, mauvaise saison, citation déformée, retour en arrière | entité correcte, date correcte, citation exacte ou sans guillemets, traitement « passé » |

**Étape 2 — Un chapitre pilote réel** : 2 à 3 minutes d'une vraie vidéo. Vous notez le résultat avec la grille des 11
questions du contrôle qualité. On mesure aussi le temps de préparation, de recherche, de vérification, de rendu et de
correction.

**Étape 3 — Une vidéo complète**, puis comparaison avec un montage fait à la main : combien de corrections, et combien de temps.

On ne passe à l'étape suivante que quand la précédente est bonne. C'est la leçon de l'outil précédent.

---

## 8. Ce qui marche sans appel au modèle

| Sans IA (code, gratuit, en cache) | Avec Claude (peu d'appels) |
|---|---|
| Indexer les bibliothèques : plans, images clés, transcription, OCR, CLIP, analyse musicale, rangement des bruitages | Analyse narrative + bible : **1 appel** pour le script entier, **1 par chapitre** |
| Appeler Media Finder et mettre les résultats en cache | Besoins audiovisuels et demandes de recherche : dans le même appel par chapitre |
| Vérifier par les indices gratuits (métadonnées, OCR, commentaire, CLIP) | Contrôle visuel d'un candidat A douteux : **1 appel par beat douteux** seulement |
| Aligner la voix off sur le script | Relecture du plan avant rendu : **1 appel** (texte seul) |
| Construire la timeline, caler, mixer, baisser la musique, placer les bruitages | Corrections en langage naturel : 1 appel par correction (ou commande directe sans IA) |
| Règles de contrôle qualité, temps de lecture, chevauchements, répétitions | |
| Rendu Remotion, exports DaVinci et CapCut | |

Pour une vidéo de 12 minutes en 5 chapitres, cela fait environ 8 à 15 appels.

Quand le système est piloté depuis une session Claude Code, c'est Claude lui-même qui fait ces étapes, sans clé d'API.
Pour une production en série automatique, on passe par l'API.

---

## 9. Ce qu'il me faut pour démarrer

1. **L'interface de Media Finder** (sans la modifier) : comment on lui envoie une demande, et ce qu'il renvoie.
   Fichier ou lien ? Titre, description, date, source ? Minutage dans la vidéo ? C'est ce qui décide de la qualité de la vérification.
2. **Où sont les bibliothèques** (médias déjà récupérés, musiques, bruitages, animations), et sous quelle forme sont
   les animations existantes : composants Remotion ? fichiers vidéo ?
3. **La voix off** : enregistrée par vous, ou voix de synthèse ? Avant ou après le montage ?
4. **Les règles de chaque chaîne** : mentions « illustration » oui ou non, style de texte, contenus sensibles.
5. **Un vrai script** (ou un chapitre) pour le pilote de l'étape 2.

## 10. Ordre de construction proposé

1. Formats (script, bible, plan) + analyse narrative + tests A à H sur le plan **seulement**.
2. Branchement de Media Finder et vérificateur A/B/C.
3. Planificateur et synchronisation, puis aperçu Remotion.
4. Contrôle qualité et corrections ciblées.
5. Musique par chapitre et catalogue d'animations.
6. Mémoire des corrections, styles de chaîne, mesures de temps.
