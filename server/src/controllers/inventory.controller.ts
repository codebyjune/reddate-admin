import { Request, Response } from "express";
import prisma from "../lib/prisma";

// 等级映射
const gradeMap: Record<string, string> = {
  KingGrade: "枣王",
  SuperPremium: "超特",
  PremiumGrade: "特级",
  Grade1: "一级",
  Grade2: "二级",
  Grade3: "三级",
};

// 获取可销售库存（按等级）
export const getAvailableInventory = async (_req: Request, res: Response) => {
  try {
    // 获取所有生产记录
    const productionRecords = await prisma.productionRecord.findMany({
      select: { grade: true, quantity: true, weight: true },
    });

    // 获取所有销售记录
    const salesRecords = await prisma.salesRecord.findMany({
      select: { productLevel: true, quantity: true, netWeight: true },
    });

    // 按等级汇总生产数量
    const productionByGrade: Record<string, { quantity: number; weight: number }> = {};
    productionRecords.forEach((r) => {
      if (!productionByGrade[r.grade]) {
        productionByGrade[r.grade] = { quantity: 0, weight: 0 };
      }
      productionByGrade[r.grade].quantity += r.quantity || 0;
      productionByGrade[r.grade].weight += r.weight || 0;
    });

    // 按等级汇总销售数量
    const salesByGrade: Record<string, { quantity: number; weight: number }> = {};
    salesRecords.forEach((r) => {
      const grade = r.productLevel || "Grade1";
      if (!salesByGrade[grade]) {
        salesByGrade[grade] = { quantity: 0, weight: 0 };
      }
      salesByGrade[grade].quantity += r.quantity || 0;
      salesByGrade[grade].weight += r.netWeight || 0;
    });

    // 计算可销售库存
    const allGrades = new Set([
      ...Object.keys(productionByGrade),
      ...Object.keys(salesByGrade),
    ]);

    const inventory: Array<{
      grade: string;
      gradeName: string;
      produced: number;
      sold: number;
      available: number;
      producedWeight: number;
      soldWeight: number;
      availableWeight: number;
    }> = [];

    allGrades.forEach((grade) => {
      const produced = productionByGrade[grade]?.quantity || 0;
      const sold = salesByGrade[grade]?.quantity || 0;
      const producedWeight = productionByGrade[grade]?.weight || 0;
      const soldWeight = salesByGrade[grade]?.weight || 0;

      inventory.push({
        grade,
        gradeName: gradeMap[grade] || grade,
        produced,
        sold,
        available: produced - sold,
        producedWeight,
        soldWeight,
        availableWeight: producedWeight - soldWeight,
      });
    });

    // 按等级排序
    const gradeOrder = ["KingGrade", "SuperPremium", "PremiumGrade", "Grade1", "Grade2", "Grade3"];
    inventory.sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));

    res.json(inventory);
  } catch (error) {
    console.error("获取可销售库存失败:", error);
    res.status(500).json({ error: "获取可销售库存失败" });
  }
};

// 获取单个等级的可销售库存
export const getAvailableByGrade = async (req: Request, res: Response) => {
  try {
    const { grade } = req.params;
    const gradeStr = Array.isArray(grade) ? grade[0] : grade;

    if (!gradeStr) {
      return res.status(400).json({ error: "缺少等级参数" });
    }

    // 获取该等级的生产数量
    const productionRecords = await prisma.productionRecord.findMany({
      where: { grade: gradeStr },
      select: { quantity: true, weight: true },
    });

    // 获取该等级的销售数量
    const salesRecords = await prisma.salesRecord.findMany({
      where: { productLevel: gradeStr },
      select: { quantity: true, netWeight: true },
    });

    const produced = productionRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const sold = salesRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const producedWeight = productionRecords.reduce((sum, r) => sum + (r.weight || 0), 0);
    const soldWeight = salesRecords.reduce((sum, r) => sum + (r.netWeight || 0), 0);

    res.json({
      grade: gradeStr,
      gradeName: gradeMap[gradeStr] || gradeStr,
      produced,
      sold,
      available: produced - sold,
      producedWeight,
      soldWeight,
      availableWeight: producedWeight - soldWeight,
    });
  } catch (error) {
    console.error("获取库存失败:", error);
    res.status(500).json({ error: "获取库存失败" });
  }
};

// 获取等外品可销售库存（按类型）
export const getRejectAvailableInventory = async (_req: Request, res: Response) => {
  try {
    // 获取所有等外品生产记录
    const rejectRecords = await prisma.rejectProduct.findMany({
      select: { rejectType: true, quantity: true, weight: true },
    });

    // 获取所有等外品销售记录（productCategory = 'reject'）
    const salesRecords = await prisma.salesRecord.findMany({
      where: { productCategory: "reject" },
      select: { productLevel: true, quantity: true, netWeight: true },
    });

    // 按类型汇总生产数量
    const productionByType: Record<string, { quantity: number; weight: number }> = {};
    rejectRecords.forEach((r) => {
      if (!productionByType[r.rejectType]) {
        productionByType[r.rejectType] = { quantity: 0, weight: 0 };
      }
      productionByType[r.rejectType].quantity += r.quantity || 0;
      productionByType[r.rejectType].weight += r.weight || 0;
    });

    // 按类型汇总销售数量
    const salesByType: Record<string, { quantity: number; weight: number }> = {};
    salesRecords.forEach((r) => {
      const type = r.productLevel || "变形";
      if (!salesByType[type]) {
        salesByType[type] = { quantity: 0, weight: 0 };
      }
      salesByType[type].quantity += r.quantity || 0;
      salesByType[type].weight += r.netWeight || 0;
    });

    // 计算可销售库存
    const allTypes = new Set([
      ...Object.keys(productionByType),
      ...Object.keys(salesByType),
      "变形", "裂口", "干条", "烂枣", // 确保所有类型都有
    ]);

    const inventory: Array<{
      rejectType: string;
      typeName: string;
      produced: number;
      sold: number;
      available: number;
      producedWeight: number;
      soldWeight: number;
      availableWeight: number;
    }> = [];

    allTypes.forEach((type) => {
      const produced = productionByType[type]?.quantity || 0;
      const sold = salesByType[type]?.quantity || 0;
      const producedWeight = productionByType[type]?.weight || 0;
      const soldWeight = salesByType[type]?.weight || 0;

      inventory.push({
        rejectType: type,
        typeName: type,
        produced,
        sold,
        available: produced - sold,
        producedWeight,
        soldWeight,
        availableWeight: producedWeight - soldWeight,
      });
    });

    // 按类型排序
    const typeOrder = ["变形", "裂口", "干条", "烂枣"];
    inventory.sort((a, b) => typeOrder.indexOf(a.rejectType) - typeOrder.indexOf(b.rejectType));

    res.json(inventory);
  } catch (error) {
    console.error("获取等外品库存失败:", error);
    res.status(500).json({ error: "获取等外品库存失败" });
  }
};
