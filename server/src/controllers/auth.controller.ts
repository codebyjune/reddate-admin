import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { generateToken } from "../lib/jwt";

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, name, phone } = req.body;

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "用户名已存在" });
    }

    // 检查是否是第一个用户（自动成为管理员）
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "user";

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        phone,
        role,
      },
    });

    // 生成 token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("注册失败:", error);
    res.status(500).json({ error: "注册失败" });
  }
};

// 登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    // 生成 token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ error: "登录失败" });
  }
};

// 获取当前用户信息
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "未登录" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    res.json(user);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({ error: "获取用户信息失败" });
  }
};
