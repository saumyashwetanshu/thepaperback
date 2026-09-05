# The Paperback

AI-powered media intelligence for Indian news — multi-source clustering, consensus facts, and editorial framing analysis with **Google Gemini**.

> **Live app:** https://thepaperback-j564xim25a-el.a.run.app  
> **Cloud Run label (exact):** `dev-tutorial=cloud-run-ai-challenge`  
> **Track:** Google Cloud | Hack2skill Gen AI Academy — APAC Edition

## What it is

**The Paperback** helps readers see past single-outlet spin. It ingests coverage across diverse Indian news desks, groups related stories with local NLP embeddings, isolates corroborated consensus facts, and surfaces framing differences via Gemini — so you can compare how outlets tell the same story.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind
- **Backend:** Node.js / Express (`server.ts` + `src/server/`)
- **Auth & data:** Firebase Auth + Cloud Firestore (`firestore.rules` in repo root)
- **AI:** Google Gemini (`@google/genai`), production keys via **Secret Manager**
- **Deploy:** Google Cloud Run (Docker / `--source`)

## Firebase Auth & Firestore

Client Firebase config uses `VITE_FIREBASE_*` env vars (see `.env.example`).
Security rules live in **`firestore.rules`** at the repository root:

- User profiles / bookmarks / history: authenticated, uid-scoped writes
- Stories / dossiers: public read; client writes denied (server / Cloud Run only)

Deploy rules with your Firebase project when you change them (`firebase deploy --only firestore:rules`).

## Gemini + Secret Manager

Do **not** commit API keys. Locally, copy `.env.example` to `.env` and set `GEMINI_API_KEY`.

On Cloud Run, store the key in Secret Manager and mount it at deploy time with `--set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest`.

Grant the Cloud Run runtime service account `roles/secretmanager.secretAccessor` on the secret.

Example secret create:

    echo -n "YOUR_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-

## Cloud Run deploy

Service label must be exactly: `dev-tutorial=cloud-run-ai-challenge`

Use Cloud Run source deploy in asia-south1, unauthenticated, secret mount GEMINI_API_KEY=GEMINI_API_KEY:latest, env NODE_ENV=production,DISABLE_BACKGROUND_INGESTION=true, labels=dev-tutorial=cloud-run-ai-challenge, memory 2Gi, cpu 1.

**Live URL:** https://thepaperback-j564xim25a-el.a.run.app

## Local setup
Clone https://github.com/saumyashwetanshu/thepaperback.git then install dependencies.
Then install packages and start locally.

## Repo notes
- Ignore .env node_modules .data dist; do not commit secrets
- See firestore.rules for Auth and Firestore policy
- Form needs BOTH GitHub repo URL and Cloud Run live URL
