<template>
  <div class="space-y-4">
    <!-- 生产录入 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">生产录入</h2>
          <p class="text-sm text-gray-400">登记当班红枣生产批次信息</p>
        </div>
      </template>

      <!-- 公共信息：班次、生产日期、批次号 -->
      <el-form label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="班次">
              <el-radio-group v-model="commonData.shift">
                <el-radio value="day">白班</el-radio>
                <el-radio value="night">夜班</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="生产日期">
              <el-date-picker
                v-model="commonData.date"
                type="date"
                placeholder="选择生产日期"
                value-format="YYYY.MM.DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="批次号">
              <el-input v-model="commonData.batchNo" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 等级内产品录入 -->
      <div class="mb-2 text-gray-600 font-medium">等级内产品</div>
      <el-form :model="normalForm" label-width="80px" ref="normalFormRef">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="等级">
              <el-select placeholder="请选择等级" v-model="normalForm.grade" style="width: 100%">
                <el-option label="枣王" value="KingGrade" />
                <el-option label="超特" value="SuperPremium" />
                <el-option label="特级" value="PremiumGrade" />
                <el-option label="一级" value="Grade1" />
                <el-option label="二级" value="Grade2" />
                <el-option label="三级" value="Grade3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="规格">
              <el-input v-model="normalForm.spec" placeholder="请输入规格">
                <template #append>kg</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="数量">
              <el-input v-model="normalForm.quantity" placeholder="请输入数量">
                <template #append>件</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="重量">
              <el-input :value="normalWeight || ''" placeholder="自动计算" disabled>
                <template #append>kg</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form-item label="备注">
              <el-input v-model="normalForm.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <el-col :span="6" class="!items-center !justify-end flex">
            <el-button type="primary" @click="addNormalItem">添加等级内产品</el-button>
          </el-col>
        </el-row>
      </el-form>

      <!-- 等外品录入（可折叠） -->
      <el-collapse v-model="rejectCollapse" class="mt-4">
        <el-collapse-item title="等外品录入（变形、裂口、干条、烂枣）" name="reject">
          <el-form :model="rejectForm" label-width="80px" ref="rejectFormRef">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="类型">
                  <el-select v-model="rejectForm.rejectType" placeholder="请选择类型" @change="handleRejectTypeChange" style="width: 100%">
                    <el-option label="变形" value="变形" />
                    <el-option label="裂口" value="裂口" />
                    <el-option label="干条" value="干条" />
                    <el-option label="烂枣" value="烂枣" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="来源等级">
                  <el-select v-model="rejectForm.sourceGrade" placeholder="请选择来源等级" style="width: 100%">
                    <el-option label="枣王" value="枣王" />
                    <el-option label="超特" value="超特" />
                    <el-option label="特级" value="特级" />
                    <el-option label="一级" value="一级" />
                    <el-option label="二级" value="二级" />
                    <el-option label="三级" value="三级" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="规格">
                  <el-input :value="rejectForm.spec" disabled>
                    <template #append>kg</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="数量">
                  <el-input v-model="rejectForm.quantity" placeholder="请输入数量">
                    <template #append>件</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="重量">
                  <el-input :value="rejectWeight || ''" placeholder="自动计算" disabled>
                    <template #append>kg</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注">
                  <el-input v-model="rejectForm.remark" placeholder="请输入备注" />
                </el-form-item>
              </el-col>
              <el-col :span="6" class="!items-center !justify-end flex">
                <el-button type="warning" @click="addRejectItem">添加等外品</el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <!-- 待提交列表 -->
      <div v-if="pendingNormalList.length > 0 || pendingRejectList.length > 0" class="mt-4">
        <div class="text-sm font-medium text-gray-600 mb-2">待提交列表</div>
        <el-table :data="pendingNormalList" size="small" border class="mb-2">
          <el-table-column label="类型" width="80">
            <template #default><el-tag type="success">等级内</el-tag></template>
          </el-table-column>
          <el-table-column prop="grade" label="等级" width="80">
            <template #default="{ row }">{{ gradeMap[row.grade] || row.grade }}</template>
          </el-table-column>
          <el-table-column prop="spec" label="规格(kg)" width="80" />
          <el-table-column prop="quantity" label="数量(件)" width="80" />
          <el-table-column prop="weight" label="重量(kg)" width="100">
            <template #default="{ row }">{{ row.weight?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button type="danger" size="small" link @click="removeNormalItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-table v-if="pendingRejectList.length > 0" :data="pendingRejectList" size="small" border>
          <el-table-column label="类型" width="80">
            <template #default><el-tag type="warning">等外品</el-tag></template>
          </el-table-column>
          <el-table-column prop="rejectType" label="名称" width="80" />
          <el-table-column prop="sourceGrade" label="来源等级" width="80" />
          <el-table-column prop="spec" label="规格(kg)" width="80" />
          <el-table-column prop="quantity" label="数量(件)" width="80" />
          <el-table-column prop="weight" label="重量(kg)" width="100">
            <template #default="{ row }">{{ row.weight?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button type="danger" size="small" link @click="removeRejectItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-end mt-4 gap-2">
        <el-button @click="handleClearAll">清空</el-button>
        <el-button type="primary" @click="handleBatchSubmit" :loading="submitLoading" :disabled="pendingNormalList.length === 0 && pendingRejectList.length === 0">
          批量提交 ({{ pendingNormalList.length + pendingRejectList.length }})
        </el-button>
      </div>
    </el-card>

    <!-- 当日生产批次记录 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">当日生产批次</h2>
        </div>
      </template>
      <el-table
        :data="batchList"
        stripe
        v-loading="loading"
        :row-key="(row: BatchRecord) => `${row.date}-${row.batchNo}-${row.shift}`"
        v-model:expand-row-keys="expandedRowKeys"
        @expand-change="handleBatchExpand"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50">
              <div class="mb-2 text-sm font-medium text-gray-600">等级内产品</div>
              <el-table :data="row.normalProducts" size="small" border class="mb-3">
                <el-table-column prop="grade" label="等级" width="80">
                  <template #default="{ row: r }">{{ gradeMap[r.grade] || r.grade }}</template>
                </el-table-column>
                <el-table-column prop="spec" label="规格(kg)" width="80" />
                <el-table-column prop="quantity" label="数量(件)" width="80" />
                <el-table-column prop="weight" label="重量(kg)" width="100">
                  <template #default="{ row: r }">{{ r.weight?.toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" />
              </el-table>
              <div v-if="row.rejectProducts && row.rejectProducts.length > 0">
                <div class="mb-2 text-sm font-medium text-gray-600">等外品</div>
                <el-table :data="row.rejectProducts" size="small" border>
                  <el-table-column prop="rejectType" label="类型" width="80" />
                  <el-table-column prop="sourceGrade" label="来源等级" width="80" />
                  <el-table-column prop="spec" label="规格(kg)" width="80" />
                  <el-table-column prop="quantity" label="数量(件)" width="80" />
                  <el-table-column prop="weight" label="重量(kg)" width="100">
                    <template #default="{ row: r }">{{ r.weight?.toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column prop="remark" label="备注" />
                </el-table>
              </div>
              <div v-else-if="row.normalProducts && row.normalProducts.length > 0" class="text-gray-400 text-sm">
                暂无等外品记录
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="shift" label="班次" width="80">
          <template #default="{ row }">
            <el-tag :type="row.shift === 'day' ? 'warning' : 'info'" size="small">
              {{ shiftMap[row.shift] || row.shift }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="批次号" min-width="140" />
        <el-table-column label="等级内产品" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.normalCount || 0 }} 条</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等外品" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.rejectCount > 0" type="warning" size="small">{{ row.rejectCount }} 条</el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="总件数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.totalQuantity || 0 }} 件</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总重量(吨)" width="120" align="right">
          <template #default="{ row }">{{ ((row.totalWeight || 0) / 1000).toFixed(3) }}</template>
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

type GradeType = "KingGrade" | "SuperPremium" | "PremiumGrade" | "Grade1" | "Grade2" | "Grade3";

interface NormalItem {
  grade: GradeType;
  spec: string;
  quantity: number;
  weight: number;
  remark: string;
}

interface RejectItem {
  rejectType: string;
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

interface RejectRecord {
  id: number;
  date: string;
  shift: string;
  batchNo: string;
  rejectType: string;
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
  rejectCount: number;
  totalQuantity: number;
  totalWeight: number;
  normalProducts: ProductionRecord[];
  rejectProducts: RejectRecord[];
}

// 等外品类型对应的固定规格(kg/件)
const REJECT_SPECS: Record<string, number> = {
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
  quantity: 0 as number | string,
  remark: "",
});

// 等外品表单
const rejectForm = reactive({
  rejectType: "变形",
  sourceGrade: "一级",
  spec: 12,
  quantity: 0 as number | string,
  remark: "",
});

// 待提交列表
const pendingNormalList = ref<NormalItem[]>([]);
const pendingRejectList = ref<RejectItem[]>([]);

const normalFormRef = ref<FormInstance>();
const rejectFormRef = ref<FormInstance>();
void normalFormRef; // 保留用于模板引用
void rejectFormRef;
const batchList = ref<BatchRecord[]>([]);
const expandedRowKeys = ref<string[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const rejectCollapse = ref<string[]>([]);

// 所有记录（用于展开详情）
const allNormalRecords = ref<ProductionRecord[]>([]);
const allRejectRecords = ref<RejectRecord[]>([]);

// 计算重量
const normalWeight = computed(() => Number(normalForm.quantity) * Number(normalForm.spec));
const rejectWeight = computed(() => rejectForm.spec * Number(rejectForm.quantity));

const shiftMap: Record<string, string> = {
  day: "白班",
  night: "夜班",
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
const handleRejectTypeChange = (type: string) => {
  rejectForm.spec = REJECT_SPECS[type] || 12;
};

// 添加等级内产品到待提交列表
const addNormalItem = () => {
  if (!normalForm.spec || Number(normalForm.quantity) <= 0) {
    ElMessage.warning("请填写规格和数量");
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
const addRejectItem = () => {
  if (Number(rejectForm.quantity) <= 0) {
    ElMessage.warning("请填写数量");
    return;
  }
  pendingRejectList.value.push({
    rejectType: rejectForm.rejectType,
    sourceGrade: rejectForm.sourceGrade,
    spec: rejectForm.spec,
    quantity: Number(rejectForm.quantity),
    weight: rejectWeight.value,
    remark: rejectForm.remark,
  });
  // 重置表单
  rejectForm.quantity = 0;
  rejectForm.remark = "";
};

// 删除待提交项
const removeNormalItem = (index: number) => {
  pendingNormalList.value.splice(index, 1);
};

const removeRejectItem = (index: number) => {
  pendingRejectList.value.splice(index, 1);
};

// 清空所有待提交项
const handleClearAll = () => {
  pendingNormalList.value = [];
  pendingRejectList.value = [];
  rejectCollapse.value = [];
};

// 批量提交
const handleBatchSubmit = async () => {
  if (!commonData.date) {
    ElMessage.warning("请选择生产日期");
    return;
  }
  if (!commonData.batchNo) {
    ElMessage.warning("请输入批次号");
    return;
  }

  const total = pendingNormalList.value.length + pendingRejectList.value.length;
  if (total === 0) {
    ElMessage.warning("请先添加产品");
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
      errorMsg += `等级内-${gradeMap[item.grade]}: ${error.message || "失败"}; `;
    }
  }

  // 提交等外品
  for (const item of pendingRejectList.value) {
    try {
      await request.post("/rejects", {
        date: commonData.date,
        batchNo: commonData.batchNo,
        shift: commonData.shift,
        rejectType: item.rejectType,
        sourceGrade: item.sourceGrade,
        spec: item.spec,
        quantity: item.quantity,
        weight: item.weight,
        remark: item.remark,
      });
      successCount++;
    } catch (error: any) {
      errorMsg += `等外品-${item.rejectType}: ${error.message || "失败"}; `;
    }
  }

  submitLoading.value = false;

  if (successCount > 0) {
    ElMessage.success(`成功提交 ${successCount} 条记录`);
    pendingNormalList.value = [];
    pendingRejectList.value = [];
    rejectCollapse.value = [];
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
    (r) => r.date === row.date && r.batchNo === row.batchNo && r.shift === row.shift
  );
  row.rejectProducts = allRejectRecords.value.filter(
    (r) => r.date === row.date && r.batchNo === row.batchNo && r.shift === row.shift
  );
};

// 获取当日生产记录
const fetchTodayRecords = async () => {
  loading.value = true;
  try {
    const [normalRes, rejectRes] = await Promise.all([
      request.get("/production"),
      request.get("/rejects"),
    ]);

    const allNormal: ProductionRecord[] = Array.isArray(normalRes) ? normalRes : [];
    const allReject: RejectRecord[] = Array.isArray(rejectRes) ? rejectRes : [];

    // 缓存所有记录
    allNormalRecords.value = allNormal;
    allRejectRecords.value = allReject;

    // 过滤今日记录
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const todayNormal = allNormal.filter((r) => {
      const parts = r.date?.split(/[.\-]/) || [];
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        return parseInt(parts[0]) === year && parseInt(parts[1]) === month && parseInt(parts[2]) === day;
      }
      return false;
    });

    const todayReject = allReject.filter((r) => {
      const parts = r.date?.split(/[.\-]/) || [];
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        return parseInt(parts[0]) === year && parseInt(parts[1]) === month && parseInt(parts[2]) === day;
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
          rejectCount: 0,
          totalQuantity: 0,
          totalWeight: 0,
          normalProducts: [],
          rejectProducts: [],
        });
      }
      const batch = batchMap.get(key)!;
      batch.normalCount++;
      batch.totalQuantity += r.quantity || 0;
      batch.totalWeight += r.weight || 0;
    });

    todayReject.forEach((r) => {
      const key = `${r.date}-${r.batchNo}-${r.shift}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, {
          date: r.date,
          shift: r.shift,
          batchNo: r.batchNo,
          normalCount: 0,
          rejectCount: 0,
          totalQuantity: 0,
          totalWeight: 0,
          normalProducts: [],
          rejectProducts: [],
        });
      }
      const batch = batchMap.get(key)!;
      batch.rejectCount++;
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
    ElMessage.error("获取生产记录失败");
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
