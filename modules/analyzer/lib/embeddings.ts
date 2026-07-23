/**
 * Client-side Gemini text embeddings for semantic log search.
 * Uses the Generative Language REST API with native fetch (browser-only).
 */

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBED_CONTENT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;

export type TextEmbedding = {
  text: string;
  vector: number[];
};

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

type GeminiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type EmbedContentResponse = GeminiErrorBody & {
  embedding?: {
    values?: number[];
  };
};

function formatGeminiError(payload: GeminiErrorBody, status: number): string {
  const message = payload.error?.message?.trim();

  if (message && /api key/i.test(message)) {
    return `Invalid Gemini API key: ${message}`;
  }

  return message ?? `Gemini embedding request failed (HTTP ${status}).`;
}

/**
 * Generates embedding vectors for log text chunks via the Gemini API.
 *
 * Sends one `embedContent` request per chunk sequentially for broad
 * API key compatibility.
 *
 * @param chunks - Text chunks to embed (e.g. from {@link chunkLogText}).
 * @param apiKey - User-provided Gemini API key (BYOK).
 * @param taskType - Retrieval task hint for {@link gemini-embedding-001}.
 * @returns Embeddings in the same order as the input chunks.
 */
export async function generateEmbeddings(
  chunks: string[],
  apiKey: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
): Promise<TextEmbedding[]> {
  const trimmedKey = apiKey.trim();

  if (trimmedKey.length === 0) {
    throw new Error("Gemini API key is required.");
  }

  if (chunks.length === 0) {
    return [];
  }

  const results: TextEmbedding[] = [];

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index]!;
    let response: Response;

    try {
      response = await fetch(`${EMBED_CONTENT_URL}?key=${trimmedKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: {
            parts: [{ text: chunk }],
          },
          embedContentConfig: {
            taskType,
          },
        }),
      });
    } catch (error) {
      throw new Error(
        "Network error while contacting the Gemini embedding API.",
        { cause: error }
      );
    }

    let payload: EmbedContentResponse;

    try {
      payload = (await response.json()) as EmbedContentResponse;
    } catch (error) {
      throw new Error(
        `Failed to parse Gemini embedding response (HTTP ${response.status}).`,
        { cause: error }
      );
    }

    if (!response.ok) {
      throw new Error(formatGeminiError(payload, response.status));
    }

    const vector = payload.embedding?.values;

    if (!vector || vector.length === 0) {
      throw new Error(
        `Gemini embedding response did not include vector values for chunk ${index + 1}.`
      );
    }

    results.push({ text: chunk, vector });
  }

  return results;
}
