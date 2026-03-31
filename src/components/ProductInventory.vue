<template>
  <div>
    <!-- 筛选区域：按成品等级筛选生产记录 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="productFilter">
        <el-form-item label="成品等级">
          <!-- 下拉选择等级，v-model 绑定筛选条件 -->
          <el-select
            v-model="productFilter.level"
            placeholder="全部等级"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="枣王" value="枣王" />
            <el-option label="超特" value="超特" />
            <el-option label="特级" value="特级" />
            <el-option label="一级" value="一级" />
            <el-option label="二级" value="二级" />
            <el-option label="三级" value="三级" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <!-- 点击筛选按钮，重新请求数据 -->
          <el-button type="primary" @click="applyProductFilter"
            >筛选</el-button
          >
          <!-- 点击重置按钮，清空条件并重新请求 -->
          <el-button @click="resetProductFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片：生产批次、总箱数、成品净重、可销售库存 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-blue-50">
          <div class="text-gray-500 text-sm">生产批次</div>
          <div class="text-2xl font-bold text-blue-600">
            {{ productStats.batches }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-green-50">
          <div class="text-gray-500 text-sm">总箱数</div>
          <div class="text-2xl font-bold text-green-600">
            {{ productStats.boxes }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-orange-50">
          <div class="text-gray-500 text-sm">成品净重(吨)</div>
          <div class="text-2xl font-bold text-orange-600">
            {{ formatTon(productStats.outputWeight) }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-cyan-50">
          <div class="text-gray-500 text-sm">可销售库存(件)</div>
          <div class="text-2xl font-bold text-cyan-600">
            {{ availableStats.totalAvailable }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成品等级库存表格：展示每个等级的生产/销售/库存情况 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <span class="font-medium">成品等级分布</span>
      </template>
      <el-table :data="inventoryData" stripe>
        <!-- 等级列：用不同颜色的标签显示 -->
        <el-table-column
          prop="gradeName"
          label="等级"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.gradeName)">{{
              row.gradeName
            }}</el-tag>
          </template>
        </el-table-column>
        <!-- 生产件数列 -->
        <el-table-column
          prop="produced"
          label="生产件数"
          width="120"
          align="center"
        />
        <!-- 已销售件数列：有销售量显示橙色，无销售显示灰色 -->
        <el-table-column
          prop="sold"
          label="已销售件数"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <span :class="row.sold > 0 ? 'text-orange-500' : 'text-gray-400'">{{
              row.sold || 0
            }}</span>
          </template>
        </el-table-column>
        <!-- 可销售库存件数列：有库存显示绿色标签，无库存显示灰色标签 -->
        <el-table-column
          prop="available"
          label="可销售库存件数"
          width="160"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.available > 0 ? 'success' : 'info'"
              size="small"
              >{{ row.available }}</el-tag
            >
          </template>
        </el-table-column>
        <!-- 生产重量列：保留两位小数 -->
        <el-table-column
          prop="producedWeight"
          label="生产重量(吨)"
          width="140"
          align="right"
        >
          <template #default="{ row }">{{
            formatTon(row.producedWeight)
          }}</template>
        </el-table-column>
        <!-- 已销售重量列：保留两位小数 -->
        <el-table-column
          prop="soldWeight"
          label="已销售重量(吨)"
          width="170"
          align="right"
        >
          <template #default="{ row }">{{
            formatTon(row.soldWeight)
          }}</template>
        </el-table-column>
        <!-- 可销售重量列：青色高亮，保留两位小数 -->
        <el-table-column
          prop="availableWeight"
          label="可销售重量(吨)"
          width="170"
          align="right"
        >
          <template #default="{ row }">
            <span class="text-cyan-600 font-medium">{{
              formatTon(row.availableWeight)
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 成品图表区域：左侧饼图展示等级分布，右侧折线图展示生产趋势 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header
            ><span class="font-medium">成品等级分布</span></template
          >
          <v-chart :option="productPieOption" autoresize style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header
            ><span class="font-medium">近7日生产趋势</span></template
          >
          <v-chart
            :option="productLineOption"
            autoresize
            style="height: 300px"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// ECharts 按需引入：渲染器、图表类型、组件
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import request from "@/utils/request";
import { generateTrend, formatTon } from "@/utils/format";

// 注册 ECharts 组件，缺了哪个对应图表功能就不生效
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

// 筛选条件：等级筛选（空字符串表示全部）
const productFilter = ref({ level: "" });

// 成品统计汇总数据
const productStats = ref({
  batches: 0,       // 生产批次数
  boxes: 0,         // 总箱数
  outputWeight: 0,  // 成品净重(kg)
  avgYieldRate: 0,  // 平均出成率
});

// 按等级汇总的数据，用于饼图展示
const productLevelData = ref<
  {
    level: string;        // 等级名称（中文）
    batches: number;      // 该等级批次数
    boxes: number;        // 该等级总箱数
    outputWeight: number; // 该等级总重量(kg)
    avgYieldRate: number; // 该等级平均出成率
  }[]
>([]);

// 生产趋势数据：每个日期对应的生产批次数
const productTrend = ref<{ date: string; count: number }[]>([]);

// 生产记录的类型定义（对应 /production 接口返回值）
interface ProductionRecord {
  id: number;
  date: string;           // 生产日期，如 "2026.03.28"
  batchNo: string;        // 批次号
  shift: string;          // 班次：day(白班)、night(夜班)
  grade: string;          // 产品等级枚举：KingGrade, Grade1 等
  spec: number;           // 规格(kg/件)
  quantity: number;       // 数量(件)
  weight: number;         // 重量(kg)
  yieldRate?: number;     // 出成率（可选，当前接口未返回）
  remark: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// 可销售库存项的类型定义
interface InventoryItem {
  grade: string;            // 等级（英文枚举，如 KingGrade）
  gradeName: string;        // 等级中文名（如 "枣王"）
  produced: number;         // 生产件数
  sold: number;             // 已销售件数
  available: number;        // 可销售库存件数 = produced - sold
  producedWeight: number;   // 生产总重量(kg)
  soldWeight: number;       // 已销售总重量(kg)
  availableWeight: number;  // 可销售重量(kg) = producedWeight - soldWeight
}
// 可销售库存数据（由后端 /inventory/available 接口计算）
const inventoryData = ref<InventoryItem[]>([]);
// 可销售库存汇总
const availableStats = ref({
  totalAvailable: 0,        // 总可销售件数
  totalAvailableWeight: 0,  // 总可销售重量(kg)
});

// 等级映射表：数据库存的英文枚举 → 前端显示的中文名
const gradeMap: Record<string, string> = {
  KingGrade: "枣王",
  SuperPremium: "超特",
  PremiumGrade: "特级",
  Grade1: "一级",
  Grade2: "二级",
  Grade3: "三级",
};

// 根据等级名称返回 Element Plus Tag 组件的颜色类型
const getLevelTagType = (level: string) => {
  const types: Record<string, string> = {
    枣王: "danger",   // 红色
    超特: "danger",   // 红色
    特级: "danger",   // 红色
    一级: "warning",  // 橙色
    二级: "success",  // 绿色
    三级: "info",     // 灰色
    统货: "",        // 默认蓝色
  };
  return types[level] || "";
};

// 点击筛选按钮：按当前筛选条件重新获取数据
const applyProductFilter = () => fetchProductData();
// 点击重置按钮：清空筛选条件后重新获取数据
const resetProductFilter = () => {
  productFilter.value.level = "";
  fetchProductData();
};

// 成品等级分布饼图配置
const productPieOption = computed(() => ({
  tooltip: {
    trigger: "item",                        // 鼠标悬浮在扇区上触发
    formatter: "{b}: {c}千克({d}%)",         // 显示格式：等级名: 重量kg (百分比%)
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "#eee",
    borderWidth: 1,
    textStyle: { color: "#333" },
  },
  legend: {
    orient: "vertical", // 图例竖排
    right: "5%",        // 靠右
    top: "center",      // 垂直居中
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 12,
    textStyle: { fontSize: 13 },
  },
  // 自定义配色方案
  color: [
    "#ff922b", "#fcc419", "#94d82d", "#51cf66",
    "#20c997", "#22b8cf", "#339af0", "#5c7cfa", "#845ef7",
  ],
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],    // 环形饼图：内圆40%，外圆70%
      center: ["40%", "50%"],    // 饼图中心位置
      avoidLabelOverlap: true,   // 避免标签重叠
      itemStyle: {
        borderRadius: 6,         // 扇区圆角
        borderColor: "#fff",     // 扇区间白色分隔线
        borderWidth: 2,
        shadowBlur: 10,          // 阴影效果
        shadowColor: "rgba(0,0,0,0.1)",
      },
      label: {
        show: true,
        formatter: "{b}\n{d}%",  // 标签显示：等级名 + 换行 + 百分比
        fontSize: 12,
        color: "#666",
      },
      labelLine: {
        show: true,
        length: 25,     // 标签线第一段长度
        length2: 15,    // 标签线第二段长度
        smooth: true,   // 平滑曲线
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,   // 高亮时更大的阴影
          shadowColor: "rgba(0,0,0,0.2)",
        },
        label: { fontSize: 14, fontWeight: "bold" }, // 高亮时标签放大加粗
      },
      // 数据源：从 productLevelData 中取等级名和重量
      data: productLevelData.value.map((l) => ({
        name: l.level,
        value: l.outputWeight,
      })),
    },
  ],
}));

// 近7日生产趋势折线图配置
const productLineOption = computed(() => ({
  tooltip: { trigger: "axis" },  // 鼠标悬浮在坐标轴上触发
  grid: { left: "10%", right: "5%", bottom: "15%", top: "10%" }, // 图表边距
  xAxis: { type: "category", data: productTrend.value.map((d) => d.date) }, // X轴：日期
  yAxis: { type: "value" },  // Y轴：数值
  series: [
    {
      name: "生产批次",
      type: "line",           // 折线图
      smooth: true,            // 平滑曲线
      areaStyle: { opacity: 0.3 }, // 填充区域半透明
      data: productTrend.value.map((d) => d.count),
      itemStyle: { color: "#67c23a" }, // 绿色折线
    },
  ],
}));

// 获取成品生产数据，计算各等级统计
const fetchProductData = async () => {
  try {
    // 请求所有生产记录
    const productions = await request.get<ProductionRecord[]>("/production");

    // 按等级汇总数据的中间结构
    const levelMap: Record<
      string,
      {
        batches: number;       // 批次数
        boxes: number;         // 箱数
        outputWeight: number;  // 重量
        yieldRates: number[];  // 出成率列表（用于计算平均值）
      }
    > = {};

    // 如果有筛选条件，先过滤出对应等级的记录；否则用全部记录
    const filteredProductions = productFilter.value.level
      ? productions.filter(
          (p) =>
            // gradeMap 把英文枚举转中文，再和筛选条件对比
            (gradeMap[p.grade] || p.grade || "统货") ===
            productFilter.value.level,
        )
      : productions;

    // 更新批次数为过滤后的数量
    productStats.value.batches = filteredProductions.length;

    // 遍历每条生产记录，按等级累加统计
    filteredProductions.forEach((p) => {
      const level = gradeMap[p.grade] || p.grade || "统货"; // 转中文等级名
      // 如果该等级还没有记录，初始化
      if (!levelMap[level])
        levelMap[level] = {
          batches: 0,
          boxes: 0,
          outputWeight: 0,
          yieldRates: [],
        };
      levelMap[level].batches++;                          // 批次 +1
      levelMap[level].boxes += p.quantity || 0;           // 箱数累加
      levelMap[level].outputWeight += p.weight || 0;      // 重量累加
      if (p.yieldRate) levelMap[level].yieldRates.push(p.yieldRate); // 收集出成率
    });


    // 计算总重量（用于算百分比）
    const totalWeight = Object.values(levelMap).reduce(
      (sum, l) => sum + l.outputWeight,
      0,
    );
    // 收集所有出成率（用于算全局平均）
    const allYieldRates = Object.values(levelMap).flatMap((l) => l.yieldRates);

    // 将 levelMap 转成数组，用于饼图和表格展示
    productLevelData.value = Object.entries(levelMap).map(([level, data]) => ({
      level,
      batches: data.batches,
      boxes: data.boxes,
      outputWeight: data.outputWeight,
      // 平均出成率 = 该等级所有出成率之和 / 条数
      avgYieldRate:
        data.yieldRates.length > 0
          ? data.yieldRates.reduce((a, b) => a + b, 0) / data.yieldRates.length
          : 0,
    }));

    // 更新汇总统计
    productStats.value.boxes = Object.values(levelMap).reduce(
      (sum, l) => sum + l.boxes,
      0,
    );
    productStats.value.outputWeight = totalWeight;
    // 全局平均出成率
    productStats.value.avgYieldRate =
      allYieldRates.length > 0
        ? allYieldRates.reduce((a, b) => a + b, 0) / allYieldRates.length
        : 0;

    // 生成近7日生产趋势（用未过滤的全部数据）
    generateTrend(productions, productTrend, "date");
  } catch (e) {
    console.error(e);
  }
};

// 获取可销售库存数据（由后端计算生产量 - 销售量）
const fetchInventoryData = async () => {
  try {
    const data = await request.get<InventoryItem[]>("/inventory/available");
    inventoryData.value = data;

    // 累加所有等级的可销售件数
    availableStats.value.totalAvailable = data.reduce(
      (sum, item) => sum + item.available,
      0,
    );
    // 累加所有等级的可销售重量
    availableStats.value.totalAvailableWeight = data.reduce(
      (sum, item) => sum + item.availableWeight,
      0,
    );
  } catch (e) {
    console.error("获取库存数据失败:", e);
  }
};

// 页面加载时同时获取生产数据和库存数据
onMounted(() => {
  fetchProductData();
  fetchInventoryData();
});
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}
</style>
