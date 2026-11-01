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
