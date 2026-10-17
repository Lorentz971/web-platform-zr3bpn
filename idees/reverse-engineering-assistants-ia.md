# Reverse engineering des assistants IA

*ChatGPT · Claude · Gemini · Perplexity · Kimi · Manus · DeepSeek · Grok — octobre 2026*

> **Périmètre** : ce document décompose les produits à partir de ce qui est **public** (annonces, papiers techniques, blogs d'ingénierie, poids open-source, comportement observable, presse). Il n'utilise aucune extraction de prompts confidentiels ni de contournement. Les chiffres issus de sources secondaires sont signalés par ⚠️.

---

## 1. Anatomie commune : comment fonctionne un assistant IA en 2026

Tous ces produits sont construits sur le même empilement à 6 couches. La différence entre eux tient à **la couche où chacun a placé son avantage**.

```
┌──────────────────────────────────────────────────────────────┐
│ 6. DISTRIBUTION   OS, navigateur, réseau social, voiture,    │
│                   suite bureautique, moteur de recherche     │
├──────────────────────────────────────────────────────────────┤
│ 5. PRODUIT / UX   chat, voix, canvas/artifacts, projets,     │
│                   navigateur agentique, CLI, apps            │
├──────────────────────────────────────────────────────────────┤
│ 4. MÉMOIRE        souvenirs utilisateur, historique,         │
│                   fichiers de projet, connecteurs (Drive…)   │
├──────────────────────────────────────────────────────────────┤
│ 3. HARNAIS        prompt système, routeur de modèles,        │
│   (orchestration) outils : recherche, code, navigateur,      │
│                   VM ; boucle agent : planifier → agir →     │
│                   observer ; classifieurs de sécurité        │
├──────────────────────────────────────────────────────────────┤
│ 2. POST-TRAINING  instructions (SFT), préférences (RLHF/AI   │
│                   feedback), RL sur tâches vérifiables (maths,│
│                   code, outils) → « modèles qui réfléchissent »│
├──────────────────────────────────────────────────────────────┤
│ 1. MODÈLE DE BASE Transformer, souvent MoE (mélange          │
│   + COMPUTE       d'experts), pré-entraîné sur des milliers  │
│                   de milliards de tokens ; GPU/TPU, datacenters│
└──────────────────────────────────────────────────────────────┘
```

**Ce que l'observation montre** :
- **Couches 1-2** : le niveau des modèles se resserre. DeepSeek estime lui-même être à **3-6 mois** de la frontière, avec des poids ouverts.
- **Couche 3** : un « agent » n'est pas un modèle spécial. C'est une **boucle** (le modèle appelle un outil, lit le résultat, recommence) dans un bac à sable (VM, navigateur, terminal). Sa qualité dépend surtout de l'**ingénierie du contexte** : quoi garder, résumer ou relire à chaque tour.
- **Couches 4-6** : c'est là que se construisent les avantages durables (mémoire = coût de changement, distribution = acquisition gratuite).

---

## 2. Fiches de reverse engineering

### 2.1 ChatGPT (OpenAI) — *l'agrégateur grand public*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | Famille GPT-5.x. Depuis GPT-5, un **routeur** choisit automatiquement entre réponse rapide et mode « réflexion ». ⚠️ Nommage 2026 non confirmé. |
| Harnais | Recherche web, exécution de code, génération d'images, **mode Agent** (navigateur et ordinateur virtuels), apps tierces intégrées au chat, navigateur Atlas. |
| Mémoire | Souvenirs explicites et référence à l'historique : c'est le **principal coût de changement** côté grand public. |
| Distribution | La marque est devenue un verbe (« demande à ChatGPT »). ~800 M d'utilisateurs hebdomadaires annoncés fin 2025, ⚠️ ~900 M estimés en 2026. |
| Modèle éco | Gratuit **avec publicité** (US), Go à 8 $, Plus à 20 $, Pro à 100/200 $, Business, Enterprise ; API. |

- **Power visé** : *Branding* et *coûts de changement* (mémoire), avec un début d'*effet de réseau* via les apps intégrées.
- **Faiblesses observables** :
  1. **Conflit pub / confiance** : une réponse peut-elle être neutre si l'assistant vend de l'espace ?
  2. **Confusion des modèles** : le retrait de GPT-4o au lancement de GPT-5 a provoqué une fronde ; les utilisateurs veulent du contrôle.
  3. **Complaisance** : en 2025, une mise à jour trop flatteuse a dû être annulée.
- **Opportunité laissée ouverte** : la neutralité. Un assistant qui *ne peut pas* être financé par la pub.

### 2.2 Claude (Anthropic) — *l'outil de travail des développeurs et des entreprises*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | Gammes Opus, Sonnet et Haiku ; forte spécialisation dans le **code** et les tâches agentiques longues. |
| Harnais | **Claude Code** (agent en terminal, IDE, cloud), Artifacts, Skills, Projects. **MCP** (Model Context Protocol), protocole ouvert pour brancher des outils, adopté par toute l'industrie. |
| Mémoire | Projets, mémoire, connecteurs MCP. |
| Distribution | Développeurs, entreprises, cloud (AWS, Google Cloud). Moins présent sur le grand public que ChatGPT ou Gemini. |
| Modèle éco | Abonnements Pro/Max, Team/Enterprise ; une grande part du revenu vient de l'API et des entreprises. |

- **Power visé** : *Process power* (savoir-faire d'entraînement sur le code et l'agentique), *Branding* « fiable et sûr » pour les entreprises. L'*effet de réseau indirect* passe par MCP (protocole ouvert : il profite à l'écosystème entier, donc protège moins).
- **Faiblesses observables** :
  1. **Limites d'usage** : la plainte n°1 des communautés en 2026 (quotas Max épuisés en avance au printemps, bug de limite hebdomadaire en juin, corrigé).
  2. **Pas de génération d'images ou de vidéo native** dans l'app grand public.
  3. Notoriété grand public plus faible.
- **Opportunité laissée ouverte** : la **prévisibilité du coût** pour les longues tâches agentiques.

### 2.3 Gemini (Google) — *l'intégré partout*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | Gemini 3.x : multimodal natif (texte, image, audio, vidéo), contexte très long ; modèles image très populaires (*Nano Banana*). |
| Compute | **TPU maison** : Google ne paie pas la marge de Nvidia, d'où un avantage de coût structurel. |
| Harnais | Recherche Google, Workspace (Gmail, Docs), Android, Chrome ; Deep Research ; agents. |
| Distribution | **1 milliard d'utilisateurs mensuels** de l'app (annonce Google, août 2026), sans compter Gemini dans Search et Workspace. |
| Modèle éco | Google AI Pro/Ultra, souvent groupé avec du stockage ; Workspace ; API. |

- **Power visé** : *Économies d'échelle* (TPU, données) et *ressource exclusive* (Android, Search, YouTube, Gmail). C'est l'acteur au moat le plus systémique.
- **Faiblesses observables** :
  1. **Dilemme de l'innovateur** : une réponse IA parfaite cannibalise les clics publicitaires de Search.
  2. **Produit fragmenté** (Gemini dans 15 surfaces, noms qui changent souvent).
  3. **Vie privée** : l'utilisateur ne sait pas quelles données Google relie entre elles.
  4. Un « utilisateur mensuel » compté sur Android installé par défaut n'est pas forcément engagé.
- **Opportunité laissée ouverte** : être l'assistant qui **n'appartient pas** à un écosystème.

### 2.4 Perplexity — *le moteur de réponses*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | **Pas de modèle frontière maison**. Orchestration de modèles tiers (au choix de l'utilisateur), plus des modèles *Sonar* affinés à partir de poids ouverts. |
| Harnais | Le cœur du produit : **index web propre + crawling + reranking + citations systématiques**. Le navigateur **Comet** (gratuit depuis octobre 2025) fait agir l'IA dans les pages. |
| Distribution | Accords avec des fabricants et des opérateurs ; navigateur. |
| Modèle éco | Pro/Max ; Comet Plus (5 $, partage de revenus avec des éditeurs) ; ⚠️ ~450 M $ d'ARR revendiqués début 2026 (non vérifié). |

- **Power visé** : *Counter-positioning* face à Google (pas de liens sponsorisés à protéger). Fragile : aucun Power durable sur le modèle.
- **Faiblesses observables** :
  1. **Dépendance** aux fournisseurs de modèles, qui sont aussi ses concurrents.
  2. **Procès des éditeurs** (copyright).
  3. **Injection de prompt** dans Comet : une page web malveillante peut donner des ordres à l'agent (failles documentées par Brave, LayerX et Zenity).
  4. Confiance abîmée par des déclarations sur la publicité ciblée.
- **Opportunité laissée ouverte** : la vérification **affirmation par affirmation**, pas seulement par lien.

### 2.5 Kimi (Moonshot AI, Pékin) — *l'agentique en open-weight*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | **K2** (juillet 2025) : MoE de 1 000 milliards de paramètres, dont **32 milliards actifs** par token ; optimiseur *MuonClip* (publié) ; entraîné spécifiquement pour l'**usage d'outils**. K2.5 puis K2.6 (avril 2026). |
| Harnais | Mode agent, contexte long (l'identité d'origine de Kimi). Utilisable comme moteur dans Claude Code, Cline ou Cursor via API compatible. |
| Distribution | Fort en Chine ; à l'étranger, surtout via développeurs et API. |
| Modèle éco | Poids ouverts et API très bon marché. |

- **Power visé** : *Counter-positioning* (l'ouvert gratuit contre le fermé payant) et *process power* (recettes d'entraînement efficaces).
- **Faiblesses** :
  1. Marque grand public quasi inexistante hors de Chine.
  2. Questions de juridiction des données pour les entreprises occidentales (contournables en auto-hébergeant les poids).
  3. Guerre des prix interne en Chine.
- **Leçon** : un modèle **spécialisé outils/agents** peut rivaliser avec les généralistes sur une tâche précise.

### 2.6 Manus (racheté par Meta) — *l'agent généraliste « qui fait »*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | **Pas de modèle maison** : s'appuie sur des modèles tiers. |
| Harnais | **C'est le produit** : chaque tâche reçoit une **VM cloud** (navigateur, terminal, fichiers). L'équipe a publié ses principes d'*ingénierie du contexte* : maximiser le taux de cache KV, utiliser le système de fichiers comme mémoire externe, réécrire une liste `todo.md` pour garder l'objectif en tête, conserver les erreurs dans le contexte pour que le modèle apprenne. |
| Distribution | Viralité au lancement (mars 2025), sur invitation. Désormais chez Meta (rachat fin 2025, > 2 Md$ selon le WSJ), avec arrêt en Chine. |
| Modèle éco | Abonnement **à crédits**. |

- **Power visé** : *Process power* sur le harnais. Faible seul (copiable), d'où le rachat : Meta apporte distribution et compute.
- **Faiblesses** :
  1. **Crédits imprévisibles** : on ne sait pas d'avance combien coûte une tâche.
  2. Taux d'échec élevé sur les tâches longues.
  3. Futur incertain, dicté par les priorités de Meta.
- **Leçon clé** : **un harnais excellent sur un modèle tiers suffit** pour créer un produit viral. C'est la porte d'entrée la plus accessible pour un petit acteur.

### 2.7 DeepSeek (High-Flyer, Hangzhou) — *l'efficience comme arme*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | Innovations publiées : **MLA** (attention latente qui compresse le cache), MoE fin, **GRPO** (RL sans modèle critique), **sparse attention** (V3.2). **V4** (avril 2026) : V4-Pro avec 1 600 milliards de paramètres dont 49 milliards actifs, V4-Flash avec 284 milliards dont 13 milliards actifs, **1 M de tokens de contexte**, licence MIT. |
| Harnais | App minimaliste (chat, recherche, réflexion). Le produit, c'est le **modèle et l'API**. |
| Modèle éco | API parmi les moins chères du marché (V4-Flash à ~0,14 $ / 0,28 $ par million de tokens, ⚠️ tarifs à vérifier) ; financé par un fonds quantitatif, donc sans pression de rentabilité immédiate. |

- **Power visé** : *Counter-positioning* (open-source et prix plancher que les labos fermés ne peuvent pas suivre sans détruire leurs marges) et *process power* (efficience d'entraînement).
- **Faiblesses** :
  1. **Censure** sur les sujets sensibles pour Pékin.
  2. **Données stockées en Chine** : interdictions dans plusieurs administrations et pays (ex. blocage par la CNIL italienne en 2025).
  3. Produit grand public pauvre (peu d'outils, pas de mémoire riche).
  4. Saturation des serveurs aux pics.
- **Leçon** : DeepSeek **fait baisser le coût de la couche 1 pour tout le monde**. Un produit construit au-dessus devient finançable en freemium.

### 2.8 Grok (xAI) — *le temps réel et la provocation*

| Couche | Ce qu'on observe |
|---|---|
| Modèle | Grok 4.x ⚠️ (4.5 / 4.6 selon des sources secondaires) ; supercalculateur **Colossus** (Memphis), une stratégie de compute massif. |
| Harnais | **Flux temps réel de X** (ressource exclusive), recherche, voix, « Companions ». |
| Distribution | X (Premium), Tesla (embarqué), app autonome. ⚠️ Rachat par SpaceX rapporté en 2026, à confirmer. |
| Modèle éco | SuperGrok, X Premium, API. |

- **Power visé** : *Ressource exclusive* (données X en temps réel, Tesla) et *Branding* contre-culturel (« moins filtré »).
- **Faiblesses** :
  1. **Incidents de sécurité de marque** répétés (propos antisémites en juillet 2025, interdiction temporaire en Turquie) : un risque majeur pour les entreprises clientes.
  2. Le biais perçu du propriétaire mine la confiance dans la neutralité.
  3. Dépend de la santé de X.
- **Leçon** : un positionnement « sans filtre » attire vite mais **se paie cher en entreprise**.

---

## 3. Synthèse comparative

| Produit | Avantage logé dans la couche… | Power principal | Talon d'Achille | Copiable par un petit acteur ? |
|---|---|---|---|---|
| ChatGPT | 6 (distribution/marque) + 4 (mémoire) | Branding, coûts de changement | Pub et neutralité | Non |
| Claude | 2-3 (code, agents, MCP) | Process power | Limites d'usage, coûts | Le harnais en partie, oui |
| Gemini | 1 (TPU) + 6 (Android, Search) | Échelle, ressource exclusive | Cannibalisation de Search | Non |
| Perplexity | 3 (recherche + citations) | Counter-positioning (fragile) | Dépendance aux modèles, procès | **Oui** (sur une niche) |
| Kimi | 1-2 (open, agentique) | Counter-positioning | Marque hors Chine | Utilisable comme brique |
| Manus | 3 (harnais agent + VM) | Process power (faible) | Coût imprévisible | **Oui** |
| DeepSeek | 1 (efficience) | Counter-positioning, process | Confiance, données | Utilisable comme brique |
| Grok | 6 (X, Tesla) + données temps réel | Ressource exclusive | Sécurité de marque | Non |

**Les 3 lois qui se dégagent** :
1. **Le modèle devient une commodité** (DeepSeek et Kimi en open-weight à quelques mois de la frontière). Il ne faut pas chercher à se battre sur la couche 1.
2. **Les gagnants durables possèdent la distribution** (Google, OpenAI, Meta via Manus, X via Grok).
3. **L'espace pour un nouvel entrant est dans les couches 3-4, sur un problème vertical** : là où Perplexity et Manus ont percé, avec un harnais spécialisé sur des modèles tiers.

---

## 4. Frustrations transversales → opportunités

| # | Frustration observée | Chez qui | Ce qu'aucun leader ne fera (et pourquoi) | Idée |
|---|---|---|---|---|
| 1 | **Mémoire prisonnière** : mon contexte est enfermé chez un fournisseur | Tous | Rendre la mémoire portable détruit leur coût de changement | **Coffre de contexte personnel** : profil, projets et préférences possédés par l'utilisateur, servis via MCP à n'importe quel assistant |
| 2 | **Coût et quotas imprévisibles** pour les agents | Manus, Claude Code, Perplexity | La facturation opaque protège leurs marges | **« Devis avant exécution »** : estimer le coût et la durée d'une tâche agentique, fixer un budget plafond, arrêt propre |
| 3 | **Réponses invérifiables**, des citations qui ne disent pas ce qu'on leur fait dire | Tous, même Perplexity | Exposer le taux d'erreur nuit à la marque | **Couche de vérification par affirmation** : chaque phrase est liée à l'extrait exact de la source, avec un score de soutien |
| 4 | **Empilement d'abonnements** (20 $ × 3-4 assistants) | Utilisateurs avancés | Chacun veut l'exclusivité | Routeur multi-modèles : ⚠️ **marché déjà occupé** (Poe, OpenRouter…), à éviter sauf angle nouveau |
| 5 | **Agents vulnérables** aux injections de prompt | Comet, Atlas, agents navigateur | La sécurité ralentit le lancement des fonctionnalités | Pare-feu d'agent : permissions, journal d'audit, validation humaine des actions sensibles |
| 6 | **Assistants génériques** face aux procédures **locales** (administration française, droit des DOM, créole) | Tous | Marchés trop petits pour eux | **Agents verticaux** sur modèles open-weight bon marché, par exemple le moteur *Dossier Vivant* (voir `frustration-vers-fonctionnalite.md`) |

### Zoom sur l'opportunité la plus forte : le **Coffre de contexte**

- **JTBD** : *Quand je change d'assistant ou que j'en utilise plusieurs, je veux qu'ils me connaissent déjà, pour pouvoir ne pas tout réexpliquer ni rester prisonnier d'un fournisseur.*
- **Mécanisme** : un coffre chiffré, possédé par l'utilisateur (profil, projets, documents, préférences de style), exposé en **serveur MCP**. L'utilisateur contrôle ce que chaque assistant peut lire et écrire. Un journal montre « qui a lu quoi ».
- **Profondeur** : structurelle (architecture où l'utilisateur détient ses données), avec un potentiel systémique (standard de format).
- **Power** : *counter-positioning* pur. OpenAI ou Google ne peuvent pas le proposer sans saborder leur propre lock-in.
- **Faiblesses honnêtes** :
  1. Les fournisseurs peuvent **restreindre l'accès** (MCP côté grand public n'est pas garanti partout).
  2. La valeur perçue est abstraite tant que l'utilisateur n'a pas vécu un changement d'assistant douloureux.
  3. Un fournisseur pourrait lancer un « export mémoire » officiel et neutraliser la promesse.
  4. Données très sensibles : la sécurité est critique.
- **Validation rapide** : un serveur MCP open-source minimal, avec un profil en Markdown chiffré, publié sur GitHub et Reddit (r/LocalLLaMA, r/ClaudeAI, r/ChatGPT). Mesures : étoiles, installations, issues demandant la synchronisation.

---

## 5. Recommandation

1. **Ne pas construire un « nouveau ChatGPT »** : les couches 1 et 6 sont verrouillées par des acteurs à plusieurs milliards.
2. **Construire un harnais vertical** (couches 3-4) sur des modèles bon marché ou open-weight (DeepSeek, Kimi), en s'inspirant des principes d'ingénierie du contexte publiés par Manus.
3. **Combiner** avec les idées précédentes : *Dossier Vivant* et *Passe-Droit* sont exactement ce type d'agent vertical. Le coût d'inférence en forte baisse rend leur freemium viable.
4. **Prochaine étape concrète** : prototyper le *Coffre de contexte* (serveur MCP minimal) **ou** l'agent *Dossier Vivant* sur un modèle open-weight, et mesurer le coût réel par dossier.

---

## Sources

- [Statistiques utilisateurs ChatGPT (WiserNotify)](https://wisernotify.com/blog/chatgpt-users/) · [Searchlab : statistiques ChatGPT 2026](https://searchlab.nl/en/statistics/chatgpt-statistics-2026) · [OpenAI : ChatGPT Go](https://www.openai.com/blog/introducing-chatgpt-go) · [Tarifs ChatGPT 2026 (PricePerToken)](https://pricepertoken.com/subscriptions/chatgpt)
- [Gemini dépasse 1 Md d'utilisateurs mensuels (iPhone in Canada)](https://www.iphoneincanada.ca/2026/08/12/google-gemini-app-surpasses-1-billion-monthly-active-users/) · [Implicator : 1 Md sans chiffre d'abonnés payants](https://www.implicator.ai/google-puts-gemini-at-1-billion-monthly-users-without-naming-paying-subscribers/)
- [Comet devient gratuit (Yahoo Tech)](https://tech.yahoo.com/ai/perplexity-ai/articles/perplexity-makes-ai-browser-free-172945066.html) · [Perplexity Comet (AI Wiki)](https://aiwiki.ai/wiki/perplexity_comet) · [Statistiques Comet ⚠️](https://presenc.ai/research/comet-usage-statistics-2026)
- [Meta rachète Manus (TechRadar)](https://www.techradar.com/pro/meta-buys-manus-for-usd2-billion-to-power-high-stakes-ai-agent-race?rand=141) · [eWeek](https://www.eweek.com/fr/news/meta-acquires-manus-2b/)
- [DeepSeek V4 en profondeur (The Neuron)](https://www.theneuron.ai/explainer-articles/deepseek-v4-admits-its-3-6-months-behind-the-architecture-says-otherwise/) · [DeepSeek V4 et l'effondrement des prix API](https://pasqualepillitteri.it/en/news/3834/deepseek-v4-llm-api-price-collapse) · [Trending Topics](https://www.trendingtopics.eu/deepseek-v4-returns-to-challenge-us-ai-giants-with-aggressive-pricing/)
- [Kimi (Wikipedia)](https://en.wikipedia.org/wiki/Kimi_(chatbot)) · [Kimi K2 (DeepLearning.AI)](https://charonhub.deeplearning.ai/moonshot-releases-kimi-k2-a-trillion-parameter-model-fine-tuned-for-agentic-tool-use/)
- [Grok en août 2026 ⚠️ (Basenor)](https://www.basenor.com/blogs/news/grok-in-august-2026-5-details-that-actually-matter) · [Grok 4 et la controverse (TipRanks)](https://www.tipranks.com/news/private-companies/xai-unveils-grok-4-and-premium-subscription-amid-controversy) · [Grok (Suprmind) ⚠️](https://suprmind.ai/hub/grok/)
- [Limites d'usage Claude (The Register)](https://www.theregister.com/2026/01/05/claude_devs_usage_limits/) · [Problèmes de quota Claude Code (DevOps.com)](https://devops.com/claude-code-quota-limits-usage-problems/) · [Bug de limite hebdomadaire](https://pasqualepillitteri.it/de/news/5431/claude-code-fehler-wochenlimit-3-prozent) · [Claude Code en 2026 (CodeMySpec)](https://codemyspec.com/blog/claude-code-review-2026)
- [Gartner 2026 : accès à un humain](https://www.gartner.com/en/newsroom/press-releases/2026-08-04-gartner-survey-finds-87-percent-of-customers-say-companies-using-genai-for-customer-service-must-provide-access-to-a-human-agent0) · [Inflection : « the frustration is real »](https://inflection.ai/blog/taking-no-seriously-the-frustration-is-real)
