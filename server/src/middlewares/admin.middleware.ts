import { Request, Response, NextFunction } from "express";

// 管理员权限中间件
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: "未登录" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ error: "无权限访问" });
  }

  next();
};
