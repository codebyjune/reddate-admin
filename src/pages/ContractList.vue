<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-gray-800">合同列表</h2>
            <p class="text-sm text-gray-400">查看已上传的红枣收购合同</p>
          </div>
          <el-button type="primary" @click="goToCreate">
            <el-icon><Plus /></el-icon>
            新增合同
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="mb-4">
        <el-form-item label="合同编号">
          <el-input
            v-model="searchForm.contractNo"
            placeholder="请输入合同编号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="乙方名称">
          <el-input
            v-model="searchForm.partyBName"
            placeholder="请输入乙方名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchContracts">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 合同列表表格 -->
      <el-table :data="contracts" stripe v-loading="loading">
        <el-table-column prop="contractNo" label="合同编号" width="150" />
        <el-table-column prop="signDate" label="签订日期" width="120" />
        <el-table-column prop="partyBName" label="乙方名称" width="120" />
        <el-table-column prop="partyBPhone" label="联系电话" width="130" />
        <el-table-column prop="plantingArea" label="种植面积(亩)" width="110">
          <template #default="{ row }">
            {{ row.plantingArea?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="purchaseQuantity"
          label="购买数量(吨)"
          width="120"
        >
          <template #default="{ row }">
            {{ row.purchaseQuantity?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="收购单价(元/kg)" width="130">
          <template #default="{ row }">
            {{ row.unitPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="deposit" label="预付定金(元)" width="120">
          <template #default="{ row }">
            {{ row.deposit?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="purchaseManager"
          label="采购负责人"
          width="110"
        />
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
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchContracts"
          @current-change="fetchContracts"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="合同详情" width="700px">
      <el-descriptions :column="2" border v-if="currentContract">
        <el-descriptions-item label="合同编号">
          {{ currentContract.contractNo }}
        </el-descriptions-item>
        <el-descriptions-item label="签订日期">
          {{ currentContract.signDate }}
        </el-descriptions-item>
        <el-descriptions-item label="乙方名称">
          {{ currentContract.partyBName }}
        </el-descriptions-item>
        <el-descriptions-item label="身份证号">
          {{ currentContract.partyBIdCard }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentContract.partyBPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="银行卡号">
          {{ currentContract.partyBBankCard || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="种植面积">
          {{ currentContract.plantingArea?.toFixed(2) }} 亩
        </el-descriptions-item>
        <el-descriptions-item label="购买数量">
          {{ currentContract.purchaseQuantity?.toFixed(2) }} 吨
        </el-descriptions-item>
        <el-descriptions-item label="收购单价">
          {{ currentContract.unitPrice?.toFixed(2) }} 元/公斤
        </el-descriptions-item>
        <el-descriptions-item label="预付定金">
          {{ currentContract.deposit?.toFixed(2) }} 元
        </el-descriptions-item>
        <el-descriptions-item label="纸箱数量">
          {{ currentContract.boxQuantity }} 个
        </el-descriptions-item>
        <el-descriptions-item label="采购负责人">
          {{ currentContract.purchaseManager || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentContract.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(currentContract.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item
          label="合同图片"
          :span="2"
          v-if="currentContract.contractImage"
        >
          <el-image
            :src="currentContract.contractImage"
            :preview-src-list="[currentContract.contractImage]"
            fit="contain"
            style="max-width: 300px; max-height: 200px"
          />
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

interface Contract {
  id: number;
  contractNo: string;
  signDate: string;
  partyBName: string;
  partyBIdCard: string;
  partyBPhone: string;
  partyBBankCard: string | null;
  plantingArea: number;
  purchaseQuantity: number;
  unitPrice: number;
  deposit: number;
  boxQuantity: number;
  purchaseManager: string | null;
  contractImage: string | null;
  createdAt: string;
  updatedAt: string;
}

const router = useRouter();
const contracts = ref<Contract[]>([]);
const loading = ref(false);
const detailVisible = ref(false);
const currentContract = ref<Contract | null>(null);

const searchForm = reactive({
  contractNo: "",
  partyBName: "",
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 获取合同列表
const fetchContracts = async () => {
  loading.value = true;
  try {
    // TODO: 以下 params 预留给后端分页使用
    // 当前后端返回全部数据，分页逻辑在前端处理
    // 如需切换到后端分页，取消注释并修改后端接口支持 page 和 pageSize 参数
    // const params: Record<string, string | number> = {
    //   page: pagination.page,
    //   pageSize: pagination.pageSize,
    // };

    // 当前使用前端分页：后端返回全部数据，前端再做过滤和分页
    const res = await request.get("/contracts");
    let data: Contract[] = Array.isArray(res) ? res : [];

    // ========== 前端过滤 ==========
    // 根据合同编号过滤
    if (searchForm.contractNo) {
      data = data.filter((c: Contract) =>
        c.contractNo.includes(searchForm.contractNo),
      );
    }

    // 根据乙方名称过滤
    if (searchForm.partyBName) {
      data = data.filter((c: Contract) =>
        c.partyBName.includes(searchForm.partyBName),
      );
    }

    // ========== 前端分页 ==========
    // 分页公式：(当前页 - 1) × 每页条数 = 起始索引
    // 例如：第2页，每页10条 → (2-1) × 10 = 10，从索引10开始截取
    pagination.total = data.length; // 更新总数

    const start = (pagination.page - 1) * pagination.pageSize;
    contracts.value = data.slice(start, start + pagination.pageSize);
  } catch (error: any) {
    console.error("获取合同列表失败:", error);
    ElMessage.error(error.message || "获取合同列表失败");
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.contractNo = "";
  searchForm.partyBName = "";
  pagination.page = 1;
  fetchContracts();
};

// 跳转到新增页面
const goToCreate = () => {
  router.push("/contract");
};

// 查看详情
const viewDetail = (contract: Contract) => {
  currentContract.value = contract;
  detailVisible.value = true;
};

// 删除合同
const handleDelete = async (contract: Contract) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除合同 ${contract.contractNo} 吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    await request.delete(`/contracts/${contract.id}`);
    ElMessage.success("删除成功");
    fetchContracts();
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
  fetchContracts();
});
</script>

<style scoped></style>
