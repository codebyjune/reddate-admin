<template>
  <div>
    <!-- 统计卡片：展示入库批次、总箱数、总净重、合同数量 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-blue-50">
          <div class="text-gray-500 text-sm">入库批次</div>
          <div class="text-2xl font-bold text-blue-600">
            {{ materialStats.batches }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-green-50">
          <div class="text-gray-500 text-sm">总箱数</div>
          <div class="text-2xl font-bold text-green-600">
            {{ materialStats.boxes }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-orange-50">
          <div class="text-gray-500 text-sm">总净重(吨)</div>
          <div class="text-2xl font-bold text-orange-600">
            {{ formatTon(materialStats.netWeight) }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-purple-50">
          <div class="text-gray-500 text-sm">合同数量</div>
          <div class="text-2xl font-bold text-purple-600">
            {{ materialStats.contracts }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入库趋势图：支持切换 7天/15天/1个月/1季度 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">入库趋势</span>
          <!-- 天数切换，改变后重新请求数据 -->
          <el-radio-group
            v-model="trendDays"
            size="small"
            @change="fetchMaterialData"
          >
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import request from "@/utils/request";
import { generateTrend, formatTon } from "@/utils/format";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
]);

// 统计数据：批次、箱数、净重、合同数
const materialStats = ref({ batches: 0, boxes: 0, netWeight: 0, contracts: 0 });
// 趋势数据：每个日期对应的入库批次数
const materialTrend = ref<{ date: string; count: number }[]>([]);
// 趋势图展示的天数
const trendDays = ref(7);

// 趋势图配置（折线图）
const materialLineOption = computed(() => ({
  // 鼠标悬浮在坐标轴上时显示提示框
  tooltip: { trigger: "axis" },
  // 图表边距：控制图表在容器内的位置
  grid: { left: "10%", right: "5%", bottom: "15%", top: "10%" },
  // X轴：类目轴，显示日期
  xAxis: { type: "category", data: materialTrend.value.map((d) => d.date) },
  // Y轴：数值轴，自动计算刻度
  yAxis: { type: "value" },
  series: [
    {
      name: "入库批次",
      type: "line", // 折线图
      smooth: true, // 平滑曲线
      areaStyle: { opacity: 0.3 }, // 填充区域半透明
      data: materialTrend.value.map((d) => d.count),
    },
  ],
}));

// 获取原料数据：入库记录 + 合同数据
const fetchMaterialData = async () => {
  try {
    // 同时请求入库记录和合同列表，提高加载速度
    const [inbounds, contracts] = await Promise.all([
      request.get<any[]>("/inbound"),
      request.get<any[]>("/contracts"),
    ]);

    // 合同数量 = contracts 数组长度
    materialStats.value.contracts = contracts.length;
    // 入库批次 = inbounds 数组长度
    materialStats.value.batches = inbounds.length;

    // 遍历所有入库记录下的产品明细，累加箱数和净重
    let totalBoxes = 0;    // 总箱数
    let totalNetWeight = 0; // 总净重(kg)
    inbounds.forEach((d: any) => {
      d.products?.forEach((p: any) => {
        totalBoxes += p.quantity || 0;                              // 箱数累加
        totalNetWeight += (p.netWeight || 0) * (p.quantity || 0);  // 净重 = 单箱净重 × 箱数
      });
    });

    materialStats.value.boxes = totalBoxes;
    materialStats.value.netWeight = totalNetWeight;

    // 生成趋势数据用于折线图展示
    generateTrend(inbounds, materialTrend, "deliveryDate", trendDays.value);
  } catch (e) {
    console.error(e);
  }
};

// 页面加载时自动获取数据
onMounted(() => {
  fetchMaterialData();
});
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}
</style>
