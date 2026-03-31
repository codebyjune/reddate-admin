import { Router } from "express";
import { getAvailableInventory, getAvailableByGrade, getSubstandardAvailableInventory } from "../controllers/inventory.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

// 获取所有等级的可销售库存
router.get("/available", getAvailableInventory);

// 获取单个等级的可销售库存
router.get("/available/:grade", getAvailableByGrade);

// 获取等外品可销售库存
router.get("/substandard-available", getSubstandardAvailableInventory);

export default router;
