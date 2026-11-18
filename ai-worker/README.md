# Agent IA du terminal — mise en ligne (gratuite)

Le portfolio est un site statique (GitHub Pages) : il ne peut pas faire tourner d'IA tout seul.
Ce petit serveur (un **Cloudflare Worker**) fait le lien entre le terminal et un modèle d'IA.

```
Navigateur (terminal)  ──►  Cloudflare Worker  ──►  Workers AI (gratuit)   ou   Claude (payant, optionnel)
```

Par défaut, il utilise **Cloudflare Workers AI** : pas de clé API à créer, pas de carte bancaire, un quota gratuit chaque jour.
Le modèle choisi est **Mistral Small 3.1** (bon en français). S'il n'est pas disponible, le Worker bascule tout seul sur **Llama 3.1 8B**.

Tant que le Worker n'est pas branché, le terminal fonctionne quand même en **mode hors ligne** (réponses tirées du portfolio, sans IA).

---

## 1. Déployer le Worker (gratuit)

### Option A — depuis le site de Cloudflare (sans rien installer)

1. Crée un compte gratuit sur https://dash.cloudflare.com.
2. **Workers & Pages → Create → Worker**, nomme-le `portfolio-ia`, puis **Deploy**.
3. **Edit code** : remplace tout le code par le contenu de `worker.js`, puis **Deploy**.
4. Dans le Worker, onglet **Settings → Bindings → Add → Workers AI**, nom de la variable : `AI`.
5. Dans **Settings → Variables and Secrets**, ajoute une variable `ALLOWED_ORIGINS` = `https://ptan07.github.io`.

### Option B — avec la ligne de commande (active aussi la limite de 10 questions/minute par visiteur)

```bash
cd ai-worker
npx wrangler login     # ouvre le navigateur pour te connecter à Cloudflare
npx wrangler deploy
```

Dans les deux cas, tu obtiens une adresse du type `https://portfolio-ia.<ton-compte>.workers.dev`.

## 2. Brancher le site

Dans `assets/config.js`, mets l'adresse du Worker :

```js
window.PORTFOLIO_AI_ENDPOINT = "https://portfolio-ia.<ton-compte>.workers.dev";
```

Publie sur GitHub : `neofetch` affiche alors « Agent IA : en ligne ».

## Et si le quota gratuit est dépassé ?

Le quota se remet à zéro chaque jour. S'il est épuisé, le Worker renvoie une erreur et le terminal repasse automatiquement en mode hors ligne : le site ne casse pas.

## Option payante : passer sur Claude

Pour des réponses de meilleure qualité, ajoute simplement un secret `ANTHROPIC_API_KEY` (clé créée sur https://console.anthropic.com, pense à fixer une limite de dépense) :

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Dès que ce secret existe, le Worker utilise Claude (`claude-haiku-5-5`) au lieu de Workers AI. Supprime-le pour revenir au gratuit.

## Réglages

| Variable | Rôle | Valeur par défaut |
|---|---|---|
| liaison `AI` | accès gratuit à Workers AI | — |
| `ALLOWED_ORIGINS` | sites autorisés à appeler l'agent | `https://ptan07.github.io` |
| `CF_MODEL` | modèle Workers AI | `@cf/mistralai/mistral-small-3.1-24b-instruct` |
| `ANTHROPIC_API_KEY` (secret, optionnel) | active Claude | — |
| `MODEL` | modèle Claude | `claude-haiku-5-5` |

Le profil que connaît l'agent est dans la constante `PROFILE` de `worker.js`. **Quand tu ajoutes une certification ou une expérience au site, mets-la aussi à jour ici**, puis redéploie.

## Protections en place

- Seul ton site peut appeler le Worker (vérification de l'origine).
- Questions limitées à 500 caractères, 10 derniers messages gardés, réponses limitées à 400 tokens.
- L'agent ne répond qu'à partir de ton profil et refuse le hors-sujet.
