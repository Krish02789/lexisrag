import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, legalDocumentsTable, documentChunksTable, queryLogsTable } from "@workspace/db";
import { QueryDocumentsBody, QueryDocumentsResponse } from "@workspace/api-zod";
import { search, type SearchMode, type SearchChunk } from "../lib/searchEngine";
import { generateAnswer } from "../lib/llm";

const router: IRouter = Router();

// Cache all chunks at startup (refreshed if table is empty)
let cachedChunks: SearchChunk[] = [];
let cacheLoaded = false;

async function getChunks(): Promise<SearchChunk[]> {
  if (cacheLoaded && cachedChunks.length > 0) return cachedChunks;

  const rows = await db
    .select({
      id: documentChunksTable.id,
      documentId: documentChunksTable.documentId,
      pageNum: documentChunksTable.pageNum,
      content: documentChunksTable.content,
      title: legalDocumentsTable.title,
      docType: legalDocumentsTable.docType,
    })
    .from(documentChunksTable)
    .innerJoin(legalDocumentsTable, eq(documentChunksTable.documentId, legalDocumentsTable.id));

  cachedChunks = rows.map((r) => ({
    id: r.id,
    documentId: r.documentId,
    documentTitle: r.title,
    docType: r.docType,
    pageNum: r.pageNum,
    content: r.content,
  }));
  cacheLoaded = true;
  return cachedChunks;
}

// Invalidate cache (called after seeding)
export function invalidateChunkCache(): void {
  cacheLoaded = false;
  cachedChunks = [];
}

router.post("/query", async (req, res): Promise<void> => {
  const parsed = QueryDocumentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { query, searchMode = "hybrid", topK = 5 } = parsed.data;
  const startTime = Date.now();

  const chunks = await getChunks();
  const results = search(chunks, query, searchMode as SearchMode, topK);

  const { answer, llmUsed } = await generateAnswer(query, results);
  const processingTimeMs = Date.now() - startTime;

  const citations = results.map((r) => ({
    documentId: r.chunk.documentId,
    documentTitle: r.chunk.documentTitle,
    docType: r.chunk.docType,
    pageNum: r.chunk.pageNum,
    excerpt: r.chunk.content.substring(0, 400) + (r.chunk.content.length > 400 ? "..." : ""),
    score: r.score,
    bm25Score: r.bm25Score ?? null,
    vectorScore: r.vectorScore ?? null,
  }));

  // Log the query
  await db.insert(queryLogsTable).values({
    query,
    answer,
    searchMode,
    processingTimeMs,
    citationsJson: JSON.stringify(citations),
    llmUsed,
  });

  const response = {
    query,
    answer,
    citations,
    searchMode,
    processingTimeMs,
    llmUsed,
  };

  res.json(QueryDocumentsResponse.parse(response));
});

export default router;
