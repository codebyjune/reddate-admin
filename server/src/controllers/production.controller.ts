import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { parseId } from "../lib/utils";

// 获取生产记录列表
export const getProductions = async (_req: Request, res: Response) => {
  try {
    const productions = await prisma.productionRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(productions);
  } catch (error) {
    console.error("获取生产记录列表失败:", error);
    res.status(500).json({ error: "获取生产记录列表失败" });
  }
};

// 获取单个生产记录
export const getProductionById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const production = await prisma.productionRecord.findUnique({
      where: { id },
    });

    if (!production) {
      return res.status(404).json({ error: "生产记录不存在" });
    }

    res.json(production);
  } catch (error) {
    console.error("获取生产记录失败:", error);
    res.status(500).json({ error: "获取生产记录失败" });
  }
};

// 创建生产记录
export const createProduction = async (req: Request, res: Response) => {
  try {
    const production = await prisma.productionRecord.create({
      data: req.body,
    });
    res.status(201).json(production);
  } catch (error) {
    console.error("创建生产记录失败:", error);
    res.status(500).json({ error: "创建生产记录失败" });
  }
};

// 更新生产记录
export const updateProduction = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const production = await prisma.productionRecord.update({
      where: { id },
      data: req.body,
    });
    res.json(production);
  } catch (error) {
    console.error("更新生产记录失败:", error);
    res.status(500).json({ error: "更新生产记录失败" });
  }
};

// 删除生产记录
export const deleteProduction = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.productionRecord.delete({
      where: { id },
    });
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除生产记录失败:", error);
    res.status(500).json({ error: "删除生产记录失败" });
  }
};
