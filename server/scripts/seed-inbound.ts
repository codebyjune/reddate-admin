import prisma from "../src/lib/prisma";

// 模拟入库送货单数据
const mockDeliveries = [
  {
    deliveryDate: "2026-03-03",
    deliveryNo: "RK-20260303-001",
    licensePlate: "新A12345",
    driver: "张三",
    driverPhone: "13800138001",
    origin: "新疆阿克苏",
    sender: "李农户",
    senderPhone: "13900139001",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "李农户",
    products: [
      { contractName: "2026年红枣采购合同-001", quantity: 50, netWeight: 12.5, yieldRate: 85, lossRate: 5, moistureRate: 15, unitPrice: 8.5, remark: "优质红枣" },
      { contractName: "2026年红枣采购合同-001", quantity: 30, netWeight: 11.8, yieldRate: 82, lossRate: 6, moistureRate: 16, unitPrice: 8.0, remark: "" },
    ],
  },
  {
    deliveryDate: "2026-03-04",
    deliveryNo: "RK-20260304-001",
    licensePlate: "新B67890",
    driver: "李四",
    driverPhone: "13800138002",
    origin: "新疆喀什",
    sender: "王农户",
    senderPhone: "13900139002",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "王农户",
    products: [
      { contractName: "2026年红枣采购合同-002", quantity: 80, netWeight: 13.2, yieldRate: 88, lossRate: 4, moistureRate: 14, unitPrice: 9.0, remark: "特级红枣" },
    ],
  },
  {
    deliveryDate: "2026-03-05",
    deliveryNo: "RK-20260305-001",
    licensePlate: "新C11111",
    driver: "王五",
    driverPhone: "13800138003",
    origin: "新疆和田",
    sender: "赵农户",
    senderPhone: "13900139003",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "赵农户",
    products: [
      { contractName: "2026年红枣采购合同-003", quantity: 100, netWeight: 12.0, yieldRate: 80, lossRate: 7, moistureRate: 18, unitPrice: 7.5, remark: "普通红枣" },
      { contractName: "2026年红枣采购合同-003", quantity: 40, netWeight: 11.5, yieldRate: 78, lossRate: 8, moistureRate: 19, unitPrice: 7.0, remark: "" },
    ],
  },
  {
    deliveryDate: "2026-03-06",
    deliveryNo: "RK-20260306-001",
    licensePlate: "新D22222",
    driver: "赵六",
    driverPhone: "13800138004",
    origin: "新疆阿克苏",
    sender: "钱农户",
    senderPhone: "13900139004",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "钱农户",
    products: [
      { contractName: "2026年红枣采购合同-004", quantity: 60, netWeight: 12.8, yieldRate: 86, lossRate: 5, moistureRate: 15, unitPrice: 8.8, remark: "一级红枣" },
    ],
  },
  {
    deliveryDate: "2026-03-07",
    deliveryNo: "RK-20260307-001",
    licensePlate: "新E33333",
    driver: "孙七",
    driverPhone: "13800138005",
    origin: "新疆喀什",
    sender: "孙农户",
    senderPhone: "13900139005",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "孙农户",
    products: [
      { contractName: "2026年红枣采购合同-005", quantity: 70, netWeight: 13.0, yieldRate: 87, lossRate: 4, moistureRate: 14, unitPrice: 8.9, remark: "" },
      { contractName: "2026年红枣采购合同-005", quantity: 25, netWeight: 12.2, yieldRate: 83, lossRate: 6, moistureRate: 16, unitPrice: 8.2, remark: "次级红枣" },
    ],
  },
  {
    deliveryDate: "2026-03-08",
    deliveryNo: "RK-20260308-001",
    licensePlate: "新F44444",
    driver: "周八",
    driverPhone: "13800138006",
    origin: "新疆和田",
    sender: "周农户",
    senderPhone: "13900139006",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "周农户",
    products: [
      { contractName: "2026年红枣采购合同-006", quantity: 90, netWeight: 12.4, yieldRate: 84, lossRate: 5, moistureRate: 15, unitPrice: 8.3, remark: "" },
    ],
  },
  {
    deliveryDate: "2026-03-09",
    deliveryNo: "RK-20260309-001",
    licensePlate: "新G55555",
    driver: "吴九",
    driverPhone: "13800138007",
    origin: "新疆阿克苏",
    sender: "吴农户",
    senderPhone: "13900139007",
    destination: "河北沧州仓库",
    receiver: "王仓管",
    purchaseManager: "赵采购",
    confirmSender: "吴农户",
    products: [
      { contractName: "2026年红枣采购合同-007", quantity: 55, netWeight: 13.5, yieldRate: 89, lossRate: 3, moistureRate: 13, unitPrice: 9.5, remark: "优质大枣" },
      { contractName: "2026年红枣采购合同-007", quantity: 35, netWeight: 12.6, yieldRate: 85, lossRate: 5, moistureRate: 15, unitPrice: 8.6, remark: "" },
    ],
  },
];

async function main() {
  console.log("开始添加模拟入库数据...");

  // 先清空现有数据
  await prisma.inboundProduct.deleteMany();
  await prisma.inboundDelivery.deleteMany();
  console.log("已清空现有入库数据");

  // 添加模拟数据
  for (const delivery of mockDeliveries) {
    const { products, ...deliveryData } = delivery;
    await prisma.inboundDelivery.create({
      data: {
        ...deliveryData,
        products: {
          create: products,
        },
      },
    });
    console.log(`已创建入库单: ${delivery.deliveryNo}`);
  }

  // 统计结果
  const totalDeliveries = await prisma.inboundDelivery.count();
  const totalProducts = await prisma.inboundProduct.count();
  const totalBoxes = await prisma.inboundProduct.aggregate({
    _sum: { quantity: true },
  });
  const totalWeight = await prisma.inboundProduct.aggregate({
    _sum: { netWeight: true },
  });

  console.log("\n===== 模拟数据统计 =====");
  console.log(`入库单数量: ${totalDeliveries}`);
  console.log(`产品明细数量: ${totalProducts}`);
  console.log(`总箱数: ${totalBoxes._sum.quantity || 0} 箱`);
  console.log(`总净重: ${((totalWeight._sum.netWeight || 0) * (totalBoxes._sum.quantity || 0)).toFixed(2)} kg`);
  console.log("========================");
}

main()
  .catch((e) => {
    console.error("添加模拟数据失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
