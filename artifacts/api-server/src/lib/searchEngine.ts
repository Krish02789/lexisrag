/**
 * Hybrid Search Engine: BM25 (keyword) + TF-IDF cosine similarity (vector)
 * Combined via Reciprocal Rank Fusion (RRF)
 */

const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","it","its","be","been","was","were","are","as","that",
  "this","which","who","whom","whose","have","has","had","do","does","did",
  "not","no","nor","so","yet","both","either","neither","each","few","more",
  "most","other","some","such","than","then","there","these","they","those",
  "through","under","until","up","we","what","when","where","while","will",
  "would","could","should","may","might","can","shall","their","them","also",
  "if","any","all","my","your","our","his","her","its","our","how","about"
]);

export interface SearchChunk {
  id: number;
  documentId: number;
  documentTitle: string;
  docType: string;
  pageNum: number;
  content: string;
}

export interface SearchResult {
  chunk: SearchChunk;
  score: number;
  bm25Score: number;
  vectorScore: number;
  rank: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function buildTermFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  return tf;
}

// BM25 parameters
const k1 = 1.5;
const b = 0.75;

function bm25Search(chunks: SearchChunk[], queryTokens: string[]): number[] {
  if (chunks.length === 0 || queryTokens.length === 0) return chunks.map(() => 0);

  const N = chunks.length;
  const tokenizedChunks = chunks.map((c) => tokenize(c.content));
  const termFreqs = tokenizedChunks.map(buildTermFreq);

  // Document frequencies
  const df = new Map<string, number>();
  for (const tokens of tokenizedChunks) {
    for (const t of new Set(tokens)) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  const avgDl = tokenizedChunks.reduce((sum, t) => sum + t.length, 0) / N;

  return tokenizedChunks.map((tokens, i) => {
    const dl = tokens.length;
    const tf = termFreqs[i];
    let score = 0;
    for (const term of queryTokens) {
      const docFreq = df.get(term) ?? 0;
      if (docFreq === 0) continue;
      const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1);
      const termFreq = tf.get(term) ?? 0;
      const tfScore = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + (b * dl) / avgDl));
      score += idf * tfScore;
    }
    return score;
  });
}

function tfidfSearch(chunks: SearchChunk[], queryTokens: string[]): number[] {
  if (chunks.length === 0 || queryTokens.length === 0) return chunks.map(() => 0);

  const N = chunks.length;
  const tokenizedChunks = chunks.map((c) => tokenize(c.content));

  // IDF for each query term across corpus
  const df = new Map<string, number>();
  for (const tokens of tokenizedChunks) {
    for (const t of new Set(tokens)) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  const idfMap = new Map<string, number>();
  for (const [term, freq] of df) {
    idfMap.set(term, Math.log((N + 1) / (freq + 1)) + 1);
  }

  // Query vector (TF-IDF)
  const queryTF = buildTermFreq(queryTokens);
  const queryVec = new Map<string, number>();
  for (const [term, freq] of queryTF) {
    const idf = idfMap.get(term) ?? Math.log((N + 1) / 1) + 1;
    queryVec.set(term, freq * idf);
  }

  function dotProduct(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dot = 0;
    for (const [term, val] of vecA) {
      dot += val * (vecB.get(term) ?? 0);
    }
    return dot;
  }

  function magnitude(vec: Map<string, number>): number {
    let sum = 0;
    for (const val of vec.values()) sum += val * val;
    return Math.sqrt(sum);
  }

  const queryMag = magnitude(queryVec);
  if (queryMag === 0) return chunks.map(() => 0);

  return tokenizedChunks.map((tokens) => {
    const docTF = buildTermFreq(tokens);
    const docVec = new Map<string, number>();
    for (const [term, freq] of docTF) {
      const idf = idfMap.get(term) ?? 0;
      docVec.set(term, freq * idf);
    }
    const docMag = magnitude(docVec);
    if (docMag === 0) return 0;
    return dotProduct(queryVec, docVec) / (queryMag * docMag);
  });
}

function reciprocalRankFusion(bm25Scores: number[], tfidfScores: number[]): number[] {
  const n = bm25Scores.length;
  const k = 60; // standard RRF constant

  // Convert scores to ranks (0-indexed, lower rank = higher score)
  const bm25Ranks = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => bm25Scores[b] - bm25Scores[a]
  );
  const tfidfRanks = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => tfidfScores[b] - tfidfScores[a]
  );

  const rrfScores = new Array(n).fill(0);
  for (let rank = 0; rank < n; rank++) {
    rrfScores[bm25Ranks[rank]] += 1 / (k + rank + 1);
    rrfScores[tfidfRanks[rank]] += 1 / (k + rank + 1);
  }

  return rrfScores;
}

export type SearchMode = "hybrid" | "keyword" | "vector";

export function search(
  chunks: SearchChunk[],
  query: string,
  mode: SearchMode = "hybrid",
  topK = 5
): SearchResult[] {
  if (chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const bm25Scores = mode !== "vector" ? bm25Search(chunks, queryTokens) : new Array(chunks.length).fill(0);
  const tfidfScores = mode !== "keyword" ? tfidfSearch(chunks, queryTokens) : new Array(chunks.length).fill(0);

  let finalScores: number[];
  if (mode === "hybrid") {
    finalScores = reciprocalRankFusion(bm25Scores, tfidfScores);
  } else if (mode === "keyword") {
    finalScores = bm25Scores;
  } else {
    finalScores = tfidfScores;
  }

  const indexed = chunks
    .map((chunk, i) => ({
      chunk,
      score: finalScores[i],
      bm25Score: bm25Scores[i],
      vectorScore: tfidfScores[i],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return indexed.map((item, rank) => ({
    ...item,
    rank: rank + 1,
  }));
}
