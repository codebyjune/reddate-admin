<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-gray-800">销售记录列表</h2>
            <p class="text-sm text-gray-400">查看现货销售和期货交割记录</p>
          </div>
          <el-button type="primary" @click="goToCreate">
            <el-icon><Plus /></el-icon>
            新增销售
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="mb-4">
        <el-form-item label="销售类型">
          <el-select
            v-model="searchForm.salesType"
            placeholder="全部类型"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="现货销售" value="现货" />
            <el-option label="期货交割" value="期货交割" />
          </el-select>
        </el-form-item>
        <el-form-item label="销售单号">
          <el-input
            v-model="searchForm.salesNo"
            placeholder="请输入销售单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchSalesRecords">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 销售记录表格 -->
      <el-table :data="salesRecords" stripe v-loading="loading">
        <el-table-column prop="salesType" label="销售类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.salesType === '现货' ? 'success' : 'warning'" size="small">
              {{ row.salesType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salesDate" label="销售日期" width="120" />
        <el-table-column prop="salesNo" label="销售单号" width="160" />
        <el-table-column prop="productLevel" label="产品等级" width="100">
          <template #default="{ row }">
            {{ getLevelLabel(row.productLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量(件)" width="90" />
        <el-table-column prop="netWeight" label="净重(kg)" width="100">
          <template #default="{ row }">
            {{ row.netWeight?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价(元/kg)" width="110">
          <template #default="{ row }">
            {{ row.unitPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额(元)" width="110">
          <template #default="{ row }">
            {{ row.totalAmount?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="客户/仓库" width="120">
          <template #default="{ row }">
            {{ row.salesType === '现货' ? row.customerName : row.warehouse || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row)"
              size="small"
            >
              {{ getStatusLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
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
          @size-change="fetchSalesRecords"
          @current-change="fetchSalesRecords"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="销售详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <!-- 基本信息 -->
        <el-descriptions-item label="销售类型">
          <el-tag :type="currentRecord.salesType === '现货' ? 'success' : 'warning'">
            {{ currentRecord.salesType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="销售日期">
          {{ currentRecord.salesDate }}
        </el-descriptions-item>
        <el-descriptions-item label="销售单号">
          {{ currentRecord.salesNo }}
        </el-descriptions-item>
        <el-descriptions-item label="规格">
          {{ currentRecord.spec || '-' }} kg/件
        </el-descriptions-item>

        <!-- 产品信息 -->
        <el-descriptions-item label="产品等级">
          {{ getLevelLabel(currentRecord.productLevel) }}
        </el-descriptions-item>
        <el-descriptions-item label="销售数量">
          {{ currentRecord.quantity }} 件
        </el-descriptions-item>
        <el-descriptions-item label="净重">
          {{ currentRecord.netWeight?.toFixed(2) }} kg
        </el-descriptions-item>
        <el-descriptions-item label="销售单价">
          {{ currentRecord.unitPrice?.toFixed(2) }} 元/kg
        </el-descriptions-item>
        <el-descriptions-item label="总金额">
          {{ currentRecord.totalAmount?.toFixed(2) }} 元
        </el-descriptions-item>

        <!-- 现货专用：客户信息 -->
        <template v-if="currentRecord.salesType === '现货'">
          <el-descriptions-item label="客户名称">
            {{ currentRecord.customerName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentRecord.customerPhone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="客户地址" :span="2">
            {{ currentRecord.customerAddress || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="付款方式">
            {{ currentRecord.paymentMethod || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="付款状态">
            <el-tag :type="getPaymentStatusType(currentRecord.paymentStatus)">
              {{ currentRecord.paymentStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已付金额">
            {{ currentRecord.paidAmount?.toFixed(2) }} 元
          </el-descriptions-item>
        </template>

        <!-- 期货交割专用 -->
        <template v-if="currentRecord.salesType === '期货交割'">
          <el-descriptions-item label="期货合约">
            {{ currentRecord.contractMonth || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="交割仓库">
            {{ currentRecord.warehouse || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="仓库代码">
            {{ currentRecord.warehouseCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="仓单编号">
            {{ currentRecord.warrantNo || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="交割状态">
            <el-tag :type="getDeliveryStatusType(currentRecord.deliveryStatus)">
              {{ currentRecord.deliveryStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="结算金额">
            {{ currentRecord.settleAmount?.toFixed(2) }} 元
          </el-descriptions-item>
        </template>

        <!-- 经办人信息 -->
        <el-descriptions-item label="经办人">
          {{ currentRecord.salesPerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentRecord.remark || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentRecord.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(currentRecord.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, View, Delete } from "@element-plus/icons-vue";
import request from "@/utils/request";

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
    ElMessage.error(error.message || "获取销售记录列表失败");
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
      `确定要删除销售单 ${record.salesNo} 吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await request.delete(`/sales/${record.id}`);
    ElMessage.success("删除成功");
    fetchSalesRecords();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error.message || "删除失败");
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
