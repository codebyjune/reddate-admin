<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-gray-800">生产记录列表</h2>
            <p class="text-sm text-gray-400">查看所有红枣加工生产记录</p>
          </div>
          <el-button type="primary" @click="goToCreate">
            <el-icon><Plus /></el-icon>
            新增生产
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="mb-4">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY.MM.DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="searchForm.shift" placeholder="全部班次" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="白班" value="day" />
            <el-option label="夜班" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="searchForm.batchNo" placeholder="请输入批次号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 批次列表表格 -->
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
                <el-table-column prop="weight" label="重量(吨)" width="100">
                  <template #default="{ row: r }">{{ ((r.weight || 0) / 1000).toFixed(3) }}</template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" />
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ row: r }">
                    <el-button type="danger" size="small" link @click="handleDeleteNormal(r)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="row.rejectProducts && row.rejectProducts.length > 0">
                <div class="mb-2 text-sm font-medium text-gray-600">等外品</div>
                <el-table :data="row.rejectProducts" size="small" border>
                  <el-table-column prop="rejectType" label="类型" width="80" />
                  <el-table-column prop="sourceGrade" label="来源等级" width="80" />
                  <el-table-column prop="spec" label="规格(kg)" width="80" />
                  <el-table-column prop="quantity" label="数量(件)" width="80" />
                  <el-table-column prop="weight" label="重量(吨)" width="100">
                    <template #default="{ row: r }">{{ ((r.weight || 0) / 1000).toFixed(3) }}</template>
                  </el-table-column>
                  <el-table-column prop="remark" label="备注" />
                  <el-table-column label="操作" width="80" align="center">
                    <template #default="{ row: r }">
                      <el-button type="danger" size="small" link @click="handleDeleteReject(r)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-else class="text-gray-400 text-sm">暂无等外品记录</div>
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

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";

interface ProductionRecord {
  id: number;
  date: string;
  shift: string;
  batchNo: string;
  grade: string;
  spec: string;
  quantity: number;
  weight: number;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
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
  remark: string | null;
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

const router = useRouter();
const loading = ref(false);
const batchList = ref<BatchRecord[]>([]);
const expandedRowKeys = ref<string[]>([]);

// 所有记录（用于展开详情）
const allNormalRecords = ref<ProductionRecord[]>([]);
const allRejectRecords = ref<RejectRecord[]>([]);

const searchForm = reactive({
  dateRange: [] as string[],
  shift: "",
  batchNo: "",
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 班次映射
const shiftMap: Record<string, string> = {
  day: "白班",
  night: "夜班",
};

// 产品等级映射
const gradeMap: Record<string, string> = {
  KingGrade: "枣王",
  SuperPremium: "超特",
  PremiumGrade: "特级",
  Grade1: "一级",
  Grade2: "二级",
  Grade3: "三级",
};

// 处理批次展开
const handleBatchExpand = (row: BatchRecord) => {
  row.normalProducts = allNormalRecords.value.filter(
    (r) => r.date === row.date && r.batchNo === row.batchNo && r.shift === row.shift
  );
  row.rejectProducts = allRejectRecords.value.filter(
    (r) => r.date === row.date && r.batchNo === row.batchNo && r.shift === row.shift
  );
};

// 搜索
const handleSearch = () => {
  fetchRecords();
};

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = [];
  searchForm.shift = "";
  searchForm.batchNo = "";
  pagination.page = 1;
  fetchRecords();
};

// 获取所有记录
const fetchRecords = async () => {
  loading.value = true;
  try {
    const [normalRes, rejectRes] = await Promise.all([
      request.get("/production"),
      request.get("/rejects"),
    ]);

    let allNormal: ProductionRecord[] = Array.isArray(normalRes) ? normalRes : [];
    let allReject: RejectRecord[] = Array.isArray(rejectRes) ? rejectRes : [];

    // 缓存所有记录
    allNormalRecords.value = allNormal;
    allRejectRecords.value = allReject;

    // 筛选
    if (searchForm.shift) {
      allNormal = allNormal.filter((r) => r.shift === searchForm.shift);
      allReject = allReject.filter((r) => r.shift === searchForm.shift);
    }
    if (searchForm.batchNo) {
      allNormal = allNormal.filter((r) => r.batchNo.includes(searchForm.batchNo));
      allReject = allReject.filter((r) => r.batchNo.includes(searchForm.batchNo));
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const start = searchForm.dateRange[0];
      const end = searchForm.dateRange[1];
      if (start && end) {
        // 标准化日期格式为 YYYY.MM.DD 以便比较
        const normalizeDate = (dateStr: string) => {
          const parts = dateStr.split(/[.\-]/);
          if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
            const [y, m, d] = parts;
            return `${y}.${m.padStart(2, '0')}.${d.padStart(2, '0')}`;
          }
          return dateStr;
        };
        allNormal = allNormal.filter((r) => {
          const normalized = normalizeDate(r.date);
          return normalized >= start && normalized <= end;
        });
        allReject = allReject.filter((r) => {
          const normalized = normalizeDate(r.date);
          return normalized >= start && normalized <= end;
        });
      }
    }

    // 按批次分组
    const batchMap = new Map<string, BatchRecord>();

    allNormal.forEach((r) => {
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

    allReject.forEach((r) => {
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
    const sortedBatches = Array.from(batchMap.values()).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.shift === b.shift ? 0 : a.shift === "day" ? -1 : 1;
    });

    pagination.total = sortedBatches.length;

    // 分页
    const start = (pagination.page - 1) * pagination.pageSize;
    batchList.value = sortedBatches.slice(start, start + pagination.pageSize);
  } catch (error: any) {
    console.error("获取生产记录失败:", error);
    ElMessage.error("获取生产记录失败");
  } finally {
    loading.value = false;
  }
};

// 删除等级内产品
const handleDeleteNormal = async (record: ProductionRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除该等级内产品记录吗？`,
      "提示",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
    );
    await request.delete(`/production/${record.id}`);
    ElMessage.success("删除成功");
    fetchRecords();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 删除等外品
const handleDeleteReject = async (record: RejectRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除该等外品记录吗？`,
      "提示",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
    );
    await request.delete(`/rejects/${record.id}`);
    ElMessage.success("删除成功");
    fetchRecords();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

// 跳转到新增页面
const goToCreate = () => {
  router.push("/production");
};

onMounted(() => {
  fetchRecords();
});
</script>

<style scoped>
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}
</style>
