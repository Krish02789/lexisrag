/**
 * LLM integration using Google Gemini API.
 * Falls back to extractive QA if GEMINI_API_KEY is not set.
 */

import { logger } from "./logger";
import type { SearchResult } from "./searchEngine";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export function isLLMAvailable(): boolean {
  return !!GEMINI_API_KEY;
}

function buildContext(results: SearchResult[]): string {
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.chunk.documentTitle} (${r.chunk.docType}), Page ${r.chunk.pageNum}:\n${r.chunk.content}`
    )
    .join("\n\n---\n\n");
}

function extractiveAnswer(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return "No relevant documents found for this query.";
  }

  const top = results[0].chunk;
  const citations = results
    .slice(0, 3)
    .map((r, i) => `[${i + 1}] ${r.chunk.documentTitle}, Page ${r.chunk.pageNum}`)
    .join("; ");

  const sentences = top.content
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const queryTokens = query.toLowerCase().split(/\s+/);
  const scored = sentences.map((s) => ({
    s,
    score: queryTokens.filter((t) => s.toLowerCase().includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);

  const answer = scored
    .slice(0, 3)
    .map((x) => x.s)
    .join(". ");

  return `Based on the retrieved legal documents:\n\n${answer}.\n\nSources: ${citations}`;
}

export async function generateAnswer(
  query: string,
  results: SearchResult[]
): Promise<{ answer: string; llmUsed: boolean }> {
  if (!isLLMAvailable() || results.length === 0) {
    return { answer: extractiveAnswer(query, results), llmUsed: false };
  }

  try {
    const context = buildContext(results);
    const prompt = `You are a precise US tax and legal research assistant. Answer the following legal question based ONLY on the provided legal document excerpts. Include specific citations with document names and page numbers. If the answer cannot be found in the provided context, say so clearly.

Legal Question: ${query}

Legal Document Context:
${context}

Provide a concise, accurate answer with citations in the format [Document Name, Page N].`;

    const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.1,
        },
        systemInstruction: {
          parts: [
            {
              text: "You are a precise US tax and legal research assistant. Answer questions using only the provided legal document excerpts. Always cite your sources with document name and page number.",
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      extractiveAnswer(query, results);

    return { answer, llmUsed: true };
  } catch (err) {
    logger.warn({ err }, "Gemini LLM call failed, falling back to extractive answer");
    return { answer: extractiveAnswer(query, results), llmUsed: false };
  }
}
