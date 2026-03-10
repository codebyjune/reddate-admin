import { Router } from "express";
import { getAvailableInventory, getAvailableByGrade, getRejectAvailableInventory } from "../controllers/inventory.controller";

const router: Router = Router();

// 获取所有等级的可销售库存
router.get("/available", getAvailableInventory);

// 获取单个等级的可销售库存
router.get("/available/:grade", getAvailableByGrade);

// 获取等外品可销售库存
router.get("/reject-available", getRejectAvailableInventory);

export default router;
