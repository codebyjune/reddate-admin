export interface TextChunk {
  chunkIndex: number;
  page: number | null;
  content: string;
  charCount: number;
}

const normalizeText = (text: string) =>
  text
    // PostgreSQL text columns cannot store NUL bytes.
    .replace(/\u0000/g, "")
    // Strip other control characters while preserving newlines.
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ ]{2,}/g, " ")
    .trim();

export const splitTextIntoChunks = (
  rawText: string,
  chunkSize = 350,
  overlapSize = 60
): TextChunk[] => {
  const text = normalizeText(rawText);

  if (!text) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    if (end < text.length) {
      const nextBreak = text.lastIndexOf("\n", end);
      if (nextBreak > start + Math.floor(chunkSize * 0.6)) {
        end = nextBreak;
      }
    }

    const content = text.slice(start, end).trim();
    if (content) {
      chunks.push({
        chunkIndex,
        page: null,
        content,
        charCount: content.length,
      });
      chunkIndex += 1;
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - overlapSize, start + 1);
  }

  return chunks;
};
