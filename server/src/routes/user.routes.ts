import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller";

const router: Router = Router();

// 所有用户路由都需要认证和管理员权限
router.use(authMiddleware);
router.use(requireAdmin);

// 获取用户列表
router.get("/", getAllUsers);

// 更新用户角色
router.put("/:id/role", updateUserRole);

// 删除用户
router.delete("/:id", deleteUser);

export default router;
