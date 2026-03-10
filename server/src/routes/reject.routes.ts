import { Router } from "express";
import * as rejectController from "../controllers/reject.controller";

const router: Router = Router();

// 获取等外品列表
router.get("/", rejectController.getRejects);

// 获取单个等外品
router.get("/:id", rejectController.getRejectById);

// 创建等外品
router.post("/", rejectController.createReject);

// 更新等外品
router.put("/:id", rejectController.updateReject);

// 删除等外品
router.delete("/:id", rejectController.deleteReject);

export default router;
