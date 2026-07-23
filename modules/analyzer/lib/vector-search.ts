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

/**
 * Finds the most semantically similar log chunks for a query embedding.
 *
 * @param queryVector - Embedding of the search query.
 * @param documentEmbeddings - Chunk embeddings from {@link generateEmbeddings}.
 * @param topK - Maximum number of results to return (default 3).
 * @returns Top-K chunks sorted by descending cosine similarity.
 */
export function searchRelatedChunks(
  queryVector: number[],
  documentEmbeddings: TextEmbedding[],
  topK: number = 3
): TextEmbedding[] {
  if (topK <= 0 || documentEmbeddings.length === 0) {
    return [];
  }

  const ranked = documentEmbeddings
    .map((embedding) => ({
      embedding,
      score: cosineSimilarity(queryVector, embedding.vector),
    }))
    .sort((left, right) => right.score - left.score);

  return ranked.slice(0, topK).map(({ embedding }) => embedding);
}
