import { Request, Response } from "express";
import prisma from "../lib/prisma";

// 获取所有用户列表
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ error: "获取用户列表失败" });
  }
};

// 更新用户角色
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const userId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);

    // 验证角色值
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ error: "无效的角色类型" });
    }

    // 不能修改自己的角色
    const currentUserId = (req as any).user?.userId;
    if (userId === currentUserId) {
      return res.status(400).json({ error: "不能修改自己的角色" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("更新用户角色失败:", error);
    res.status(500).json({ error: "更新用户角色失败" });
  }
};

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);

    // 不能删除自己
    const currentUserId = (req as any).user?.userId;
    if (userId === currentUserId) {
      return res.status(400).json({ error: "不能删除自己的账户" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除用户失败:", error);
    res.status(500).json({ error: "删除用户失败" });
  }
};
