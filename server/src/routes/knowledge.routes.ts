import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import * as knowledgeController from "../controllers/knowledge.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

const uploadDir = path.join(__dirname, "../../uploads/knowledge");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
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

router.get("/documents", knowledgeController.getDocuments);
router.post("/documents", upload.single("file"), knowledgeController.uploadDocument);
router.delete("/documents/:id", knowledgeController.deleteDocument);

export default router;
