import type { TextEmbedding } from "./embeddings";

/**
 * Cosine similarity between two vectors: (A · B) / (||A|| * ||B||).
 * Returns 0 when either vector has zero magnitude.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new RangeError(
      `Vector dimensions must match (${vecA.length} vs ${vecB.length}).`
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vecA.length; index += 1) {
    const a = vecA[index]!;
    const b = vecB[index]!;

    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

const KEYWORD_STOPWORDS = new Set([
  "about",
  "after",
  "before",
  "cause",
  "caused",
  "error",
  "errors",
  "from",
  "have",
  "logs",
  "that",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
  "چرا",
  "چه",
  "در",
  "را",
  "که",
]);

function keywordBoost(chunkText: string, queryText: string): number {
  const lowerChunk = chunkText.toLowerCase();
  const lowerQuery = queryText.toLowerCase();
  let boost = 0;

  for (const code of queryText.match(/\b\d{3}\b/g) ?? []) {
    if (chunkText.includes(code)) {
      boost += 0.12;
    }
  }

  for (const token of lowerQuery.match(/[a-z0-9][a-z0-9_./:-]{2,}/g) ?? []) {
    if (KEYWORD_STOPWORDS.has(token)) {
      continue;
    }

    if (lowerChunk.includes(token)) {
      boost += 0.04;
    }
  }

  return Math.min(boost, 0.35);
}

/**
 * Finds the most semantically similar log chunks for a query embedding.
 *
 * When {@link queryText} is provided, matching status codes and keywords
 * receive a small score boost so literal log terms are not missed.
 *
 * @param queryVector - Embedding of the search query.
 * @param documentEmbeddings - Chunk embeddings from {@link generateEmbeddings}.
 * @param topK - Maximum number of results to return (default 5).
 * @param queryText - Original question text for hybrid keyword boosting.
 * @returns Top-K chunks sorted by descending combined score.
 */
export function searchRelatedChunks(
  queryVector: number[],
  documentEmbeddings: TextEmbedding[],
  topK: number = 5,
  queryText?: string
): TextEmbedding[] {
  if (topK <= 0 || documentEmbeddings.length === 0) {
    return [];
  }

  const ranked = documentEmbeddings
    .map((embedding) => {
      const semanticScore = cosineSimilarity(queryVector, embedding.vector);
      const boost =
        queryText !== undefined
          ? keywordBoost(embedding.text, queryText)
          : 0;

      return {
        embedding,
        score: semanticScore + boost,
      };
    })
    .sort((left, right) => right.score - left.score);

  return ranked.slice(0, topK).map(({ embedding }) => embedding);
}
