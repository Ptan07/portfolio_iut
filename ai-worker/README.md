# Agent IA du terminal — mise en ligne

Le portfolio est un site statique (GitHub Pages) : il ne peut pas contenir de clé API, sinon n'importe qui pourrait la voler.
Ce petit serveur (un **Cloudflare Worker**, gratuit) garde la clé secrète et fait le lien entre le terminal et l'API Claude.

```
Navigateur (terminal)  ──►  Cloudflare Worker (clé secrète)  ──►  API Claude
```

Tant que le Worker n'est pas branché, le terminal fonctionne quand même en **mode hors ligne** : il répond à partir des infos du portfolio, sans IA.

---

## 1. Obtenir une clé API Claude

1. Crée un compte sur https://console.anthropic.com et ajoute un peu de crédit (l'API est payante à l'usage).
2. **Fixe une limite de dépense mensuelle** dans les paramètres de la console : c'est ta protection si quelqu'un abuse du terminal.
3. Crée une clé API et garde-la de côté. Ne la mets jamais dans le dépôt GitHub.

## 2. Déployer le Worker

### Option A — avec la ligne de commande (recommandé, active aussi la limite de 10 questions/minute)

```bash
cd ai-worker
npx wrangler login                          # ouvre le navigateur pour te connecter à Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY   # colle ta clé quand on te la demande
npx wrangler deploy
```

À la fin, Wrangler affiche l'adresse du Worker, du type `https://portfolio-ia.<ton-compte>.workers.dev`.

### Option B — depuis le site de Cloudflare (sans rien installer)

1. Crée un compte gratuit sur https://dash.cloudflare.com.
2. **Workers & Pages → Create → Worker**, nomme-le `portfolio-ia`, puis **Deploy**.
3. **Edit code** : remplace tout le code par le contenu de `worker.js`, puis **Deploy**.
4. Dans les paramètres du Worker (**Settings → Variables and Secrets**) :
   - ajoute un **secret** `ANTHROPIC_API_KEY` avec ta clé ;
   - ajoute une **variable** `ALLOWED_ORIGINS` = `https://ptan07.github.io`.

Avec cette option, la limite par IP n'est pas active : la limite de dépense de l'étape 1 est donc indispensable.

## 3. Brancher le site

Dans `assets/config.js`, mets l'adresse du Worker :

```js
window.PORTFOLIO_AI_ENDPOINT = "https://portfolio-ia.<ton-compte>.workers.dev";
```

Publie sur GitHub : le terminal affiche alors « Agent IA : en ligne » dans `neofetch`.

## Réglages utiles

| Variable | Rôle | Valeur par défaut |
|---|---|---|
| `ANTHROPIC_API_KEY` (secret) | clé de l'API Claude | — |
| `ALLOWED_ORIGINS` | sites autorisés à appeler l'agent | `https://ptan07.github.io` |
| `MODEL` | modèle Claude utilisé | `claude-haiku-5-5` (rapide et économique) |

Le profil que connaît l'agent est dans la constante `PROFILE` de `worker.js`. **Quand tu ajoutes une certification ou une expérience au site, mets-la aussi à jour ici**, puis redéploie.

## Protections déjà en place

- La clé n'est jamais envoyée au navigateur.
- Seul ton site peut appeler le Worker (vérification de l'origine).
- Questions limitées à 500 caractères, 10 derniers messages gardés, réponses limitées à 400 tokens.
- L'agent ne répond qu'à partir de ton profil et refuse le hors-sujet.
