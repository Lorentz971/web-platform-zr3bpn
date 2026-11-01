# Recherche YouTube : document complet

*Version unique regroupant les 6 documents et le registre des sources. Novembre 2026.*

## Précisions importantes (après relecture)

Ces précisions priment sur toute formulation plus prudente qui resterait dans les documents ci-dessous.

1. **Production avec Claude Code ≠ contenu généré par IA.** Claude Code pilote des outils classiques (Blender pour les VFX, Remotion pour le montage, bibliothèques sonores). Les vidéos produites ne sont **pas** des images ou des vidéos générées par IA. Les règles de YouTube sur le contenu « inauthentique » visent les vidéos **quasi identiques produites en masse**, pas les outils utilisés.
2. **Musiques et sons choisis selon le contexte de chaque vidéo** : pas de réutilisation à l'identique. Le point sur la politique anti-spam (F31) est donc une simple vigilance, pas une contrainte.
3. **Déclaration « contenu modifié ou synthétique »** : elle ne s'applique qu'à une scène **réaliste** qui pourrait passer pour vraie (par exemple un faux événement réel reconstitué de façon photoréaliste). Les VFX stylisés ou manifestement mis en scène ne sont pas concernés.
4. **Extraits protégés (F1, football, films, animés)** : de nombreuses chaînes les utilisent dans des vidéos **montées et commentées**. C'est une pratique viable. Le risque concret est la **revendication Content ID** (une partie ou la totalité des revenus de la vidéo peut aller à l'ayant droit) et, plus rarement, un avertissement. Il se gère avec des extraits courts, transformés et intégrés à une analyse. Les formats avec extraits sont donc **à tester**, en mesurant le taux de revendication et les revenus perdus, et non à éviter.
5. **Seule règle stricte** : un Short de **plus d'une minute** contenant un extrait revendiqué par Content ID est bloqué dans le monde entier. Les Shorts avec extraits doivent rester sous une minute.

---

# Document 1 : comprendre YouTube

*Système de découverte, recommandations, métriques et limites de nos connaissances. Novembre 2026.*

> Les références **F1, F2…** renvoient au registre `notes-sources.md`, qui donne la source, la date et le niveau de confiance de chaque fait.
> **[OFFICIEL]** confirmé par YouTube · **[OFFICIEL-R]** déclaration officielle connue par une reprise · **[TECHNIQUE]** publication d'ingénieurs YouTube · **[OBSERVÉ]** étude externe · **[ESTIMATION]** chiffre d'outil · **[HYPOTHÈSE]** notre interprétation.

---

## 1. Ce que YouTube cherche à optimiser

### Faits
- YouTube présente son système comme un moyen d'aider chaque spectateur à trouver des vidéos **qu'il va apprécier**, pas les plus populaires [OFFICIEL, F1].
- Les signaux cités publiquement sont les clics, les vues, la durée de visionnage, les **enquêtes de satisfaction**, les partages, les « j'aime » et les « je n'aime pas » [OFFICIEL, F1]. Les actions « Pas intéressé » et « Ne pas recommander cette chaîne » sont connues des utilisateurs, mais leur poids n'est pas publié.
- Après la « responsabilité » (limiter les contenus problématiques et privilégier les sources fiables sur l'actualité), **la satisfaction est l'objectif principal** [OFFICIEL-R, F2]. YouTube entraîne ses modèles avec des enquêtes posées à un petit nombre de spectateurs (1 à 2 par mois et par personne) [OFFICIEL-R, F2].
- Historiquement, le classement a été entraîné à prédire la **durée de visionnage attendue** plutôt que le clic (publication de 2016) [TECHNIQUE, F7]. Puis il est devenu **multi-objectifs**, combinant l'engagement et la satisfaction, avec une correction du biais de position (publication de 2019) [TECHNIQUE, F8].

### Interprétation
- Le système récompense une vidéo qui **tient sa promesse** auprès de spectateurs **qui l'ont choisie**. Un clic suivi d'un abandon rapide, ou une longue durée de visionnage suivie d'une mauvaise note en enquête, n'est pas un succès pour lui [HYPOTHÈSE, cohérente avec F1, F2, F8].
- Les publications de 2016 et 2019 décrivent **l'architecture de l'époque**. Elles montrent le type de problème que YouTube résout (sélectionner quelques centaines de candidats parmi des millions, puis les classer selon plusieurs objectifs), mais **pas** les pondérations actuelles.

---

## 2. Les surfaces de découverte

| Surface | Comment la vidéo y arrive | Ce qui semble compter | Niveau |
|---|---|---|---|
| **Accueil** | Personnalisé à chaque ouverture de l'app, selon l'historique et les préférences | Probabilité qu'un spectateur précis clique **et** soit satisfait | [OFFICIEL] F1 + [HYPOTHÈSE] |
| **Suggestions** (« à suivre », à côté d'une vidéo) | Dépend de la vidéo en cours et de l'historique | Lien thématique avec la vidéo regardée, et ce que des spectateurs similaires ont regardé ensuite | [TECHNIQUE] F8 + [HYPOTHÈSE] |
| **Recherche** | Requête explicite | Pertinence (titre, description, contenu), engagement agrégé **pour cette requête**, qualité ; personnalisation selon l'historique | [OFFICIEL-R] F5 |
| **Fil Shorts** | Défilement vertical, la vidéo est lancée sans clic | Le fait que le spectateur **continue à regarder** au lieu de passer au suivant, les revisionnages, l'engagement | [OFFICIEL-R] F6 + [HYPOTHÈSE] |
| **Abonnements** | Fil des chaînes suivies | Les abonnés ne voient ni ne regardent tout | [OFFICIEL-R] F4 |
| **Explorer / Hype** | Classement des vidéos récentes « hypées » (chaînes de moins de 500 000 abonnés) | Le soutien actif de spectateurs déjà convaincus | [OFFICIEL-R] F9 |
| **Externe** | Liens partagés (réseaux, messageries, sites) | Hors de l'algorithme ; peut amorcer des données | — |

**Différence essentielle avec les Shorts** : dans le fil Shorts, il n'y a pas de clic sur une miniature. L'« emballage » (titre, miniature) compte beaucoup moins que les **premières secondes** de la vidéo. Shorts et vidéos longues ont des **systèmes de recommandation séparés** [OFFICIEL-R, F6].

**Répartition observée des vues** (Metricool 2026, environ 800 000 vidéos) : fil Shorts environ 61 % des vues organiques, abonnés environ 11 %, recherche environ 9 % [OBSERVÉ, F18]. ⚠️ Ces chiffres mélangent toutes les tailles de chaînes et toutes les niches, et le comptage des Shorts a changé pendant la période étudiée. Ils montrent un **ordre de grandeur** : la majorité des vues ne vient pas des abonnés.

---

## 3. Comment YouTube trouve les « bons » spectateurs pour une vidéo

### Ce qui est confirmé
- YouTube s'appuie sur **l'historique des spectateurs** et sur ce que des **spectateurs similaires** ont regardé et apprécié [OFFICIEL, F1].
- **Aucun ratio vues/abonnés** n'est requis pour être recommandé [OFFICIEL-R, F2].
- Une vidéo ancienne peut être recommandée à nouveau si l'intérêt revient [OFFICIEL-R, F4].

### Ce qui est observé
- Les vidéos de petites chaînes peuvent percer : 191 des 2 996 percées étudiées venaient de chaînes de moins de 1 000 abonnés [OBSERVÉ, F20].
- **Mais la réalité de départ est dure** : sur un échantillon aléatoire, la vidéo médiane a environ 35 à 41 vues, et une infime minorité de vidéos concentre la majorité des vues [OBSERVÉ, F16]. La distribution est extrêmement **inégale** (« loi de puissance »).

### Modèle de travail [HYPOTHÈSE]
Le schéma suivant résume ce qu'il est raisonnable de supposer. Il **n'est pas** un mécanisme confirmé.

1. La vidéo est proposée à des spectateurs dont l'historique suggère un intérêt pour le sujet : abonnés, spectateurs de vidéos proches, personnes qui font une recherche.
2. Si ces spectateurs cliquent, regardent et semblent satisfaits, la vidéo est proposée à des groupes plus larges ou voisins.
3. Si les réactions faiblissent dans un nouveau groupe, la diffusion se stabilise.

**Conséquence pratique** : ce qui étend la diffusion, c'est la réaction **de chaque nouveau groupe**, pas le nombre d'abonnés. Un sujet qui intéresse un public large et voisin a plus de « place » pour s'étendre qu'un sujet très pointu.

---

## 4. Sujet, concurrence, saisonnalité

| Facteur | Ce qu'on sait | Niveau |
|---|---|---|
| **Intérêt du sujet** | L'audience totale d'un sujet limite le maximum atteignable. Certains genres (jeu vidéo, contenus pour enfants) ont des vues médianes plus élevées parmi les grosses chaînes. | [OBSERVÉ] F17 |
| **Concurrence** | Le système compare implicitement les vidéos entre elles pour un même spectateur. Un sujet saturé exige une vidéo meilleure ou un **angle différent**. | [HYPOTHÈSE] |
| **Actualité** | Une demande soudaine profite aux vidéos publiées tôt. La valeur décroît vite. | [OBSERVÉ] (général) |
| **Evergreen** | Les vues continuent pendant des mois ; 83 % des interactions ont lieu dans les 10 premiers jours, mais pas toutes les vues. | [OBSERVÉ] F18 |
| **Saisonnalité de l'audience** | Recherches cycliques (rentrée, fêtes, événements sportifs). | [OBSERVÉ] (général) |
| **Saisonnalité des revenus** | RPM plus élevé au 4e trimestre, chute en janvier. | [ESTIMATION] F24 |
| **Langue** | Le doublage automatique (27 langues) fait entrer des contenus étrangers dans l'espace francophone. Les sujets **spécifiquement francophones** sont moins exposés à cette concurrence. | [OFFICIEL-R] F10 + [HYPOTHÈSE] |

---

## 5. Les types de spectateurs

| Catégorie dans Studio | Définition | À quoi sert ce chiffre |
|---|---|---|
| **Nouveaux** | Première vidéo de la chaîne regardée sur la période | Mesure la capacité à **atteindre** de nouvelles personnes |
| **Occasionnels** | Regardent certains mois, sans régularité | Public large, à fidéliser |
| **Réguliers** | Regardent la plupart des mois sur un an (seuil exact à confirmer) | Le noyau fidèle, et un indicateur de la **valeur de la chaîne** |
| **Abonnés** | Ont cliqué sur « S'abonner » | **Ne sont pas** synonymes de réguliers : beaucoup ne regardent pas les nouvelles vidéos |

[OFFICIEL-R, F12]. L'ancienne métrique « spectateurs connus » a été remplacée en juillet 2025.

**Interprétation** : pour une nouvelle chaîne, la priorité est la part de **nouveaux spectateurs qui reviennent** (passage de « nouveau » à « occasionnel », puis à « régulier »). Les abonnés sont un indicateur secondaire [HYPOTHÈSE].

---

## 6. Les métriques et la façon de les lire

### 6.1 Définitions

| Métrique | Ce qu'elle mesure | Piège |
|---|---|---|
| **Impressions** | Le nombre de fois où une miniature a été montrée (sur les surfaces internes) | N'inclut pas tout : les vues externes n'ont pas d'impression |
| **CTR des impressions** | La part des impressions qui mènent à une vue [OFFICIEL-R, F11] | Il **baisse mécaniquement** quand la vidéo atteint des publics plus larges et moins ciblés. Il dépend fortement de la surface (recherche > accueil, en général). |
| **Vues** | ⚠️ **Depuis le 24 août 2026, une vue compte dès la première image, pour tous les formats** [OFFICIEL-R, F13] | Les vues d'avant et d'après cette date **ne sont pas comparables** |
| **Vues engagées** (mode avancé) | L'ancienne mesure, plus stricte | La plus fiable pour comparer des vidéos dans le temps |
| **Durée moyenne de visionnage** (AVD) | Le temps moyen passé par vue | Dépend de la durée de la vidéo |
| **Pourcentage moyen regardé** (AVP) | L'AVD divisée par la durée de la vidéo | Une vidéo courte a mécaniquement un AVP plus élevé |
| **Courbe de rétention** | La part des spectateurs encore présents à chaque moment | La plus riche en enseignements pour le montage |
| **Durée de visionnage totale** | Vues × AVD | L'indicateur utilisé par Test & Compare (« part de durée de visionnage ») [F14] |
| **Sources de trafic** | Accueil, suggestions, recherche, Shorts, externe… | Indique **quel système** porte la vidéo |
| **Nouveaux / occasionnels / réguliers** | Voir section 5 | — |

### 6.2 Comment les métriques interagissent

```
Impressions ──► CTR ──► Vues ──► Rétention / satisfaction ──► (plus d'impressions ?)
     ▲                                                               │
     └───────────────── élargissement vers d'autres publics ◄────────┘
```

- **Le CTR et les impressions évoluent en sens inverse** quand la diffusion s'élargit. Un CTR qui baisse alors que les impressions explosent est **normal**.
- **La rétention** ne se compare qu'entre vidéos de **durée comparable**, et de préférence sur la **même chaîne**.
- **Aucune métrique isolée ne suffit** [OFFICIEL-R, F4].

### 6.3 Diagnostics types [HYPOTHÈSE, à valider sur nos données]

| Situation | Lecture probable | Action |
|---|---|---|
| **CTR élevé, rétention faible** | La miniature promet quelque chose que la vidéo ne donne pas tout de suite (ou pas du tout) | Revoir l'introduction : confirmer la promesse dans les 30 premières secondes. Vérifier que le titre n'est pas trompeur. |
| **CTR faible, rétention élevée** | Le contenu plaît, l'« emballage » ne donne pas envie | Tester d'autres titres et miniatures (Test & Compare) |
| **CTR et rétention bons, peu d'impressions** | Le sujet a une audience réduite, ou la vidéo est encore trop récente | Attendre, puis élargir l'angle aux vidéos suivantes |
| **Chute brutale à un moment précis** | Passage ennuyeux, rupture de promesse, publicité intégrée mal placée | Couper ou réordonner dans les vidéos suivantes |
| **Bonne rétention, peu de retours** | Bonne vidéo isolée, mais pas d'identité de chaîne | Créer des séries, des formats récurrents |
| **Beaucoup de vues en Shorts, peu sur les vidéos longues** | Les publics sont distincts (F6) | Ne pas supposer de conversion automatique |

### 6.4 Erreurs d'interprétation fréquentes

1. **Comparer des vues d'avant et d'après le 24 août 2026**, ou des Shorts d'avant et d'après le 31 mars 2025 [F13].
2. **Appliquer un seuil universel** (« un bon CTR, c'est 10 % »). Il n'existe pas de norme : le CTR varie selon la niche, la surface et l'âge de la vidéo [F11].
3. **Juger une vidéo dans les premières heures.** L'essentiel des interactions arrive dans les 10 premiers jours, mais les vues continuent pendant des mois [F18].
4. **Conclure sur 3 ou 4 vidéos.** La distribution est très inégale [F16] : une seule vidéo peut tout fausser. Il faut raisonner en médianes et sur un nombre suffisant de vidéos (voir document 5).
5. **Confondre corrélation et cause.** « Les chaînes qui publient des Shorts ont plus de vues » [F6, F18] ne prouve pas que les Shorts en sont la cause.
6. **Imputer à « l'algorithme » ce qui relève du sujet.** Une vidéo sur un sujet de niche plafonne même si elle est excellente.

---

## 7. Comment une nouvelle chaîne construit son audience

### Faits et observations
- Le système ne pénalise pas une chaîne pour sa petite taille, et une mauvaise vidéo ne condamne pas la chaîne [OFFICIEL-R, F2, F4].
- Le bouton **Hype** donne un avantage réservé aux chaînes de moins de 500 000 abonnés [OFFICIEL-R, F9].
- Les petites chaînes peuvent percer [OBSERVÉ, F20], mais la grande majorité des vidéos fait très peu de vues [OBSERVÉ, F16].

### Trajectoire probable [HYPOTHÈSE]
1. **Phase de calibrage** : peu d'impressions. Le système manque de données sur « qui aime cette chaîne ». La **recherche** et le **fil Shorts** sont les surfaces les plus accessibles, parce qu'elles ne dépendent pas d'un historique de la chaîne.
2. **Première percée** : une vidéo trouve un public. Le système apprend **quel type de spectateur** apprécie la chaîne.
3. **Consolidation** : les vidéos suivantes **sur le même territoire** bénéficient de ce que le système a appris. Un changement brutal de sujet remet en partie le calibrage à zéro.
4. **Fidélisation** : la part de spectateurs réguliers augmente, ce qui stabilise les performances.

**Implication** : une chaîne gagne à rester **cohérente** dans son territoire (sujet et public) le temps que le système apprenne, tout en variant ses angles.

---

## 8. Ce que nous savons, ce que nous observons, ce que nous ignorons

| Domaine | ✅ Confirmé officiellement | 🔍 Observable (données externes) | ❓ Inconnu |
|---|---|---|---|
| Objectif du système | Satisfaction des spectateurs, après la responsabilité (F1, F2) | — | Comment la satisfaction est exactement pondérée face à l'engagement |
| Signaux | Clics, durée de visionnage, enquêtes, partages, « j'aime » et « je n'aime pas » (F1) | Les vidéos qui percent ont souvent un emballage soigné (F21) | Le poids de chaque signal ; la durée de la fenêtre d'évaluation |
| Abonnés | Ne sont pas une condition pour être recommandé (F2) | Environ 11 % des vues seulement (F18) | — |
| Shorts | Système séparé des vidéos longues (F6) | Une corrélation existe entre publier des Shorts et la croissance (F6, F18) | Si les Shorts **causent** une croissance des vidéos longues |
| Recherche | Pertinence + engagement + qualité (F5) | — | La pondération ; l'effet des tags (probablement faible) |
| Nouvelles chaînes | Pas de pénalité liée à la taille (F2, F4) ; Hype (F9) | Des percées possibles mais rares (F16, F20) | L'existence ou non d'une phase de « test » systématique |
| Fréquence de publication | — | 2 à 4 vidéos longues par semaine, corrélées à plus de vues par vidéo (F18) | Si la fréquence a un effet propre ou si elle reflète la taille des équipes |
| Comptage des vues | Changé pour tous les formats le 24 août 2026 (F13) | — | L'effet réel sur la recommandation (a priori aucun) |

### Mythes à écarter

| Idée reçue | Statut | Pourquoi |
|---|---|---|
| « Il faut beaucoup d'abonnés pour être recommandé » | ❌ Faux | F2, F16, F20 |
| « Les premières heures décident de tout » | ⚠️ Exagéré | Les vues continuent des mois (F18) ; d'anciennes vidéos peuvent revenir (F4) |
| « Un bon CTR, c'est X % » | ❌ Pas de norme universelle | F11 |
| « Les Shorts tuent la chaîne » ou « les Shorts font grandir les vidéos longues » | ❓ Non établi dans un sens comme dans l'autre | Systèmes séparés (F6) ; seulement des corrélations |
| « Les tags sont essentiels » | ⚠️ Secondaires | La pertinence passe d'abord par le titre, la description et le contenu (F5) |
| « Un visage sur la miniature augmente le CTR » | ⚠️ Non démontré | Aussi fréquent chez les vidéos qui échouent (F21) |
| « Publier tous les jours garantit la croissance » | ❌ Non | Au-delà de 7 vidéos par semaine, les vues mensuelles baissent dans l'étude Metricool (F18) |
| « YouTube punit l'IA » | ⚠️ Inexact | Il punit la production en masse et répétitive, pas l'outil (F30, F31) ; obligation de déclaration (F32) |

---

## 9. Limites de ce document

- Les pages officielles (youtube.com, support.google.com) n'étaient **pas accessibles** directement dans cette session. Les faits marqués [OFFICIEL-R] sont à revérifier à la source.
- Aucune donnée privée de chaîne n'a été consultée. Les études externes sont publiées par des éditeurs d'outils (Metricool, vidIQ, AIR), avec un intérêt commercial possible.
- Les publications techniques (2016, 2019) décrivent le système **de leur époque**.


---

# Document 2 : analyse des formats et des niches

*Comparaison des formats qui correspondent à notre écosystème (Story Studio, Media Finder, Animation Studio, Editing Studio/Remotion, Audio Library, VFX Studio). Novembre 2026.*

> Les références F1, F2… renvoient à `notes-sources.md`.

---

## 0. Avertissement méthodologique

- **Pas d'accès aux données YouTube** dans cette session (API et domaines bloqués). Les chaînes citées sont des **exemples qualitatifs** connus publiquement pour leur format. **Aucune métrique privée** n'est avancée, et aucun chiffre d'abonnés n'est donné quand il n'a pas pu être vérifié.
- Pour éviter le **biais du survivant** (n'étudier que les énormes succès), la section 11 fournit un **protocole d'échantillonnage** à exécuter avec l'API YouTube Data. Il couvre des chaînes de toutes tailles et compare les vidéos d'une même chaîne entre elles.
- Rappel de réalité : la vidéo médiane sur YouTube a environ 35 à 41 vues [F16]. Les exemples ci-dessous sont des exceptions.

---

## 1. Grille de lecture

Pour chaque format, on évalue les 10 dimensions demandées. Les notes de 1 à 5 en fin de section sont des **[HYPOTHÈSES]** de travail, à remplacer par nos propres mesures.

- **Adéquation avec nos outils** : quels studios sont fortement sollicités.
- **Risque de droits** : la dépendance à des images appartenant à des tiers, en tenant compte du droit français (pas de *fair use* ; courte citation étroite) [F34].

---

## 2. Storytelling et documentaires

**Exemples (qualitatifs)** : *LEMMiNO* (mystères et histoire, très peu de vidéos mais très soignées, voix off), *Barely Sociable* (mystères d'Internet, sans visage), *Magnates Media* (histoires d'entreprises, sans visage), *Nota Bene* (histoire, en français, avec présentateur).

| Dimension | Analyse |
|---|---|
| 1. Publics | Large : curieux, amateurs d'histoire, d'énigmes, de faits réels. Spectateurs prêts à regarder 15 à 40 min. |
| 2. Mécanismes d'intérêt | Question ouverte (« comment est-ce possible ? »), personnage, enjeu, révélation progressive. |
| 3. Sujets qui cliquent | Mystères non résolus, chutes spectaculaires (entreprises, personnalités), destins hors norme, « l'histoire vraie derrière… ». |
| 4. Structures | Ouverture *in medias res* (la scène la plus forte) → contexte → montée de tension → révélations → résolution ou question finale. |
| 5. Difficultés | Recherche longue et exigeante (exactitude), écriture, rythme du montage sur 20 min et plus. |
| 6. Différenciation | L'angle (un point de vue inédit), la profondeur de la recherche, l'**identité visuelle**, la **langue** (sujets francophones peu traités). |
| 7. Réutilisation | Forte : cartes, chronologies, gabarits de titres, musiques d'ambiance, transitions. ⚠️ Varier pour ne pas tomber sous la politique anti-spam [F31]. |
| 8. Monétisation | Bonne : vidéos longues, donc plusieurs coupures publicitaires ; audience adulte ; sponsoring possible. |
| 9. Risques | Erreurs factuelles, diffamation (personnes réelles), droits sur les archives, sujets sensibles (moins problématiques pour la publicité depuis janvier 2026 s'ils sont traités sans images choquantes [F33]). |
| 10. Test à faible coût | 3 vidéos de 10-12 min sur des sujets voisins, avec des visuels sous licence libre ou créés par nous. |

**Adéquation avec nos outils** : Story Studio ★★★★★, Media Finder ★★★★, Editing ★★★★, Animation ★★★. **Risque de droits** : moyen.

---

## 3. Sports : Formule 1, football, boxe

**Exemples** : *Chain Bear* (F1 technique, explications par animations maison), *Tifo Football* (tactique et histoire du football en animation, racheté par The Athletic).

| Dimension | Analyse |
|---|---|
| 1. Publics | Très larges et passionnés ; pics autour des événements. |
| 2. Mécanismes | Rivalités, polémiques, explication technique (« pourquoi cette voiture est si rapide »), destins de champions, histoire des grands moments. |
| 3. Sujets qui cliquent | Analyse « à chaud » après un événement, histoires de transferts et de rivalités, records, désastres, « comment X a changé le sport ». |
| 4. Structures | Analyse : question → données → démonstration visuelle → conclusion. Récit : contexte → affrontement → bascule → héritage. |
| 5. Difficultés | **Les images**, surtout. Un rythme imposé par le calendrier sportif. |
| 6. Différenciation | **L'animation maison** (circuits, schémas tactiques, données) **contourne le problème des droits** et devient l'identité de la chaîne, comme le font Chain Bear et Tifo. |
| 7. Réutilisation | Très forte : modèles de circuits, de terrains, de joueurs, de graphiques de données. |
| 8. Monétisation | Bonne (audience adulte, sponsors liés au sport et aux paris, avec prudence réglementaire). |
| 9. Risques | **Très élevés avec les images officielles** : Formula One Management et les grandes ligues de football sont parmi les ayants droit les plus actifs [F35, F36]. Usage du **nom « F1 »** dans le nom de la chaîne déconseillé [F35]. |
| 10. Test à faible coût | Une série d'explications animées (« comment fonctionne X ») sans aucune image officielle. |

**Adéquation avec nos outils** : Animation ★★★★★, VFX ★★★★, Story ★★★★, Media Finder ★★ (peu d'images utilisables). **Risque de droits** : très élevé avec archives, faible en animation pure.

---

## 4. Cinéma, séries, animés

**Exemples** : *Every Frame a Painting* (essais vidéo sur le cinéma ; la chaîne s'est arrêtée en 2017, ses auteurs ayant décrit les frictions avec les systèmes de revendication), *Le Fossoyeur de Films* et *Le Ciné-Club de M. Bobine* (analyse en français).

| Dimension | Analyse |
|---|---|
| 1. Publics | Très larges (sorties, franchises, animés populaires). |
| 2. Mécanismes | Théories, explications de fins, coulisses, « ce que vous n'avez pas vu », classements. |
| 3. Sujets qui cliquent | Sorties récentes, polémiques autour d'une franchise, coulisses de tournages ratés, analyse de scènes cultes. |
| 4. Structures | Essai : thèse → démonstration par extraits → contre-arguments → conclusion. |
| 5. Difficultés | **Dépendance aux extraits**, donc aux revendications. |
| 6. Différenciation | Analyse originale, **reconstitution animée** plutôt que l'extrait, angle thématique (économie du cinéma, coulisses de production). |
| 7. Réutilisation | Moyenne (gabarits d'analyse, habillage). |
| 8. Monétisation | Variable : les revendications Content ID peuvent **transférer les revenus à l'ayant droit** [F37]. |
| 9. Risques | **Élevés** : animés revendiqués en quelques heures, campagnes de retrait contre des chaînes de réaction [F37] ; en France, la courte citation est étroite [F34]. **Shorts de plus d'une minute avec revendication : bloqués dans le monde** [F29]. |
| 10. Test à faible coût | Des vidéos **sans extraits** (coulisses, économie, histoires de production) illustrées par l'animation et des images libres. |

**Adéquation avec nos outils** : Story ★★★★, Animation ★★★, Media Finder ★★ (droits). **Risque de droits** : élevé.

---

## 5. Histoires insolites, controverses, événements marquants

**Exemples** : *Barely Sociable* (mystères d'Internet), formats « histoire vraie » en français.

| Dimension | Analyse |
|---|---|
| 1. Publics | Très larges, transgénérationnels. |
| 2. Mécanismes | Curiosité, incongruité, indignation, « je n'arrive pas à y croire ». |
| 3. Sujets qui cliquent | Arnaques, disparitions, catastrophes évitables, coïncidences, personnages excentriques. |
| 4. Structures | Accroche choc → « comment en est-on arrivé là » → escalade → dénouement → conséquences. |
| 5. Difficultés | Vérification des faits ; ton juste face à des victimes réelles. |
| 6. Différenciation | Rigueur, sources affichées, sujets **locaux ou francophones** peu traités. |
| 7. Réutilisation | Forte (cartes, coupures de presse reconstituées, chronologies). |
| 8. Monétisation | Moyenne à bonne, selon la sensibilité (violence, mort). L'assouplissement de janvier 2026 aide les sujets sensibles traités sans images choquantes [F33]. |
| 9. Risques | Diffamation, atteinte à la vie privée, publicité limitée, politique sur les contenus choquants. |
| 10. Test à faible coût | 3 histoires documentées, en format de 8 à 12 minutes, et leurs Shorts. |

**Adéquation avec nos outils** : Story ★★★★★, Media Finder ★★★★, Editing ★★★★. **Risque de droits** : moyen.

---

## 6. Vidéos éducatives et explicatives

**Exemples** : *Kurzgesagt* (science en animation, avec une version française), vulgarisation française (histoire, sciences, langues).

| Dimension | Analyse |
|---|---|
| 1. Publics | Étudiants, curieux, adultes en formation. Forte demande en **recherche** [F5]. |
| 2. Mécanismes | « Comment ça marche », « pourquoi », résolution d'une confusion courante. |
| 3. Sujets qui cliquent | Questions que tout le monde se pose, idées reçues démontées, comparaisons d'échelle. |
| 4. Structures | Question → intuition fausse → explication pas à pas → révélation → résumé. |
| 5. Difficultés | Exactitude, pédagogie, visuels explicatifs (coûteux). |
| 6. Différenciation | Clarté, qualité des schémas animés, angle original. |
| 7. Réutilisation | **Très forte** (personnages, styles, icônes, diagrammes). |
| 8. Monétisation | Bonne ; l'éducation a un RPM supérieur à la moyenne en France [F23, ESTIMATION]. |
| 9. Risques | Erreurs (crédibilité) ; **concurrence des chaînes anglophones doublées automatiquement** [F10] sur les sujets universels. |
| 10. Test à faible coût | 4 explications courtes (5-8 min) sur des questions à forte recherche. |

**Adéquation avec nos outils** : Animation ★★★★★, Story ★★★★, Editing ★★★★. **Risque de droits** : faible.

---

## 7. Animation 2D et 2.5D

**Exemples** : *Kurzgesagt* (2D vectorielle), *OverSimplified* et *Extra History* (histoire en 2D humoristique), *Tifo Football* (2D appliquée au sport).

| Dimension | Analyse |
|---|---|
| 1. Publics | Tous publics, y compris des personnes peu attirées par les documentaires classiques. |
| 2. Mécanismes | Clarté visuelle, humour, personnages récurrents, **reconnaissance immédiate** du style. |
| 3. Sujets | Tous les sujets qui manquent d'images utilisables : histoire ancienne, science, tactique sportive, coulisses. |
| 4. Structures | Les mêmes que le documentaire ou l'explication, avec des gags ou des visualisations. |
| 5. Difficultés | **Temps de production** et **temps de rendu** élevés ; cohérence du style. |
| 6. Différenciation | **Le style visuel est un avantage difficile à copier** ; il réduit la dépendance aux droits. |
| 7. Réutilisation | **Maximale** : personnages, décors, bibliothèques d'animations. ⚠️ Attention à la répétition à l'identique [F31]. |
| 8. Monétisation | Bonne (audience large, vidéos longues), avec du merchandising possible pour les personnages. |
| 9. Risques | Contenu jugé « produit en masse » si les vidéos se ressemblent trop [F30] ; obligation de déclarer l'IA seulement pour un contenu **réaliste** [F32]. |
| 10. Test à faible coût | Comparer 1 sujet traité en animation et 1 sujet comparable traité avec des archives (voir document 5). |

**Adéquation avec nos outils** : Animation ★★★★★, VFX ★★★★, Audio ★★★★. **Risque de droits** : très faible.

---

## 8. Chaînes sans visage

C'est une **modalité de production** plutôt qu'un format : elle s'applique aux documentaires, aux explications, aux histoires et à l'animation.

| Atout | Limite |
|---|---|
| Production automatisable, pas de dépendance à une personne | Lien de confiance et identité plus difficiles à créer |
| Plusieurs chaînes possibles en parallèle | **Vigilance maximale** sur les règles de contenu inauthentique et de spam [F30, F31] |
| Voix off (humaine ou IA déclarée [F32]) | Une voix IA générique rend la chaîne interchangeable |

**Ce qui distingue une chaîne sans visage durable** [HYPOTHÈSE] : une **voix** reconnaissable, un **style visuel** propre, un **point de vue** éditorial, et une **recherche** que d'autres ne font pas.

---

## 9. Shorts et formats très courts

| Dimension | Analyse |
|---|---|
| 1. Publics | Massifs, jeunes, peu engagés envers une chaîne. |
| 2. Mécanismes | Accroche visuelle immédiate, chute ou révélation, boucle. |
| 3. Sujets | Faits surprenants, « le saviez-vous », moments forts d'une vidéo longue, avant/après. |
| 4. Structures | Accroche (0-2 s) → développement (1 idée) → révélation finale → boucle éventuelle. |
| 5. Difficultés | Volume nécessaire ; concurrence énorme ; peu de revenus par vue. |
| 6. Différenciation | Faible en général ; possible par une **série** reconnaissable. |
| 7. Réutilisation | **Maximale** : des extraits des vidéos longues. |
| 8. Monétisation | **RPM d'environ 3 à 14 % de celui des vidéos longues** [F19] ; le créateur garde 45 % de sa part de la cagnotte [F28]. |
| 9. Risques | **Shorts de plus d'une minute avec revendication Content ID : bloqués dans le monde** [F29] ; la musique réduit la cagnotte [F28]. |
| 10. Test à faible coût | Décliner chaque vidéo longue en 2 ou 3 Shorts, à coût marginal faible. |

**Adéquation avec nos outils** : Editing ★★★★★ (déclinaison automatique). **Risque de droits** : variable.

---

## 10. Evergreen ou actualité

| | Evergreen | Actualité |
|---|---|---|
| Durée de vie | Des mois ou des années (« slow burn » [F18]) | Quelques jours à quelques semaines |
| Surface principale | Recherche, suggestions | Accueil, suggestions, Shorts |
| Pression de production | Faible (pas d'urgence) | **Forte** : il faut publier vite |
| Compatibilité avec un pipeline automatisé | **Excellente** | Moyenne (le rendu et la vérification prennent du temps) |
| Risque | Concurrence installée sur les sujets évidents | Erreurs factuelles dues à la précipitation |

**Recommandation [HYPOTHÈSE]** : une base **evergreen** (70-80 %) et des vidéos **d'actualité** ponctuelles quand un événement touche directement le territoire de la chaîne.

---

## 11. Protocole pour analyser de vraies chaînes (à exécuter)

Pour remplacer les exemples qualitatifs par des données, avec l'API YouTube Data (une clé gratuite suffit pour les données publiques) :

1. **Échantillon** : pour chaque niche visée, 5 chaînes par tranche de taille (moins de 10 000 abonnés ; 10 000 à 100 000 ; 100 000 à 1 million ; plus de 1 million), soit environ 20 chaînes par niche.
2. **Données publiques** : pour les 30 dernières vidéos de chaque chaîne, récupérer le titre, la date, la durée, les vues, les « j'aime » et les commentaires.
3. **Indicateur clé** : le **ratio de performance**, c'est-à-dire les vues d'une vidéo divisées par la **médiane** des vues de la chaîne sur la même période. On compare **à l'intérieur** de chaque chaîne, ce qui neutralise sa taille.
4. **Analyse** : pour chaque chaîne, comparer les vidéos au-dessus de 3× la médiane avec celles en dessous de 0,5× (titre, durée, sujet, miniature). C'est ainsi qu'on étudie les **échecs** autant que les succès.
5. ⚠️ **Comptage des vues** : se limiter aux vidéos publiées **après le 24 août 2026**, ou ne pas mélanger les périodes [F13].
6. **Ce qu'on ne peut pas savoir** : CTR, rétention, sources de trafic. Ces données sont privées : ne jamais les supposer.

---

## 12. Synthèse comparative

| Format | Demande | Adéquation outils | Risque droits | Coût de production | Monétisation | Différenciation possible | **Priorité de test** |
|---|---|---|---|---|---|---|---|
| Documentaire / storytelling | ★★★★ | ★★★★ | Moyen | Élevé | ★★★★ | ★★★★ | **1** |
| Explication animée (éducatif) | ★★★★ | ★★★★★ | Faible | Élevé (rendu) | ★★★★ | ★★★★★ | **1** |
| Sport en animation (sans images officielles) | ★★★★ | ★★★★★ | Faible | Élevé | ★★★★ | ★★★★ | **2** |
| Histoires insolites | ★★★★★ | ★★★★ | Moyen | Moyen | ★★★ | ★★★ | **2** |
| Cinéma / animés (sans extraits) | ★★★★ | ★★★ | Élevé si extraits | Moyen | ★★★ | ★★★ | **3** |
| Sport, cinéma, animés avec extraits montés et commentés | ★★★★★ | ★★★★ | Élevé (revendications), gérable | Moyen | ★★★ (une partie des revenus peut être revendiquée) | ★★★ | **2** (mesurer le taux de revendication) |
| Shorts seuls | ★★★★★ | ★★★★★ | Variable | Faible | ★ | ★★ | En complément |

**Lecture** : notre écosystème est le plus fort là où **l'animation remplace les images protégées** (explications, sport, histoire) et là où **la recherche narrative** fait la différence (documentaires, histoires insolites). Les formats qui dépendent d'extraits protégés (sport filmé, cinéma, animés) sont les plus risqués, surtout en France [F34].


---

# Document 3 : stratégie multi-chaînes, économie et automatisation

*Tester plusieurs projets en limitant les risques, le travail humain et les dépenses. Novembre 2026.*

> Les références F1, F2… renvoient à `notes-sources.md`. Tous les chiffres économiques de ce document sont des **scénarios hypothétiques**, à remplacer par nos mesures réelles.

---

## 1. Principes directeurs

1. **Le système apprend par chaîne et par public** [F1, F4]. Une chaîne trop dispersée envoie des signaux contradictoires. Une chaîne par **promesse** et par **public**, pas par idée.
2. **Mutualiser l'usine, pas le produit.** On partage la recherche, les bibliothèques et les gabarits ; on ne publie jamais le même contenu ou des quasi-copies sur plusieurs chaînes [F31].
3. **Décider sur des données suffisantes** : pas de conclusion sur 3 vidéos (distribution très inégale [F16]).
4. **Le temps machine compte** : le temps de rendu et de calcul fait partie du coût, au même titre que le temps humain.

---

## 2. Créer une nouvelle chaîne, ou publier sur une chaîne existante ?

| Situation | Décision | Pourquoi |
|---|---|---|
| Même public, sujet voisin, même promesse | **Même chaîne**, nouvelle série ou playlist | Le système a déjà appris qui aime la chaîne |
| Même public, format différent (Shorts / vidéo longue) | **Même chaîne** | Systèmes de recommandation séparés [F6], mais une identité commune |
| **Public différent** (âge, centres d'intérêt), ou promesse incompatible | **Nouvelle chaîne** | Évite de brouiller les signaux de la chaîne existante |
| Ton incompatible (humour / sérieux, enfants / adultes) | **Nouvelle chaîne** | Protège la confiance du public |
| Autre langue | **Doublage automatique d'abord** [F10], chaîne séparée seulement si le contenu doit être adapté (références culturelles) | Coût marginal quasi nul |

**Test rapide** : « Un spectateur fidèle de la chaîne A serait-il content de voir cette vidéo dans ses recommandations ? » Si la réponse est non, il faut une autre chaîne.

---

## 3. Trois modèles d'organisation pour une petite équipe

### Modèle A : une chaîne, plusieurs séries (démarrage)
- **Principe** : une seule chaîne avec un territoire large (par exemple « histoires vraies et mystères ») et 2 ou 3 séries internes.
- **Pour** : concentre l'apprentissage du système, une seule identité à construire, charge minimale.
- **Contre** : un échec d'une série pèse sur la perception de la chaîne ; les publics ne peuvent pas être trop éloignés.
- **Charge humaine estimée** [HYPOTHÈSE] : 1 personne à mi-temps, plus le pipeline.

### Modèle B : portefeuille de 2 ou 3 chaînes pilotes (recommandé pour tester)
- **Principe** : 2 ou 3 chaînes aux **publics distincts**, sur un **socle commun** (Story Studio, Media Finder, bibliothèques, Remotion). Chacune garde une identité propre (voix, style, gabarit de miniature).
- **Pour** : on compare des niches en parallèle, et le risque est réparti.
- **Contre** : la charge humaine augmente avec chaque chaîne ; risque de dispersion.
- **Garde-fou** : un **budget fixe d'heures par chaîne et par semaine**, et des critères d'arrêt définis **avant** de commencer (section 5).
- **Charge humaine estimée** [HYPOTHÈSE] : 1 à 2 personnes.

### Modèle C : un moteur éprouvé, décliné (après une première réussite)
- **Principe** : quand un format a fait ses preuves, on le décline sur des territoires voisins (même mécanique narrative et visuelle, sujets différents).
- **Pour** : un rendement maximal du pipeline.
- **Contre** : **risque maximal** au regard des règles sur le contenu inauthentique et le spam [F30, F31] si les chaînes se ressemblent trop.
- **Condition** : chaque chaîne doit avoir un **apport éditorial propre** (recherche, angle, voix), pas seulement des sujets différents.

---

## 4. Mutualiser sans tomber dans le « produit en masse »

| Élément | Mutualisable ? | Précaution |
|---|---|---|
| Recherche de sujets, veille | ✅ Oui | — |
| Méthodes de script, structures | ✅ Oui | Adapter le ton à chaque chaîne |
| Bibliothèques de cartes, icônes, décors | ✅ Oui | Personnaliser le style par chaîne |
| Musiques | ⚠️ Avec variation | YouTube cite explicitement les chaînes qui **réutilisent exactement la même musique de fond** sur de nombreuses vidéos [F31] |
| Images ou animations générées par IA | ⚠️ Avec variation | Même avertissement sur les **images IA répétitives** [F31] ; déclaration obligatoire si le rendu est réaliste [F32] |
| Gabarits Remotion (habillage, sous-titres) | ✅ Oui | Un gabarit distinct par chaîne |
| Voix off | ⚠️ | Une voix par chaîne ; déclarer une voix IA réaliste [F32] |
| Vidéos ou extraits identiques | ❌ Non | Interdit par la politique anti-spam [F31] |

---

## 5. Décider : continuer, modifier ou abandonner

### Règles statistiques de base
- Les vues suivent une **distribution très inégale** [F16]. Il faut utiliser la **médiane** et non la moyenne, et regarder la **tendance**, pas une vidéo isolée.
- **Taille d'échantillon minimale indicative** [HYPOTHÈSE] : environ **10 à 12 vidéos longues** ou **30 Shorts** par format, publiées sur **au moins 8 à 12 semaines**, avant toute décision d'abandon. En dessous, on peut seulement **modifier**.
- Comparer une vidéo à la **médiane de sa propre chaîne**, pas à des chaînes d'autres tailles.
- ⚠️ Mesurer avec les **vues engagées** (mode avancé) et la **durée de visionnage**, pas avec les vues comptées depuis la première image [F13].

### Grille de décision [HYPOTHÈSE, à calibrer]

| Signal après la période de test | Décision |
|---|---|
| Médiane des vues en hausse, pourcentage regardé stable ou en hausse, part de spectateurs occasionnels et réguliers qui augmente | **Développer** : augmenter la cadence, envisager le modèle C |
| Bonne rétention mais CTR faible | **Modifier l'emballage** (titres, miniatures), pas le contenu |
| CTR correct mais rétention faible | **Modifier le contenu** : introductions, rythme, durée |
| Une ou deux vidéos percent, le reste stagne | **Pivoter** vers le sous-sujet ou l'angle des vidéos qui ont percé |
| Tout reste plat et le coût par vidéo est élevé | **Abandonner** et réaffecter les heures |

**Toujours noter** la raison de chaque décision dans le journal d'expériences (document 5), pour éviter de reproduire les mêmes erreurs.

### Éviter la dispersion
- **3 chaînes actives au maximum** au départ.
- On n'ouvre une nouvelle chaîne qu'en en fermant ou en mettant en pause une autre.
- Un **responsable éditorial** par chaîne, même s'il s'agit de la même personne : quelqu'un qui garde la cohérence.

---

## 6. Économie et monétisation

### 6.1 Règles en vigueur

| Élément | Règle | Niveau |
|---|---|---|
| Accès à la publicité | 1 000 abonnés + 4 000 heures de visionnage sur 12 mois, **ou** 1 000 abonnés + 10 millions de vues de Shorts sur 90 jours | [OFFICIEL-R] F27 |
| Niveau d'entrée (sans publicité) | 500 abonnés, 3 vidéos en 90 jours, 3 000 heures ou 3 millions de vues de Shorts ; selon les pays | [OFFICIEL-R] F27 |
| Partage des revenus des vidéos longues | 55 % pour le créateur | [OFFICIEL-R] F28 |
| Partage des revenus des Shorts | Cagnotte répartie selon les vues engagées, moins la part musique ; 45 % de la part attribuée revient au créateur | [OFFICIEL-R] F28 |
| Contenu réutilisé | Monétisable seulement avec un apport original important | [OFFICIEL-R] F30 |
| Contenu inauthentique | Contenu produit en masse ou répétitif non monétisable ; **s'applique à la chaîne entière** | [OFFICIEL-R] F30 |

### 6.2 Ce que représentent les 4 000 heures (calcul simple)
Avec une vidéo de 12 minutes regardée en moyenne à 40 % (4,8 minutes par vue) :
4 000 h × 60 = 240 000 minutes ÷ 4,8 = **environ 50 000 vues** cumulées sur 12 mois, toutes vidéos longues confondues.
C'est un objectif atteignable par une seule vidéo qui perce, ou par environ 40 vidéos à 1 250 vues. **[Calcul, pas une prévision.]**

### 6.3 Revenus par format (ordres de grandeur)

| Format | RPM retenu pour les scénarios | Fondement |
|---|---|---|
| Vidéo longue, audience française | 1,5 € (bas) / 3 € (médian) / 5 € (haut) pour 1 000 vues | [ESTIMATION] F23 : moyenne autour de 2,6 $, éducation 2,8 $, finance 4,2 $ |
| Short | Environ 3 à 14 % du RPM des vidéos longues, soit environ 0,05 à 0,40 € | [OBSERVÉ] F19 |
| Saisonnalité | Q4 plus élevé ; janvier −30 à −50 % | [ESTIMATION] F24 |

⚠️ **[HYPOTHÈSE]** Depuis le 24 août 2026, les vues comptées dès la première image augmentent le nombre de vues sans augmenter les revenus [F13]. Le **RPM calculé par vue risque de baisser mécaniquement**. Pour comparer des périodes, il vaut mieux suivre le **revenu par heure de visionnage**.

### 6.4 Scénarios de rentabilité (hypothétiques)

Valeur du temps humain retenue : **25 € de l'heure** (convention de calcul).

| Scénario | Heures humaines par vidéo | Coût humain | Vues nécessaires pour couvrir ce coût (RPM 3 €) |
|---|---|---|---|
| Documentaire 12 min, sans pipeline | 25 h | 625 € | ≈ 208 000 |
| Documentaire 12 min, avec pipeline mûr | 8 h | 200 € | ≈ 67 000 |
| Explication animée 8 min, sans pipeline | 50 h | 1 250 € | ≈ 417 000 |
| Explication animée 8 min, avec bibliothèques mûres | 12 h | 300 € | ≈ 100 000 |
| Short décliné d'une vidéo longue | 0,5 h | 12,5 € | ≈ 62 500 (RPM Short 0,20 €) |

**Lecture** :
1. La **publicité seule** rentabilise rarement une vidéo coûteuse sur une petite chaîne. **Réduire les heures par vidéo** (le pipeline) est le levier principal.
2. Une vidéo evergreen continue de rapporter pendant des mois [F18]. Le calcul sur 12 mois est donc plus juste que sur un mois.
3. Les Shorts sont rentables **seulement** quand ils sont déclinés à très faible coût.

### 6.5 Diversifier les revenus

| Source | Quand | Remarque |
|---|---|---|
| **Sponsoring** | Dès quelques milliers de vues régulières dans une niche recherchée | Souvent calculé en CPM sur les vues moyennes [F25] ; peut dépasser la publicité |
| **Affiliation** | Niches liées à des produits (sport, tech, livres) | Liens en description ; mention obligatoire |
| **Abonnements et dons** (membres, Super Thanks) | Dès le niveau d'entrée [F27] | Nécessite un noyau fidèle |
| **Produits propres** (applications, guides, formations) | Quand une audience réclame un outil | Synergie possible avec nos autres projets |
| **Licence de nos animations ou bibliothèques** | Quand le style est reconnu | Revenu hors YouTube |
| **TikTok** | Pour réutiliser les formats verticaux | Programme Creator Rewards : environ 10 000 abonnés et 100 000 vues sur 30 jours, vidéos de plus d'une minute (à confirmer) [F39] |

### 6.6 Risques économiques

| Risque | Parade |
|---|---|
| **Démonétisation de toute la chaîne** pour contenu inauthentique [F30] | Apport éditorial visible dans chaque vidéo ; variations réelles d'une vidéo à l'autre |
| **Revendications ou avertissements pour droits d'auteur** [F34-F37] | Priorité à l'animation et aux médias sous licence ; registre des droits de chaque média utilisé |
| **Dépendance à YouTube seul** | Au moins une source de revenus hors publicité dès que possible |
| **Contenu sensible** (publicité limitée) | Traitement sans images choquantes ; règles assouplies en janvier 2026 [F33] |
| **Coût des outils** (licence Remotion au-delà de 3 salariés [F38], rendu dans le cloud) | Rendu local tant que c'est possible ; prévoir la licence dans le budget dès qu'on grossit |

---

## 7. Automatisation : évaluation par étape

Les gains sont des **estimations relatives [HYPOTHÈSE]**. Chaque automatisation doit être **mesurée** avant et après (critère d'utilité dans la dernière colonne). Le **temps machine** (calcul, rendu) est compté à part.

| Étape | Gain humain estimé | Coût de création | Maintenance | Temps machine | Risque qualité | Doit rester humain | Critère d'utilité |
|---|---|---|---|---|---|---|---|
| **Recherche de sujets** (veille, tendances, questions fréquentes) | Moyen | Faible | Faible | Faible | Faible | Le **choix final** du sujet | Plus de sujets « validés » par heure de recherche |
| **Analyse des opportunités** (vidéos hors norme dans une niche, via l'API) | **Élevé** | Moyen | Moyen (quotas, changements d'API) | Faible | Moyen (données publiques seulement) | L'interprétation | Une meilleure médiane des vues sur les sujets choisis par l'outil que sur les autres |
| **Assistance au script** (plan, recherche de faits, premières versions) | Élevé | Faible | Faible | Faible | **Élevé** (erreurs, ton générique) | **Vérification des faits, angle, voix finale** | Moins d'heures par script **sans** baisse de rétention |
| **Recherche et découpage de médias** (Media Finder) | **Élevé** | Moyen | Moyen | Moyen | Moyen (**droits**) | **Validation des droits** de chaque média | Moins d'heures de recherche ; zéro revendication |
| **Bibliothèques réutilisables** (Audio, VFX, décors) | Élevé à terme | Élevé au départ | Faible | — | Moyen (répétition [F31]) | La variété et la cohérence du style | Part des éléments réutilisés par vidéo, sans hausse des signalements |
| **Animation automatisée** (Animation Studio) | Élevé | **Élevé** | Élevé | **Élevé** (rendu) | Élevé (rendu « générique ») | La direction artistique | Heures **et** minutes de rendu par minute de vidéo finale |
| **Montage Remotion** (Editing Studio) | **Élevé** | Moyen | Moyen | **Élevé** (rendu) | Moyen (rythme mécanique) | Le rythme, les coupes clés | Heures de montage par minute finale ; rétention comparable au montage manuel |
| **Déclinaison en Shorts** | **Très élevé** | Faible | Faible | Moyen | Moyen (accroches faibles) | Le choix des moments et de l'accroche | Coût marginal par Short ; part de Shorts qui dépassent la médiane |
| **Analyse des performances** (rapports automatiques) | Moyen | Faible | Faible | Faible | Faible | Les décisions | Délai entre la publication et la décision |
| **Suivi des expériences** (journal, tableau de bord) | Moyen | Faible | Faible | Faible | Faible | La rigueur du protocole | Décisions documentées à 100 % |

### Mesurer le temps machine (protocole)
Pour chaque vidéo, enregistrer automatiquement :
- la durée de chaque étape de calcul (génération, découpage, rendu) ;
- les **minutes de rendu par minute de vidéo finale**, en local et dans le cloud ;
- le coût du cloud éventuel (Lambda est facturé par AWS en plus de la licence Remotion [F38]).

**Ordre de priorité de l'automatisation [HYPOTHÈSE]** :
1. Déclinaison en Shorts (gain très élevé, faible coût).
2. Analyse des opportunités (meilleurs sujets = levier principal sur les vues).
3. Montage Remotion avec gabarits.
4. Recherche de médias **avec registre des droits**.
5. Animation automatisée : la plus coûteuse à construire. À lancer seulement si les tests montrent que l'animation surperforme les archives (document 5, test H6).


---

# Document 4 : guide de production

*Sujets, scripts, introductions, miniatures, montage, animation et publication. Novembre 2026.*

> Les références F1, F2… renvoient à `notes-sources.md`. Ce guide décrit des **pratiques**, pas des règles : chacune est accompagnée de son niveau de preuve. Les modèles de scripts sont des **points de départ adaptables**, pas des formules.

---

## 1. Choisir les sujets

### Fondement
- Ce qui étend la diffusion d'une vidéo, c'est la réaction de publics successifs [F1, F4]. Un sujet doit donc intéresser un **public assez large**, qui s'étend au-delà des spécialistes.
- Les vidéos qui « percent » montrent qu'un **sujet** attire, indépendamment de la taille de la chaîne [F20].

### Processus en 5 étapes
1. **Collecte** : vidéos hors norme dans la niche (ratio vues / médiane de la chaîne supérieur à 3, idéalement supérieur à 10 ; voir le protocole du document 2, section 11), questions fréquentes en recherche, actualité du territoire.
2. **Filtre « public »** : qui, précisément, va cliquer ? Le sujet dépasse-t-il le cercle des initiés ?
3. **Filtre « angle »** : qu'apportons-nous que les vidéos existantes n'apportent pas (une information nouvelle, une meilleure clarté, un point de vue, la langue française, un traitement visuel) ?
4. **Filtre « faisabilité »** : avons-nous les médias, **avec les droits** ? Le sujet se prête-t-il à l'animation ?
5. **Filtre « emballage »** : peut-on écrire un titre et une miniature **convaincants** (section 3) ? Si non, on abandonne le sujet.

### Score de sujet (à remplir pour chaque idée) [HYPOTHÈSE]

| Critère | Note de 1 à 5 |
|---|---|
| Taille du public potentiel | |
| Preuve d'intérêt (vidéos hors norme sur ce sujet) | |
| Force de l'angle (différence avec l'existant) | |
| Faisabilité (médias, droits, temps) | |
| Durée de vie (evergreen ou actualité) | |
| Qualité du meilleur titre et de la meilleure miniature | |

On garde le score pour vérifier **a posteriori** s'il prédit les performances. Sinon, on le corrige.

---

## 2. Scripts et narration

### 2.1 Principes étayés
- **La première minute doit confirmer la promesse** du titre et de la miniature. Le document attribué à MrBeast (non authentifié) indique qu'une grande partie de l'audience part dans la première minute, et que le passage des minutes 3 à 6 est le second point critique [NON CONFIRMÉ, F26]. C'est cohérent avec l'objectif de satisfaction de YouTube [F1, F2].
- **Ne pas tromper** : un titre trompeur peut produire des clics, mais aussi de l'abandon et de l'insatisfaction, ce qui va contre ce que mesure le système [F1, F8].

### 2.2 Les éléments d'un script [HYPOTHÈSE, pratique courante]

| Élément | Rôle | Question à se poser |
|---|---|---|
| **Angle** | Ce qui rend la vidéo unique | « En une phrase, qu'est-ce que cette vidéo dit que les autres ne disent pas ? » |
| **Promesse** | Ce que le spectateur va obtenir | « Qu'aura-t-il appris ou ressenti à la fin ? » |
| **Accroche** | Retenir dans les premières secondes | « Pourquoi rester **maintenant** ? » |
| **Enjeux** | Pourquoi c'est important | « Qu'est-ce qui est en jeu, et pour qui ? » |
| **Progression** | Avancer sans tourner en rond | « Chaque séquence apporte-t-elle quelque chose de nouveau ? » |
| **Questions ouvertes** | Maintenir la curiosité | « Quelle question le spectateur se pose-t-il à cet instant ? » |
| **Surprises** | Relancer l'attention | « Où est le retournement ? » |
| **Transitions** | Enchaîner sans couper l'élan | « Comment cette séquence mène-t-elle à la suivante ? » |
| **Rapport texte / image** | Montrer plutôt que dire | « Que voit-on pendant cette phrase ? » |
| **Conclusion** | Satisfaire la promesse | « La question de départ est-elle résolue ? » |

### 2.3 Modèles adaptables

**A. Documentaire / storytelling (12 à 25 min)**
1. **0:00-0:30** : la scène la plus forte, ou la question centrale (*in medias res*).
2. **0:30-1:30** : la promesse (« dans cette vidéo, on va comprendre comment… ») et les enjeux.
3. **Acte 1** : le contexte, les personnages, la situation de départ.
4. **Acte 2** : l'escalade, les complications, et une première révélation vers le milieu.
5. **Acte 3** : le point culminant, la résolution, puis les conséquences.
6. **Fin** : retour à la question de départ, et une ouverture vers une vidéo liée.

**B. Explication animée (6 à 12 min)**
1. Une question concrète et un paradoxe (« on croit que… mais »).
2. L'intuition courante, montrée visuellement.
3. L'explication pas à pas, **une idée par séquence**.
4. Une révélation ou un changement d'échelle.
5. Un résumé en une image.

**C. Analyse sportive (8 à 15 min)**
1. Le moment clé ou la statistique surprenante.
2. La question : « pourquoi ? » ou « comment ? ».
3. La démonstration avec des données et des schémas animés (sans images officielles [F35, F36]).
4. Les contre-arguments.
5. Le verdict, puis ce qu'il faut surveiller ensuite.

**D. Commentaire / analyse de culture (cinéma, séries)**
1. La thèse, en une phrase.
2. Les preuves, illustrées par des reconstitutions, des schémas ou de très courts extraits **justifiés et sourcés** (courte citation [F34]).
3. Les objections.
4. La conclusion, qui élargit le propos.

**E. Short (15 à 60 secondes)**
1. **0-2 s** : l'image ou la phrase qui arrête le défilement.
2. Une seule idée, développée vite.
3. La chute ou la révélation à la fin, éventuellement une boucle vers le début.
4. ⚠️ Au-delà d'une minute, **aucun** élément revendiqué par Content ID [F29].

### 2.4 Différences selon le format

| | Documentaire | Animation | Commentaire | Analyse sportive | Short |
|---|---|---|---|---|---|
| Rythme | Lent puis crescendo | Régulier, une idée par séquence | Argumentatif | Démonstratif | Immédiat |
| Moteur de rétention | Suspense, personnages | Clarté, humour, émerveillement | Opinion forte | Données, débat | Surprise |
| Risque principal | Longueurs au milieu | Densité excessive | Monotonie | Droits sur les images | Accroche faible |

---

## 3. Titres et miniatures

### 3.1 Ce que disent les données
- La miniature et le titre forment une **promesse unique** : ils doivent se compléter, pas se répéter.
- **Visages** : très fréquents chez les vidéos qui percent, **mais aussi fréquents chez celles qui échouent** [F21]. Un visage n'est pas un avantage en soi.
- **Texte sur la miniature** : plus fréquent chez les vidéos qui percent que chez celles qui échouent [F21]. Corrélation, pas preuve.
- **Test & Compare** compare jusqu'à 3 variantes et désigne le gagnant à la **part de durée de visionnage**, pas au CTR [F14]. Cela confirme que YouTube juge l'emballage **sur ce qui suit le clic**.

### 3.2 Les angles de titre

| Angle | Exemple de structure | Convient à |
|---|---|---|
| **Événement** | « Le jour où… » | Documentaire, sport |
| **Personnage** | « L'homme qui… » | Histoire, insolite |
| **Conflit** | « X contre Y : … » | Sport, entreprises |
| **Mystère** | « Pourquoi personne n'a jamais… » | Documentaire, insolite |
| **Transformation** | « Comment X est devenu Y » | Histoire, sport, économie |
| **Explication** | « Comment fonctionne vraiment… » | Éducatif, animation |

### 3.3 Processus reproductible (avant la production)
1. Écrire **10 titres** avec au moins 3 angles différents.
2. Décrire **3 concepts de miniature** en une phrase chacun (l'image principale, 0 à 4 mots, le contraste).
3. **Test de cohérence** : la vidéo peut-elle tenir la promesse dans sa première minute ?
4. **Test de lisibilité** : la miniature réduite à la taille d'un téléphone est-elle encore lisible ?
5. **Test de différenciation** : placer la miniature dans une capture de la page de résultats ou de suggestions du sujet. Ressort-elle ?
6. **Choisir 2 ou 3 variantes** pour Test & Compare [F14].
7. **Après publication** : laisser le test aller à son terme, et noter le gagnant **et** l'écart dans le journal d'expériences.

---

## 4. Introductions : la checklist des 30 premières secondes

- [ ] La première image correspond à la miniature (aucune « rupture de promesse »).
- [ ] L'enjeu est posé en moins de 10 secondes.
- [ ] Pas de logo animé, de générique ni de demande d'abonnement avant d'avoir donné de la valeur.
- [ ] Une question est ouverte, et elle ne sera résolue que plus tard.
- [ ] Le rythme visuel change toutes les quelques secondes (sans précipitation).
- [ ] Une **raison de rester** est explicite (« à la fin, vous comprendrez pourquoi… »).

Pour **vérifier** : comparer la courbe de rétention des 30 premières secondes **entre nos propres vidéos** de même durée. Aucune norme externe n'est fiable [F22].

---

## 5. Montage et animation

### Pratiques [HYPOTHÈSE, à mesurer]
- **Rythme** : relancer l'attention à chaque chute de la courbe de rétention constatée dans les vidéos précédentes.
- **Variété** : alterner narration, schéma, carte, citation et silence. Éviter la répétition visuelle à l'identique d'une vidéo à l'autre [F31].
- **Sous-titres** : utiles pour l'accessibilité et le visionnage sans le son, notamment sur mobile.
- **Chapitres** : facilitent la navigation (effet sur la recommandation non documenté).
- **Animation** : réservée à ce qui manque d'images ou à ce qui doit être expliqué. Un **style propre** est un atout de différenciation.
- **Musique** : utiliser des bibliothèques sous licence ; varier les morceaux. Dans les Shorts, chaque morceau réduit la part de la cagnotte attribuée au créateur [F28].
- **IA** : déclarer tout contenu **réaliste** généré ou modifié par IA (visuels, voix) [F32].

### Registre des droits (obligatoire pour chaque vidéo)

| Média | Source | Licence | Preuve (lien, capture) | Usage (durée, cadre) |
|---|---|---|---|---|

---

## 6. Publication

| Pratique | Niveau de preuve | Recommandation |
|---|---|---|
| **Fréquence** | Dans l'étude Metricool, 2 à 4 vidéos longues par semaine donnent les meilleures performances par vidéo ; au-delà de 7, les vues mensuelles baissent [OBSERVÉ, F18]. Corrélation, influencée par la taille des équipes. | **Régularité tenable** plutôt que volume. Ne jamais sacrifier la qualité pour la cadence. |
| **Heure de publication** | Pas de preuve d'effet propre | Publier quand le public est actif (voir l'onglet Audience). C'est secondaire. |
| **Métadonnées** (titre, description, tags) | La recherche repose sur la pertinence du titre, de la description et du contenu [OFFICIEL-R, F5] | Une description utile : résumé, sources, chapitres. Les tags sont secondaires. |
| **Hype** | Coup de pouce dans le classement Explorer pour les chaînes de moins de 500 000 abonnés [F9] | Inviter les spectateurs fidèles à « hyper » les nouvelles vidéos dans les 7 premiers jours. |
| **Doublage automatique** | 27 langues [F10] | L'activer pour les contenus universels. Vérifier la qualité sur un échantillon. |
| **Déclaration IA** | Obligatoire pour un contenu réaliste [F32] | À cocher au moment de l'envoi. |
| **Suivi** | Interactions concentrées sur les 10 premiers jours, vues sur des mois [F18] | Premier bilan à J+10, bilan complet à J+28, puis vérification à J+90. |


---

# Document 5 : plan d'expérimentation

*Hypothèses, métriques, conditions de comparaison, critères de décision et suivi. Novembre 2026.*

> Les références F1, F2… renvoient à `notes-sources.md`. **Aucune promesse de vues.** Les seuils proposés sont des points de départ à recalibrer avec nos premières données.

---

## 1. Principes de méthode

1. **Une seule vraie expérience aléatoire existe sur YouTube** : **Test & Compare**, où YouTube répartit lui-même les spectateurs entre les variantes [F14]. Tout le reste est **observationnel** : il faut contrôler au mieux les facteurs parasites.
2. **Comparer à l'intérieur d'une chaîne**, à durée comparable et à des périodes proches.
3. **Utiliser la médiane** et des comparaisons par paires, car la distribution des vues est extrêmement inégale [F16].
4. **Fixer les critères de décision avant le test**, et les écrire dans le journal.
5. **Ne pas tester trop de choses à la fois** : une variable principale par vague.
6. **Mesure** : utiliser les **vues engagées** (mode avancé) et la **durée de visionnage**. Ne pas mélanger de données d'avant et d'après le **24 août 2026** [F13].

---

## 2. Indicateurs

### Par vidéo (relevés à J+10, J+28 et J+90)

| Indicateur | Rôle | Source |
|---|---|---|
| **Durée de visionnage totale** (heures) | Indicateur principal de performance | Studio |
| **Vues engagées** | Volume réel | Studio, mode avancé |
| **Pourcentage moyen regardé** (AVP) | Qualité de la rétention, à durée comparable | Studio |
| **Rétention à 30 s et à 60 s** | Qualité de l'introduction | Courbe de rétention |
| **CTR des impressions, par source de trafic** | Qualité de l'emballage | Studio (ne pas comparer d'une source à l'autre) |
| **Répartition des sources de trafic** | Quel système porte la vidéo | Studio |
| **Part de nouveaux spectateurs** | Capacité à atteindre de nouveaux publics | Studio, Audience [F12] |
| **Heures humaines** | Coût | Journal de production |
| **Minutes machine** (calcul et rendu) | Coût | Journal automatique |
| **Revendications et avertissements** | Risque | Studio |

### Par chaîne (mensuel)
Médiane de la durée de visionnage par vidéo ; évolution des spectateurs occasionnels et réguliers ; durée de visionnage obtenue par heure humaine ; revenus (une fois monétisé), avec le revenu par heure de visionnage.

---

## 3. Hypothèses à tester

| # | Hypothèse | Variable testée | Ce qui reste fixe | Indicateur principal | Méthode |
|---|---|---|---|---|---|
| **H1** | Parmi 2 ou 3 niches, l'une offre un meilleur rapport entre la **durée de visionnage** et les **heures de production** | La niche (une chaîne pilote par niche) | Le format (documentaire ou explication de 10-12 min), la cadence | Médiane de la durée de visionnage par vidéo **÷ heures humaines** | 12 vidéos par chaîne, sur 10 à 12 semaines |
| **H2** | Certains angles de titre (mystère, événement, personnage…) génèrent plus de durée de visionnage dans notre niche | L'angle du titre | La vidéo elle-même | Gagnant de Test & Compare (part de durée de visionnage) | Test & Compare sur **chaque** vidéo ; agrégation par angle |
| **H3** | Une ouverture *in medias res* retient mieux qu'une ouverture « promesse d'abord » | Le type d'introduction | La niche, la durée, le style | Rétention à 30 s et à 60 s | Alterner les deux types sur des vidéos successives (A, B, A, B…), au moins 6 de chaque |
| **H4** | Une vidéo de 8-10 min donne plus de durée de visionnage **par heure de production** qu'une vidéo de 15-20 min | La durée | La niche, le style | Durée de visionnage par vidéo **et** par heure humaine | Paires de sujets comparables, au moins 5 paires |
| **H5** | Un montage plus dense (relances visuelles fréquentes) améliore la rétention sans hausse du coût | La densité de montage | Le script | Pourcentage moyen regardé ; minutes de rendu | Même structure de script, 2 gabarits Remotion, au moins 5 vidéos par gabarit |
| **H6** | L'**animation** surperforme les **archives** sur des sujets comparables | Le traitement visuel | Le sujet (paires), la narration | AVP, CTR, durée de visionnage **et** coût total (humain + machine) | Au moins 4 paires de sujets jumeaux |
| **H7** | Décliner chaque vidéo longue en 2 ou 3 Shorts augmente la durée de visionnage des vidéos longues de la chaîne | La présence de Shorts | Les vidéos longues | Durée de visionnage des vidéos longues ; part de nouveaux spectateurs | Périodes alternées avec et sans Shorts (4 semaines chacune). ⚠️ Causalité difficile à établir [F6] |
| **H8** | Le pipeline automatisé réduit les heures par vidéo de plus de 50 % **sans** baisse de rétention | Manuel ou pipeline | La niche, le format | Heures humaines, minutes machine, AVP | Vidéos successives produites des deux façons, au moins 4 de chaque |

---

## 4. Conditions de comparaison et limites statistiques

| Facteur parasite | Effet | Parade |
|---|---|---|
| **Le sujet** | De loin le facteur le plus puissant | Paires de sujets jumeaux ; alternance A, B, A, B |
| **L'âge de la chaîne** | Les vidéos tardives profitent de l'apprentissage du système | Comparer des vidéos proches dans le temps |
| **La saisonnalité** | Audience et RPM varient selon la période [F24] | Pas de comparaison entre décembre et janvier, par exemple |
| **Une vidéo qui perce** | Fait monter les vidéos suivantes et précédentes | Exclure la vidéo hors norme et vérifier si la conclusion tient sans elle |
| **Changement de comptage des vues** | Rupture au 24 août 2026 [F13] | Vues engagées et durée de visionnage uniquement |
| **Petit échantillon** | Fortes variations dues au hasard | Ne conclure qu'à partir d'**écarts importants et répétés** (par exemple plus de 30 % de différence de médiane, dans le même sens, sur au moins 2 vagues). Sinon : « non concluant ». |

**Ce qu'il faut accepter** : avec 5 à 12 vidéos par condition, on détecte seulement les **grosses** différences. Les petites différences ne sont pas mesurables à notre échelle : ce n'est pas grave, ce sont les grosses qui comptent pour décider.

---

## 5. Calendrier

| Phase | Durée | Contenu | Livrable |
|---|---|---|---|
| **0. Préparation** | 2 semaines | Journal d'expériences, protocole API (document 2, section 11), 30 sujets notés, gabarits Remotion, registre des droits | Backlog de sujets et outils de suivi |
| **1. Pilotes** | Semaines 3 à 14 | 2 ou 3 chaînes (modèle B, document 3) ; environ 12 vidéos longues et 25 à 35 Shorts par chaîne ; H1, H2 (en continu), H3 | Choix de la niche principale |
| **2. Optimisation** | Semaines 15 à 26 | Sur la ou les chaînes retenues : H4, H5, H6, H7, H8 | Format, durée, style et pipeline optimisés |
| **3. Passage à l'échelle** | À partir de la semaine 27 | Cadence augmentée, modèle C éventuel, revenus hors publicité | Feuille de route de la phase suivante |

---

## 6. Critères de décision (définis à l'avance)

**Fin de la phase 1, pour chaque chaîne pilote** [HYPOTHÈSE, à recalibrer] :

| Résultat | Décision |
|---|---|
| Médiane de la durée de visionnage par vidéo en hausse sur les 6 dernières vidéos par rapport aux 6 premières, **et** au moins une vidéo à plus de 3× la médiane | **Retenir** la chaîne |
| Stagnation, mais AVP correct (meilleur que nos autres chaînes) | **Modifier** l'emballage et les sujets pendant 6 vidéos supplémentaires |
| Stagnation, AVP faible, coût élevé | **Arrêter** la chaîne et réaffecter les heures |

**Test & Compare (H2)** : un angle est jugé meilleur s'il **gagne dans plus de 60 % des tests** où il est opposé aux autres, sur au moins 10 tests. Si les résultats sont « équivalents », on ne conclut pas.

---

## 7. Journal d'expériences (structure du tableau)

Une ligne par vidéo :

| Colonne | Exemple |
|---|---|
| Identifiant de la vidéo, chaîne, date | — |
| Hypothèse(s) testée(s), condition (A ou B) | H3-A |
| Sujet, angle, score de sujet (document 4) | — |
| Titres et miniatures testés, gagnant, écart | — |
| Durée de la vidéo | — |
| Heures humaines par étape (recherche, script, médias, animation, montage, emballage) | — |
| Minutes machine par étape (génération, rendu) | — |
| Indicateurs à J+10, J+28, J+90 | — |
| Revendications ou avertissements | — |
| Observations qualitatives (commentaires, chutes de rétention) | — |
| Décision et raison | — |

**Revue** : courte chaque semaine (nouvelles données), complète chaque mois (décisions).


---

# Document 6 : synthèse décisionnelle

*Réponses directes aux 8 questions, puis la feuille de route. Novembre 2026.*

> Détails et sources dans les documents 01 à 05 et dans `notes-sources.md` (références F1, F2…).

---

## 1. Qu'avons-nous réellement appris sur YouTube ?

1. **YouTube optimise la satisfaction, pas seulement le clic ou la durée de visionnage.** Il s'appuie sur l'engagement **et** sur des enquêtes posées aux spectateurs [F1, F2, F8]. Une vidéo réussit quand elle **tient sa promesse** auprès de ceux qui l'ont choisie.
2. **Les abonnés pèsent peu dans la découverte.** Environ 11 % des vues viennent d'eux dans l'étude Metricool [F18], et aucun ratio vues/abonnés n'est requis pour être recommandé [F2]. Une petite chaîne peut percer [F20].
3. **Mais la plupart des vidéos font très peu de vues.** La vidéo médiane a environ 35 à 41 vues [F16]. Le succès est rare et très concentré : il faut un **portefeuille de vidéos**, pas un pari unique.
4. **Shorts et vidéos longues sont deux systèmes distincts** [F6]. Les Shorts rapportent environ 3 à 14 % de ce que rapportent les vidéos longues par vue [F19].
5. **Les mesures ont changé.** Depuis le 24 août 2026, une vue compte dès la première image, pour tous les formats [F13]. Il faut comparer avec les **vues engagées** et la **durée de visionnage**.
6. **Les règles visent le contenu répétitif, pas les outils.** Le contenu « inauthentique » (produit en masse, quasi identique d'une vidéo à l'autre) n'est pas monétisable [F30]. Utiliser Claude Code pour piloter Blender, Remotion ou des bibliothèques sonores n'entre pas dans cette catégorie : ce n'est **pas** du contenu généré par IA. Le seul point de vigilance est de garder des vidéos réellement différentes les unes des autres, ce qui est déjà notre intention (musiques et sons choisis selon le contexte).
7. **Les extraits protégés sont utilisables dans des vidéos montées et commentées**, comme le font de nombreuses chaînes de F1, de football, de cinéma ou d'animé. Le risque pratique n'est pas l'interdiction, c'est la **revendication Content ID** (les revenus de la vidéo peuvent partir à l'ayant droit) et, plus rarement, un avertissement. Il se gère : extraits courts, transformés, intégrés à un commentaire ou une analyse [F34-F37].
8. **Le doublage automatique** (27 langues, dont le français) [F10] fait entrer la concurrence étrangère sur les sujets universels, **et** ouvre nos contenus à d'autres langues pour un coût quasi nul.

---

## 2. Quelles idées reçues sont fausses ou incertaines ?

| Idée reçue | Verdict |
|---|---|
| « Il faut des abonnés pour être recommandé » | ❌ Faux [F2, F20] |
| « Il existe un bon CTR universel » | ❌ Faux : il dépend de la niche, de la surface et de l'âge de la vidéo [F11] |
| « Tout se joue dans les premières heures » | ⚠️ Exagéré : les vues continuent des mois [F18], et d'anciennes vidéos reviennent [F4] |
| « Les Shorts font grandir les vidéos longues » | ❓ Non démontré : seulement des corrélations [F6, F18] |
| « Les Shorts tuent la chaîne » | ❓ Non démontré non plus |
| « Un visage sur la miniature augmente le CTR » | ⚠️ Non démontré : les visages sont aussi fréquents chez les vidéos qui échouent [F21] |
| « Les tags sont essentiels » | ⚠️ Secondaires face au titre, à la description et au contenu [F5] |
| « Publier tous les jours garantit la croissance » | ❌ Faux : au-delà de 7 vidéos par semaine, les vues mensuelles baissent dans les données Metricool [F18] |
| « YouTube interdit l'IA » | ⚠️ Inexact : il sanctionne la production de masse répétitive, pas l'outil [F30] |
| « Citer un extrait avec un commentaire, c'est toujours légal » | ❌ Faux en France [F34] |

---

## 3. Quels formats tester dans notre situation ?

**Priorité 1** :
- **Documentaire / storytelling** (histoires vraies, mystères, ascensions et chutes), en **10 à 15 min**. Ce format exploite au mieux Story Studio et Media Finder.
- **Explication animée** (2D / 2.5D) sur des sujets qui manquent d'images. C'est **notre avantage le plus difficile à copier**, avec un risque de droits faible.

**Priorité 2** :
- **Sport en animation, sans images officielles** (F1, football, boxe : tactique, technique, histoire). La demande est forte et l'animation contourne le problème des droits [F35, F36].
- **Histoires insolites**, plus courtes (8 à 12 min), qui servent aussi à alimenter les Shorts.

**En complément systématique** : **2 ou 3 Shorts déclinés** de chaque vidéo longue (coût marginal faible).

**Aussi à tester** : les formats avec **extraits montés et commentés** (F1, football, cinéma, animés), comme le font de nombreuses chaînes. On mesure dans le journal d'expériences la part des vidéos revendiquées et les revenus perdus, pour savoir si le format reste rentable.

**À éviter** : la publication d'extraits bruts sans apport, et les vidéos quasi identiques d'une fois sur l'autre.

---

## 4. Comment choisir nos premiers sujets ?

1. Partir des **vidéos hors norme** de la niche (vues supérieures à 3 à 10 fois la médiane de leur chaîne), relevées avec l'API (document 2, section 11).
2. Garder les sujets qui intéressent **au-delà des spécialistes**.
3. Exiger un **angle propre** : une information nouvelle, plus de clarté, un traitement visuel, la langue française.
4. Vérifier la **faisabilité avec les droits** avant tout.
5. Ne produire que si l'on a **un titre et une miniature convaincants** (document 4, section 3).
6. Privilégier l'**evergreen** (70-80 %) et réserver l'actualité aux événements qui touchent directement notre territoire.

---

## 5. Quelles pratiques semblent les plus prometteuses pour retenir les spectateurs ?

1. **Confirmer la promesse dans la première minute**, sans générique ni demande d'abonnement avant d'avoir apporté de la valeur [F26, F1].
2. **Ouvrir une question** que la vidéo ne résout qu'à la fin.
3. **Une idée nouvelle par séquence** : chaque séquence doit faire avancer.
4. **Relancer** aux endroits où nos propres courbes de rétention chutent.
5. **Montrer plutôt que dire** : l'animation pour expliquer, les cartes et les chronologies pour situer.
6. **Une conclusion qui répond** à la question de départ.
7. **Mesurer sur nos propres vidéos**, aucune norme externe n'étant fiable [F22].

---

## 6. Quelles automatisations auront le plus fort impact ?

| Rang | Automatisation | Pourquoi |
|---|---|---|
| 1 | **Déclinaison automatique en Shorts** | Gain très élevé, coût faible ; alimente la découverte |
| 2 | **Analyse des opportunités** (vidéos hors norme via l'API) | Le choix du sujet est le levier n°1 sur les vues |
| 3 | **Montage Remotion avec gabarits par chaîne** | Réduit fortement les heures par vidéo |
| 4 | **Recherche de médias avec registre des droits** | Gagne du temps **et** réduit le risque juridique |
| 5 | **Suivi automatique des expériences et des performances** | Rend les décisions possibles et traçables |
| 6 | **Animation automatisée** | Le gain le plus élevé à terme, mais aussi le coût et le temps de rendu les plus élevés : à lancer **seulement si** le test H6 montre que l'animation surperforme |

**Doivent rester humains** : le choix du sujet et de l'angle, la vérification des faits, la validation des droits, la direction artistique, le choix des accroches et des moments forts des Shorts.

---

## 7. Quels tests lancer en premier ?

1. **H1, comparaison de niches** : 2 ou 3 chaînes pilotes, 12 vidéos longues chacune, sur 10 à 12 semaines.
2. **H2, Test & Compare sur chaque vidéo** dès la première : c'est le seul vrai test aléatoire disponible [F14], et il ne coûte rien.
3. **H3, type d'introduction**, en alternance sur les vidéos des pilotes.
4. **H8, mesure du pipeline** dès le départ : les heures humaines et les minutes machine de **chaque** vidéo.

Ensuite (phase 2) : H4 (durée), H5 (densité de montage), H6 (animation ou archives), H7 (effet des Shorts).

---

## 8. Que devons-nous éviter ?

1. **Les extraits bruts sans transformation**, et les **Shorts de plus d'une minute contenant un extrait revendiqué**, qui sont bloqués dans le monde entier [F29]. Pour les Shorts avec extraits, rester sous une minute.
2. **Les vidéos quasi identiques** d'une fois sur l'autre ou d'une chaîne à l'autre [F30, F31].
3. **Les titres trompeurs** : clics à court terme, insatisfaction ensuite [F1, F8].
4. **Les conclusions sur trop peu de vidéos**, ou sur des vues d'avant et d'après le 24 août 2026 [F13, F16].
5. **La dispersion** : plus de 3 chaînes actives au départ.
6. **Construire l'animation automatisée avant d'avoir prouvé** que l'animation est rentable chez nous.
7. **Oublier la déclaration** dans le seul cas où elle s'applique : une scène **réaliste** qui pourrait passer pour vraie (par exemple un faux événement réel reconstitué de façon photoréaliste) [F32]. Les VFX stylisés ou manifestement mis en scène ne sont pas concernés.
8. **Dépendre uniquement de la publicité** : prévoir le sponsoring, l'affiliation et des produits propres [F25].

---

## 9. Feuille de route

Classement : **impact** (effet attendu sur l'objectif qualité / temps / audience / revenus), **effort** (travail et coût), **confiance** (solidité des preuves).

| # | Action | Impact | Effort | Confiance | Quand |
|---|---|---|---|---|---|
| 1 | Mettre en place le **journal d'expériences** et la mesure des heures humaines et des minutes machine | Élevé | Faible | Élevée | Semaine 1 |
| 2 | Autoriser `youtube.com` et `support.google.com` dans la session, puis **revérifier les faits [OFFICIEL-R]** | Moyen | Faible | — | Semaine 1 |
| 3 | Construire l'**analyse des vidéos hors norme** via l'API (protocole du document 2) | Élevé | Moyen | Élevée | Semaines 1-2 |
| 4 | Constituer un **backlog de 30 sujets notés** pour 2 ou 3 niches | Élevé | Moyen | Moyenne | Semaine 2 |
| 5 | Créer les **gabarits Remotion** propres à chaque chaîne et le **registre des droits** | Élevé | Moyen | Élevée | Semaine 2 |
| 6 | Lancer les **chaînes pilotes** (H1) avec Test & Compare systématique (H2) | **Très élevé** | Élevé | Moyenne | Semaines 3-14 |
| 7 | Automatiser la **déclinaison en Shorts** | Élevé | Faible | Élevée | Semaines 3-6 |
| 8 | Alterner les types d'introduction (H3) | Moyen | Faible | Moyenne | Semaines 3-14 |
| 9 | Décision de fin de phase 1 : **retenir, modifier ou arrêter** chaque chaîne | Très élevé | Faible | Dépend des données | Semaine 14 |
| 10 | Tests H4 à H7 sur la ou les chaînes retenues | Élevé | Moyen | Moyenne | Semaines 15-26 |
| 11 | Animation automatisée avancée, **si H6 est positif** | Élevé | **Très élevé** | Faible aujourd'hui | Après la semaine 20 |
| 12 | Diversification des revenus (sponsoring, affiliation, produits) | Élevé | Moyen | Moyenne | Dès les premières audiences régulières |
| 13 | Activation du doublage automatique et adaptation à TikTok | Moyen | Faible | Moyenne | Phase 3 |

**La décision la plus importante des 3 prochains mois** : ne pas chercher à tout automatiser d'emblée. Lancer peu de chaînes, mesurer chaque vidéo, et laisser **nos propres données** décider des investissements suivants.


---

# Registre des sources et des faits

*Mis à jour le 1er novembre 2026. Ce registre permet de reprendre la recherche sans la refaire. Chaque fait porte un identifiant (F1, F2…) cité dans les documents 01 à 06.*

**Légende**
- **[OFFICIEL]** : déclaré par YouTube ou Google.
- **[OFFICIEL-R]** : déclaration officielle connue seulement par une reprise (presse, blog), sans accès direct à la page de YouTube. À revérifier quand les domaines youtube.com et support.google.com seront autorisés.
- **[TECHNIQUE]** : publication scientifique d'ingénieurs de YouTube ou Google. Elle décrit un système **à une date donnée**, pas forcément le système actuel.
- **[OBSERVÉ]** : étude externe avec un échantillon et une méthode décrits.
- **[ESTIMATION]** : chiffre d'un outil, d'une agence ou d'un blog, sans méthode vérifiable.
- **[NON CONFIRMÉ]** : une seule source, ou des sources qui se contredisent.

> **Limite d'accès** : dans cette session, les domaines `youtube.com` et `support.google.com` sont bloqués par la configuration réseau. Les pages officielles n'ont donc pas pu être lues directement ; leur contenu est connu par des extraits de recherche et des reprises datées.

---

## A. Recommandation et découverte

| ID | Fait | Niveau | Source et date |
|---|---|---|---|
| F1 | Le système de recommandation cherche à aider chaque spectateur à trouver des vidéos **qu'il va apprécier**. Il s'appuie sur les clics, les vues, la durée de visionnage, des **enquêtes auprès des utilisateurs**, les partages, les « j'aime » et « je n'aime pas ». YouTube évoque plus de 80 milliards de signaux. | [OFFICIEL] | [Blog YouTube, « On YouTube's recommendation system », C. Goodrow, sept. 2021](https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/) |
| F2 | Après la « responsabilité » (contenus problématiques), le critère le plus important est la **satisfaction**. Les enquêtes sont « l'une des données les plus importantes » pour entraîner le système ; un spectateur ne reçoit qu'une ou deux enquêtes par mois. Aucun ratio vues/abonnés n'est requis. | [OFFICIEL-R] | [Tubefilter, FAQ Creator Insider, 15 sept. 2021](https://tubefilter.com/2021/09/15/youtube-creator-insider-recommendation-algorithm-faqs/) |
| F3 | La satisfaction déclarée a des limites : YouTube ne recommande pas un contenu de mauvaise qualité (exemple : la Terre plate) même si certains spectateurs s'en disent satisfaits. | [OFFICIEL-R] | Idem F2 |
| F4 | T. Beaupré (YouTube) : YouTube mesure ce que les spectateurs **ressentent** de leur temps passé, via l'engagement et les enquêtes. Une vidéo qui marche mal ne condamne pas une chaîne. D'anciennes vidéos peuvent être recommandées à nouveau si l'intérêt revient. « Aucune métrique seule n'est un bon indicateur de valeur. » Une citation selon laquelle les abonnés ne regardent pas 90 % des vidéos de leur fil est **[NON CONFIRMÉE]**. | [OFFICIEL-R] | [PPC Land](https://ppc.land/subscribers-skip-90-of-uploads-in-their-feed-youtube-director-says/) · [Search Engine Journal](https://www.searchenginejournal.com/youtube-algorithm-myths-debunked-insights-from-the-growth-team/510091/) |
| F5 | **Recherche YouTube** : trois familles de critères, la **pertinence** (titre, tags, description, contenu par rapport à la requête), l'**engagement** (signaux agrégés, comme la durée de visionnage d'une vidéo pour une requête donnée) et la **qualité**. Leur poids varie selon le type de recherche. Les résultats sont personnalisés selon l'historique. | [OFFICIEL-R] | Help « How YouTube search works » (answer/16090438), reprise par [Search Engine Journal](https://www.searchenginejournal.com/google-explains-how-youtube-search-works) |
| F6 | Les recommandations **Shorts** et **vidéos longues** sont distinctes : regarder un format ne fait pas mécaniquement recommander l'autre. YouTube a indiqué que les chaînes qui publient aussi des Shorts semblaient croître plus vite (une **corrélation**). | [OFFICIEL-R] | [vidIQ, juillet 2022](https://vidiq.com/blog/post/youtube-shorts-long-form-viewers-algorithm/) · [Search Engine Journal, FAQ Shorts](https://www.searchenginejournal.com/youtube-shorts-algorithm-explained-in-qa-format/) |
| F7 | **Covington et al. 2016** : système en deux étapes, la **génération de candidats** (quelques centaines de vidéos parmi des millions) puis le **classement**. Le classement de l'époque était entraîné à prédire la **durée de visionnage attendue** plutôt que le seul clic. | [TECHNIQUE] | *Deep Neural Networks for YouTube Recommendations*, RecSys 2016 |
| F8 | **Zhao et al. 2019** : classement **multi-objectifs**. Il combine des objectifs d'**engagement** (clics, degré de visionnage) et de **satisfaction** (« j'aime », notes), et corrige le **biais de position** (une vidéo en haut de liste est cliquée parce qu'elle est en haut). | [TECHNIQUE] | [Zhao et al., RecSys 2019, résumé](https://charleslow.github.io/notebook/book/papers/zhao_2019.html) |
| F9 | **Hype** : bouton réservé aux chaînes de **moins de 500 000 abonnés**. Chaque spectateur dispose de 3 « hypes » par semaine, pour des vidéos de moins de 7 jours. Classement dans l'onglet Explorer, avec un bonus plus fort pour les petites chaînes. Déployé mondialement en août 2025. | [OFFICIEL-R] | [TechCrunch, 26 août 2025](https://techcrunch.com/2025/08/26/youtubes-hype-feature-that-boosts-smaller-creators-launches-globally) |
| F10 | **Doublage automatique** dans 27 langues, dont le français, ouvert à tous les créateurs début 2026. Environ 6 millions de spectateurs par jour ont regardé au moins 10 minutes de contenu doublé (décembre 2025). | [OFFICIEL-R] | [PPC Land](https://ppc.land/youtube-auto-dubbing-tops-6m-daily-viewers-expands-to-27-languages) · [Storyboard18](https://www.storyboard18.com/amp/digital/youtube-expands-auto-dubbing-to-27-languages-adds-more-natural-and-expressive-voices-88923.htm) |

## B. Métriques

| ID | Fait | Niveau | Source et date |
|---|---|---|---|
| F11 | **CTR des impressions** : mesure la fréquence à laquelle les spectateurs regardent après une impression enregistrée. Il varie selon le type de contenu, l'audience et l'endroit où l'impression a eu lieu. Il ne se calcule pas simplement en divisant les vues par les impressions. La phrase « la moitié des chaînes ont un CTR entre 2 % et 10 % » est attribuée à YouTube par plusieurs sites, mais **non vérifiée à la source**. | [OFFICIEL-R] | Help answer/7628154 (extraits) · [OutlierKit](https://outlierkit.com/resources/youtube-click-through-rate/) |
| F12 | **Spectateurs nouveaux, occasionnels et réguliers** remplacent l'ancienne métrique « spectateurs connus » (juillet 2025). Les seuils précis des « réguliers » (6 ou 7 mois sur 12) diffèrent selon les sources. | [OFFICIEL-R] | [PPC Land](https://ppc.land/youtube-introduces-refined-viewer-analytics-with-casual-and-regular-metrics/) · Help answer/13615784 |
| F13 | **Changement du comptage des vues** : Shorts comptés dès le lancement depuis le **31 mars 2025** (l'ancienne mesure devient les « vues engagées »). Depuis le **24 août 2026**, **tous les formats** comptent une vue dès la première image. L'ancienne mesure reste disponible en mode avancé de Studio. Les conditions du Programme Partenaire ne changent pas. | [OFFICIEL-R] | [Engadget, mars 2025](https://www.engadget.com/social-media/youtube-is-changing-how-it-calculates-views-for-shorts-233058880.html) · [NewscastStudio, 18 août 2026](https://www.newscaststudio.com/2026/08/18/youtube-view-count-metric-change/) · [PPC Land](https://ppc.land/youtube-counts-views-from-the-first-frame-across-all-formats-on-august-24/) |
| F14 | **Test & Compare** : jusqu'à 3 variantes (miniatures, titres ou combinaisons). Le gagnant est choisi sur la **part de durée de visionnage**, pas sur le CTR. Les titres ont été ouverts à tous les créateurs éligibles (autour de décembre 2025, date **[NON CONFIRMÉE]**). | [OFFICIEL-R] | [ThumbnailTest](https://thumbnailtest.com/news/youtube-releases-title-test-compare/) · [vidIQ](https://vidiq.com/blog/post/youtube-launches-new-thumbnail-testing-tool) |
| F15 | L'onglet **Inspiration** de Studio est progressivement retiré à partir d'août 2026 au profit d'**Ask Studio** (assistant IA, en anglais, déploiement limité). | [OFFICIEL-R] | Help answer/15575509 (extrait) · [Search Engine Journal](https://www.searchenginejournal.com/youtube-introduces-ask-studio-ai-for-channel-analytics/559399/) |

## C. Études externes

| ID | Fait | Niveau | Source et date |
|---|---|---|---|
| F16 | Sur un **échantillon aléatoire** de plus de 10 000 vidéos, la vidéo médiane a **environ 35 à 41 vues** (selon la version des données), environ 4 à 5 % n'ont aucune vue, une poignée de vidéos concentre plus de la moitié des vues, et la vidéo médiane dure 64 secondes. | [OBSERVÉ] | McGrady et al. 2023, *Journal of Quantitative Description* · [E. Zuckerman, déc. 2023](https://ethanzuckerman.com/2023/12/22/how-big-is-youtube/) |
| F17 | Pew Research (2019, chaînes de plus de 250 000 abonnés) : 10 % des chaînes produisent 70 % des vidéos ; la vidéo moyenne dure environ 12 minutes ; en suivant 4 recommandations, YouTube proposait des vidéos plus longues. | [OBSERVÉ] | [Pew Research, 25 juillet 2019](https://www.pewresearch.org/internet/2019/07/25/a-week-in-the-life-of-popular-youtube-channels/) |
| F18 | **Metricool 2026** (799 718 vidéos, 71 177 comptes, février 2025 vs février 2026) : le fil Shorts représente environ 61 % des vues organiques, les abonnés environ 11 %, la recherche environ 9 %. Vues des vidéos longues +76 % mais engagement −45 %. 83 % des interactions arrivent dans les 10 premiers jours, mais les vues continuent pendant des mois (« slow burn »). 2 à 4 vidéos longues par semaine donnent le meilleur résultat par vidéo. Les chaînes publiant environ 5 Shorts par mois ont plus de vues par vidéo longue (une **corrélation**). ⚠️ La période inclut le changement de comptage des Shorts de mars 2025 (F13), donc les évolutions des Shorts sont en partie un **effet de mesure**. | [OBSERVÉ] (étude d'éditeur) | [Metricool](https://metricool.com/youtube-trends/) · [Tubefilter, août 2026](https://www.tubefilter.com/2026/08/03/youtube-shorts-long-form-study-metricool/) |
| F19 | **AIR Media-Tech** (274 chaînes, 13 niches, données Analytics, juin 2026) : le RPM des Shorts vaut **3 à 14 % du RPM des vidéos longues** dans presque toutes les niches. La musique fait exception (41 à 60 %). | [OBSERVÉ] (étude d'éditeur) | [AIR Media-Tech](https://air.io/en/air-data-findings/youtube-shorts-rpm-vs-long-form-how-much-do-shorts-earn-in-2026) |
| F20 | Étude de 2 996 vidéos « qui percent » issues de 463 chaînes : 191 viennent de chaînes de moins de 1 000 abonnés ; 89,7 % des percées des chaînes de moins de 100 000 abonnés dépassent leur nombre d'abonnés. L'étude **ne permet pas** d'estimer une probabilité de percée. | [OBSERVÉ] | [Overseeros](https://www.overseeros.com/blog/can-small-youtube-channels-go-viral) |
| F21 | **Miniatures** : vidIQ (500 vidéos qui percent, juillet 2026) trouve environ 69 % de visages et 72 % de texte. Eden (507 478 vidéos) trouve des visages **aussi fréquents chez les vidéos qui échouent** (84 % contre 82 %), alors que le texte est plus fréquent chez les vidéos qui percent. Le visage est donc une norme, pas un avantage. | [OBSERVÉ] | [vidIQ](https://vidiq.com/research/youtube-thumbnail-study/) · [Eden](https://eden.so/blog/what-makes-a-good-youtube-thumbnail/) |
| F22 | Repères de rétention (pourcentage moyen regardé) : 40 à 55 % pour 5-15 min, 30 à 45 % pour 15-30 min, 25 à 35 % au-delà. Les Shorts tournent autour de 74 %. Ce sont des **repères d'outil**, pas des normes. | [ESTIMATION] | [vidIQ](https://vidiq.com/blog/post/increase-audience-retention-youtube/) |
| F23 | RPM en France par niche (TubeAnalytics) : finance ≈ 4,2 $, tech ≈ 3,6 $, éducation ≈ 2,8 $, gaming ≈ 1,4 $, moyenne ≈ 2,6 $. | [ESTIMATION] | [TubeAnalytics France](https://www.tubeanalytics.net/fr/benchmarks/france) |
| F24 | Saisonnalité : RPM plus élevé au 4e trimestre, chute de 30 à 50 % en janvier. La tendance est cohérente entre les sources, mais les chiffres ne le sont pas. | [ESTIMATION] | Guides divers, sans données primaires |
| F25 | Sponsoring : tarifs couramment calculés en CPM (vues moyennes × CPM / 1 000), avec de fortes variations par niche. Aucune grille fiable pour la France n'a été trouvée. | [ESTIMATION] | [1of10](https://www.1of10.com/blog/youtube-sponsorship-rates/) · [CreatorsJet](https://www.creatorsjet.com/fr/blog/combien-les-marques-paient-elles-pour-des-sponsorisations-youtube) |
| F26 | Document interne attribué à MrBeast (authenticité **non confirmée**) : priorité au CTR, à la durée moyenne de visionnage (AVD) et au pourcentage moyen regardé (AVP) ; la première minute doit confirmer la promesse de la miniature ; les minutes 3 à 6 sont le second point critique. | [NON CONFIRMÉ] | [Creator Handbook](https://www.creatorhandbook.net/leaked-document-allegedly-reveals-mrbeasts-secrets-to-youtube-success-the-key-takeaways/) · [A. Jarvis](https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/) |

## D. Monétisation et règles

| ID | Fait | Niveau | Source et date |
|---|---|---|---|
| F27 | **Programme Partenaire (publicité)** : 1 000 abonnés + 4 000 heures de visionnage public sur 12 mois, **ou** 1 000 abonnés + 10 millions de vues de Shorts sur 90 jours. **Niveau d'entrée** (financement par les fans, sans publicité) : 500 abonnés, 3 vidéos publiques en 90 jours, et 3 000 heures ou 3 millions de vues de Shorts. Ce niveau n'existe que dans certains pays. | [OFFICIEL-R] | [AIR](https://air.io/en/monetization/youtube-partner-program-requirements-2026-the-complete-guide) · [vidIQ](https://vidiq.com/blog/post/monetize-youtube-guide/) |
| F28 | **Revenus des Shorts** : les revenus publicitaires du fil Shorts forment une cagnotte mensuelle. Une partie couvre les licences musicales selon le nombre de morceaux utilisés (1 morceau : moitié vers la cagnotte des créateurs ; 2 morceaux : un tiers). La cagnotte est répartie selon la part de **vues engagées** par pays. Le créateur garde **45 %** de ce qui lui est attribué. Pour les vidéos longues, le partage habituel est de 55 % pour le créateur. | [OFFICIEL-R] | Help answer/12504220 (extraits) · [Music Business Worldwide](https://musicbusinessworldwide.com/youtube-shorts-to-split-ad-revenue-between-music-rightsholders-and-creators-from-february-1) |
| F29 | Shorts jusqu'à **3 minutes** depuis le 15 octobre 2024. Un Short de **plus d'une minute** avec une revendication Content ID active est **bloqué dans le monde entier** et non monétisable. | [OFFICIEL-R] | Help answer/15424877 (extraits) |
| F30 | **Contenu « inauthentique »** (15 juillet 2025) : nouveau nom du « contenu répétitif ». Il vise les contenus produits en masse ou répétitifs, et **s'applique à la chaîne entière**. Le contenu **réutilisé** (extraits, compilations, réactions) reste monétisable s'il apporte un **apport original important** (commentaire, montage, valeur éducative). L'IA n'est pas interdite en soi. | [OFFICIEL-R] | [Search Engine Journal](https://searchenginejournal.com/youtube-targets-mass-produced-content-in-monetization-update/550337/) · [PPC Land](https://ppc.land/youtube-clarifies-inauthentic-content-policy-changes/) |
| F31 | **Politique anti-spam** : publier le même contenu de façon répétée sur une ou plusieurs chaînes est interdit, et les réseaux de chaînes coordonnés sont visés. Exemple donné par YouTube : des chaînes qui **réutilisent exactement la même musique de fond et des images IA répétitives** sur de nombreuses vidéos. | [OFFICIEL-R] | Help answer/2801973 (extraits) |
| F32 | **Contenu modifié ou synthétique** : il faut déclarer un contenu réaliste créé ou modifié par IA (images, voix, sons). Depuis 2026, l'étiquette est plus visible, et YouTube peut l'appliquer lui-même. Le contenu animé ou clairement irréaliste garde une mention discrète. | [OFFICIEL-R] | [Blog YouTube, étiquettes IA](https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/) · [PPC Land](https://ppc.land/youtube-shifts-generative-ai-labels-to-spots-viewers-will-actually-see/) |
| F33 | **Contenus adaptés aux annonceurs** : en janvier 2026, YouTube a assoupli la monétisation des sujets sensibles traités sans images choquantes (avortement, automutilation, violences). Une règle sur la violence graphique dans les premières secondes des vidéos de jeu (sept. 2026) est rapportée **[NON CONFIRMÉE]**. | [OFFICIEL-R] | [WTOP/AP, janv. 2026](https://wtop.com/business-finance/2026/01/youtube-relaxes-monetization-policy-on-videos-with-controversial-content/) |

## E. Droits d'auteur par niche

| ID | Fait | Niveau | Source |
|---|---|---|---|
| F34 | **France** : il n'existe pas de *fair use*. L'**exception de courte citation** est étroite : un extrait **bref**, justifié par un but critique, pédagogique ou d'information, avec la source clairement identifiée. Elle ne protège pas automatiquement une vidéo YouTube. | [OBSERVÉ] (droit) | [Blog du Modérateur](https://www.blogdumoderateur.com/reutiliser-extraits-videos-youtube-legal-ou-pas/) · [Elephorm](https://www.elephorm.com/formation/le-droit-dauteur-pour-la-creation-artistique-musique-video-et-image/comprendre-lexception-legale-de-courte-citation) |
| F35 | **Formule 1** : Formula One Management est réputé agressif (revendications sur des vidéos de jeux et des images de course ; lettres de mise en demeure rapportées en 2025 sur l'usage du nom « F1 » dans des noms de chaînes). Les chaînes d'analyse utilisent souvent **leurs propres graphiques et animations**. | [OBSERVÉ] | [Jalopnik](https://jalopnik.com/youtube-sim-racing-streamers-can-t-seem-to-escape-copyr-1831604926) · [Sportskeeda](https://widgets.sportskeeda.com/f1/f1-youtubers-at-risk-after-being-hit-by-copyright-claims-from-fom) |
| F36 | **Football** : Premier League, UEFA et FIFA comptent parmi les ayants droit les plus actifs. Des images de match brutes sont revendiquées rapidement. | [OBSERVÉ] | [Satura](https://saturaai.com/blog/football-highlights-without-copyright-issues-build-commentary-led-videos-not-clip-rp-8to) (guide) |
| F37 | **Animé** : des extraits non retravaillés sont revendiqués par Content ID en quelques heures. Des campagnes de retrait ont touché des chaînes de réaction. Un commentaire original important améliore la position, sans la garantir. | [OBSERVÉ] | [vidIQ](https://vidiq.com/blog/post/can-you-monetize-anime-clips-recaps-gameplay-youtube/) · [Dexerto](https://www.dexerto.com/youtube/anime-youtuber-says-channel-faced-deletion-after-copyright-strikes-removed-60-videos-3408486/) |

## F. Outils

| ID | Fait | Niveau | Source |
|---|---|---|---|
| F38 | **Remotion** : gratuit pour les particuliers et les entreprises de **3 salariés ou moins**. Au-delà, une licence entreprise est payante (minimum mensuel autour de 100 $ selon les sources, qui divergent). Le rendu dans le cloud (Lambda) est facturé en plus par AWS. | [OFFICIEL-R] | [Remotion, licence](https://remotion.dev/docs/license) · [Remotion, tarifs](https://www.remotion.dev/docs/license/pricing) |
| F39 | **TikTok Creator Rewards** : 10 000 abonnés et 100 000 vues sur 30 jours sont couramment cités ; le programme semble disponible en France. La règle « vidéos de plus d'une minute » repose sur une seule source. | [NON CONFIRMÉ] | [Swello](https://swello.com/fr/blog/gagner-de-largent-sur-tiktok/) · [Postfast](https://postfa.st/blog/tiktok-monetization-requirements) |

---

## Questions ouvertes (à vérifier dès que l'accès est rétabli)

1. Texte exact des pages Help : CTR (phrase « 2 % à 10 % »), YPP, Shorts, contenu inauthentique, spam.
2. Date exacte d'ouverture du test des titres dans Test & Compare.
3. Seuil exact des « spectateurs réguliers ».
4. Conditions TikTok (durée minimale, pays).
5. Données publiques sur des chaînes de taille moyenne dans nos niches : à collecter avec l'API YouTube Data (voir document 05, protocole d'échantillonnage).


---

