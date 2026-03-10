import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "未登录" });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "token 已过期或无效" });
  }

  (req as any).user = payload;
  next();
};
