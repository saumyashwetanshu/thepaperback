# The Paperback

India multi-desk news intelligence — extract honest coverage excerpts, cluster related stories with local MiniLM embeddings + NER, and explore framing with **Google Gemini** on **Cloud Run**.

> **Live app:** https://thepaperback-j564xim25a-el.a.run.app
> **Cloud Run label (exact):** `dev-tutorial=cloud-run-ai-challenge`
> **Track:** Google Cloud | Hack2skill Gen AI Academy — APAC Edition

## What it is (honest product)

**The Paperback** is **not** a Ground News clone and does **not** claim "corroborated facts" as verified truth.

It helps readers compare how Indian outlets cover the same events by:

1. **Ingesting** multi-desk RSS / HTML sources
2. **Extracting** article text with an honest status ladder: `EXTRACTED` / `PARTIAL` / `PAYWALLED`
3. **Clustering** related coverage with **Xenova MiniLM** embeddings
4. **Tagging** people/orgs/places with token-classification **NER**
5. **Surfacing** framing differences and multi-turn dossier chat via **Gemini**, grounded on **EXTRACTED** excerpts only (with a documented model fallback ladder)

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React, TypeScript, Vite, Tailwind |
| Backend | Node.js / Express (`server.ts` + `src/server/`) |
| Auth & data | **Firebase Auth** (Google Sign-In) + **Cloud Firestore** (`firestore.rules`) |
| AI | Google Gemini (`@google/genai`); production keys via **Secret Manager** |
| NLP (local) | Xenova MiniLM embeddings + transformers NER |
| Deploy | **Google Cloud Run** (Docker) |

## Firebase Auth & Firestore

- Client config: `VITE_FIREBASE_*` (see `.env.example`)
- Primary auth: **Google Sign-In** via Firebase Auth
- Rules in repo root `firestore.rules`:
  - User profiles / bookmarks / history / `dossier_chats`: authenticated, **uid-scoped** writes
  - Stories / dossiers: **public read**; client writes denied (server / Cloud Run only)

```bash
firebase deploy --only firestore:rules
```

## Gemini + Secret Manager

Do **not** commit API keys. Locally, copy `.env.example` → `.env` and set `GEMINI_API_KEY`.

On Cloud Run, store the key in Secret Manager and mount it:

```bash
echo -n "YOUR_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
# Grant Cloud Run runtime SA: roles/secretmanager.secretAccessor
```

Deploy with `--set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest`.

## Cloud Run deploy

**Required label (exact key=value):** `dev-tutorial=cloud-run-ai-challenge`

Use **asia-south1**, allow unauthenticated, mount the Gemini secret, and **enable** live RSS background ingestion in production.

Example (single line):

```
gcloud run deploy thepaperback --source . --region asia-south1 --allow-unauthenticated --memory 2Gi --cpu 1 --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest --set-env-vars=NODE_ENV=production,ENABLE_BACKGROUND_INGESTION=true --update-labels=dev-tutorial=cloud-run-ai-challenge
```

> Set `ENABLE_BACKGROUND_INGESTION=true` so Home rails stay fresh. Do **not** set `DISABLE_BACKGROUND_INGESTION=true` for the challenge deploy.

**Live URL:** https://thepaperback-j564xim25a-el.a.run.app

## Local setup

1. Clone `https://github.com/saumyashwetanshu/thepaperback.git`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` plus `VITE_FIREBASE_*`
3. Run `npm ci` then `npm run dev`
4. Optional: `docker compose up --build`

## Repo hygiene
- Never commit env secrets data node_modules or huge dist
- See firestore.rules for Auth and Firestore policy
- SUBMISSION_BRIEF.txt is the short challenge blurb
- Challenge form needs both GitHub URL and Cloud Run URL

## License
MIT - see LICENSE
