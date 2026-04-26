import { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import * as knowledgeController from "../controllers/knowledge.controller";
import { ensureKnowledgeUploadDir, knowledgeUploadDir } from "../lib/knowledge/paths";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

ensureKnowledgeUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, knowledgeUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `knowledge-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
    return;
  }

  cb(new Error("只支持 PDF 文件"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const handleKnowledgeUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("file")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "PDF 文件大小不能超过 20MB" });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }

    next(err);
  });
};

router.get("/documents", knowledgeController.getDocuments);
router.post("/documents", handleKnowledgeUpload, knowledgeController.uploadDocument);
router.delete("/documents/:id", knowledgeController.deleteDocument);

export default router;
