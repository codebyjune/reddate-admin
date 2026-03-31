import { Router } from "express";
import * as contractController from "../controllers/contract.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

// 获取合同列表
router.get("/", contractController.getContracts);

// 获取单个合同
router.get("/:id", contractController.getContractById);

// 创建合同
router.post("/", contractController.createContract);

// 更新合同
router.put("/:id", contractController.updateContract);

// 删除合同
router.delete("/:id", contractController.deleteContract);

export default router;
