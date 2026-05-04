import { Router } from "express";
import * as aiController from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/chat", authMiddleware, aiController.chat);

export default router;
