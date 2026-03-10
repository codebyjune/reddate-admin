import { Router } from "express";
import * as salesController from "../controllers/sales.controller";

const router: Router = Router();

// 获取销售记录列表
router.get("/", salesController.getSalesRecords);

// 获取单个销售记录
router.get("/:id", salesController.getSalesRecordById);

// 创建销售记录
router.post("/", salesController.createSalesRecord);

// 更新销售记录
router.put("/:id", salesController.updateSalesRecord);

// 删除销售记录
router.delete("/:id", salesController.deleteSalesRecord);

export default router;
