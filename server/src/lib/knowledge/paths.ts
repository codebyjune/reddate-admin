import fs from "fs";
import path from "path";

export const knowledgeUploadsBaseDir = path.resolve(__dirname, "../../../");
export const knowledgeUploadsRelativeDir = "uploads/knowledge";
export const knowledgeUploadDir = path.join(
  knowledgeUploadsBaseDir,
  knowledgeUploadsRelativeDir
);

export const ensureKnowledgeUploadDir = () => {
  if (!fs.existsSync(knowledgeUploadDir)) {
    fs.mkdirSync(knowledgeUploadDir, { recursive: true });
  }
};

export const resolveKnowledgeDocumentPath = (storedFilePath: string) =>
  path.resolve(knowledgeUploadsBaseDir, storedFilePath);
