import { Router } from "express";
import * as substandardController from "../controllers/substandard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

// 获取等外品列表
router.get("/", substandardController.getSubstandards);

// 获取单个等外品
router.get("/:id", substandardController.getSubstandardById);

// 创建等外品
router.post("/", substandardController.createSubstandard);

// 更新等外品
router.put("/:id", substandardController.updateSubstandard);

// 删除等外品
router.delete("/:id", substandardController.deleteSubstandard);

export default router;
