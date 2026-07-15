# Prompts Used During LexisRAG Development

This document records the key prompts, system instructions, and design decisions
made during the development of LexisRAG. It is part of the assignment deliverables.

---

## 1. System / LLM Synthesis Prompt

Used in `artifacts/api-server/src/lib/llm.ts` to instruct Gemini 2.5 Flash when
generating answers from retrieved legal chunks.

```
You are LexisRAG, a precision legal research assistant specialising in US Tax and
Federal Law. Your role is to synthesise accurate, citation-backed answers from the
provided legal source excerpts.

STRICT RULES:
1. Answer ONLY from the provided source excerpts. Do not use outside knowledge.
2. Every factual claim must be traceable to a specific source and page number.
3. Use precise legal language. Cite statutes by section number, cases by full
   citation (e.g. 348 U.S. 426 (1955)), and regulations by CFR reference.
4. Structure your answer: lead with the direct answer, then supporting detail,
   then any important caveats or exceptions.
5. If the sources do not contain sufficient information to answer fully, say so
   explicitly rather than speculating.
6. Never fabricate citations, dollar amounts, dates, or legal standards.

FORMAT:
- Use plain prose, not bullet lists, unless the question explicitly asks for a list.
- Keep the answer focused and under 300 words.
- Do not include a "Sources:" footer — citations are handled separately.
```

---

## 2. Extractive QA Fallback Prompt (No LLM Key)

When `GEMINI_API_KEY` is absent the system falls back to extractive QA. The
relevant logic in `llm.ts`:

```
// Build answer by extracting the most relevant sentences from each chunk.
// Score each sentence by keyword overlap with the query, pick top sentences,
// deduplicate, and join into a coherent paragraph.
```

No prompt template is needed — the function scores sentences by normalised
keyword overlap against the query tokens, then concatenates the highest-scoring
sentences in source order.

---

## 3. Retrieval Design Prompt (Search Engine Architecture)

The following reasoning was used when designing `searchEngine.ts`:

**Goal:** Replicate the retrieval quality of a BM25 + dense-vector hybrid search
(as used by Elasticsearch / OpenSearch) without any infrastructure dependency.

**BM25 component:**
```
Score(D, Q) = Σ IDF(qᵢ) · [f(qᵢ, D) · (k1 + 1)] / [f(qᵢ, D) + k1 · (1 − b + b · |D| / avgdl)]

where:
  k1 = 1.2   (term frequency saturation)
  b  = 0.75  (document length normalisation)
  IDF(qᵢ) = ln((N − df(qᵢ) + 0.5) / (df(qᵢ) + 0.5) + 1)
```

**TF-IDF Cosine component:**
```
cosine_sim(query_vec, doc_vec) = (query · doc) / (|query| · |doc|)

Vectors are built over a shared vocabulary of all non-stopword tokens.
Each dimension is weighted by TF-IDF: tf(t,d) · log((1 + N) / (1 + df(t)))
```

**Reciprocal Rank Fusion:**
```
RRF_score(d) = Σ 1 / (k + rank_i(d))    where k = 60

Fuses BM25 ranked list and TF-IDF cosine ranked list into a single ranking.
k = 60 was chosen per the original RRF paper (Cormack et al., 2009) as it
dampens rank differences at high positions and is robust across domains.
```

---

## 4. Chunking Strategy

Prompt / rationale used when deciding how to split legal documents:

```
Legal documents must be chunked at PAGE boundaries rather than fixed token
windows because:
  - Each page of a US statute or court judgment forms a coherent semantic unit
    (e.g. "Section 61(a) — definitions" on page 1 vs "Section 61(b) — exceptions"
    on page 2).
  - Cross-page chunks would split the holding from the reasoning in case law.
  - Page-aligned chunks map directly to citation practice (e.g. "Page 2" of
    Glenshaw Glass corresponds exactly to the ratio decidendi).

Each page chunk is stored as a separate row in `document_chunks` with its
`page_num` recorded, enabling pin-point citations in answers.
```

---

## 5. Corpus Curation Prompt

The 100-document corpus was curated with the following selection criteria:

```
Select documents that together cover the full breadth of a US Tax & Legal RAG
evaluation suite. Requirements:

  CATEGORIES (target distribution):
  - Statutes (IRC sections):          ~30 docs  — foundational tax law
  - Court Judgments (SCOTUS/Circuit): ~35 docs  — landmark case law
  - Practitioner POV / Commentary:    ~20 docs  — planning perspectives
  - IRS Rulings & Regulations:        ~15 docs  — administrative guidance

  SELECTION CRITERIA:
  1. Foundational importance — must be cited in a tax law course or bar exam.
  2. Diversity — cover income, property, corporate, international, estate,
     and digital asset taxation.
  3. Evaluability — each document must support at least one unambiguous
     question-answer pair for the golden set.
  4. No overlap — avoid redundant coverage of the same legal principle.

  GOLDEN SET COVERAGE:
  Every golden set entry must have exactly one primary source document.
  The corpus must contain that source document.
```

---

## 6. Golden Set Construction Prompt

Prompt used when generating the 50 golden set question-answer pairs:

```
For each selected source document, generate one evaluation entry following
these rules:

  QUERY:
  - Must be a realistic question a tax attorney or CPA would ask.
  - Must be answerable from a single source document (no cross-document synthesis).
  - Phrased as a natural language question, not a retrieval keyword.

  GROUND TRUTH ANSWER:
  - Must cite specific section numbers, page numbers, or case citations.
  - Must include the key holding / rule and at least one supporting detail.
  - Must be 2–5 sentences — long enough to test faithfulness, short enough
    to allow exact matching.
  - Must be extractable verbatim or near-verbatim from the named source pages.

  CATEGORY:
  - Assign exactly one category from:
    Individual Tax | Income Taxation | Corporate Tax | Pass-Through Taxation |
    Property Transactions | Case Law | International Tax | Estate Planning |
    Digital Assets | Entity Classification | Passive Activities |
    Business Deductions | Payroll Tax | Real Property | Investment Tax

  SOURCE DOCUMENT:
  - Must match the document title exactly as stored in the corpus.
  - Must include the page number(s) where the answer appears.
```

---

## 7. Evaluation Metric Design

Rationale behind the two evaluation metrics:

### Retrieval Accuracy
```
Definition: A retrieval is "accurate" when the ground-truth source document
appears in the top-K retrieved chunks (default K = 5), measured by normalised
keyword overlap ≥ 50% between the stored source title and the retrieved
document title.

Why keyword overlap rather than exact match:
  - Document titles in the golden set are written in natural language and may
    differ slightly from stored titles (e.g. "Section 61" vs "IRC Section 61 –
    Gross Income Defined").
  - Overlap ≥ 50% is a conservative threshold that tolerates abbreviation
    while rejecting unrelated documents.
```

### Faithfulness
```
Definition: Normalised unigram overlap between the ground-truth answer tokens
and the system-generated answer tokens, after stopword removal.

faithfulness = |GT_tokens ∩ SYS_tokens| / |GT_tokens|

This approximates ROUGE-1 recall and measures whether the system answer covers
the key legal terms, section numbers, and concepts present in the ground truth.
A score of 1.0 means every non-stopword token in the ground truth appears in
the system answer.

Why not embedding-based similarity:
  - Legal evaluation requires exact term matching (statute numbers, citations,
    dollar thresholds). Embedding similarity may rate semantically similar but
    legally incorrect answers as high.
  - Unigram overlap is transparent, reproducible, and computationally cheap.
```

---

## 8. UI Design Brief

The following brief was used to instruct the design subagent building the React frontend:

```
Design System:
  Primary:    #0D1B3E  (navy)
  Accent:     #D4AF37  (legal gold)
  Background: #FAF7F0  (parchment)
  Surface:    #FFFFFF
  Text:       #1A1A2E

Typography:
  Headings:   Playfair Display (serif) — authoritative, legal
  Body/UI:    Plus Jakarta Sans (sans-serif) — modern, readable

Pages to build:
  1. Q&A Hub (/)
     - Large textarea with placeholder "Ask a complex legal question..."
     - Search mode selector: Hybrid / BM25 Only / TF-IDF Only
     - "Synthesize Answer" CTA button
     - Answer panel: LLM-generated prose answer
     - Citation cards: document title, page number, excerpt preview
     - Loading skeleton during query

  2. Document Library (/documents)
     - Search bar filtering by title
     - Type filter pills: All / Act / Court Judgment / POV / Tax Document
     - Table: title, type badge, page count, date added
     - Clickable rows linking to Document Detail

  3. Document Detail (/documents/:id)
     - Document metadata header (type badge, title, description)
     - Page-by-page reading view with page numbers
     - "Back to Library" navigation

  4. Evaluation Dashboard (/evaluate)
     - "Run Evaluation" button triggering POST /api/evaluation/run
     - Metrics display: Retrieval Accuracy %, Faithfulness score, Pass count
     - Recharts radar/bar chart visualising the metrics
     - Results table: query, ground truth snippet, system answer snippet, pass/fail

Sidebar:
  - LexisRAG logo + "PRECISION RESEARCH" tagline
  - Navigation links to all four pages
  - System stats widget at bottom: Total Documents, Total Chunks
```

---

## 9. Database Schema Design

Rationale used when designing the four Drizzle ORM tables:

```
legal_documents   — top-level document metadata (title, type, description, page count)
document_chunks   — one row per page, foreign-keyed to document; holds chunk text
golden_set_entries — evaluation pairs (query, ground truth, source, category)
query_logs        — append-only log of every POST /api/query call (for analytics)

Design decisions:
  - Store chunks in the DB for durability, but build the search index in-memory
    at startup for sub-millisecond retrieval. The DB is the source of truth;
    the in-memory index is a cache rebuilt on every cold start.
  - `seedIfEmpty()` checks document count on startup and reseeds if < expected.
    This handles cold starts without manual migration steps.
  - `query_logs` has no foreign key to documents (queries may retrieve multiple
    docs). Kept denormalised for simplicity.
```

---

*Document generated: 2026-07-14 | LexisRAG v1.0*
