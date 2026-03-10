<template>
  <div class="p-4">
    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="mb-4">
      <el-tab-pane label="原料库存" name="material">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Box /></el-icon>
            原料库存
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="成品库存" name="product">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Goods /></el-icon>
            成品库存
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 原料库存内容 -->
    <div v-if="activeTab === 'material'">
      <!-- 原料统计卡片 -->
      <el-row :gutter="20" class="mb-6">
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card bg-blue-50">
            <div class="text-gray-500 text-sm">入库批次</div>
            <div class="text-2xl font-bold text-blue-600">{{ materialStats.batches }}</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card bg-green-50">
            <div class="text-gray-500 text-sm">总箱数</div>
            <div class="text-2xl font-bold text-green-600">{{ materialStats.boxes }}</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card bg-orange-50">
            <div class="text-gray-500 text-sm">总净重(吨)</div>
            <div class="text-2xl font-bold text-orange-600">{{ (materialStats.netWeight / 1000).toFixed(2) }}</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card bg-purple-50">
            <div class="text-gray-500 text-sm">合同数量</div>
            <div class="text-2xl font-bold text-purple-600">{{ materialStats.contracts }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 原料入库趋势图 -->
      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">入库趋势</span>
            <el-radio-group v-model="trendDays" size="small" @change="fetchMaterialData">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="15">15天</el-radio-button>
              <el-radio-button :value="30">1个月</el-radio-button>
              <el-radio-button :value="90">1季度</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <v-chart :option="materialLineOption" autoresize style="height: 300px" />
      </el-card>
    </div>

    <!-- 成品库存内容 -->
    <div v-if="activeTab === 'product'">
      <!-- 子Tab切换：等级内产品 / 等外品 -->
      <el-tabs v-model="productSubTab" class="mb-4">
        <el-tab-pane label="等级内产品" name="normal" />
        <el-tab-pane label="等外品" name="reject" />
      </el-tabs>

      <!-- 等级内产品 -->
      <div v-if="productSubTab === 'normal'">
        <!-- 筛选区域 -->
        <el-card shadow="never" class="mb-4">
          <el-form :inline="true" :model="productFilter">
            <el-form-item label="成品等级">
              <el-select v-model="productFilter.level" placeholder="全部等级" clearable style="width: 150px">
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
              <el-button type="primary" @click="applyProductFilter">筛选</el-button>
              <el-button @click="resetProductFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 成品统计卡片 -->
        <el-row :gutter="20" class="mb-6">
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-blue-50">
              <div class="text-gray-500 text-sm">生产批次</div>
              <div class="text-2xl font-bold text-blue-600">{{ productStats.batches }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-green-50">
              <div class="text-gray-500 text-sm">总箱数</div>
              <div class="text-2xl font-bold text-green-600">{{ productStats.boxes }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-orange-50">
              <div class="text-gray-500 text-sm">成品净重(kg)</div>
              <div class="text-2xl font-bold text-orange-600">{{ productStats.outputWeight.toFixed(2) }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-cyan-50">
              <div class="text-gray-500 text-sm">可销售库存(件)</div>
              <div class="text-2xl font-bold text-cyan-600">{{ availableStats.totalAvailable }}</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 成品等级库存表格 -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <span class="font-medium">成品等级分布</span>
          </template>
          <el-table :data="inventoryData" stripe>
            <el-table-column prop="gradeName" label="等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelTagType(row.gradeName)">{{ row.gradeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="produced" label="生产件数" width="100" align="center" />
            <el-table-column prop="sold" label="已销售件数" width="110" align="center">
              <template #default="{ row }">
                <span :class="row.sold > 0 ? 'text-orange-500' : 'text-gray-400'">{{ row.sold || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="available" label="可销售库存件数" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.available > 0 ? 'success' : 'info'" size="small">{{ row.available }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="producedWeight" label="生产重量(kg)" width="120" align="right">
              <template #default="{ row }">{{ row.producedWeight.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="soldWeight" label="已销售重量(kg)" width="130" align="right">
              <template #default="{ row }">{{ row.soldWeight.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="availableWeight" label="可销售重量(kg)" width="130" align="right">
              <template #default="{ row }">
                <span class="text-cyan-600 font-medium">{{ row.availableWeight.toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 成品图表 -->
        <el-row :gutter="20">
          <el-col :xs="24" :lg="12">
            <el-card shadow="never">
              <template #header><span class="font-medium">成品等级分布</span></template>
              <v-chart :option="productPieOption" autoresize style="height: 300px" />
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="never">
              <template #header><span class="font-medium">近7日生产趋势</span></template>
              <v-chart :option="productLineOption" autoresize style="height: 300px" />
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 等外品 -->
      <div v-if="productSubTab === 'reject'">
        <!-- 筛选区域 -->
        <el-card shadow="never" class="mb-4">
          <el-form :inline="true" :model="rejectFilter">
            <el-form-item label="等外品类型">
              <el-select v-model="rejectFilter.type" placeholder="全部类型" clearable style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="变形" value="变形" />
                <el-option label="裂口" value="裂口" />
                <el-option label="干条" value="干条" />
                <el-option label="烂枣" value="烂枣" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源等级">
              <el-select v-model="rejectFilter.sourceGrade" placeholder="全部等级" clearable style="width: 150px">
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
              <el-button type="primary" @click="applyRejectFilter">筛选</el-button>
              <el-button @click="resetRejectFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 等外品统计卡片 -->
        <el-row :gutter="20" class="mb-6">
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-gray-50">
              <div class="text-gray-500 text-sm">总记录数</div>
              <div class="text-2xl font-bold text-gray-600">{{ rejectStats.records }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-amber-50">
              <div class="text-gray-500 text-sm">总件数</div>
              <div class="text-2xl font-bold text-amber-600">{{ rejectStats.quantity }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-rose-50">
              <div class="text-gray-500 text-sm">总重量(kg)</div>
              <div class="text-2xl font-bold text-rose-600">{{ rejectStats.weight.toFixed(2) }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card shadow="hover" class="stat-card bg-indigo-50">
              <div class="text-gray-500 text-sm">总重量(吨)</div>
              <div class="text-2xl font-bold text-indigo-600">{{ (rejectStats.weight / 1000).toFixed(3) }}</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 等外品类型分布表格 -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <span class="font-medium">等外品类型分布</span>
          </template>
          <el-table :data="rejectTypeData" stripe>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="records" label="记录数" width="100" />
            <el-table-column prop="quantity" label="件数" width="100" />
            <el-table-column prop="spec" label="规格(kg/件)" width="120" />
            <el-table-column prop="weight" label="重量(kg)" width="120">
              <template #default="{ row }">{{ row.weight.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比">
              <template #default="{ row }">
                <el-progress :percentage="row.percentage" :stroke-width="15" :color="'#e6a23c'" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 等外品图表 -->
        <el-row :gutter="20">
          <el-col :xs="24" :lg="12">
            <el-card shadow="never">
              <template #header><span class="font-medium">等外品类型分布</span></template>
              <v-chart :option="rejectPieOption" autoresize style="height: 300px" />
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="never">
              <template #header><span class="font-medium">等外品来源等级分布</span></template>
              <v-chart :option="rejectSourcePieOption" autoresize style="height: 300px" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import VChart from "vue-echarts";
import { Box, Goods } from "@element-plus/icons-vue";

use([CanvasRenderer, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

const activeTab = ref("product");
const productSubTab = ref("normal");

// 成品筛选 - 使用新的等级体系
const productFilter = ref({ level: "" });

// 等外品筛选
const rejectFilter = ref({ type: "", sourceGrade: "" });

// 等外品统计
const rejectStats = ref({ records: 0, quantity: 0, weight: 0 });
const rejectTypeData = ref<{ type: string; records: number; quantity: number; spec: number; weight: number; percentage: number }[]>([]);
const rejectAllData = ref<any[]>([]);

// 原料统计
const materialStats = ref({ batches: 0, boxes: 0, netWeight: 0, contracts: 0 });
const materialTrend = ref<{ date: string; count: number }[]>([]);
const trendDays = ref(7);

// 成品统计
const productStats = ref({ batches: 0, boxes: 0, outputWeight: 0, avgYieldRate: 0 });
const productLevelData = ref<{ level: string; batches: number; boxes: number; outputWeight: number; avgYieldRate: number; percentage: number }[]>([]);
const productTrend = ref<{ date: string; count: number }[]>([]);

// 可销售库存
interface InventoryItem {
  grade: string;
  gradeName: string;
  produced: number;
  sold: number;
  available: number;
  producedWeight: number;
  soldWeight: number;
  availableWeight: number;
}
const inventoryData = ref<InventoryItem[]>([]);
const availableStats = ref({ totalAvailable: 0, totalAvailableWeight: 0 });

// 等级标签颜色
const getLevelTagType = (level: string) => {
  const types: Record<string, string> = { '特级': 'danger', '一级': 'warning', '二级': 'success', '三级': 'info', '统货': '' };
  return types[level] || '';
};

// 成品筛选
const applyProductFilter = () => fetchProductData();
const resetProductFilter = () => { productFilter.value.level = ""; fetchProductData(); };

// 原料图表配置
const materialLineOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: "10%", right: "5%", bottom: "15%", top: "10%" },
  xAxis: { type: "category", data: materialTrend.value.map(d => d.date) },
  yAxis: { type: "value" },
  series: [{ name: "入库批次", type: "line", smooth: true, areaStyle: { opacity: 0.3 }, data: materialTrend.value.map(d => d.count) }],
}));

// 成品图表配置
const productPieOption = computed(() => ({
  tooltip: { trigger: "item", formatter: "{b}: {c}kg ({d}%)" },
  legend: { orient: "vertical", left: "left" },
  series: [{ type: "pie", radius: "50%", data: productLevelData.value.map(l => ({ name: l.level, value: l.outputWeight })) }],
}));

const productLineOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: "10%", right: "5%", bottom: "15%", top: "10%" },
  xAxis: { type: "category", data: productTrend.value.map(d => d.date) },
  yAxis: { type: "value" },
  series: [{ name: "生产批次", type: "line", smooth: true, areaStyle: { opacity: 0.3 }, data: productTrend.value.map(d => d.count), itemStyle: { color: '#67c23a' } }],
}));

// 等外品图表配置
const rejectPieOption = computed(() => ({
  tooltip: { trigger: "item", formatter: "{b}: {c}kg ({d}%)" },
  legend: { orient: "vertical", left: "left" },
  series: [{ type: "pie", radius: "50%", data: rejectTypeData.value.map(r => ({ name: r.type, value: r.weight })), itemStyle: { color: '#e6a23c' } }],
}));

const rejectSourcePieOption = computed(() => {
  // 按来源等级统计
  const sourceMap: Record<string, number> = {};
  rejectAllData.value.forEach((r: any) => {
    const grade = r.sourceGrade || '未知';
    sourceMap[grade] = (sourceMap[grade] || 0) + (r.weight || 0);
  });
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c}kg ({d}%)" },
    legend: { orient: "vertical", left: "left" },
    series: [{ type: "pie", radius: "50%", data: Object.entries(sourceMap).map(([name, value]) => ({ name, value })) }],
  };
});

// 等外品筛选
const applyRejectFilter = () => processRejectData();
const resetRejectFilter = () => {
  rejectFilter.value.type = "";
  rejectFilter.value.sourceGrade = "";
  processRejectData();
};

// 获取等外品数据
const fetchRejectData = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/rejects", { headers: { Authorization: `Bearer ${token}` } });
    rejectAllData.value = await res.json();
    processRejectData();
  } catch (e) { console.error(e); }
};

// 处理等外品数据
const processRejectData = () => {
  let data = rejectAllData.value;

  // 筛选
  if (rejectFilter.value.type) {
    data = data.filter((r: any) => r.rejectType === rejectFilter.value.type);
  }
  if (rejectFilter.value.sourceGrade) {
    data = data.filter((r: any) => r.sourceGrade === rejectFilter.value.sourceGrade);
  }

  // 统计
  rejectStats.value.records = data.length;
  rejectStats.value.quantity = data.reduce((sum: number, r: any) => sum + (r.quantity || 0), 0);
  rejectStats.value.weight = data.reduce((sum: number, r: any) => sum + (r.weight || 0), 0);

  // 按类型分布
  const typeMap: Record<string, { records: number; quantity: number; weight: number; spec: number }> = {};
  data.forEach((r: any) => {
    const type = r.rejectType || '未知';
    if (!typeMap[type]) typeMap[type] = { records: 0, quantity: 0, weight: 0, spec: r.spec || 12 };
    typeMap[type].records++;
    typeMap[type].quantity += r.quantity || 0;
    typeMap[type].weight += r.weight || 0;
  });

  const totalWeight = rejectStats.value.weight;
  rejectTypeData.value = Object.entries(typeMap).map(([type, d]) => ({
    type,
    records: d.records,
    quantity: d.quantity,
    spec: d.spec,
    weight: d.weight,
    percentage: totalWeight > 0 ? Math.round((d.weight / totalWeight) * 100) : 0,
  }));
};

// 获取原料数据
const fetchMaterialData = async () => {
  try {
    const token = localStorage.getItem("token");
    const [inboundRes, contractRes] = await Promise.all([
      fetch("/api/inbound", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/contracts", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const deliveries = await inboundRes.json();
    const contracts = await contractRes.json();

    materialStats.value.contracts = contracts.length;
    materialStats.value.batches = deliveries.length;

    // 统计总箱数和净重
    let totalBoxes = 0;
    let totalNetWeight = 0;
    deliveries.forEach((d: any) => {
      d.products?.forEach((p: any) => {
        totalBoxes += p.quantity || 0;
        totalNetWeight += (p.netWeight || 0) * (p.quantity || 0);
      });
    });

    materialStats.value.boxes = totalBoxes;
    materialStats.value.netWeight = totalNetWeight;

    // 趋势
    generateTrend(deliveries, materialTrend, 'deliveryDate', trendDays.value);
  } catch (e) { console.error(e); }
};

// 获取成品数据
const fetchProductData = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/production", { headers: { Authorization: `Bearer ${token}` } });
    const productions = await res.json();

    productStats.value.batches = productions.length;

    // 统计等级分布
    const levelMap: Record<string, { batches: number; boxes: number; outputWeight: number; yieldRates: number[] }> = {};
    const filteredProductions = productFilter.value.level
      ? productions.filter((p: any) => (p.productLevel || p.productType || '统货') === productFilter.value.level)
      : productions;

    productStats.value.batches = filteredProductions.length;

    filteredProductions.forEach((p: any) => {
      const level = p.productLevel || p.productType || '统货';
      if (!levelMap[level]) levelMap[level] = { batches: 0, boxes: 0, outputWeight: 0, yieldRates: [] };
      levelMap[level].batches++;
      levelMap[level].boxes += p.outputQuantity || 0;
      levelMap[level].outputWeight += p.outputWeight || 0;
      if (p.yieldRate) levelMap[level].yieldRates.push(p.yieldRate);
    });

    const totalWeight = Object.values(levelMap).reduce((sum, l) => sum + l.outputWeight, 0);
    const allYieldRates = Object.values(levelMap).flatMap(l => l.yieldRates);

    productLevelData.value = Object.entries(levelMap).map(([level, data]) => ({
      level, batches: data.batches, boxes: data.boxes, outputWeight: data.outputWeight,
      avgYieldRate: data.yieldRates.length > 0 ? data.yieldRates.reduce((a, b) => a + b, 0) / data.yieldRates.length : 0,
      percentage: totalWeight > 0 ? Math.round((data.outputWeight / totalWeight) * 100) : 0,
    }));

    productStats.value.boxes = Object.values(levelMap).reduce((sum, l) => sum + l.boxes, 0);
    productStats.value.outputWeight = totalWeight;
    productStats.value.avgYieldRate = allYieldRates.length > 0 ? allYieldRates.reduce((a, b) => a + b, 0) / allYieldRates.length : 0;

    // 趋势
    generateTrend(productions, productTrend, 'productionDate');
  } catch (e) { console.error(e); }
};

// 生成趋势数据
const generateTrend = (data: any[], target: any, dateField: string, days: number = 7) => {
  const trendMap: Record<string, number> = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    trendMap[date.toISOString().split("T")[0] as string] = 0;
  }
  data.forEach((d: any) => {
    const dateVal = d[dateField] as string | undefined;
    if (dateVal && trendMap[dateVal] !== undefined) trendMap[dateVal]++;
  });
  target.value = Object.entries(trendMap).map(([date, count]) => ({ date: date.slice(5), count }));
};

// 获取可销售库存
const fetchInventoryData = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/inventory/available", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data: InventoryItem[] = await res.json();
    inventoryData.value = data;

    // 计算总计
    availableStats.value.totalAvailable = data.reduce((sum, item) => sum + item.available, 0);
    availableStats.value.totalAvailableWeight = data.reduce((sum, item) => sum + item.availableWeight, 0);
  } catch (e) {
    console.error("获取库存数据失败:", e);
  }
};

onMounted(() => { fetchMaterialData(); fetchProductData(); fetchRejectData(); fetchInventoryData(); });
</script>

<style scoped>
.stat-card { border-radius: 8px; }
:deep(.el-table .el-table__cell) {
  padding: 12px 16px;
}
</style>
