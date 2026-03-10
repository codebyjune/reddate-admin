import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { parseId } from "../lib/utils";

// 获取合同列表
export const getContracts = async (_req: Request, res: Response) => {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(contracts);
  } catch (error) {
    console.error("获取合同列表失败:", error);
    res.status(500).json({ error: "获取合同列表失败" });
  }
};

// 获取单个合同
export const getContractById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return res.status(404).json({ error: "合同不存在" });
    }

    res.json(contract);
  } catch (error) {
    console.error("获取合同失败:", error);
    res.status(500).json({ error: "获取合同失败" });
  }
};

// 创建合同
export const createContract = async (req: Request, res: Response) => {
  try {
    const contract = await prisma.contract.create({
      data: req.body,
    });
    res.status(201).json(contract);
  } catch (error) {
    console.error("创建合同失败:", error);
    res.status(500).json({ error: "创建合同失败" });
  }
};

// 更新合同
export const updateContract = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const contract = await prisma.contract.update({
      where: { id },
      data: req.body,
    });
    res.json(contract);
  } catch (error) {
    console.error("更新合同失败:", error);
    res.status(500).json({ error: "更新合同失败" });
  }
};

// 删除合同
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.contract.delete({
      where: { id },
    });
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除合同失败:", error);
    res.status(500).json({ error: "删除合同失败" });
  }
};
