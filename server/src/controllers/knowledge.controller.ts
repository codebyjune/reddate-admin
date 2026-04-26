import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { indexKnowledgeDocument } from "../lib/knowledge/index-document";
import { parseId } from "../lib/utils";

const normalizeUploadedFilename = (originalname: string) => {
  const decoded = Buffer.from(originalname, "latin1").toString("utf8");

  // Some clients send broken bytes inside otherwise UTF-8 filenames.
  // Prefer the decoded result, then trim common mojibake artifacts so the
  // user sees a readable title even if one character cannot be recovered.
  return decoded
    .replace(/\uFFFD/g, "")
    .replace(/\s+\)/g, ")")
    .trim();
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "未登录" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "请选择要上传的 PDF 文件" });
    }

    const originalName = normalizeUploadedFilename(req.file.originalname);

    const document = await prisma.knowledgeDocument.create({
      data: {
        name: originalName,
        mimeType: req.file.mimetype,
        filePath: `uploads/knowledge/${req.file.filename}`,
        fileSize: req.file.size,
        status: "pending",
        ownerId: userId,
      },
    });

    void indexKnowledgeDocument(document.id).catch((error) => {
      console.error("知识库文档索引失败:", error);
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("上传知识库文档失败:", error);
    res.status(500).json({ error: "上传知识库文档失败" });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "未登录" });
    }

    const documents = await prisma.knowledgeDocument.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(documents);
  } catch (error) {
    console.error("获取知识库文档列表失败:", error);
    res.status(500).json({ error: "获取知识库文档列表失败" });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const id = parseId(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "未登录" });
    }

    const document = await prisma.knowledgeDocument.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: "文档不存在" });
    }

    await prisma.knowledgeDocument.delete({
      where: { id },
    });

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除知识库文档失败:", error);
    res.status(500).json({ error: "删除知识库文档失败" });
  }
};
