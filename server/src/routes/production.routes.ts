import { Router } from "express";
import * as productionController from "../controllers/production.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

// 获取生产记录列表
router.get("/", productionController.getProductions);

// 获取单个生产记录
router.get("/:id", productionController.getProductionById);

// 创建生产记录
router.post("/", productionController.createProduction);

// 更新生产记录
router.put("/:id", productionController.updateProduction);

// 删除生产记录
router.delete("/:id", productionController.deleteProduction);

export default router;
