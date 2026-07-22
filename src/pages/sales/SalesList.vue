<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-wrap justify-between items-center gap-2">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-gray-800">{{ t("sales.listTitle") }}</h2>
            <p class="text-sm text-gray-400">{{ t("sales.listDesc") }}</p>
          </div>
          <el-button type="primary" @click="goToCreate">
            <el-icon><Plus /></el-icon>
            {{ t("sales.add") }}
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="mb-4">
        <el-form-item :label="t('sales.salesType')">
          <el-select
            v-model="searchForm.salesType"
            :placeholder="t('sales.allTypes')"
            clearable
            style="width: 150px"
          >
            <el-option :label="t('common.all')" value="" />
            <el-option :label="t('sales.spotSales')" value="现货" />
            <el-option :label="t('sales.futures')" value="期货交割" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('sales.no')">
          <el-input
            v-model="searchForm.salesNo"
            :placeholder="t('sales.enterSalesNo')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchSalesRecords">{{ t("common.search") }}</el-button>
          <el-button @click="resetSearch">{{ t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>

      <!-- 销售记录表格 -->
      <el-table :data="salesRecords" stripe v-loading="loading">
        <el-table-column prop="salesType" :label="t('sales.salesType')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.salesType === '现货' ? 'success' : 'warning'" size="small">
              {{ row.salesType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salesDate" :label="t('sales.date')" width="120" />
        <el-table-column prop="salesNo" :label="t('sales.no')" width="160" />
        <el-table-column prop="productLevel" :label="t('sales.level')" width="100">
          <template #default="{ row }">
            {{ getLevelLabel(row.productLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" :label="t('sales.qty')" width="90" />
        <el-table-column prop="netWeight" :label="t('sales.netWeightCol')" width="100">
          <template #default="{ row }">
            {{ row.netWeight?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" :label="t('sales.unitPriceCol')" width="110">
          <template #default="{ row }">
            {{ row.unitPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" :label="t('sales.totalAmountCol')" width="110">
          <template #default="{ row }">
            {{ row.totalAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('sales.customerWarehouse')" width="120">
          <template #default="{ row }">
            {{ row.salesType === '现货' ? row.customerName : row.warehouse || '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('sales.status')" width="90">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row)"
              size="small"
            >
              {{ getStatusLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              {{ t("common.view") }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              {{ t("common.delete") }}
            </el-button>
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
          @size-change="fetchSalesRecords"
          @current-change="fetchSalesRecords"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="t('sales.detailTitle')" :width="'90%'" style="max-width: 700px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <!-- 基本信息 -->
        <el-descriptions-item :label="t('sales.salesType')">
          <el-tag :type="currentRecord.salesType === '现货' ? 'success' : 'warning'">
            {{ currentRecord.salesType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.date')">
          {{ currentRecord.salesDate }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.no')">
          {{ currentRecord.salesNo }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.specLabel')">
          {{ t('sales.specValue', [currentRecord.spec || '-']) }}
        </el-descriptions-item>

        <!-- 产品信息 -->
        <el-descriptions-item :label="t('sales.level')">
          {{ getLevelLabel(currentRecord.productLevel) }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.salesQtyLabel')">
          {{ currentRecord.quantity }} {{ t('common.pieces') }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.netWeightLabel')">
          {{ currentRecord.netWeight?.toFixed(2) }} {{ t('common.kg') }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.unitPriceLabel')">
          {{ currentRecord.unitPrice?.toFixed(2) }} {{ t('sales.priceUnit') }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.totalAmountLabel')">
          {{ currentRecord.totalAmount?.toFixed(2) }} {{ t('common.yuan') }}
        </el-descriptions-item>

        <!-- 现货专用：客户信息 -->
        <template v-if="currentRecord.salesType === '现货'">
          <el-descriptions-item :label="t('sales.customerNameLabel')">
            {{ currentRecord.customerName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.customerPhoneLabel')">
            {{ currentRecord.customerPhone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.customerAddressLabel')" :span="2">
            {{ currentRecord.customerAddress || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.paymentMethodLabel')">
            {{ currentRecord.paymentMethod || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.paymentStatusLabel')">
            <el-tag :type="getPaymentStatusType(currentRecord.paymentStatus)">
              {{ currentRecord.paymentStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.paidAmountLabel')">
            {{ currentRecord.paidAmount?.toFixed(2) }} {{ t('common.yuan') }}
          </el-descriptions-item>
        </template>

        <!-- 期货交割专用 -->
        <template v-if="currentRecord.salesType === '期货交割'">
          <el-descriptions-item :label="t('sales.contractMonthLabel')">
            {{ currentRecord.contractMonth || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.warehouseLabel')">
            {{ currentRecord.warehouse || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.warehouseCodeLabel')">
            {{ currentRecord.warehouseCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.warrantNoLabel')">
            {{ currentRecord.warrantNo || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.deliveryStatusLabel')">
            <el-tag :type="getDeliveryStatusType(currentRecord.deliveryStatus)">
              {{ currentRecord.deliveryStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('sales.settleAmountLabel2')">
            {{ currentRecord.settleAmount?.toFixed(2) }} {{ t('common.yuan') }}
          </el-descriptions-item>
        </template>

        <!-- 经办人信息 -->
        <el-descriptions-item :label="t('sales.managerLabel')">
          {{ currentRecord.salesPerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.remarkLabel')" :span="2">
          {{ currentRecord.remark || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.createdAtLabel')">
          {{ formatDate(currentRecord.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('sales.updatedAtLabel')">
          {{ formatDate(currentRecord.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ t("common.close") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, View, Delete } from "@element-plus/icons-vue";
import request from "@/utils/request";
import { useI18n } from "vue-i18n";

interface SalesRecord {
  id: number;
  salesType: string;
  salesDate: string;
  salesNo: string;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  productLevel: string;
  spec: string | null;
  quantity: number;
  netWeight: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  paidAmount: number;
  contractMonth: string | null;
  warehouse: string | null;
  warehouseCode: string | null;
  warrantNo: string | null;
  deliveryStatus: string;
  settleAmount: number;
  salesPerson: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

const router = useRouter();
const salesRecords = ref<SalesRecord[]>([]);
const loading = ref(false);
const detailVisible = ref(false);
const currentRecord = ref<SalesRecord | null>(null);
const { t } = useI18n();

const searchForm = reactive({
  salesType: "",
  salesNo: "",
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 产品等级映射
const levelMap: Record<string, string> = {
  KingGrade: "枣王",
  SuperPremium: "超特",
  PremiumGrade: "特级",
  Grade1: "一级",
  Grade2: "二级",
  Grade3: "三级",
};

const getLevelLabel = (level: string) => {
  return levelMap[level] || level;
};

// 获取状态类型和标签
const getStatusType = (row: SalesRecord) => {
  if (row.salesType === "现货") {
    return getPaymentStatusType(row.paymentStatus);
  } else {
    return getDeliveryStatusType(row.deliveryStatus);
  }
};

const getStatusLabel = (row: SalesRecord) => {
  if (row.salesType === "现货") {
    return row.paymentStatus;
  } else {
    return row.deliveryStatus;
  }
};

const getPaymentStatusType = (status: string) => {
  const types: Record<string, string> = {
    "未付款": "danger",
    "部分付款": "warning",
    "已付款": "success",
  };
  return types[status] || "info";
};

const getDeliveryStatusType = (status: string) => {
  const types: Record<string, string> = {
    "待交割": "warning",
    "已交割": "success",
    "已注销": "info",
  };
  return types[status] || "info";
};

// 获取销售记录列表
const fetchSalesRecords = async () => {
  loading.value = true;
  try {
    const res = await request.get("/sales");
    let data: SalesRecord[] = Array.isArray(res) ? res : [];

    // 前端过滤
    if (searchForm.salesType) {
      data = data.filter((r) => r.salesType === searchForm.salesType);
    }
    if (searchForm.salesNo) {
      data = data.filter((r) => r.salesNo.includes(searchForm.salesNo));
    }

    pagination.total = data.length;
    // 前端分页
    const start = (pagination.page - 1) * pagination.pageSize;
    salesRecords.value = data.slice(start, start + pagination.pageSize);
  } catch (error: any) {
    console.error("获取销售记录列表失败:", error);
    ElMessage.error(error.message || t("sales.fetchFailed"));
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.salesType = "";
  searchForm.salesNo = "";
  pagination.page = 1;
  fetchSalesRecords();
};

// 跳转到新增页面
const goToCreate = () => {
  router.push("/sales");
};

// 查看详情
const viewDetail = (record: SalesRecord) => {
  currentRecord.value = record;
  detailVisible.value = true;
};

// 删除记录
const handleDelete = async (record: SalesRecord) => {
  try {
    await ElMessageBox.confirm(
      t("sales.deleteConfirm", [record.salesNo]),
      t("header.prompt"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    await request.delete(`/sales/${record.id}`);
    ElMessage.success(t("sales.deleteSuccess"));
    fetchSalesRecords();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error.message || t("sales.deleteFailed"));
    }
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchSalesRecords();
});
</script>

<style scoped>
</style>
