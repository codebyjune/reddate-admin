import { Router } from "express";
import * as inboundController from "../controllers/inbound.controller";

const router: Router = Router();

// 获取入库单列表
router.get("/", inboundController.getInboundDeliveries);

// 获取单个入库单
router.get("/:id", inboundController.getInboundById);

// 创建入库单
router.post("/", inboundController.createInbound);

// 更新入库单
router.put("/:id", inboundController.updateInbound);

// 删除入库单
router.delete("/:id", inboundController.deleteInbound);

export default router;
