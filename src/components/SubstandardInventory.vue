<template>
  <div>
    <!-- 筛选区域 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="substandardFilter">
        <el-form-item :label="t('common.type')">
          <el-select
            v-model="substandardFilter.type"
            :placeholder="t('substandardType.allTypes')"
            clearable
            style="width: 150px"
          >
            <el-option :label="t('common.all')" value="" />
            <el-option :label="t('substandardType.变形')" value="变形" />
            <el-option :label="t('substandardType.裂口')" value="裂口" />
            <el-option :label="t('substandardType.干条')" value="干条" />
            <el-option :label="t('substandardType.烂枣')" value="烂枣" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('substandardType.sourceGrade')">
          <el-select
            v-model="substandardFilter.sourceGrade"
            :placeholder="t('grade.allGrades')"
            clearable
            style="width: 150px"
          >
            <el-option :label="t('common.all')" value="" />
            <el-option :label="t('grade.KingGrade')" value="枣王" />
            <el-option :label="t('grade.SuperPremium')" value="超特" />
            <el-option :label="t('grade.PremiumGrade')" value="特级" />
            <el-option :label="t('grade.Grade1')" value="一级" />
            <el-option :label="t('grade.Grade2')" value="二级" />
            <el-option :label="t('grade.Grade3')" value="三级" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applySubstandardFilter"
            >{{ t("common.filter") }}</el-button
          >
          <el-button @click="resetSubstandardFilter">{{ t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 等外品统计卡片 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-gray-50">
          <div class="text-gray-500 text-sm">{{ t("inventory.totalRecords") }}</div>
          <div class="text-2xl font-bold text-gray-600">
            {{ substandardStats.records }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-amber-50">
          <div class="text-gray-500 text-sm">{{ t("inventory.totalPieces") }}</div>
          <div class="text-2xl font-bold text-amber-600">
            {{ substandardStats.quantity }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card bg-indigo-50">
          <div class="text-gray-500 text-sm">{{ t("inventory.totalWeight") }}</div>
          <div class="text-2xl font-bold text-indigo-600">
            {{ formatTon(substandardStats.weight) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 等外品类型分布表格 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <span class="font-medium">{{ t("inventory.substandardDistribution") }}</span>
      </template>
      <el-table :data="substandardTypeData" stripe>
        <el-table-column prop="type" :label="t('common.type')" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="records" :label="t('common.records')" width="100" />
        <el-table-column prop="quantity" :label="t('common.quantity')" width="100" />
        <el-table-column prop="spec" :label="t('common.spec')" width="140" />
        <el-table-column prop="weight" :label="t('common.weight')" width="120">
          <template #default="{ row }">{{ formatTon(row.weight) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 等外品图表 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never">
          <template #header
            ><span class="font-medium">{{ t("inventory.substandardDistribution") }}</span></template
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
            ><span class="font-medium">{{ t("inventory.substandardSourceDist") }}</span></template
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
/**
 * SubstandardInventory 组件
 * 等外品（次品）库存管理页面，展示等外品的统计信息、类型分布和来源等级分布
 * 功能：
 * - 按等外品类型（变形/裂口/干条/烂枣）和来源等级筛选
 * - 统计总记录数、总件数、总重量(kg/吨)
 * - 按类型汇总展示表格
 * - 饼图展示类型分布和来源等级分布
 */
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
import { formatTon } from "@/utils/format";
import { useI18n } from "vue-i18n";

// 注册 ECharts 所需模块
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const { t } = useI18n();

/** 筛选条件 */
const substandardFilter = ref({ type: "", sourceGrade: "" });

/** 统计汇总数据（记录数、件数、重量） */
const substandardStats = ref({ records: 0, quantity: 0, weight: 0 });

/** 按类型汇总后的数据，用于表格和饼图展示 */
const substandardTypeData = ref<
  {
    type: string;
    records: number;
    quantity: number;
    spec: number;
    weight: number;
  }[]
>([]);

/** 接口返回的原始全量数据 */
const substandardAllData = ref<any[]>([]);

/** 等外品类型分布饼图配置（按重量） */
const substandardPieOption = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c}吨({d}%)",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "#eee",
    borderWidth: 1,
    textStyle: { color: "#333" },
  },
  legend: {
    orient: "vertical",
    right: "5%",
    top: "center",
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 12,
    textStyle: { fontSize: 13 },
  },
  color: [
    "#5c7cfa", "#15aabf", "#12b886", "#fab005",
    "#f59f00", "#e67700", "#d9480f", "#c92a2a",
  ],
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      center: ["40%", "50%"],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: "#fff",
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: "rgba(0,0,0,0.1)",
      },
      label: {
        show: true,
        formatter: "{b}\n{d}%",
        fontSize: 12,
        color: "#666",
      },
      labelLine: {
        show: true,
        length: 25,
        length2: 15,
        smooth: true,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: "rgba(0,0,0,0.2)",
        },
        label: { fontSize: 14, fontWeight: "bold" },
      },
      data: substandardTypeData.value.map((r) => ({
        name: r.type,
        value: r.weight,
      })),
    },
  ],
}));

/** 等外品来源等级分布饼图配置（按重量） */
const substandardSourcePieOption = computed(() => {
  // 按来源等级汇总重量
  const sourceMap: Record<string, number> = {};
  substandardAllData.value.forEach((r: any) => {
    const grade = r.sourceGrade || t("common.noData");
    sourceMap[grade] = (sourceMap[grade] || 0) + (r.weight || 0);
  });
  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}吨({d}%)",
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#eee",
      borderWidth: 1,
      textStyle: { color: "#333" },
    },
    legend: {
      orient: "vertical",
      right: "5%",
      top: "center",
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
      textStyle: { fontSize: 13 },
    },
    color: [
      "#82c91e", "#40c057", "#f03e3e", "#d6336c",
      "#a61e4d", "#862e9c", "#5f3dc4", "#364fc7",
    ],
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["40%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: "rgba(0,0,0,0.1)",
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          fontSize: 12,
          color: "#666",
        },
        labelLine: {
          show: true,
          length: 25,
          length2: 15,
          smooth: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: "rgba(0,0,0,0.2)",
          },
          label: { fontSize: 14, fontWeight: "bold" },
        },
        data: Object.entries(sourceMap).map(([name, value]) => ({
          name,
          value,
        })),
      },
    ],
  };
});

/** 应用筛选条件 */
const applySubstandardFilter = () => processSubstandardData();

/** 重置筛选条件并刷新数据 */
const resetSubstandardFilter = () => {
  substandardFilter.value.type = "";
  substandardFilter.value.sourceGrade = "";
  processSubstandardData();
};

/** 从接口获取等外品全量数据 */
const fetchSubstandardData = async () => {
  try {
    substandardAllData.value = await request.get<any[]>("/substandards");
    processSubstandardData();
  } catch (e) {
    console.error(e);
  }
};

/**
 * 根据当前筛选条件处理数据：
 * 1. 过滤数据
 * 2. 计算汇总统计
 * 3. 按等外品类型分组汇总
 */
const processSubstandardData = () => {
  let data = substandardAllData.value;

  // 按类型筛选
  if (substandardFilter.value.type) {
    data = data.filter(
      (r: any) => r.substandardType === substandardFilter.value.type,
    );
  }
  // 按来源等级筛选
  if (substandardFilter.value.sourceGrade) {
    data = data.filter(
      (r: any) => r.sourceGrade === substandardFilter.value.sourceGrade,
    );
  }

  // 计算汇总统计
  substandardStats.value.records = data.length;
  substandardStats.value.quantity = data.reduce(
    (sum: number, r: any) => sum + (r.quantity || 0),
    0,
  );
  substandardStats.value.weight = data.reduce(
    (sum: number, r: any) => sum + (r.weight || 0),
    0,
  );

  // 按等外品类型分组汇总
  const typeMap: Record<
    string,
    { records: number; quantity: number; weight: number; spec: number }
  > = {};

  data.forEach((r: any) => {
    const type = r.substandardType || t("common.noData");
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

  // 转换为数组供表格和饼图使用
  substandardTypeData.value = Object.entries(typeMap).map(([type, d]) => ({
    type,
    records: d.records,
    quantity: d.quantity,
    spec: d.spec,
    weight: d.weight,
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
