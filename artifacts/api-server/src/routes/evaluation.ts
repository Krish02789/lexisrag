import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, goldenSetEntriesTable, legalDocumentsTable, documentChunksTable } from "@workspace/db";
import { ListGoldenSetResponse, RunEvaluationResponse, GetEvaluationResultsResponse } from "@workspace/api-zod";
import { search, type SearchChunk } from "../lib/searchEngine";
import { generateAnswer } from "../lib/llm";

const router: IRouter = Router();

// Cache last evaluation result
let lastEvaluationResult: {
  avgRetrievalAccuracy: number;
  avgFaithfulness: number;
  totalEntries: number;
  passedEntries: number;
  results: EvalEntryResult[];
  ranAt: string;
} | null = null;

interface EvalEntryResult {
  id: number;
  query: string;
  groundTruth: string;
  systemAnswer: string;
  sourceDocument: string;
  retrievalAccuracy: number;
  faithfulness: number;
  retrieved: string[];
}

function buildReport(results: EvalEntryResult[]) {
  const total = results.length;
  const passed = results.filter((r) => r.retrievalAccuracy >= 0.5).length;
  const avgRetrieval = total > 0 ? results.reduce((s, r) => s + r.retrievalAccuracy, 0) / total : 0;
  const avgFaithfulness = total > 0 ? results.reduce((s, r) => s + r.faithfulness, 0) / total : 0;

  return {
    avgRetrievalAccuracy: Math.round(avgRetrieval * 1000) / 1000,
    avgFaithfulness: Math.round(avgFaithfulness * 1000) / 1000,
    totalEntries: total,
    passedEntries: passed,
    results,
    ranAt: new Date().toISOString(),
  };
}

function computeRetrievalAccuracy(sourceDocument: string, retrievedDocs: string[]): number {
  const normalizedSource = sourceDocument.toLowerCase().trim();
  const found = retrievedDocs.some((d) => {
    const norm = d.toLowerCase().trim();
    const sourceWords = normalizedSource.split(/\s+/).filter((w) => w.length > 3);
    const matchCount = sourceWords.filter((w) => norm.includes(w)).length;
    return matchCount / sourceWords.length >= 0.5;
  });
  return found ? 1.0 : 0.0;
}

function computeFaithfulness(groundTruth: string, systemAnswer: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);

  const truthTokens = new Set(normalize(groundTruth));
  const answerTokens = normalize(systemAnswer);

  if (truthTokens.size === 0) return 0;

  const overlap = answerTokens.filter((t) => truthTokens.has(t)).length;
  return Math.min(1.0, overlap / truthTokens.size);
}

router.get("/golden-set", async (_req, res): Promise<void> => {
  const entries = await db
    .select()
    .from(goldenSetEntriesTable)
    .orderBy(goldenSetEntriesTable.id);

  const response = entries.map((e) => ({
    id: e.id,
    query: e.query,
    groundTruthAnswer: e.groundTruthAnswer,
    sourceDocument: e.sourceDocument,
    pageNumbers: e.pageNumbers,
    category: e.category ?? null,
  }));

  res.json(ListGoldenSetResponse.parse(response));
});

router.post("/evaluation/run", async (_req, res): Promise<void> => {
  const goldenSet = await db.select().from(goldenSetEntriesTable);

  // Load all chunks for search
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

  const chunks: SearchChunk[] = rows.map((r) => ({
    id: r.id,
    documentId: r.documentId,
    documentTitle: r.title,
    docType: r.docType,
    pageNum: r.pageNum,
    content: r.content,
  }));

  const evalResults: EvalEntryResult[] = [];

  for (const entry of goldenSet) {
    const results = search(chunks, entry.query, "hybrid", 5);
    const { answer } = await generateAnswer(entry.query, results);

    const retrievedDocs = results.map((r) => r.chunk.documentTitle);
    const retrievalAccuracy = computeRetrievalAccuracy(entry.sourceDocument, retrievedDocs);
    const faithfulness = computeFaithfulness(entry.groundTruthAnswer, answer);

    evalResults.push({
      id: entry.id,
      query: entry.query,
      groundTruth: entry.groundTruthAnswer,
      systemAnswer: answer,
      sourceDocument: entry.sourceDocument,
      retrievalAccuracy,
      faithfulness,
      retrieved: retrievedDocs,
    });
  }

  const report = buildReport(evalResults);
  lastEvaluationResult = report;

  res.json(RunEvaluationResponse.parse(report));
});

router.get("/evaluation/results", async (_req, res): Promise<void> => {
  if (!lastEvaluationResult) {
    res.json(
      GetEvaluationResultsResponse.parse({
        avgRetrievalAccuracy: 0,
        avgFaithfulness: 0,
        totalEntries: 0,
        passedEntries: 0,
        results: [],
        ranAt: new Date().toISOString(),
      })
    );
    return;
  }

  res.json(GetEvaluationResultsResponse.parse(lastEvaluationResult));
});

export default router;
