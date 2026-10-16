# De la frustration à la fonctionnalité

*Méthode et premières idées de produits — octobre 2026*

L'objectif : partir de **frustrations réelles et documentées** (pas d'intuitions), et les transformer en mécanismes produit qu'un acteur en place ne peut pas copier facilement.

---

## Partie 1 — La méthode (réutilisable pour chaque nouvelle idée)

### 1.1 Les 5 familles de frustration à chasser

| Famille | Question à se poser | Exemple de signal |
|---|---|---|
| **Frustration d'usage** | Quel geste les gens refont 3x/semaine sans outil satisfaisant ? | « Je passe plus de temps à chercher quoi regarder qu'à regarder » |
| **Limite d'un service** | Qu'est-ce que le leader *refuse* de faire, parce que ça nuirait à son modèle ? | Une plateforme de streaming ne vous dira jamais de résilier |
| **Limite technique / performance** | Où le produit casse-t-il dès que les conditions sont mauvaises ? | Caisse/paiement inutilisable sans réseau |
| **Limite d'infrastructure** | Quelle hypothèse (réseau, électricité, guichet, humain) est tenue pour acquise mais fausse pour une partie des gens ? | Zones blanches, coupures, démarches 100 % en ligne |
| **Asymétrie de pouvoir** | Où l'utilisateur est-il seul face à une organisation qui a l'info, le temps et les règles ? | Chatbot qui bloque l'accès à un humain, administration qui ne répond pas |

### 1.2 Le pipeline en 6 étapes

1. **Collecter** sur plusieurs sources (avis 3★ des apps concurrentes, Reddit/forums, groupes Facebook/Discord, rapports officiels, enquêtes).
2. **Regrouper** les plaintes par thème.
3. **Scorer** chaque thème : **Fréquence** (combien de gens) × **Intensité** (cherchent-ils une solution *maintenant*, ou tolèrent-ils ?).
4. **Reformuler en JTBD** : *Quand [situation], je veux [motivation], pour pouvoir [résultat].*
5. **Inverser la frustration** : se demander quel mécanisme rendrait la frustration **impossible**, et pas seulement moins pénible (voir 1.3).
6. **Tester le moat** : *pourquoi le leader ne peut-il pas simplement ajouter cette fonctionnalité ?* S'il n'y a pas de réponse structurelle, l'idée n'est pas défendable.

### 1.3 Les 6 façons de transformer une frustration en fonctionnalité

| Frustration | Transformation | Mécanisme type |
|---|---|---|
| « Je ne sais pas où j'en suis » | **Rendre visible** | Timeline, état en temps réel, compteur de délai |
| « Je dois tout refaire / tout ressaisir » | **Capturer une fois, réutiliser partout** | Coffre de pièces, profil réutilisable |
| « Personne ne me répond » | **Escalade automatique** | Relances datées, passage à l'échelon supérieur selon des règles |
| « Ça ne marche pas quand… (réseau, panne) » | **Dégradation gracieuse** | Offline-first, synchronisation différée, mode secours |
| « Le service a intérêt à ce que je reste coincé » | **Contre-positionnement** | Un modèle payé par l'utilisateur, aligné sur *son* intérêt |
| « Chacun galère seul avec le même problème » | **Mutualiser l'expérience** | Données collectives (délais réels, astuces qui marchent) → effet de réseau |

### 1.4 Les garde-fous (auto-audit avant de valider une idée)

- La différenciation tient-elle encore si on change seulement le nom et le logo d'un concurrent ? → si oui, elle est **cosmétique**, on recommence.
- Est-ce qu'on se différencie juste en **réduisant l'audience** (« X pour les seniors ») ? → interdit : ça réduit le marché sans changer le produit.
- Quel **Power** (7 Powers de Helmer) est visé, et qu'est-ce qui empêche le leader de le copier ?
- TAM/SAM/SOM chiffrés, même grossièrement ?
- Rétention/conversion comparées à un **vrai benchmark** de la catégorie ?
- Au moins **2 vraies faiblesses** listées ?

---

## Partie 2 — Carte des signaux collectés

| # | Signal (source) | Fréquence | Intensité | Score |
|---|---|---|---|---|
| A | **Démarches administratives** : 61 % des Français rencontrent des difficultés (contre 39 % en 2016) ; plus de 165 000 saisines du Défenseur des droits en 2025 (+17 % sur un an) ; selon une enquête, une personne sur quatre renonce à ses droits face à la complexité. | Très haute | Très haute (droits perdus, titres de séjour, aides) | ★★★★★ |
| B | **Chatbots qui bloquent l'accès à un humain** : 87 % des clients exigent de garder l'accès à un agent humain (Gartner, 2026) ; les échecs répétés avec l'IA font fuir. | Très haute | Haute, mais ponctuelle | ★★★★ |
| C | **Fragmentation du streaming** : 46 % des sondés US ont raté un match faute de savoir où il passait ; 30 % mettent plus de temps à choisir qu'à regarder ; 32 % s'abonnent juste le temps d'une saison (Bango, 2026). | Haute | Moyenne (agaçant, rarement grave) | ★★★ |
| D | **Fragilité réseau/électricité** : black-out général de près de 2 jours en Guadeloupe (oct. 2024) ; zones blanches résiduelles (Arcep 2026 : 92,7 % du territoire guadeloupéen en « bonne » 4G). | Moyenne | Très haute pendant l'incident (on ne peut plus vendre ni payer) | ★★★ (à valider sur le terrain) |

**Lecture** : A domine. B est le même problème de fond, *l'utilisateur seul face à une organisation*, mais dans le secteur privé. C'est un vrai filon commun, développé ci-dessous.

---

## Partie 3 — Fiches idées

### Idée 1 — **Dossier Vivant** *(démarches administratives)*

**Signal d'origine** : rapports du Défenseur des droits 2025-2026 (hausse record des saisines, délais excessifs, absence de réponse, dématérialisation mal accompagnée).
**JTBD** : *Quand je lance une démarche (titre de séjour, CAF, carte grise, retraite) et que je n'ai plus de nouvelles, je veux savoir où en est mon dossier et quoi faire, pour pouvoir obtenir mon droit sans perdre des mois ni abandonner.*

**CORE**
- **Clarté** : les gens ne savent pas où en est leur dossier, quel délai est normal, ni quel recours existe.
- **Objectif unique** : suivre chaque démarche comme un colis, de l'envoi jusqu'à la décision.
- **Résolution** : chaque démarche devient un *dossier vivant* (pièces, accusés, échanges, dates). L'app connaît les **délais légaux** (ex. le silence de l'administration qui vaut décision après 2 mois dans de nombreux cas) et propose, au bon moment, la relance, le recours gracieux ou la saisine du Défenseur des droits, avec le dossier de preuves déjà assemblé.
- **Expérience (aha < 60 s)** : on photographie l'accusé de réception → l'app affiche « Jour 47 / délai de réponse : 60 jours. Délai médian constaté dans votre préfecture : 94 jours. Prochaine action conseillée : le 12/11 ».

**Positionnement**
- **Profondeur** : **structurelle** (modèle « dossier + horloge légale + escalade »), avec une base **systémique** : les délais réels sont mutualisés entre les utilisateurs.
- **Carte concurrence** :

| Concurrent | Force | Faiblesse | Taille | Axe laissé ouvert |
|---|---|---|---|---|
| Service-Public.fr | Référence officielle des procédures | Explique la règle, pas *votre* dossier ; ne publie pas les délais réels | Très grande | Suivi personnel + délais constatés |
| France Services (guichets) | Accompagnement humain | Horaires, déplacement, pas de suivi dans la durée | ~2 800 points | Continuité entre deux rendez-vous |
| LegalPlace / Legalstart | Démarches payantes clés en main | Orientés entreprises, à l'acte | Moyenne | Particuliers, suivi long |
| Associations (Cimade, etc.) | Expertise, confiance | Débordées, outils artisanaux | Locale | Outil pour leurs bénévoles |

- **Power visé** : **économies d'échelle sur la donnée** et **effets de réseau indirects** (chaque dossier enrichit la base des délais réels par administration et par département), complétés par du **counter-positioning** : l'État ne publiera pas spontanément la mesure de ses propres retards. Horizon : après traction (environ 10 000 dossiers suivis).
- **Vecteur de percée** : n° 5, être le meilleur pour résoudre complètement le problème d'un segment exigeant (étrangers en renouvellement de titre, aidants familiaux).

**Sizing** *(ordres de grandeur)*
- **TAM** : environ 30 M d'adultes en France ont des difficultés dans leurs démarches (61 % de ~52 M).
- **SAM** : ceux qui sont à l'aise sur smartphone, ou qui ont un aidant qui l'est : environ 12-15 M.
- **SOM (24 mois)** : 100-200 k utilisateurs actifs.
- **Anti-rétrécissement** : le segment de départ (titres de séjour, aidants) découle du mécanisme : c'est là que délai et enjeu sont les plus forts. Le produit est identique pour la CAF ou une carte grise.

**Architecture & ADN**
- **Modèle de données** : `Démarche` → `Pièces` + `Événements datés` + `Règle de délai` + `Organisme/département` ; agrégat anonymisé `Délai constaté`.
- **Structure** : asynchrone, centralisée pour l'agrégat, mais pièces chiffrées côté utilisateur (données très sensibles). Dossier **partageable** avec un aidant ou un bénévole d'association.
- **Archétype** : *l'allié lucide*. Ton calme et factuel, jamais anxiogène. Règle produit : toujours **une seule** prochaine action visible.

**UI/UX**
- Visuel sobre, inspiré du suivi de colis (barre de progression + horloge).
- Onboarding en 3 écrans : choisir une démarche → photographier un document → voir son horloge.

**Boucle d'engagement**
- **Hook** : déclencheur = échéance qui approche → action = 1 tap pour générer la relance → récompense variable = réponse obtenue, déblocage → investissement = dossier enrichi.
- **Octalysis** : *accomplissement* (étapes franchies), *évitement de perte* (« votre délai de recours expire dans 5 jours »), *influence sociale* (« 312 personnes suivent la même démarche ici »).
- **Test éthique** : ✅ l'urgence affichée est **réelle** (délais légaux), jamais fabriquée.

**Modèle économique**
- Gratuit pour suivre ses dossiers.
- **Pack recours** à l'acte (9-19 €) : courrier mis en forme, envoi en recommandé électronique, dossier de preuves.
- Licence B2B pour associations, mutuelles et employeurs (RH : salariés étrangers).
- Hypothèse : 3 % de conversion à l'acte (médiane freemium : 2-5 %). Le revenu principal vient du B2B.

**Risques & angles morts**
1. **Frontière avec le conseil juridique**, qui est réglementé : il faut rester sur l'information et les modèles de courrier, ou s'adosser à des avocats ou à des associations agréées.
2. **Paradoxe d'accès** : les plus en difficulté sont les moins équipés. D'où le mode « aidant » et le canal associations, indispensables dès le départ, pas en option.
3. **Données ultra-sensibles** (séjour, santé, revenus) : une fuite tuerait la marque. Le chiffrement et l'hébergement en France sont non négociables.
4. **Démarrage à froid de la donnée** : les délais constatés n'ont de valeur qu'au-delà d'un certain volume par département.

**Prochaine étape de validation** : landing page « Suivez votre titre de séjour comme un colis » + un Google Form pour saisir un dossier, puis un **Wizard of Oz** (relances calculées à la main) avec 2 associations pendant 4 semaines. Signal de succès : 40 % des dossiers mis à jour au moins une fois.

---

### Idée 2 — **Passe-Droit** *(atteindre un humain et obtenir gain de cause face au service client)*

**Signal d'origine** : Gartner 2026 (87 % exigent l'accès à un humain ; les échecs répétés avec l'IA font fuir) ; enquêtes Genesys et Metrigy relayées en 2026 *(chiffres secondaires, à vérifier)*.
**JTBD** : *Quand un opérateur, une banque ou un e-commerçant me fait tourner en rond avec son chatbot, je veux joindre la bonne personne et constituer une preuve, pour pouvoir être remboursé ou dépanné sans y passer des heures.*

**CORE**
- **Clarté** : l'utilisateur est seul et sans mémoire face à une entreprise qui, elle, a des scripts.
- **Objectif unique** : transformer un litige en **dossier qui avance tout seul**.
- **Résolution** : (1) une base collaborative des **chemins d'escalade qui marchent** par entreprise (numéro direct, mot-clé qui déclenche un humain, service réclamations, médiateur de la consommation compétent) ; (2) chaque échange est horodaté dans le dossier ; (3) après N échecs, l'app génère automatiquement la réclamation écrite, puis la saisine du médiateur.
- **Aha < 60 s** : on tape « Free box en panne » → « Chemin le plus rapide constaté : … (temps médian 11 min) · Médiateur compétent : … · Votre dossier est ouvert ».

**Positionnement**
- **Profondeur** : **structurelle**, et **systémique** via la base collective des chemins d'escalade et des taux de résolution par entreprise.
- **Carte concurrence** :

| Concurrent | Force | Faiblesse | Taille | Axe laissé ouvert |
|---|---|---|---|---|
| Avis (Trustpilot…) | Notoriété | Se plaindre ≠ obtenir réparation | Très grande | Action concrète |
| Signal Conso (DGCCRF) | Officiel | Remonte l'info sans résoudre votre cas | Grande | Suivi jusqu'à la résolution |
| Rocket Money et similaires | Résilier, négocier | Centré sur les abonnements, peu présent en France | Grande (US) | Litiges en général, marché FR |
| Associations de consommateurs | Expertise, poids | Adhésion, lenteur | Moyenne | Self-service immédiat |

- **Power** : **effets de réseau** (plus il y a d'utilisateurs, plus les chemins d'escalade sont à jour) et **counter-positioning** (les entreprises ne peuvent pas proposer un outil qui contourne leur propre chatbot).
- **Vecteur** : n° 1, être 10x meilleur sur une seule chose qui compte : *le temps pour joindre un humain*.

**Sizing**
- **TAM** : tous les consommateurs qui ont un litige dans l'année (des dizaines de millions en France).
- **SAM (FR, mobile)** : environ 10 M de litiges actifs par an.
- **SOM** : 50-100 k dossiers par an à 24 mois.
- **Anti-rétrécissement** : ✅ aucun sous-segment, le mécanisme est universel.

**Architecture & ADN**
- **Données** : `Entreprise` → `Chemins d'escalade` (votés, datés) ; `Dossier` → `Tentatives` → `Résultat`.
- **Structure** : asynchrone, collaborative (modèle à la Waze).
- **Archétype** : *le rebelle méthodique*, avec de l'humour mais des courriers irréprochables.

**Boucle** : la frustration, au moment où elle surgit, sert de déclencheur → action : « ouvrir un dossier » → récompense variable : remboursement obtenu, et combien → investissement : on vote pour le chemin qui a marché.
**Octalysis** : *accomplissement* (« 214 € récupérés »), *influence sociale* (contributeurs), *empowerment*.
**Test éthique** : ✅

**Modèle économique** : gratuit jusqu'à la saisine du médiateur, puis commission de 10-15 % sur les sommes récupérées au-delà d'un seuil, ou 4,99 € par dossier « premium ». Freemium : viser 3-5 %.

**Risques**
1. Pente glissante vers le **contournement des CGU** ou des pratiques agressives : il faut rester dans les voies légales (réclamation, médiateur).
2. **Fraîcheur des données** : les entreprises changent leurs numéros et leurs parcours. Sans communauté active, la base pourrit.
3. Usage **épisodique** (rétention J30 faible, comparable au e-commerce : 2-4 %), d'où un modèle à l'acte plutôt qu'un abonnement.

**Validation** : une page publique « Comment joindre un humain chez [les 20 plus grosses entreprises en France] », mesurée en trafic SEO et en contributions. Si personne ne la met à jour en 2 mois, l'effet de réseau n'existe pas.

> 💡 **Mutualisation possible** : les idées 1 et 2 partagent le même moteur (*dossier + horloge + escalade + données collectives*). Un seul moteur, deux portes d'entrée (public / privé) : c'est le vrai actif à construire.

---

### Idée 3 — **Caisse Tenace** *(vendre et encaisser même sans réseau ni électricité)*

**Signal d'origine** : black-out général de près de 2 jours en Guadeloupe (25-27 octobre 2024), avec des répercussions importantes sur les commerces ; zones blanches résiduelles (Arcep 2026). *Signal à confirmer sur le terrain : je n'ai pas trouvé de chiffres sur les ventes perdues.*
**JTBD** : *Quand le réseau ou le courant tombe, je veux continuer à vendre et à encaisser sans perdre la trace, pour pouvoir ne pas fermer boutique ni me faire voler.*

**CORE**
- **Clarté** : les caisses et terminaux de paiement supposent un réseau permanent.
- **Objectif unique** : **ne jamais perdre une vente**.
- **Résolution** : caisse **offline-first** sur smartphone, avec synchronisation entre téléphones par Bluetooth ou Wi-Fi local. Paiement différé sécurisé : le client scanne un QR, et un **engagement de paiement signé** est réglé automatiquement par virement instantané dès le retour du réseau, avec relance SMS. Dernier recours : export papier du journal.
- **Aha < 60 s** : passer en mode avion → encaisser une vente → réactiver le réseau → tout se synchronise.

**Positionnement**
- **Profondeur** : **structurelle**. Le *local-first* est une architecture, pas une fonctionnalité : un concurrent conçu cloud-first doit refondre sa couche de données pour l'adopter.
- **Carte concurrence** :

| Concurrent | Force | Faiblesse | Taille | Axe laissé ouvert |
|---|---|---|---|---|
| SumUp / Zettle | Terminaux bon marché | Mode hors ligne limité ou inexistant selon les offres | Très grande | Résilience totale |
| Square | A un mode de paiement hors ligne (limité, selon les marchés) | Faible présence aux Antilles, plafonds | Très grande | Marchés insulaires et ruraux |
| Cahier papier | Marche toujours | Pas de trace fiable, ni de stock | — | Le remplacer sans perdre sa robustesse |

- **Power** : **coûts de changement** (historique des ventes et du stock, clients récurrents) et **process power** à long terme (savoir-faire en synchronisation et résolution de conflits hors ligne).
- **Vecteur** : n° 5 (meilleur problem-solver pour un segment exigeant), puis n° 3 (adopté d'abord par les commerçants les plus exposés).

**Sizing**
- **TAM** : petits commerces dans les zones où le réseau est fragile dans le monde (îles, zones rurales, marchés, festivals, Afrique de l'Ouest) : plusieurs dizaines de millions.
- **SAM** : DOM + France rurale + événements : quelques centaines de milliers de points de vente.
- **SOM** : 2-5 k commerçants à 24 mois.
- **Anti-rétrécissement** : les Antilles sont le **terrain de preuve** du mécanisme, pas la limite du marché. Le même produit sert un food-truck en festival.

**Architecture & ADN**
- **Données** : journal de ventes en *event log* local (CRDT), synchronisation pair-à-pair ; `Engagement de paiement` = objet signé, horodaté, avec un statut.
- **Structure** : **distribuée**, local-first, avec le cloud en option.
- **Archétype** : *l'artisan increvable*. Gros boutons, contraste fort (lisible en plein soleil), fonctionne sur un vieux téléphone. Règle produit : **aucune fonctionnalité ne doit dépendre du réseau pour encaisser**.

**Boucle** : usage quotidien de caisse (rétention structurelle, comparable à la productivité, DAU/MAU 30-60 %). La récompense est un tableau de fin de journée (« 0 vente perdue pendant la coupure de 14 h »). Octalysis : *accomplissement*, *évitement de perte*. Test éthique ✅.

**Modèle économique** : abonnement de 9-19 €/mois, sans terminal propriétaire ; commission sur le paiement différé réglé. Logiciel B2B pour petits commerces : essai 14 jours, viser 10-15 % de conversion après l'essai.

**Risques**
1. **Risque de crédit et de fraude** sur le paiement différé : il faut un plafond, une note de confiance par client, et éventuellement un partenaire de paiement agréé (régulation des établissements de paiement).
2. **Fréquence des coupures** : si elles sont rares, la proposition « résilience » ne suffit pas, et la caisse doit être bonne *aussi* au quotidien.
3. **Distribution** : convaincre des commerçants un par un coûte cher. Il faut passer par la CCI, les grossistes ou les banques locales.

**Validation** : 15 entretiens avec des commerçants à Pointe-à-Pitre / Jarry (« Qu'avez-vous fait pendant le black-out ? Combien avez-vous perdu ? »), puis un prototype PWA hors ligne testé sur un marché local un samedi.

---

### Idée 4 (fiche courte) — **Rotation** *(streaming)*

- **Signal** : 46 % ont raté un match faute de savoir où il passait ; 32 % s'abonnent pour une saison (Bango 2026).
- **Mécanisme** : non pas un « où regarder » de plus (JustWatch existe déjà, ce serait une différenciation cosmétique), mais un **planificateur de rotation d'abonnements** : on déclare ses séries, ses équipes et ses compétitions, et l'app calcule *quel service prendre et quel mois*, puis rappelle de résilier.
- **Power** : **counter-positioning**. JustWatch vit de l'affiliation aux inscriptions ; il ne peut pas vous pousser à *résilier*.
- **Faiblesses** : les bundles box et opérateurs (abonnements annuels) réduisent la valeur de la rotation ; le calendrier des droits sportifs est très coûteux à maintenir. **Score plus faible** (intensité moyenne) : à garder en réserve.

---

## Partie 4 — Recommandation

1. **Priorité : le moteur « Dossier + Horloge + Escalade »** (idées 1 et 2). Le signal est le plus fort, il est documenté par des institutions, et le moat de données est réel.
2. **Pari local : Caisse Tenace**, à condition que les entretiens terrain confirment des pertes réelles et récurrentes.
3. **Prochaine action concrète (2 semaines)** : une landing page *Dossier Vivant* dans ce dépôt + 10 entretiens (associations d'aide aux démarches, aidants familiaux).

---

## Sources

- [Défenseur des droits : dégradation de l'accès aux droits (Maire-info)](https://maire-info.com/services-publics/services-publics-la-defenseure-des-droits-alerte-sur-la-degradation-significative-de-lacces-aux-droits-article-30680)
- [Une personne sur quatre renonce à ses droits (Acteurs publics)](https://acteurspublics.fr/articles/services-publics-une-personne-sur-quatre-renonce-a-ses-droits-face-a-la-complexite-des-demarches/)
- [Le Défenseur des droits appelle à mieux accompagner la dématérialisation (Acteurs publics)](https://acteurspublics.fr/articles/le-defenseur-des-droits-appelle-letat-a-mieux-accompagner-la-dematerialisation-des-services-publics/)
- [Gartner 2026 : 87 % des clients veulent garder l'accès à un humain](https://www.gartner.com/en/newsroom/press-releases/2026-08-04-gartner-survey-finds-87-percent-of-customers-say-companies-using-genai-for-customer-service-must-provide-access-to-a-human-agent0)
- [ConsumerAffairs : les bots de service client ne sont pas prêts](https://www.consumeraffairs.com/news/customer-service-ai-bots-not-ready-for-prime-time-survey-suggests-121825.html)
- [Sénal News : fragmentation du streaming sportif (Bango 2026)](https://senalnews.com/en/data/usa-sports-streaming-reaches-tipping-point-as-fragmentation-drives-demand-for-bundles)
- [NewscastStudio : la fragmentation teste les limites du streaming](https://www.newscaststudio.com/2026/06/04/analysis-fragmentation-built-streamings-growth-and-now-tests-its-limits/)
- [Arcep 2026 : panorama de la connectivité mobile](https://www.arcep.fr/uploads/tx_gspublication/Arcep-RA2026-tome2-Panorama-connectivite-mobile-France_normeA.pdf)
- [Électricité rétablie en Guadeloupe après le black-out (Maire-info)](https://www.maire-info.com/outre-mer/l'electricite-retablie-partout-en-guadeloupe-le-couvre-feu-partiel-reconduit-article-29056)
- [Gendarmerie : un week-end de haute intensité en Guadeloupe](https://www.gendarmerie.interieur.gouv.fr/gendinfo/terrain/immersion/2024/guadeloupe-les-gendarmes-confrontes-a-un-week-end-de-haute-intensite)
