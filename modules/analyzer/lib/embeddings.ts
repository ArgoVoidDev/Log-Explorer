/**
 * Client-side Gemini text embeddings for semantic log search.
 * Uses the Generative Language REST API with native fetch (browser-only).
 */

const EMBEDDING_MODEL = "text-embedding-004";
const BATCH_EMBEDDING_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents`;
const MAX_BATCH_SIZE = 100;

export type TextEmbedding = {
  text: string;
  vector: number[];
};

type GeminiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type BatchEmbedContentResponse = GeminiErrorBody & {
  embeddings?: Array<{
    values?: number[];
  }>;
};

function formatGeminiError(payload: GeminiErrorBody, status: number): string {
  const message = payload.error?.message?.trim();

  if (message && /api key/i.test(message)) {
    return `Invalid Gemini API key: ${message}`;
  }

  return message ?? `Gemini embedding request failed (HTTP ${status}).`;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

async function fetchEmbeddingBatch(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  let response: Response;

  try {
    response = await fetch(
      `${BATCH_EMBEDDING_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: texts.map((text) => ({
            model: `models/${EMBEDDING_MODEL}`,
            content: {
              parts: [{ text }],
            },
            taskType: "RETRIEVAL_DOCUMENT",
          })),
        }),
      }
    );
  } catch (error) {
    throw new Error("Network error while contacting the Gemini embedding API.", {
      cause: error,
    });
  }

  let payload: BatchEmbedContentResponse;

  try {
    payload = (await response.json()) as BatchEmbedContentResponse;
  } catch (error) {
    throw new Error(
      `Failed to parse Gemini embedding response (HTTP ${response.status}).`,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new Error(formatGeminiError(payload, response.status));
  }

  const embeddings = payload.embeddings;

  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error(
      "Gemini batch embedding response count did not match the request."
    );
  }

  return embeddings.map((embedding, index) => {
    const vector = embedding.values;

    if (!vector || vector.length === 0) {
      throw new Error(
        `Gemini embedding response did not include vector values for chunk ${index + 1}.`
      );
    }

    return vector;
  });
}

/**
 * Generates embedding vectors for log text chunks via the Gemini API.
 *
 * Uses `batchEmbedContents` (up to 100 chunks per request) to minimize
 * round-trips for large log files.
 *
 * @param chunks - Text chunks to embed (e.g. from {@link chunkLogText}).
 * @param apiKey - User-provided Gemini API key (BYOK).
 * @returns Embeddings in the same order as the input chunks.
 */
export async function generateEmbeddings(
  chunks: string[],
  apiKey: string
): Promise<TextEmbedding[]> {
  const trimmedKey = apiKey.trim();

  if (trimmedKey.length === 0) {
    throw new Error("Gemini API key is required.");
  }

  if (chunks.length === 0) {
    return [];
  }

  try {
    const batches = chunkArray(chunks, MAX_BATCH_SIZE);
    const results: TextEmbedding[] = [];

    for (const batch of batches) {
      const vectors = await fetchEmbeddingBatch(batch, trimmedKey);

      for (const vector of vectors) {
        const chunkIndex = results.length;
        results.push({
          text: chunks[chunkIndex]!,
          vector,
        });
      }
    }

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unexpected error while generating embeddings.", {
      cause: error,
    });
  }
}
