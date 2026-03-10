import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { parseId } from "../lib/utils";

// 等外品类型对应的固定规格(kg/件)
const REJECT_SPECS: Record<string, number> = {
  变形: 12,
  裂口: 12,
  干条: 10,
  烂枣: 12,
};

// 获取等外品列表
export const getRejects = async (_req: Request, res: Response) => {
  try {
    const rejects = await prisma.rejectProduct.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(rejects);
  } catch (error) {
    console.error("获取等外品列表失败:", error);
    res.status(500).json({ error: "获取等外品列表失败" });
  }
};

// 获取单个等外品
export const getRejectById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const reject = await prisma.rejectProduct.findUnique({
      where: { id },
    });

    if (!reject) {
      return res.status(404).json({ error: "等外品记录不存在" });
    }

    res.json(reject);
  } catch (error) {
    console.error("获取等外品失败:", error);
    res.status(500).json({ error: "获取等外品失败" });
  }
};

// 创建等外品
export const createReject = async (req: Request, res: Response) => {
  try {
    const { rejectType, quantity, remark, ...rest } = req.body;

    // 获取固定规格
    const spec = REJECT_SPECS[rejectType] || 12;
    const qty = Number(quantity);
    const weight = spec * qty;

    const reject = await prisma.rejectProduct.create({
      data: {
        ...rest,
        rejectType,
        spec,
        quantity: qty,
        weight,
        remark: remark || null,
      },
    });

    res.status(201).json(reject);
  } catch (error: any) {
    console.error("创建等外品失败:", error);
    res.status(500).json({ error: "创建等外品失败", detail: error?.message || String(error) });
  }
};

// 更新等外品
export const updateReject = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const { rejectType, quantity, remark, createdAt, updatedAt, ...rest } = req.body;

    // 获取固定规格
    const spec = REJECT_SPECS[rejectType] || 12;
    const qty = Number(quantity);
    const weight = spec * qty;

    const reject = await prisma.rejectProduct.update({
      where: { id },
      data: {
        ...rest,
        rejectType,
        spec,
        quantity: qty,
        weight,
        remark: remark || null,
      },
    });

    res.json(reject);
  } catch (error: any) {
    console.error("更新等外品失败:", error);
    res.status(500).json({ error: "更新等外品失败", detail: error?.message || String(error) });
  }
};

// 删除等外品
export const deleteReject = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.rejectProduct.delete({
      where: { id },
    });
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除等外品失败:", error);
    res.status(500).json({ error: "删除等外品失败" });
  }
};
