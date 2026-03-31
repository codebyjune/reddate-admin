<template>
  <div>
    <!-- 筛选区域 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="substandardFilter">
        <el-form-item label="等外品类型">
          <el-select
            v-model="substandardFilter.type"
            placeholder="全部类型"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="变形" value="变形" />
            <el-option label="裂口" value="裂口" />
            <el-option label="干条" value="干条" />
            <el-option label="烂枣" value="烂枣" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源等级">
          <el-select
            v-model="substandardFilter.sourceGrade"
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
          <el-button type="primary" @click="applySubstandardFilter"
            >筛选</el-button
          >
          <el-button @click="resetSubstandardFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 等外品统计卡片 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-gray-50">
          <div class="text-gray-500 text-sm">总记录数</div>
          <div class="text-2xl font-bold text-gray-600">
            {{ substandardStats.records }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-amber-50">
          <div class="text-gray-500 text-sm">总件数</div>
          <div class="text-2xl font-bold text-amber-600">
            {{ substandardStats.quantity }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-rose-50">
          <div class="text-gray-500 text-sm">总重量(kg)</div>
          <div class="text-2xl font-bold text-rose-600">
            {{ substandardStats.weight.toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-indigo-50">
          <div class="text-gray-500 text-sm">总重量(吨)</div>
          <div class="text-2xl font-bold text-indigo-600">
            {{ (substandardStats.weight / 1000).toFixed(3) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 等外品类型分布表格 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <span class="font-medium">等外品类型分布</span>
      </template>
      <el-table :data="substandardTypeData" stripe>
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
            <el-progress
              :percentage="row.percentage"
              :stroke-width="15"
              :color="'#e6a23c'"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 等外品图表 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header
            ><span class="font-medium">等外品类型分布</span></template
          >
          <v-chart
            :option="substandardPieOption"
            autoresize
            style="height: 300px"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header
            ><span class="font-medium">等外品来源等级分布</span></template
          >
          <v-chart
            :option="substandardSourcePieOption"
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
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import request from "@/utils/request";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const substandardFilter = ref({ type: "", sourceGrade: "" });

const substandardStats = ref({ records: 0, quantity: 0, weight: 0 });
const substandardTypeData = ref<
  {
    type: string;
    records: number;
    quantity: number;
    spec: number;
    weight: number;
    percentage: number;
  }[]
>([]);
const substandardAllData = ref<any[]>([]);

const substandardPieOption = computed(() => ({
  tooltip: { trigger: "item", formatter: "{b}: {c}kg ({d}%)" },
  legend: { orient: "vertical", left: "left" },
  series: [
    {
      type: "pie",
      radius: "50%",
      data: substandardTypeData.value.map((r) => ({
        name: r.type,
        value: r.weight,
      })),
      itemStyle: { color: "#e6a23c" },
    },
  ],
}));

const substandardSourcePieOption = computed(() => {
  const sourceMap: Record<string, number> = {};
  substandardAllData.value.forEach((r: any) => {
    const grade = r.sourceGrade || "未知";
    sourceMap[grade] = (sourceMap[grade] || 0) + (r.weight || 0);
  });
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c}kg ({d}%)" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: Object.entries(sourceMap).map(([name, value]) => ({
          name,
          value,
        })),
      },
    ],
  };
});

const applySubstandardFilter = () => processSubstandardData();
const resetSubstandardFilter = () => {
  substandardFilter.value.type = "";
  substandardFilter.value.sourceGrade = "";
  processSubstandardData();
};

const fetchSubstandardData = async () => {
  try {
    substandardAllData.value = await request.get<any[]>("/substandards");
    processSubstandardData();
  } catch (e) {
    console.error(e);
  }
};

const processSubstandardData = () => {
  let data = substandardAllData.value;

  if (substandardFilter.value.type) {
    data = data.filter(
      (r: any) => r.substandardType === substandardFilter.value.type,
    );
  }
  if (substandardFilter.value.sourceGrade) {
    data = data.filter(
      (r: any) => r.sourceGrade === substandardFilter.value.sourceGrade,
    );
  }

  substandardStats.value.records = data.length;
  substandardStats.value.quantity = data.reduce(
    (sum: number, r: any) => sum + (r.quantity || 0),
    0,
  );
  substandardStats.value.weight = data.reduce(
    (sum: number, r: any) => sum + (r.weight || 0),
    0,
  );

  const typeMap: Record<
    string,
    { records: number; quantity: number; weight: number; spec: number }
  > = {};
  data.forEach((r: any) => {
    const type = r.substandardType || "未知";
    if (!typeMap[type])
      typeMap[type] = {
        records: 0,
        quantity: 0,
        weight: 0,
        spec: r.spec || 12,
      };
    typeMap[type].records++;
    typeMap[type].quantity += r.quantity || 0;
    typeMap[type].weight += r.weight || 0;
  });

  const totalWeight = substandardStats.value.weight;
  substandardTypeData.value = Object.entries(typeMap).map(([type, d]) => ({
    type,
    records: d.records,
    quantity: d.quantity,
    spec: d.spec,
    weight: d.weight,
    percentage:
      totalWeight > 0 ? Math.round((d.weight / totalWeight) * 100) : 0,
  }));
};

onMounted(() => {
  fetchSubstandardData();
});
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}
</style>
