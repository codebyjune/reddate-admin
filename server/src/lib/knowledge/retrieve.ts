import prisma from "../prisma";
import { embedText } from "./embed";

const MIN_RETRIEVAL_SCORE = 0.35;

export interface RetrievedChunk {
  chunkId: number;
  documentId: number;
  documentName: string;
  page: number | null;
  content: string;
  score: number;
}

const formatVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export const retrieveRelevantChunks = async (
  userId: number,
  query: string,
  limit = 5
): Promise<RetrievedChunk[]> => {
  const queryEmbedding = await embedText(query);
  const vectorLiteral = formatVectorLiteral(queryEmbedding);

  const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `
      SELECT
        kc.id AS "chunkId",
        kc."documentId" AS "documentId",
        kd.name AS "documentName",
        kc.page AS "page",
        kc.content AS "content",
        1 - (kce.vector <=> $1::vector) AS "score"
      FROM knowledge_chunk_embeddings kce
      JOIN knowledge_chunks kc ON kc.id = kce."chunkId"
      JOIN knowledge_documents kd ON kd.id = kc."documentId"
      WHERE kd."ownerId" = $2
        AND kd.status = 'ready'
      ORDER BY kce.vector <=> $1::vector ASC
      LIMIT $3
    `,
    vectorLiteral,
    userId,
    limit
  );

  return rows.filter((row) => Number.isFinite(row.score) && row.score >= MIN_RETRIEVAL_SCORE);
};

export const formatRetrievedContext = (chunks: RetrievedChunk[]) => {
  if (chunks.length === 0) {
    return "";
  }

  return chunks
    .map((chunk, index) => {
      const pageInfo = chunk.page ? `，页码 ${chunk.page}` : "";
      return [
        `参考片段 ${index + 1}`,
        `来源文档：${chunk.documentName}${pageInfo}`,
        `相关度：${chunk.score.toFixed(4)}`,
        `内容：${chunk.content}`,
      ].join("\n");
    })
    .join("\n\n");
};
