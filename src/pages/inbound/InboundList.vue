<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-2">
          <h2 class="text-lg font-semibold">{{ t("inbound.title") }}</h2>
          <el-button type="primary" @click="$router.push('/inbound/create')">
            <el-icon><Plus /></el-icon>
            {{ t("inbound.add") }}
          </el-button>
        </div>
      </template>

      <!-- 筛选区域 -->
      <el-form :inline="true" :model="filterForm" class="mb-4">
        <el-form-item :label="t('inbound.inboundDate')">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="-"
            :start-placeholder="t('productionList.startDate')"
            :end-placeholder="t('productionList.endDate')"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item :label="t('inbound.inboundNo')">
          <el-input v-model="filterForm.deliveryNo" :placeholder="t('inbound.enterNo')" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item :label="t('inbound.licensePlate')">
          <el-input v-model="filterForm.licensePlate" :placeholder="t('inbound.enterPlate')" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">{{ t("common.search") }}</el-button>
          <el-button @click="resetFilter">{{ t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" stripe v-loading="loading" @expand-change="handleExpandChange">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="p-4 bg-gray-50">
              <h4 class="font-medium mb-2 text-gray-700">{{ t("inbound.productDetail") }}</h4>
              <el-table :data="row.products" size="small" border>
                <el-table-column prop="contractName" :label="t('inbound.contractName')" min-width="150" />
                <el-table-column prop="quantity" :label="t('inbound.boxCount')" width="100" />
                <el-table-column prop="netWeight" :label="t('inbound.netWeightBox')" width="120">
                  <template #default="{ row }">{{ row.netWeight?.toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="yieldRate" :label="t('inbound.yieldRate')" width="100">
                  <template #default="{ row }">{{ row.yieldRate || '-' }}</template>
                </el-table-column>
                <el-table-column prop="lossRate" :label="t('inbound.lossRate')" width="100">
                  <template #default="{ row }">{{ row.lossRate || '-' }}</template>
                </el-table-column>
                <el-table-column prop="moistureRate" :label="t('inbound.moistureRate')" width="100">
                  <template #default="{ row }">{{ row.moistureRate || '-' }}</template>
                </el-table-column>
                <el-table-column prop="unitPrice" :label="t('inbound.unitPrice')" width="100">
                  <template #default="{ row }">{{ row.unitPrice?.toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="remark" :label="t('common.remark')" min-width="100">
                  <template #default="{ row }">{{ row.remark || '-' }}</template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryDate" :label="t('inbound.inboundDate')" width="120" />
        <el-table-column prop="deliveryNo" :label="t('inbound.inboundNo')" width="160" />
        <el-table-column prop="licensePlate" :label="t('inbound.licensePlate')" width="100" />
        <el-table-column prop="driver" :label="t('inbound.driver')" width="80" />
        <el-table-column prop="origin" :label="t('inbound.origin')" min-width="120" />
        <el-table-column prop="destination" :label="t('inbound.destination')" min-width="120" />
        <el-table-column :label="t('inbound.productCount')" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.products?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('inbound.totalBoxes')" width="90" align="center">
          <template #default="{ row }">
            {{ calculateTotalBoxes(row.products) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('inbound.totalNetWeight')" width="110" align="center">
          <template #default="{ row }">
            {{ calculateTotalWeight(row.products).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">{{ t("common.edit") }}</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">{{ t("common.delete") }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex flex-wrap justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";

const router = useRouter();
const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);

const filterForm = reactive({
  dateRange: [] as string[],
  deliveryNo: "",
  licensePlate: "",
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 计算总箱数
const calculateTotalBoxes = (products: any[]) => {
  if (!products) return 0;
  return products.reduce((sum, p) => sum + (p.quantity || 0), 0);
};

// 计算总净重(吨)
const calculateTotalWeight = (products: any[]) => {
  if (!products) return 0;
  const totalKg = products.reduce((sum, p) => sum + (p.netWeight || 0) * (p.quantity || 0), 0);
  return totalKg / 1000;
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    let data = await request.get<any[]>("/inbound");

    // 筛选
    if (filterForm.deliveryNo) {
      data = data.filter((item: any) => item.deliveryNo.includes(filterForm.deliveryNo));
    }
    if (filterForm.licensePlate) {
      data = data.filter((item: any) => item.licensePlate.includes(filterForm.licensePlate));
    }
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      const [start, end] = filterForm.dateRange;
      if (start && end) {
        data = data.filter((item: any) => item.deliveryDate >= start && item.deliveryDate <= end);
      }
    }

    pagination.total = data.length;

    // 分页
    const start = (pagination.page - 1) * pagination.pageSize;
    tableData.value = data.slice(start, start + pagination.pageSize);
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage.error(t("inbound.fetchFailed"));
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilter = () => {
  filterForm.dateRange = [];
  filterForm.deliveryNo = "";
  filterForm.licensePlate = "";
  pagination.page = 1;
  fetchData();
};

// 处理展开
const handleExpandChange = (_row: any, _expandedRows: any[]) => {
  // 可以在这里加载详细数据
};

// 编辑
const handleEdit = (row: any) => {
  router.push(`/inbound/edit/${row.id}`);
};

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(t("inbound.deleteConfirm", [row.deliveryNo]), t("header.prompt"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    });

    await request.delete(`/inbound/${row.id}`);
    ElMessage.success(t("inbound.deleteSuccess"));
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || t("inbound.deleteFailed"));
    }
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
}
:deep(.el-table .el-table__cell:last-child .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
