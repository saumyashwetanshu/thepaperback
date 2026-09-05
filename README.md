# The Paperback

India multi-desk news intelligence: ingest coverage from multiple Indian outlets, cluster related stories with local MiniLM embeddings and NER, and explore framing differences with Google Gemini on Cloud Run.

**Live app:** https://thepaperback-j564xim25a-el.a.run.app
**Cloud Run label:** `dev-tutorial=cloud-run-ai-challenge`
**Track:** Google Cloud | Hack2skill Gen AI Academy — APAC Edition

## Features

- Multi-desk RSS/HTML ingestion across Indian news sources
- Article extraction with status ladder: `EXTRACTED` / `PARTIAL` / `PAYWALLED`
- Story clustering via Xenova MiniLM embeddings
- People, organizations, and places tagged with token-classification NER
- Framing comparison and multi-turn dossier chat powered by Gemini (grounded on extracted excerpts)
- Firebase Auth with Google Sign-In; per-user bookmarks, history, and dossier chats

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React, TypeScript, Vite, Tailwind |
| Backend | Node.js / Express (`server.ts` + `src/server/`) |
| Auth & data | Firebase Auth (Google Sign-In) + Cloud Firestore (`firestore.rules`) |
| AI | Google Gemini (`@google/genai`); production keys via Secret Manager |
| NLP (local) | Xenova MiniLM embeddings + transformers NER |
| Deploy | Google Cloud Run (Docker) |

## Firebase Auth & Firestore

- Client config: `VITE_FIREBASE_*` (see `.env.example`)
- Primary auth: Google Sign-In via Firebase Auth
- Rules live in `firestore.rules`:
  - User profiles, bookmarks, history, and `dossier_chats`: authenticated, uid-scoped writes
  - Stories and dossiers: public read; client writes denied (server / Cloud Run only)

```bash
firebase deploy --only firestore:rules
```

## Secrets / Gemini

Do not commit API keys. Locally, copy `.env.example` to `.env` and set `GEMINI_API_KEY`.

On Cloud Run, store the key in Secret Manager and mount it:

```bash
echo -n "YOUR_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
# Grant Cloud Run runtime SA: roles/secretmanager.secretAccessor
```

Deploy with `--set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest`.

## Deploy to Cloud Run

Required label (exact): `dev-tutorial=cloud-run-ai-challenge`

Use `asia-south1`, allow unauthenticated traffic, mount the Gemini secret, and enable live RSS background ingestion:

```bash
gcloud run deploy thepaperback \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars=NODE_ENV=production,ENABLE_BACKGROUND_INGESTION=true \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

Set `ENABLE_BACKGROUND_INGESTION=true` so Home rails stay fresh.

**Live URL:** https://thepaperback-j564xim25a-el.a.run.app

## Local setup

1. Clone https://github.com/saumyashwetanshu/thepaperback.git
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` plus `VITE_FIREBASE_*`
3. Run `npm ci` then `npm run dev`
4. Optional: `docker compose up --build`

## License

MIT — see [LICENSE](LICENSE)
