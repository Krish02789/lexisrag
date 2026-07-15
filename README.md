# LexisRAG — US Tax & Legal Research Assistant

A full-stack RAG (Retrieval-Augmented Generation) system for the US Tax & Legal domain. Ask complex legal questions and receive precise, citation-backed answers from 100 authoritative source documents.

**Live demo:** *(add your deployed URL here)*

---

## Features

- **Hybrid Search** — BM25 + TF-IDF Cosine Similarity fused via Reciprocal Rank Fusion (RRF). Pure TypeScript, zero infrastructure dependencies.
- **LLM Synthesis** — Google Gemini 2.5 Flash generates grounded answers. Fully functional extractive QA fallback when no key is set.
- **100-document corpus** — IRC statute sections, Supreme Court judgments, IRS rulings, and practitioner commentary. Auto-seeded at startup.
- **Evaluation dashboard** — 50 golden set entries, Retrieval Accuracy (100%) and Faithfulness (89.4%) metrics.
- **Single-service deployment** — Express serves both the API and React frontend. One PORT, one process, deploys anywhere.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 + TypeScript + Tailwind CSS v4 |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Search | BM25 + TF-IDF Cosine + RRF (pure TypeScript) |
| LLM | Google Gemini 2.5 Flash (optional) |
| Package manager | pnpm 9 workspaces |

---

## Project Structure

```
lexisrag/
├── artifacts/
│   ├── api-server/          # Express 5 API + static file serving
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── searchEngine.ts   # BM25 + TF-IDF + RRF
│   │       │   ├── llm.ts            # Gemini 2.5 Flash + extractive fallback
│   │       │   └── seed.ts           # 100 docs + 50 golden set entries
│   │       └── routes/               # /api/documents, /api/query, /api/evaluation …
│   └── legal-rag/           # React + Vite frontend
│       └── src/pages/
│           ├── hub.tsx               # Q&A Hub
│           ├── documents.tsx         # Document Library
│           ├── document-detail.tsx   # Page reader
│           └── evaluate.tsx          # Evaluation Dashboard
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 spec (source of truth)
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM schema
├── Dockerfile               # Container build (multi-stage)
├── railway.toml             # One-click Railway deploy
├── render.yaml              # One-click Render deploy
├── fly.toml                 # Fly.io deploy config
├── APPROACH.md              # Architecture & design document
├── PROMPTS.md               # Prompts used during development
└── golden_set.xlsx          # 50 evaluation entries with full answers
```

---

## Quick Start (Local)

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9: `npm i -g pnpm`
- PostgreSQL ≥ 14

### 1 — Install

```bash
pnpm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL at minimum
```

### 3 — Push database schema

```bash
pnpm db:push
```

### 4 — Run (development — two terminals)

```bash
# Terminal 1 – API server (port 8080, auto-seeds 100 docs)
PORT=8080 pnpm dev:api

# Terminal 2 – Vite dev server (port 3000, proxies /api → 8080)
API_PORT=8080 pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000).

### 5 — Run (production build — single process)

```bash
NODE_ENV=production pnpm build
PORT=8080 pnpm start
```

Open [http://localhost:8080](http://localhost:8080).

---

## Deployment

### Option A — Railway (recommended, free tier available)

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Add a **PostgreSQL** plugin (Railway provisions it and sets `DATABASE_URL` automatically).
4. Set environment variables in **Variables** tab:
   ```
   NODE_ENV=production
   GEMINI_API_KEY=<your key>   # optional
   ```
5. Railway auto-detects `railway.toml` and deploys. Done.

### Option B — Render (free tier available)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Blueprint** → connect your repo.
3. Render reads `render.yaml` and creates:
   - A **Web Service** (the app)
   - A **PostgreSQL** database
4. Set `DATABASE_URL` (from Render DB dashboard) and optionally `GEMINI_API_KEY` in the service **Environment** tab.
5. Click **Apply** → deploys automatically.

### Option C — Fly.io

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
fly auth login
fly launch --no-deploy          # reads fly.toml
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set GEMINI_API_KEY="..."   # optional
fly deploy
```

### Option D — Docker (any VPS / cloud)

```bash
docker build -t lexisrag .
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/lexisrag" \
  -e NODE_ENV=production \
  lexisrag
```

### Option E — Vercel (frontend only)

Vercel supports static SPAs but not long-running Node.js servers. To use Vercel for the frontend:
1. Deploy the API server separately (Railway / Render).
2. Set `VITE_API_BASE_URL=https://your-api.railway.app` in `artifacts/legal-rag/.env.production`.
3. Update `lib/api-client-react/src/custom-fetch.ts` to call `setBaseUrl(import.meta.env.VITE_API_BASE_URL)` at app init.
4. Deploy `artifacts/legal-rag` as a Vite static project on Vercel.

**Recommended: use Railway or Render** — the whole app (API + frontend) deploys as a single service with zero extra configuration.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/stats` | Corpus statistics (100 docs, 175 chunks) |
| `GET` | `/api/documents` | List all documents |
| `GET` | `/api/documents/:id` | Document detail + page chunks |
| `POST` | `/api/query` | Submit query — returns answer + citations |
| `GET` | `/api/golden-set` | List 50 evaluation entries |
| `POST` | `/api/evaluation/run` | Run full evaluation suite |
| `GET` | `/api/evaluation/results` | Last evaluation results |

### Example

```bash
curl -X POST https://your-app.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the standard deduction under TCJA?","mode":"hybrid","topK":5}'
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `NODE_ENV` | ✅ Yes (prod) | Set to `production` for static serving |
| `PORT` | No | Server port (default: `8080`) |
| `GEMINI_API_KEY` | No | Enables Gemini 2.5 Flash LLM answers |
| `STATIC_DIR` | No | Override path to built frontend (default: auto-resolved) |

---

## Evaluation Results

| Metric | Score |
|---|---|
| Retrieval Accuracy | **100%** (50/50) |
| Faithfulness | **89.4%** avg |

Run the evaluation yourself:
```bash
curl -X POST http://localhost:8080/api/evaluation/run
```

---

## No Secrets in Repo

`.env` is gitignored. Never commit API keys. Use your platform's secrets/environment manager:
- Railway → Variables tab
- Render → Environment tab
- Fly.io → `fly secrets set KEY=value`
- Docker → `-e KEY=value` or `--env-file`

---

## License

MIT
