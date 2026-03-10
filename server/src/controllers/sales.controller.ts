import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { parseId } from "../lib/utils";

// 获取销售记录列表
export const getSalesRecords = async (_req: Request, res: Response) => {
  try {
    const records = await prisma.salesRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (error) {
    console.error("获取销售记录列表失败:", error);
    res.status(500).json({ error: "获取销售记录列表失败" });
  }
};

// 获取单个销售记录
export const getSalesRecordById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const record = await prisma.salesRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({ error: "销售记录不存在" });
    }

    res.json(record);
  } catch (error) {
    console.error("获取销售记录失败:", error);
    res.status(500).json({ error: "获取销售记录失败" });
  }
};

// 创建销售记录
export const createSalesRecord = async (req: Request, res: Response) => {
  try {
    const record = await prisma.salesRecord.create({
      data: req.body,
    });
    res.status(201).json(record);
  } catch (error) {
    console.error("创建销售记录失败:", error);
    res.status(500).json({ error: "创建销售记录失败" });
  }
};

// 更新销售记录
export const updateSalesRecord = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const record = await prisma.salesRecord.update({
      where: { id },
      data: req.body,
    });
    res.json(record);
  } catch (error) {
    console.error("更新销售记录失败:", error);
    res.status(500).json({ error: "更新销售记录失败" });
  }
};

// 删除销售记录
export const deleteSalesRecord = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.salesRecord.delete({
      where: { id },
    });
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除销售记录失败:", error);
    res.status(500).json({ error: "删除销售记录失败" });
  }
};
