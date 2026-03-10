import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

// 公开路由
router.post("/register", register);
router.post("/login", login);

// 需要认证的路由
router.get("/profile", authMiddleware, getProfile);

export default router;
