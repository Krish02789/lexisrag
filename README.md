
# LexisRAG

I built this for the Shorthills AI Associate AI Product Engineer assignment — a RAG system for US Tax & Legal research. You ask it a tax/legal question, it goes and finds the right passage across 100 documents (statutes, court judgments, IRS rulings, commentary), and gives you back an answer with the actual page number cited.

**Live demo:** https://code-vault--krishbatracost4.replit.app/

## What it does

Ask something like "what's the standard deduction under TCJA" or "how does Glenshaw Glass define gross income," and it'll search the corpus, pull the most relevant pages, and hand the answer to Gemini with strict instructions to only use what's in front of it (no outside knowledge, no making up citations). If there's no Gemini key configured, it falls back to picking the best-matching sentences directly out of the source text — not as good, but it still works and still cites correctly.

There's also an evaluation dashboard where you can run the whole thing against a 50-question golden set and see how it does on retrieval accuracy and faithfulness.

## How the search actually works

I didn't want to pull in Elasticsearch just for a 100-document corpus, so I wrote BM25 and TF-IDF cosine similarity by hand in TypeScript and fused the two rankings with Reciprocal Rank Fusion. BM25 catches exact terms — "Section 199A," specific case names, that sort of thing. TF-IDF/cosine catches the paraphrased stuff, like someone asking about a "1031 exchange" when the document says "like-kind exchange." RRF just merges both ranked lists so you get the benefit of both without one drowning out the other.

Honestly BM25 alone probably gets you 90% of the way there for a corpus this size, legal queries tend to use precise terminology anyway. But the assignment asked for hybrid search specifically, and the vector side does catch the occasional query that's phrased more conversationally.

Documents get chunked at the page level, not by token count. That was a deliberate call: legal citations are page-based ("see page 2 of the ruling"), and if you chunk by arbitrary token windows you risk splitting a holding from its reasoning mid-sentence.

## Query flow, step by step

1. You type a question and pick a search mode (hybrid, BM25-only, or TF-IDF-only)
2. Every page chunk in the corpus gets scored against your query with both BM25 and TF-IDF
3. RRF merges the two ranked lists (k=60, the standard constant from the original RRF paper)
4. The top chunks go to Gemini 2.5 Flash along with a system prompt that says, roughly, "only answer from what's here, cite page numbers, don't guess"
5. You get back the answer plus citation cards — document, type, page number, excerpt, and the raw scores if you're curious
6. Every query gets logged so there's a record of what's been asked

## Evaluation

50 golden set entries, each with a query, a ground-truth answer, and the document/page it comes from. I run the query pipeline against each one and score two things:

- **Retrieval accuracy** — did it pull the right source document? (keyword overlap ≥50% between the expected title and what got retrieved — titles aren't always written identically, so exact match was too strict)
- **Faithfulness** — does the generated answer actually contain the key terms from the ground truth, or is it drifting/hallucinating? (unigram overlap after stripping stopwords — basically a rough ROUGE-1)

Current numbers are 100% retrieval accuracy and ~89% faithfulness with Gemini enabled. Turn the key off and faithfulness drops to somewhere around 60-75%, not because retrieval got worse but because the extractive fallback phrases things differently than the ground truth even when it's basically right.

## Stack

- Frontend: React 19 + Vite + TypeScript + Tailwind
- Backend: Express 5 + TypeScript
- DB: PostgreSQL via Drizzle ORM
- Search: hand-rolled BM25 + TF-IDF + RRF, no external search infra
- LLM: Gemini 2.5 Flash (optional — everything still works without it)
- API contract: OpenAPI spec → generates the React Query hooks and Zod schemas, so frontend and backend can't drift out of sync

## Project layout

```
lexisrag/
├── artifacts/
│   ├── api-server/          # Express API
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── searchEngine.ts   # BM25 + TF-IDF + RRF
│   │       │   ├── llm.ts            # Gemini + extractive fallback
│   │       │   └── seed.ts           # seeds 100 docs + 50 golden set entries
│   │       └── routes/
│   └── legal-rag/           # React frontend
│       └── src/pages/
│           ├── hub.tsx               # the Q&A page
│           ├── documents.tsx         # browse the corpus
│           ├── document-detail.tsx   # read a doc page by page
│           └── evaluate.tsx          # run/view evaluation results
├── lib/
│   ├── api-spec/            # OpenAPI spec, source of truth for the contract
│   ├── api-client-react/    # generated hooks
│   ├── api-zod/             # generated validation
│   └── db/                  # Drizzle schema
├── Dockerfile
├── railway.toml / render.yaml / fly.toml   # pick your deploy target
├── APPROACH.md
├── PROMPTS.md
└── golden_set.xlsx
```

## Running it locally

You'll need Node 20+, pnpm 9+, and a Postgres instance.

```bash
pnpm install
cp .env.example .env        # set DATABASE_URL at minimum
pnpm db:push
```

Then in two terminals:

```bash
# terminal 1 — API, auto-seeds the corpus on first boot
PORT=8080 pnpm dev:api

# terminal 2 — frontend, proxies to the API
API_PORT=8080 pnpm dev:web
```

Open localhost:3000. For a production-style single-process run:

```bash
NODE_ENV=production pnpm build
PORT=8080 pnpm start
```

## Deploying

I'd go with Railway or Render — both deploy the API and frontend as one service with basically zero config beyond adding a Postgres instance and (optionally) `GEMINI_API_KEY`.

- **Railway**: push to GitHub, "New Project" → deploy from repo, add the Postgres plugin, set your env vars, done — it picks up `railway.toml` automatically
- **Render**: same idea, it reads `render.yaml` and provisions the web service + Postgres together
- **Fly.io**: `fly launch --no-deploy` (reads `fly.toml`), then `fly secrets set` for your DB URL and Gemini key, then `fly deploy`
- **Docker**: `docker build -t lexisrag .` then run it with `DATABASE_URL` and `NODE_ENV=production` set
- **Vercel**: only really works for the frontend since it doesn't run long-lived Node processes — you'd need to host the API elsewhere and point `VITE_API_BASE_URL` at it

## API endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/healthz` | health check |
| GET | `/api/stats` | corpus stats |
| GET | `/api/documents` | list everything |
| GET | `/api/documents/:id` | one document, page by page |
| POST | `/api/query` | ask a question, get an answer + citations |
| GET | `/api/golden-set` | the 50 eval entries |
| POST | `/api/evaluation/run` | run the eval suite |
| GET | `/api/evaluation/results` | last run's results |

```bash
curl -X POST https://your-app.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the standard deduction under TCJA?","mode":"hybrid","topK":5}'
```

## Env vars

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `NODE_ENV` | yes in prod | set to `production` |
| `PORT` | no | defaults to 8080 |
| `GEMINI_API_KEY` | no | without it, falls back to extractive QA |
| `STATIC_DIR` | no | override where the built frontend lives |

`.env` is gitignored — nothing sensitive is committed. Set secrets through whatever platform you deploy to.
