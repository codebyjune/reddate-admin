import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { parseId } from "../lib/utils";

// 获取入库单列表
export const getInboundDeliveries = async (_req: Request, res: Response) => {
  try {
    const deliveries = await prisma.inboundDelivery.findMany({
      include: { products: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(deliveries);
  } catch (error) {
    console.error("获取入库单列表失败:", error);
    res.status(500).json({ error: "获取入库单列表失败" });
  }
};

// 获取单个入库单
export const getInboundById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const delivery = await prisma.inboundDelivery.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!delivery) {
      return res.status(404).json({ error: "入库单不存在" });
    }

    res.json(delivery);
  } catch (error) {
    console.error("获取入库单失败:", error);
    res.status(500).json({ error: "获取入库单失败" });
  }
};

// 创建入库单
export const createInbound = async (req: Request, res: Response) => {
  try {
    const { products, createdAt, updatedAt, id, ...deliveryData } = req.body;

    // 过滤掉产品中不需要的字段，确保数值类型正确
    const cleanProducts = products?.map((p: any) => ({
      contractName: p.contractName,
      quantity: Number(p.quantity),
      netWeight: Number(p.netWeight),
      yieldRate: p.yieldRate ? Number(p.yieldRate) : null,
      lossRate: p.lossRate ? Number(p.lossRate) : null,
      moistureRate: p.moistureRate ? Number(p.moistureRate) : null,
      unitPrice: Number(p.unitPrice),
      remark: p.remark || null,
    }));

    const delivery = await prisma.inboundDelivery.create({
      data: {
        ...deliveryData,
        products: cleanProducts
          ? {
              create: cleanProducts,
            }
          : undefined,
      },
      include: { products: true },
    });

    res.status(201).json(delivery);
  } catch (error: any) {
    console.error("创建入库单失败:", error);
    res.status(500).json({ error: "创建入库单失败", detail: error?.message || String(error) });
  }
};

// 更新入库单
export const updateInbound = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    const { products, createdAt, updatedAt, ...deliveryData } = req.body;

    // 先删除原有的产品明细
    await prisma.inboundProduct.deleteMany({
      where: { deliveryId: id },
    });

    // 过滤并格式化产品数据
    const cleanProducts = products?.map((p: any) => ({
      contractName: p.contractName,
      quantity: Number(p.quantity),
      netWeight: Number(p.netWeight),
      yieldRate: p.yieldRate ? Number(p.yieldRate) : null,
      lossRate: p.lossRate ? Number(p.lossRate) : null,
      moistureRate: p.moistureRate ? Number(p.moistureRate) : null,
      unitPrice: Number(p.unitPrice),
      remark: p.remark || null,
    }));

    // 再更新入库单并创建新的产品明细
    const delivery = await prisma.inboundDelivery.update({
      where: { id },
      data: {
        ...deliveryData,
        products: cleanProducts
          ? {
              create: cleanProducts,
            }
          : undefined,
      },
      include: { products: true },
    });

    res.json(delivery);
  } catch (error: any) {
    console.error("更新入库单失败:", error);
    res.status(500).json({ error: "更新入库单失败", detail: error?.message || String(error) });
  }
};

// 删除入库单
export const deleteInbound = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    await prisma.inboundDelivery.delete({
      where: { id },
    });
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除入库单失败:", error);
    res.status(500).json({ error: "删除入库单失败" });
  }
};
