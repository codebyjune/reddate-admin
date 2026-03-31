import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { parseId } from "../lib/utils";

// 等外品类型对应的固定规格(kg/件)
const SUBSTANDARD_SPECS: Record<string, number> = {
  变形: 12,
  裂口: 12,
  干条: 10,
  烂枣: 12,
};

// 获取等外品列表
export const getSubstandards = async (_req: Request, res: Response) => {
  try {
    const substandards = await prisma.substandardProduct.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(substandards);
  } catch (error) {
    console.error("获取等外品列表失败:", error);
    res.status(500).json({ error: "获取等外品列表失败" });
  }
};

// 获取单个等外品
export const getSubstandardById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const substandard = await prisma.substandardProduct.findUnique({
      where: { id },
    });

    if (!substandard) {
      return res.status(404).json({ error: "等外品记录不存在" });
    }

    res.json(substandard);
  } catch (error) {
    console.error("获取等外品失败:", error);
    res.status(500).json({ error: "获取等外品失败" });
  }
};

// 创建等外品
export const createSubstandard = async (req: Request, res: Response) => {
  try {
    const { substandardType, quantity, remark, ...rest } = req.body;

    // 获取固定规格
    const spec = SUBSTANDARD_SPECS[substandardType] || 12;
    const qty = Number(quantity);
    const weight = spec * qty;

    const substandard = await prisma.substandardProduct.create({
      data: {
        ...rest,
        substandardType,
        spec,
        quantity: qty,
        weight,
        remark: remark || null,
      },
    });

    res.status(201).json(substandard);
  } catch (error: any) {
    console.error("创建等外品失败:", error);
    res.status(500).json({ error: "创建等外品失败", detail: error?.message || String(error) });
  }
};

// 更新等外品
export const updateSubstandard = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const { substandardType, quantity, remark, createdAt, updatedAt, ...rest } = req.body;

    // 获取固定规格
    const spec = SUBSTANDARD_SPECS[substandardType] || 12;
    const qty = Number(quantity);
    const weight = spec * qty;

    const substandard = await prisma.substandardProduct.update({
      where: { id },
      data: {
        ...rest,
        substandardType,
        spec,
        quantity: qty,
        weight,
        remark: remark || null,
      },
    });

    res.json(substandard);
  } catch (error: any) {
    console.error("更新等外品失败:", error);
    res.status(500).json({ error: "更新等外品失败", detail: error?.message || String(error) });
  }
};

// 删除等外品
export const deleteSubstandard = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.substandardProduct.delete({
      where: { id },
    });
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除等外品失败:", error);
    res.status(500).json({ error: "删除等外品失败" });
  }
};
