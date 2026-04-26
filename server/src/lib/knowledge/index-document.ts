import path from "path";
import prisma from "../prisma";
import { splitTextIntoChunks } from "./chunk";
import { embedText, getEmbeddingModelName } from "./embed";
import { parsePdfDocument } from "./pdf";

interface IndexedChunkPayload {
  chunkIndex: number;
  page: number | null;
  content: string;
  charCount: number;
  embedding: number[];
}

export const indexKnowledgeDocument = async (documentId: number) => {
  const document = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("文档不存在");
  }

  const absoluteFilePath = path.resolve(process.cwd(), document.filePath);

  await prisma.knowledgeDocument.update({
    where: { id: documentId },
    data: {
      status: "processing",
      errorMessage: null,
    },
  });

  try {
    const parsed = await parsePdfDocument(absoluteFilePath);
    const chunks = splitTextIntoChunks(parsed.text);

    if (chunks.length === 0) {
      throw new Error("PDF 未提取到可用文本，可能是扫描件或空文档");
    }

    const indexedChunks: IndexedChunkPayload[] = [];
    for (const chunk of chunks) {
      const embedding = await embedText(chunk.content);
      indexedChunks.push({
        chunkIndex: chunk.chunkIndex,
        page: chunk.page,
        content: chunk.content,
        charCount: chunk.charCount,
        embedding,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM knowledge_chunk_embeddings WHERE "chunkId" IN (SELECT id FROM knowledge_chunks WHERE "documentId" = $1)`,
        documentId
      );

      await tx.knowledgeChunk.deleteMany({
        where: { documentId },
      });

      await tx.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          pageCount: parsed.pageCount,
        },
      });

      for (const chunk of indexedChunks) {
        const createdChunk = await tx.knowledgeChunk.create({
          data: {
            documentId,
            chunkIndex: chunk.chunkIndex,
            page: chunk.page,
            content: chunk.content,
            charCount: chunk.charCount,
          },
        });

        const vector = `[${chunk.embedding.join(",")}]`;

        await tx.$executeRawUnsafe(
          `INSERT INTO knowledge_chunk_embeddings ("chunkId", model, vector, "createdAt") VALUES ($1, $2, $3::vector, NOW())`,
          createdChunk.id,
          getEmbeddingModelName(),
          vector
        );
      }
    });

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "ready",
        errorMessage: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文档索引失败";

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "failed",
        errorMessage: message,
      },
    });

    throw error;
  }
};
