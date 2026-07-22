<template>
  <div class="space-y-4">
    <!-- 生产录入 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ t("production.entryTitle") }}
          </h2>
          <p class="text-sm text-gray-400">
            {{ t("production.entryDesc") }}
          </p>
        </div>
      </template>

      <!-- 公共信息：班次、生产日期、批次号 -->
      <el-form label-width="80px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-form-item :label="t('common.shift')">
              <el-radio-group v-model="commonData.shift">
                <el-radio value="day">{{ t("common.dayShift") }}</el-radio>
                <el-radio value="night">{{ t("common.nightShift") }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="t('production.productionDate')">
              <el-date-picker
                v-model="commonData.date"
                type="date"
                :placeholder="t('production.selectDate')"
                value-format="YYYY.MM.DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="t('common.batchNo')">
              <el-input
                v-model="commonData.batchNo"
                :placeholder="t('production.enterBatchNo')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 成品录入 -->
      <div class="mb-2 text-gray-600 font-medium">{{ t("production.normalEntry") }}</div>
      <el-form :model="normalForm" label-width="80px" ref="normalFormRef">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item :label="t('common.grade')">
              <el-select
                :placeholder="t('production.selectGrade')"
                v-model="normalForm.grade"
                style="width: 100%"
              >
                <el-option :label="t('grade.KingGrade')" value="KingGrade" />
                <el-option :label="t('grade.SuperPremium')" value="SuperPremium" />
                <el-option :label="t('grade.PremiumGrade')" value="PremiumGrade" />
                <el-option :label="t('grade.Grade1')" value="Grade1" />
                <el-option :label="t('grade.Grade2')" value="Grade2" />
                <el-option :label="t('grade.Grade3')" value="Grade3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item :label="t('common.spec')">
              <el-input v-model="normalForm.spec" :placeholder="t('production.enterSpec')">
                <template #append>kg</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item :label="t('common.quantity')">
              <el-input
                v-model.number="normalForm.quantity"
                :placeholder="t('production.enterQuantity')"
              >
                <template #append>件</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item :label="t('common.weight')">
              <el-input
                :value="normalWeight || ''"
                :placeholder="t('production.autoCalc')"
                disabled
              >
                <template #append>kg</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="18">
            <el-form-item :label="t('common.remark')">
              <el-input v-model="normalForm.remark" :placeholder="t('common.remark')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-button type="primary" @click="addNormalItem"
              >{{ t("production.addProduct") }}</el-button
            >
          </el-col>
        </el-row>
      </el-form>

      <!-- 等外品录入（可折叠） -->
      <el-collapse v-model="substandardCollapse" class="mt-4">
        <el-collapse-item
          :title="t('production.substandardEntry')"
          name="substandard"
        >
          <el-form
            :model="substandardForm"
            label-width="80px"
            ref="substandardFormRef"
          >
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('common.type')">
                <el-select
                  v-model="substandardForm.substandardType"
                  :placeholder="t('substandardType.allTypes')"
                  @change="handleSubstandardTypeChange"
                  style="width: 100%"
                >
                  <el-option :label="t('substandardType.变形')" value="变形" />
                  <el-option :label="t('substandardType.裂口')" value="裂口" />
                  <el-option :label="t('substandardType.干条')" value="干条" />
                  <el-option :label="t('substandardType.烂枣')" value="烂枣" />
                </el-select>
              </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('substandardType.sourceGrade')">
                <el-select
                  v-model="substandardForm.sourceGrade"
                  :placeholder="t('grade.allGrades')"
                  style="width: 100%"
                >
                  <el-option :label="t('grade.KingGrade')" value="枣王" />
                  <el-option :label="t('grade.SuperPremium')" value="超特" />
                  <el-option :label="t('grade.PremiumGrade')" value="特级" />
                  <el-option :label="t('grade.Grade1')" value="一级" />
                  <el-option :label="t('grade.Grade2')" value="二级" />
                  <el-option :label="t('grade.Grade3')" value="三级" />
                </el-select>
              </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('common.spec')">
                <el-input :value="substandardForm.spec" disabled>
                  <template #append>kg</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('common.quantity')">
                <el-input
                  v-model.number="substandardForm.quantity"
                  :placeholder="t('production.enterQuantity')"
                >
                    <template #append>件</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="6">
              <el-form-item :label="t('common.weight')">
                <el-input
                  :value="substandardWeight || ''"
                  :placeholder="t('production.autoCalc')"
                  disabled
                >
                    <template #append>kg</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
              <el-form-item :label="t('common.remark')">
                <el-input
                  v-model="substandardForm.remark"
                  :placeholder="t('common.remark')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="6">
              <el-button type="warning" @click="addSubstandardItem"
                >{{ t("production.addSubstandard") }}</el-button
              >
            </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <!-- 待提交列表 -->
      <div
        v-if="pendingNormalList.length > 0 || pendingSubstandardList.length > 0"
        class="mt-4"
      >
        <div class="text-sm font-medium text-gray-600 mb-2">{{ t("production.pendingList") }}</div>
        <el-table :data="pendingNormalList" size="small" class="mb-2">
          <el-table-column :label="t('common.type')" width="80">
            <template #default><el-tag type="success">{{ t("production.normalTag") }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="grade" :label="t('common.grade')" width="80">
            <template #default="{ row }">{{
              gradeMap[row.grade] || row.grade
            }}</template>
          </el-table-column>
          <el-table-column prop="spec" :label="t('common.spec')" width="80" />
          <el-table-column prop="quantity" :label="t('common.quantity')" width="80" />
          <el-table-column prop="weight" :label="t('common.weight')" width="100">
            <template #default="{ row }">{{ formatWeight(row.weight) }}</template>
          </el-table-column>
          <el-table-column prop="remark" :label="t('common.remark')" />
          <el-table-column :label="t('common.action')" width="60" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                link
                @click="removeNormalItem($index)"
                >{{ t("common.delete") }}</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-table
          v-if="pendingSubstandardList.length > 0"
          :data="pendingSubstandardList"
          size="small"
        >
          <el-table-column :label="t('common.type')" width="80">
            <template #default><el-tag type="warning">{{ t("production.substandardTag") }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="substandardType" :label="t('common.type')" width="80" />
          <el-table-column prop="sourceGrade" :label="t('substandardType.sourceGrade')" width="80" />
          <el-table-column prop="spec" :label="t('common.spec')" width="80" />
          <el-table-column prop="quantity" :label="t('common.quantity')" width="80" />
          <el-table-column prop="weight" :label="t('common.weight')" width="100">
            <template #default="{ row }">{{
              formatWeight(row.weight)
            }}</template>
          </el-table-column>
          <el-table-column prop="remark" :label="t('common.remark')" />
          <el-table-column :label="t('common.action')" width="60" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                link
                @click="removeSubstandardItem($index)"
                >{{ t("common.delete") }}</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 提交按钮 -->
      <div class="flex flex-wrap justify-end mt-4 gap-2">
        <el-button @click="handleClearAll">{{ t("common.clear") }}</el-button>
        <el-button
          type="primary"
          @click="handleBatchSubmit"
          :loading="submitLoading"
          :disabled="
            pendingNormalList.length === 0 &&
            pendingSubstandardList.length === 0
          "
        >
          {{ t("production.batchSubmit", [pendingNormalList.length + pendingSubstandardList.length]) }}
        </el-button>
      </div>
    </el-card>

    <!-- 当日生产批次记录 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">{{ t("production.todayBatches") }}</h2>
        </div>
      </template>
      <el-table
        :data="batchList"
        stripe
        v-loading="loading"
        :row-key="
          (row: BatchRecord) => `${row.date}-${row.batchNo}-${row.shift}`
        "
        v-model:expand-row-keys="expandedRowKeys"
        @expand-change="handleBatchExpand"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50">
              <div class="mb-2 text-sm font-medium text-gray-600">
                {{ t("production.normalProducts") }}
              </div>
              <el-table
                :data="row.normalProducts"
                size="small"
                border
                class="mb-3"
              >
                <el-table-column prop="grade" :label="t('common.grade')" width="80">
                  <template #default="{ row: r }">{{
                    gradeMap[r.grade] || r.grade
                  }}</template>
                </el-table-column>
                <el-table-column prop="spec" :label="t('common.spec')" width="80" />
                <el-table-column prop="quantity" :label="t('common.quantity')" width="80" />
                <el-table-column prop="weight" :label="t('common.weight')" width="100">
                  <template #default="{ row: r }">{{
                    r.weight?.toFixed(2)
                  }}</template>
                </el-table-column>
                <el-table-column prop="remark" :label="t('common.remark')" />
              </el-table>
              <div
                v-if="
                  row.substandardProducts && row.substandardProducts.length > 0
                "
              >
                <div class="mb-2 text-sm font-medium text-gray-600">{{ t("production.substandardProducts") }}</div>
                <el-table :data="row.substandardProducts" size="small" border>
                  <el-table-column
                    prop="substandardType"
                    :label="t('common.type')"
                    width="80"
                  />
                  <el-table-column
                    prop="sourceGrade"
                    :label="t('substandardType.sourceGrade')"
                    width="80"
                  />
                  <el-table-column prop="spec" :label="t('common.spec')" width="80" />
                  <el-table-column
                    prop="quantity"
                    :label="t('common.quantity')"
                    width="80"
                  />
                  <el-table-column prop="weight" :label="t('common.weight')" width="100">
                    <template #default="{ row: r }">{{
                      r.weight?.toFixed(2)
                    }}</template>
                  </el-table-column>
                  <el-table-column prop="remark" :label="t('common.remark')" />
                </el-table>
              </div>
              <div
                v-else-if="row.normalProducts && row.normalProducts.length > 0"
                class="text-gray-400 text-sm"
              >
                {{ t("production.noSubstandard") }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="date" :label="t('common.date')" width="110" />
        <el-table-column prop="shift" :label="t('common.shift')" width="80">
          <template #default="{ row }">
            <el-tag
              :type="row.shift === 'day' ? 'warning' : 'info'"
              size="small"
            >
              {{ shiftMap[row.shift] || row.shift }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" :label="t('common.batchNo')" min-width="140" />
        <el-table-column :label="t('production.normalCount')" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small"
              >{{ row.normalCount || 0 }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column :label="t('production.substandardCount')" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.substandardCount > 0" type="warning" size="small"
              >{{ row.substandardCount }}</el-tag
            >
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('production.totalQuantity')" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small"
              >{{ row.totalQuantity || 0 }} 件</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column :label="t('production.totalWeight')" width="120" align="right">
          <template #default="{ row }">{{
            ((row.totalWeight || 0) / 1000).toFixed(3)
          }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { formatWeight } from "@/utils/format";
import { useI18n } from "vue-i18n";
type GradeType =
  | "KingGrade"
  | "SuperPremium"
  | "PremiumGrade"
  | "Grade1"
  | "Grade2"
  | "Grade3";

interface NormalItem {
  grade: GradeType;
  spec: string;
  quantity: number;
  weight: number;
  remark: string;
}

interface SubstandardItem {
  substandardType: string;
  sourceGrade: string;
  spec: number;
  quantity: number;
  weight: number;
  remark: string;
}

interface ProductionRecord {
  id: number;
  date: string;
  shift: string;
  batchNo: string;
  grade: string;
  spec: string;
  quantity: number;
  weight: number;
  remark: string;
}

interface SubstandardRecord {
  id: number;
  date: string;
  shift: string;
  batchNo: string;
  substandardType: string;
  sourceGrade: string;
  spec: number;
  quantity: number;
  weight: number;
  remark: string;
}

interface BatchRecord {
  date: string;
  shift: string;
  batchNo: string;
  normalCount: number;
  substandardCount: number;
  totalQuantity: number;
  totalWeight: number;
  normalProducts: ProductionRecord[];
  substandardProducts: SubstandardRecord[];
}

const { t } = useI18n();

// 等外品类型对应的固定规格(kg/件)
const SUBSTANDARD_SPECS: Record<string, number> = {
  变形: 12,
  裂口: 12,
  干条: 10,
  烂枣: 12,
};

// 公共数据
const commonData = reactive({
  date: "",
  batchNo: "",
  shift: "day" as "day" | "night",
});

// 等级内产品表单
const normalForm = reactive({
  grade: "Grade1" as GradeType,
  spec: "",
  quantity: 0 as number,
  remark: "",
});

// 等外品表单
const substandardForm = reactive({
  substandardType: "变形",
  sourceGrade: "一级",
  spec: 12,
  quantity: 0 as number,
  remark: "",
});

// 待提交列表
const pendingNormalList = ref<NormalItem[]>([]);
const pendingSubstandardList = ref<SubstandardItem[]>([]);

const normalFormRef = ref<FormInstance>();
const substandardFormRef = ref<FormInstance>();
void normalFormRef; // 保留用于模板引用
void substandardFormRef;
const batchList = ref<BatchRecord[]>([]);
const expandedRowKeys = ref<string[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const substandardCollapse = ref<string[]>([]);

// 所有记录（用于展开详情）
const allNormalRecords = ref<ProductionRecord[]>([]);
const allSubstandardRecords = ref<SubstandardRecord[]>([]);

// 计算重量
const normalWeight = computed(
  () => Number(normalForm.quantity) * Number(normalForm.spec),
);
const substandardWeight = computed(
  () => substandardForm.spec * Number(substandardForm.quantity),
);

const shiftMap: Record<string, string> = {
  day: t("common.dayShift"),
  night: t("common.nightShift"),
};

const gradeMap: Record<string, string> = {
  KingGrade: "枣王",
  SuperPremium: "超特",
  PremiumGrade: "特级",
  Grade1: "一级",
  Grade2: "二级",
  Grade3: "三级",
};

// 等外品类型改变时更新规格
const handleSubstandardTypeChange = (type: string) => {
  substandardForm.spec = SUBSTANDARD_SPECS[type] || 12;
};

// 添加正品到待提交列表
const addNormalItem = () => {
  if (!normalForm.spec || normalForm.quantity <= 0) {
    ElMessage.warning(t("production.fillSpecQty"));
    return;
  }
  pendingNormalList.value.push({
    grade: normalForm.grade,
    spec: normalForm.spec,
    quantity: Number(normalForm.quantity),
    weight: normalWeight.value,
    remark: normalForm.remark,
  });
  // 重置表单
  normalForm.spec = "";
  normalForm.quantity = 0;
  normalForm.remark = "";
};

// 添加等外品到待提交列表
const addSubstandardItem = () => {
  if (substandardForm.quantity <= 0) {
    ElMessage.warning(t("production.fillQty"));
    return;
  }
  pendingSubstandardList.value.push({
    substandardType: substandardForm.substandardType,
    sourceGrade: substandardForm.sourceGrade,
    spec: substandardForm.spec,
    quantity: substandardForm.quantity,
    weight: substandardWeight.value,
    remark: substandardForm.remark,
  });
  // 重置表单
  substandardForm.quantity = 0;
  substandardForm.remark = "";
};

// 删除待提交项
const removeNormalItem = (index: number) => {
  pendingNormalList.value.splice(index, 1);
};

const removeSubstandardItem = (index: number) => {
  pendingSubstandardList.value.splice(index, 1);
};

// 清空所有待提交项
const handleClearAll = () => {
  pendingNormalList.value = [];
  pendingSubstandardList.value = [];
  substandardCollapse.value = [];
};

// 批量提交
const handleBatchSubmit = async () => {
  if (!commonData.date) {
    ElMessage.warning(t("production.selectDateWarn"));
    return;
  }
  if (!commonData.batchNo) {
    ElMessage.warning(t("production.enterBatchNoWarn"));
    return;
  }

  const total =
    pendingNormalList.value.length + pendingSubstandardList.value.length;
  if (total === 0) {
    ElMessage.warning(t("production.addProductFirst"));
    return;
  }

  submitLoading.value = true;
  let successCount = 0;
  let errorMsg = "";

  // 提交等级内产品
  for (const item of pendingNormalList.value) {
    try {
      await request.post("/production", {
        date: commonData.date,
        batchNo: commonData.batchNo,
        grade: item.grade,
        spec: Number(item.spec),
        quantity: item.quantity,
        weight: item.weight,
        shift: commonData.shift,
        remark: item.remark,
      });
      successCount++;
    } catch (error: any) {
      errorMsg += `成品-${gradeMap[item.grade]}: ${error.message || t("common.failed")}; `;
    }
  }

  // 提交等外品
  for (const item of pendingSubstandardList.value) {
    try {
      await request.post("/substandards", {
        date: commonData.date,
        batchNo: commonData.batchNo,
        shift: commonData.shift,
        substandardType: item.substandardType,
        sourceGrade: item.sourceGrade,
        spec: item.spec,
        quantity: item.quantity,
        weight: item.weight,
        remark: item.remark,
      });
      successCount++;
    } catch (error: any) {
      errorMsg += `等外品-${item.substandardType}: ${error.message || t("common.failed")}; `;
    }
  }

  submitLoading.value = false;

  if (successCount > 0) {
    ElMessage.success(t("production.submitSuccess", [successCount]));
    pendingNormalList.value = [];
    pendingSubstandardList.value = [];
    substandardCollapse.value = [];
    fetchTodayRecords();
  }

  if (errorMsg) {
    ElMessage.error(errorMsg);
  }
};

// 处理批次展开
const handleBatchExpand = (row: BatchRecord) => {
  // 展开时从缓存数据中填充产品列表
  row.normalProducts = allNormalRecords.value.filter(
    (r) =>
      r.date === row.date && r.batchNo === row.batchNo && r.shift === row.shift,
  );
  row.substandardProducts = allSubstandardRecords.value.filter(
    (r) =>
      r.date === row.date && r.batchNo === row.batchNo && r.shift === row.shift,
  );
};

// 获取当日生产记录
const fetchTodayRecords = async () => {
  loading.value = true;
  try {
    const [normalRes, substandardRes] = await Promise.all([
      request.get("/production"),
      request.get("/substandards"),
    ]);

    const allNormal: ProductionRecord[] = Array.isArray(normalRes)
      ? normalRes
      : [];
    const allSubstandard: SubstandardRecord[] = Array.isArray(substandardRes)
      ? substandardRes
      : [];

    // 缓存所有记录
    allNormalRecords.value = allNormal;
    allSubstandardRecords.value = allSubstandard;

    // 过滤今日记录
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const todayNormal = allNormal.filter((r) => {
      const parts = r.date?.split(/[.\-]/) || [];
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        return (
          parseInt(parts[0]) === year &&
          parseInt(parts[1]) === month &&
          parseInt(parts[2]) === day
        );
      }
      return false;
    });

    const todaySubstandard = allSubstandard.filter((r: any) => {
      const parts = r.date?.split(/[.\-]/) || [];
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        return (
          parseInt(parts[0]) === year &&
          parseInt(parts[1]) === month &&
          parseInt(parts[2]) === day
        );
      }
      return false;
    });

    // 按批次分组
    const batchMap = new Map<string, BatchRecord>();

    todayNormal.forEach((r) => {
      const key = `${r.date}-${r.batchNo}-${r.shift}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, {
          date: r.date,
          shift: r.shift,
          batchNo: r.batchNo,
          normalCount: 0,
          substandardCount: 0,
          totalQuantity: 0,
          totalWeight: 0,
          normalProducts: [],
          substandardProducts: [],
        });
      }
      const batch = batchMap.get(key)!;
      batch.normalCount++;
      batch.totalQuantity += r.quantity || 0;
      batch.totalWeight += r.weight || 0;
    });

    todaySubstandard.forEach((r: any) => {
      const key = `${r.date}-${r.batchNo}-${r.shift}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, {
          date: r.date,
          shift: r.shift,
          batchNo: r.batchNo,
          normalCount: 0,
          substandardCount: 0,
          totalQuantity: 0,
          totalWeight: 0,
          normalProducts: [],
          substandardProducts: [],
        });
      }
      const batch = batchMap.get(key)!;
      batch.substandardCount++;
      batch.totalQuantity += r.quantity || 0;
      batch.totalWeight += r.weight || 0;
    });

    // 按日期降序排序
    batchList.value = Array.from(batchMap.values()).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.shift === b.shift ? 0 : a.shift === "day" ? -1 : 1;
    });
  } catch (error: any) {
    console.error("获取生产记录失败:", error);
    ElMessage.error(t("production.fetchFailed"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTodayRecords();
});
</script>

<style scoped>
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}
</style>
