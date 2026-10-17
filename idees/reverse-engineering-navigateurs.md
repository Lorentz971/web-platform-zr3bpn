# Reverse engineering des navigateurs, de la recherche et de l'IA

*Chrome/Google · Brave · Opera · DuckDuckGo · navigateurs IA (Comet, Atlas, Dia, Edge Copilot, Neon) — octobre 2026*

> Suite de `reverse-engineering-assistants-ia.md`. Analyse fondée sur des informations **publiques** (code open-source, décisions de justice, annonces, mesures d'audience). ⚠️ = chiffre secondaire ou non confirmé.

---

## 1. Anatomie : un navigateur est un **canal de distribution** déguisé en logiciel

```
┌──────────────────────────────────────────────────────────────┐
│ 7. MODÈLE ÉCO     accords « moteur par défaut », pubs search, │
│                   pubs navigateur, abonnements, crypto        │
├──────────────────────────────────────────────────────────────┤
│ 6. IA             barre latérale (résumé, chat) → AGENT qui   │
│                   clique, remplit, achète                     │
├──────────────────────────────────────────────────────────────┤
│ 5. RECHERCHE      moteur par défaut : index propre (Google,   │
│                   Brave) ou loué (DuckDuckGo ≈ Bing)          │
├──────────────────────────────────────────────────────────────┤
│ 4. CONFIDENTIALITÉ blocage pubs/traqueurs, cookies, VPN,      │
│                   fingerprinting                               │
├──────────────────────────────────────────────────────────────┤
│ 3. COMPTE & SYNC  identité, mots de passe, historique →       │
│                   coûts de changement                          │
├──────────────────────────────────────────────────────────────┤
│ 2. COQUE (UI)     onglets, sidebar, espaces, gaming (GX)…     │
├──────────────────────────────────────────────────────────────┤
│ 1. MOTEUR         Chromium/Blink (Chrome, Edge, Brave, Opera, │
│                   Comet, Atlas, Dia) · WebKit (Safari) · Gecko│
└──────────────────────────────────────────────────────────────┘
```

**Quatre faits structurants** :
1. **Le moteur est une commodité.** Presque tous les concurrents sont des **forks de Chromium**, c'est-à-dire du code que Google maintient et dont il fixe la feuille de route (ex. Manifest V3, qui limite les bloqueurs de pubs dans les extensions).
2. **L'argent vient du moteur de recherche par défaut, pas du navigateur.** Le procès antitrust américain a révélé que Google paie des dizaines de milliards par an pour être par défaut (environ 20 Md$ versés à Apple en 2022). La plupart des navigateurs alternatifs vivent d'accords de recherche.
3. **Les parts de marché sont figées.** En septembre 2026 (StatCounter, toutes plateformes) : **Chrome 66,4 %**, Safari 18,3 %, Edge 6,0 %, Firefox 2,8 %, Samsung Internet 2,3 %, Opera 1,8 %. Brave est à 1,1 % sur ordinateur. Les navigateurs IA **n'ont pas entamé Chrome**.
4. **L'IA casse la boucle économique du web.** La boucle était : recherche → clic → site → pub. Le trafic Google vers les éditeurs a **chuté d'environ un tiers** dans le monde (−38 % aux US) sur l'année 2025, et jusqu'à **−60 % pour les petits éditeurs sur 2 ans**. Les réponses IA renvoient **moins de 1 %** du trafic (Reuters Institute / Chartbeat).

---

## 2. Fiches de reverse engineering

### 2.1 Google : Chrome + Search + AI Mode + Gemini — *l'empire qui se cannibalise*

| Couche | Ce qu'on observe |
|---|---|
| Moteur | Blink/Chromium : Google **contrôle le standard de fait** du web. |
| Recherche | Index n°1 mondial. **AI Overviews** et **AI Mode** répondent directement, au risque de ne plus générer de clic. |
| IA | **Gemini dans Chrome** (gratuit depuis septembre 2025 aux US). Fonctions agentiques, avec **confirmation obligatoire** avant les actions sensibles (achat, envoi d'e-mail). |
| Compte | Compte Google : synchronisation, mots de passe, Gmail, Android. Coûts de changement maximaux. |
| Modèle éco | Pubs Search (+12 % de croissance annoncée alors même que les AI Overviews s'étendent ⚠️), données, Cloud. |
| Justice | Jugement Mehta (septembre 2025) : **Google garde Chrome**, mais les contrats d'exclusivité sont interdits et Google doit partager certaines données et résultats avec des concurrents qualifiés. Appel en cours ; des ONG demandent une cession de Chrome. |

- **Powers** : *ressource exclusive* (index, données, Android), *économies d'échelle*, *coûts de changement*.
- **Talon d'Achille** : le **dilemme de l'innovateur**. Chaque réponse IA parfaite supprime un clic publicitaire et appauvrit les éditeurs qui produisent le contenu dont l'IA se nourrit. Autre front : le **risque antitrust** sur la distribution par défaut, désormais étendu à l'IA.

### 2.2 Brave — *la confidentialité rentabilisée par un index propre*

| Couche | Ce qu'on observe |
|---|---|
| Moteur | Fork de Chromium, avec un **bloqueur natif en Rust** (« Shields ») qui ne dépend pas des extensions, donc échappe aux limites de Manifest V3. |
| Recherche | **Brave Search, avec un index indépendant** (rare : avec Google et Bing, c'est un des seuls index occidentaux à grande échelle). **2,51 Md de requêtes en août 2026**, dont environ 8 % depuis d'autres navigateurs. **API de recherche** vendue à des tiers, notamment des acteurs de l'IA. |
| IA | **Leo** (assistant multi-modèles, mode privé), et réponses IA dans Search. |
| Audience | **126 M d'utilisateurs mensuels en août 2026** (record) ; ~51 M d'utilisateurs quotidiens. |
| Modèle éco | Pubs Search, **API Search**, pubs navigateur opt-in rémunérées en BAT (crypto), abonnements (VPN, Leo Premium). |

- **Powers** : *counter-positioning* (il ne peut pas exister de « Google sans surveillance » chez Google) et ***ressource exclusive* qui monte en valeur : l'index**. À l'ère des LLM, un index web indépendant devient une **infrastructure** que les acteurs de l'IA achètent.
- **Talon d'Achille** : dépend de Chromium, donc de Google ; l'image crypto rebute une partie du public ; plafond de part de marché d'environ 1-2 %.
- **Leçon** : Brave a **déplacé sa valeur du navigateur vers l'index**. Le navigateur est un canal d'acquisition pour Search, et Search devient un fournisseur pour l'IA.

### 2.3 Opera — *le navigateur multi-niches et le pari agentique*

| Couche | Ce qu'on observe |
|---|---|
| Moteur | Chromium. |
| Coque | **Gammes par segment** : Opera One (grand public), **Opera GX** (gamers : limites de CPU et de RAM, intégrations Twitch et Discord), Opera Mini (données mobiles économisées, historiquement fort en Afrique), **Opera Neon** (agentique, payant). |
| IA | **Aria**, assistant gratuit construit sur les modèles d'OpenAI et de Google. **Neon** (lancé en octobre 2025, payant) : des agents qui naviguent, remplissent des formulaires et mènent plusieurs « Tasks » en parallèle, en **hybride local + VM sur serveurs européens**. |
| Modèle éco | Accords de recherche, pubs, et désormais abonnement Neon ; société cotée (Nasdaq), qui se dit rentable. |

- **Power** : faible. Plutôt du ***process power* de segmentation** (GX a créé une catégorie : le navigateur pour gamers).
- **Talon d'Achille** : pas de moteur propre, pas d'index, IA louée à des tiers. Neon arrive face à OpenAI, Perplexity et Google sur le même terrain. Part de marché de 1,8 %.
- **Leçon** : **GX prouve qu'un navigateur peut gagner par l'identité d'un segment** (la différenciation par la DA devient structurelle : règles produit propres aux gamers).

### 2.4 DuckDuckGo — *la confidentialité comme marque*

| Couche | Ce qu'on observe |
|---|---|
| Moteur | **Pas de fork de Chromium** : utilise le moteur de rendu du système (WebKit sur Apple, WebView2 sur Windows). Le navigateur est léger, avec moins de maintenance. |
| Recherche | Résultats principalement issus de **Bing** (loué) plus des sources propres ; **pas d'index complet maison**. |
| IA | **Duck.ai** : accès anonymisé à plusieurs modèles (l'adresse IP est retirée, et le fournisseur ne peut pas relier les requêtes à l'utilisateur). Les réponses IA dans la recherche sont **désactivables**. |
| Signal 2026 | **Hausse des téléchargements après Google I/O 2026**, de la part d'utilisateurs **qui veulent une recherche sans IA** ⚠️. |
| Modèle éco | Pubs **contextuelles par mot-clé** (non personnalisées, via Microsoft), affiliation, abonnement Privacy Pro (VPN, suppression de données personnelles) ; > 100 M$ de revenus par an ⚠️. |

- **Power** : *Branding* (« confidentialité » = DuckDuckGo) et *counter-positioning*.
- **Talon d'Achille** : **dépendance à Bing**, à la fois pour les résultats et pour la régie publicitaire. Part de marché plafonnée (de l'ordre de 0,6 à 1 %). La confidentialité est **une raison de partir, rarement une raison de payer**.
- **Leçon** : il existe une **demande réelle « sans IA »**, une niche qui grandit à chaque poussée IA de Google.

### 2.5 Navigateurs IA : Comet, Atlas, Dia, Edge Copilot, Neon, Gemini dans Chrome — *la course à l'agent*

| Produit | Éditeur | Ce qu'on observe |
|---|---|---|
| **Comet** | Perplexity | Gratuit depuis octobre 2025 ; recherche citée ; agent dans les pages ; **failles d'injection de prompt** documentées (Brave, LayerX, Zenity). |
| **ChatGPT Atlas** | OpenAI | Lancé en octobre 2025 ; mémoire de navigation, mode agent. ⚠️ Une rumeur d'arrêt en août 2026 n'est pas confirmée. |
| **Dia** | The Browser Company (racheté par Atlassian en 2025) | Navigateur « IA d'abord », orienté **travail** (logique Atlassian). |
| **Edge Copilot Mode** | Microsoft | Relancé 2 jours après Atlas ; Actions, raisonnement sur plusieurs onglets. Avantage : **par défaut sous Windows**. |
| **Opera Neon** | Opera | Payant, agents parallèles, VM européennes. |
| **Gemini dans Chrome** | Google | Le seul doté d'une **distribution massive**. |

**Ce que le reverse engineering montre** :
- **Architecture commune** : Chromium, plus un panneau latéral LLM, plus un **agent qui lit l'arbre DOM et l'accessibilité de la page** et agit (clics, saisie), plus une mémoire de navigation (souvent dans le cloud).
- **Le problème non résolu, c'est l'injection de prompt** : une page web peut contenir des instructions cachées que l'agent prend pour des ordres de l'utilisateur. C'est un défaut **structurel** (le contenu et les instructions passent par le même canal). Selon une source de cabinet de conseil ⚠️, Gartner aurait même conseillé aux entreprises de **bloquer** ces navigateurs.
- **Résultat** : beaucoup de lancements, **aucune bascule de part de marché**. Chrome reste à 66 %, car Google copie chaque fonctionnalité en quelques mois, avec la distribution en plus.

---

## 3. Synthèse comparative

| Acteur | Avantage logé dans… | Power | Talon d'Achille | Part (sept. 2026) |
|---|---|---|---|---|
| Google | Moteur + index + compte + défauts | Ressource exclusive, échelle | Cannibalisation pub par l'IA ; antitrust | Chrome 66,4 % |
| Brave | **Index indépendant** + bloqueur natif | Counter-positioning, index | Dépend de Chromium ; image crypto | ~1,1 % (ordinateur) |
| Opera | Segmentation (GX, Mini, Neon) | Faible | Ni index ni modèle propre | 1,8 % |
| DuckDuckGo | Marque confidentialité | Branding | Dépend de Bing | < 1 % |
| Navigateurs IA | Agent + mémoire | Aucun durable (copiable) | **Injection de prompt** ; pas de distribution | Négligeable |

**Les 5 lois** :
1. **Faire un navigateur, c'est facile** (un fork de Chromium). **Le faire adopter est quasi impossible** : la part de marché se gagne par défaut, pas par mérite. Plafond observé pour les alternatives : 1 à 2 %.
2. **La vraie valeur migre vers l'index** (Brave Search, son API) et vers **les données de navigation** qui alimentent l'IA.
3. **L'IA détruit le trafic des éditeurs** (−33 %), ce qui menace à terme **la matière première** dont l'IA se nourrit : le web est en train de se fermer (paywalls, blocage des robots d'IA).
4. **L'agent de navigation est la nouvelle frontière, mais il n'est pas sûr.** Un agent qui agit partout est vulnérable partout.
5. **Une demande « sans IA » et « sans surveillance » existe** (DuckDuckGo, Brave), mais elle se monétise mal en grand public.

---

## 4. Frustrations → opportunités

| # | Frustration | Qui la subit | Pourquoi les leaders ne la régleront pas | Opportunité |
|---|---|---|---|---|
| 1 | **Agents de navigation dangereux** (injection, actions non voulues) | Entreprises, DSI | Ils vendent l'agent universel, et brider l'agent ralentit leur course | **Pare-feu d'agent** : domaines autorisés, permissions par action, journal d'audit, validation humaine. Attention : les navigateurs d'entreprise (Island, Talon…) occupent déjà une partie du terrain |
| 2 | **Formulaires administratifs** sans API (impots.gouv, CAF, ANTS, Ameli) | Particuliers, aidants, TPE | Trop local et trop risqué juridiquement pour eux | **Copilote de formulaires** en extension (voir section 5) |
| 3 | **Historique inutilisable** : « j'ai vu ce truc il y a 3 semaines » | Tous | Atlas et Dia le font, mais **dans le cloud** (problème de confidentialité) | Mémoire de navigation **locale**, avec recherche sémantique sur l'appareil |
| 4 | **Trop d'IA** imposée dans la recherche | Une minorité croissante | Google ne peut pas reculer | Niche déjà occupée par DuckDuckGo et Brave, **à éviter** |
| 5 | **Éditeurs privés de trafic** | Médias, blogs, petits sites | Google y gagne | Couche d'**attribution et de licence** du contenu pour l'IA. Marché B2B réel, mais politique et lent |
| 6 | **Connexion lente ou chère** (DOM, zones rurales, Afrique) | Utilisateurs mobiles | Marché peu rentable pour eux | Navigation compressée pilotée par l'IA (résumé côté serveur). Opera Mini l'a fait, et c'est un **marché qui décline** |

---

## 5. La meilleure opportunité : **ne pas construire un navigateur, construire une extension**

**Le « dernier kilomètre » manquant de tous nos projets précédents** (*Dossier Vivant*, *Fisc Clair*, *Passe-Droit*) : les sites publics **n'ont pas d'API pour les particuliers**. Stocker les identifiants FranceConnect des utilisateurs serait inacceptable. **La solution : l'agent travaille *dans le navigateur de l'utilisateur*, là où il est déjà connecté.**

### **Copilote Démarches** *(nom provisoire)*, extension Chromium + Firefox

- **JTBD** : *Quand je dois remplir un formulaire administratif en ligne, je veux qu'un assistant remplisse ce qu'il sait déjà et m'explique le reste, pour pouvoir finir sans erreur et sans abandonner.*
- **Mécanisme** :
  1. L'extension reconnaît la page (impots.gouv, CAF, ANTS, Ameli, URSSAF…).
  2. Elle **lit la page en local** et propose de remplir les champs avec le **coffre de l'utilisateur** (situation, pièces), en **surlignant** chaque champ prérempli.
  3. Elle explique chaque case en français clair (« case 7DB = emploi d'un salarié à domicile »).
  4. **L'utilisateur clique lui-même** sur « Valider » et « Envoyer ». L'agent ne soumet jamais seul.
- **Sécurité par conception** : l'agent ne fonctionne **que sur une liste blanche de domaines officiels** (`*.gouv.fr`, `ameli.fr`, `caf.fr`…). La surface d'injection de prompt devient minime, car ce sont des sites de confiance. C'est la différence fondamentale avec un agent universel comme Comet ou Atlas.
- **Pourquoi une extension plutôt qu'un navigateur** : elle marche dans Chrome, Brave, Edge et Opera (tous Chromium) **et** Firefox. **On utilise la distribution des autres** au lieu de se battre contre le plafond de 1-2 %.
- **Power** :
  - *process power* : la cartographie maintenue des formulaires publics français, qui changent souvent ;
  - *coûts de changement* : le coffre ;
  - *counter-positioning* : un agent volontairement **limité et sûr**, que les généralistes ne peuvent pas proposer sans renoncer à leur promesse « l'agent fait tout ».
- **Sizing** :
  - **TAM** : 61 % des Français ont des difficultés dans leurs démarches (≈ 30 M d'adultes).
  - **SAM** : ceux qui utilisent un ordinateur ou un aidant (≈ 10-15 M).
  - **SOM** : 50-150 k installations actives à 24 mois.
- **Modèle** : gratuit pour les particuliers ; **licence pour les aidants professionnels** (France Services, CCAS, associations, travailleurs sociaux, secrétaires indépendantes) ; intégration au *Pack recours* de Dossier Vivant et au rattrapage de Fisc Clair.

**Risques et angles morts** :
1. **Google peut faire pareil** avec Gemini dans Chrome. Mais il ne maintiendra pas la cartographie fine des formulaires français, et sa promesse universelle l'expose à l'injection.
2. **Fragilité technique** : chaque refonte d'un site public casse les sélecteurs, d'où des coûts de maintenance continus. Il faut des tests automatisés quotidiens sur chaque formulaire.
3. **Politiques des stores d'extensions** (Manifest V3, revue Chrome Web Store) : les extensions qui lisent toutes les pages sont scrutées. La liste blanche de domaines est **aussi** un atout pour la validation.
4. **Responsabilité** : une case mal préremplie peut avoir des conséquences. D'où l'humain qui valide tout, le surlignage, et un journal local de ce qui a été rempli.
5. **Le mobile** (où se font beaucoup de démarches) supporte mal les extensions. La version mobile passe par un navigateur intégré à l'app (WebView), ce qui est plus complexe.

**Validation (2 semaines)** :
1. Prototype de l'extension sur **un seul formulaire** (par exemple la déclaration de revenus, ou une demande CAF), avec explication des cases seulement, sans remplissage.
2. Test avec **5 conseillers France Services ou travailleurs sociaux** : *combien de minutes économisées par usager ?*
3. **Critère de go** : au moins 30 % de temps gagné, et des conseillers qui demandent à le garder.

---

## 6. Ce que ça change dans la stratégie globale

```
             ┌──────────────────────────────────┐
             │  MOTEUR COMMUN                   │
             │  documents → règles → horloge →  │
             │  rédaction → escalade            │
             │  (LLM open-weight + OpenFisca…)  │
             └──────────────┬───────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      ▼                     ▼                     ▼
 Dossier Vivant        Fisc Clair         Admin TPE / factures
      │                     │                     │
      └──────────┬──────────┴──────────┬──────────┘
                 ▼                     ▼
       COPILOTE DÉMARCHES       COFFRE DE CONTEXTE
       (extension : exécuter    (mémoire possédée
        sur les vrais sites)     par l'utilisateur)
```

L'extension est **la couche d'exécution** qui manquait. Le moteur **décide** ; l'extension **agit** sur les sites, là où l'utilisateur est déjà connecté, sans jamais détenir ses identifiants.

---

## Sources

- [StatCounter : parts de marché des navigateurs](https://gs.statcounter.com/browser-market-share/monthly/worldwide) · [StatCounter : ordinateur et tablette](https://gs.statcounter.com/browser-market-share/desktop-tabletconsole/worldwide)
- [Gemini intégré à Chrome après le répit antitrust (Exchange4media)](https://www.exchange4media.com/digital-news/google-integrates-gemini-ai-into-chrome-after-antitrust-reprieve-147625.html) · [The Current : jugement sur les remèdes](https://www.thecurrent.com/data-privacy-google-gemini-chrome-search-remedies-ruling) · [Economic Liberties : renforcer les remèdes](https://www.economicliberties.us/press-release/geminis-rapid-rise-proves-google-antitrust-remedies-must-be-strengthened-economic-liberties-tells-d-c-circuit/)
- [Brave : 126 M d'utilisateurs en août 2026 (PiunikaWeb)](https://piunikaweb.com/2026/09/03/brave-browser-126-million-users-august-2026/) · [Brave : 51 M d'utilisateurs quotidiens](https://piunikaweb.com/2026/08/05/brave-51-million-daily-users-summer-slump/) · [Brave Search dans la liste des moteurs de Chrome (PPC Land)](https://ppc.land/brave-search-gains-a-spot-on-chromes-engine-list-at-2-46-billion-queries/) · [Brave (Sacra)](https://sacra.com/c/brave/)
- [Opera : outils IA natifs (communiqué)](https://press.opera.com/?p=3733) · [Opera Neon (Geekflare)](https://geekflare.com/news/meet-opera-neon-a-browser-that-thinks-with-you) · [Navigation agentique avec Neon (Shelly Palmer)](https://shellypalmer.com/?p=203183)
- [DuckDuckGo : hausse des téléchargements après la refonte IA de Google ⚠️](https://feedbagel.com/post/users-flock-to-duckduckgo-as-google-ai-search-faces-backlash) · [Statistiques DuckDuckGo 2026 ⚠️](https://www.loopexdigital.com/blog/duckduckgo-statistics)
- [Lancement de ChatGPT Atlas (ClickUp)](https://clickup.com/blog/openai-launches-chatgpt-atlas-browser/) · [Meilleurs navigateurs IA 2026 (Composite)](https://composite.com/blog/best-new-ai-browsers) · [Les navigateurs IA dangereux (Ara)](https://en.ara.cat/media/the-dangerous-ai-powered-browsers_1_5549666.html) · [Pourquoi Atlas et Comet ne gagneront pas ⚠️](https://blog.mean.ceo/?p=2918) · [Perplexity Comet (AI Wiki)](https://aiwiki.ai/wiki/perplexity_comet)
- [Trafic Google des éditeurs (Reuters Institute / Chartbeat, via TechCentral)](https://www.techcentral.ie/ai-search-results-have-publishers-on-the-back-foot-to-maintain-audiences/) · [Baisse du trafic des éditeurs britanniques (MediaCopilot)](https://mediacopilot.ai/google-search-traffic-uk-publishers-decline/) · [Search Engine Journal : AI Overviews et éditeurs](https://www.searchenginejournal.com/google-ai-overviews-impact-on-publishers-how-to-adapt-into-2026/556843/)
