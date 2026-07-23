/**
 * Line-aware log text chunking for embedding and LLM context windows.
 * Groups lines up to a character budget and overlaps consecutive chunks.
 */

function clampOverlap(overlap: number, maxChunkSize: number): number {
  return Math.min(Math.max(0, overlap), maxChunkSize - 1);
}

function splitLongText(
  text: string,
  maxChunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChunkSize, text.length);
    chunks.push(text.slice(start, end));

    if (end >= text.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}

function joinWithOverlapPrefix(
  prefix: string,
  line: string,
  maxChunkSize: number
): string {
  const separator = prefix.length > 0 && line.length > 0 ? "\n" : "";
  const combined = prefix + separator + line;

  if (combined.length <= maxChunkSize) {
    return combined;
  }

  // Line fits on its own; trim the overlap prefix so the chunk stays within budget.
  const roomForPrefix =
    maxChunkSize - line.length - (line.length > 0 ? 1 : 0);

  if (roomForPrefix <= 0) {
    return line;
  }

  const trimmedPrefix = prefix.slice(-roomForPrefix);
  const trimmedSeparator =
    trimmedPrefix.length > 0 && line.length > 0 ? "\n" : "";

  return trimmedPrefix + trimmedSeparator + line;
}

/**
 * Splits log text into overlapping chunks, preferring line boundaries.
 *
 * @param text - Raw log file contents.
 * @param maxChunkSize - Maximum characters per chunk (default 1000).
 * @param overlap - Characters repeated at the start of each subsequent chunk (default 200).
 * @returns Array of text chunks. Empty input yields an empty array.
 */
export function chunkLogText(
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (text.length === 0) {
    return [];
  }

  if (maxChunkSize <= 0) {
    throw new RangeError("maxChunkSize must be greater than 0");
  }

  const safeOverlap = clampOverlap(overlap, maxChunkSize);

  if (text.length <= maxChunkSize) {
    return [text];
  }

  const lines = text.split("\n");
  const chunks: string[] = [];
  let buffer = "";

  const flushBuffer = () => {
    if (buffer.length === 0) {
      return;
    }

    chunks.push(buffer);
    buffer = "";
  };

  const appendLine = (line: string) => {
    if (buffer.length === 0) {
      buffer = line;
      return;
    }

    const candidate = `${buffer}\n${line}`;

    if (candidate.length <= maxChunkSize) {
      buffer = candidate;
      return;
    }

    const completedChunk = buffer;
    flushBuffer();

    const overlapPrefix =
      safeOverlap > 0 ? completedChunk.slice(-safeOverlap) : "";
    buffer = joinWithOverlapPrefix(overlapPrefix, line, maxChunkSize);
  };

  for (const line of lines) {
    if (line.length > maxChunkSize) {
      flushBuffer();

      const lineChunks = splitLongText(line, maxChunkSize, safeOverlap);
      chunks.push(...lineChunks.slice(0, -1));
      buffer = lineChunks[lineChunks.length - 1] ?? "";
      continue;
    }

    appendLine(line);
  }

  flushBuffer();

  return chunks;
}
