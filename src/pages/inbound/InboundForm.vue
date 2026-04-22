<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">{{ isEdit ? '编辑入库记录' : '原料入库' }}</h2>
          <p class="text-sm text-gray-400">{{ isEdit ? '修改入库记录信息' : '用于记录卡车运输入库的详细信息和产品明细' }}</p>
        </div>
      </template>

      <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
        <div class="mb-4">
          <h3 class="text-base font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">基础信息</h3>
          <el-row :gutter="20" class="mb-1">
            <el-col :span="8">
              <el-form-item label="发货日期" prop="deliveryDate">
                <el-date-picker v-model="formData.deliveryDate" type="date" placeholder="选择发货日期" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="编号" prop="deliveryNo">
                <el-input v-model="formData.deliveryNo" placeholder="请输入编号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="车牌号" prop="licensePlate">
                <el-input v-model="formData.licensePlate" placeholder="请输入车牌号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb-2">
            <el-col :span="8">
              <el-form-item label="司机" prop="driver">
                <el-input v-model="formData.driver" placeholder="请输入司机姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="司机电话" prop="driverPhone">
                <el-input v-model="formData.driverPhone" placeholder="请输入司机电话" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="起始地" prop="origin">
                <el-input v-model="formData.origin" placeholder="请输入起始地" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb-2">
            <el-col :span="8">
              <el-form-item label="发货人" prop="sender">
                <el-input v-model="formData.sender" placeholder="请输入发货人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="发货人电话" prop="senderPhone">
                <el-input v-model="formData.senderPhone" placeholder="请输入发货人电话" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="目的地" prop="destination">
                <el-input v-model="formData.destination" placeholder="请输入目的地" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb-2">
            <el-col :span="8">
              <el-form-item label="收货人" prop="receiver">
                <el-input v-model="formData.receiver" placeholder="请输入收货人" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-medium text-gray-700 border-l-4 border-blue-500 pl-2">产品明细</h3>
            <el-button type="primary" @click="handleAddProduct">+ 添加</el-button>
          </div>
          <el-table :data="productList" border stripe>
            <el-table-column prop="contractName" label="合同名称" min-width="120" />
            <el-table-column prop="quantity" label="数量(箱)" width="90" />
            <el-table-column prop="netWeight" label="净重/箱(KG)" width="120" />
            <el-table-column prop="yieldRate" label="出成率%" width="90" />
            <el-table-column prop="lossRate" label="损耗率%" width="90" />
            <el-table-column prop="moistureRate" label="含水率%" width="90" />
            <el-table-column prop="unitPrice" label="单价" width="90" />
            <el-table-column prop="remark" label="备注" min-width="100" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button type="danger" size="small" link @click="handleDeleteProduct($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="mb-4">
          <h3 class="text-base font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">签字确认</h3>
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="采购经理">
                <el-input v-model="formData.purchaseManager" placeholder="请输入采购经理姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发货人">
                <el-input v-model="formData.confirmSender" placeholder="请输入发货人姓名" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-row justify="center" class="mt-6">
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
          <el-button @click="handlePrint">打印</el-button>
        </el-row>
      </el-form>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加产品" width="600px">
      <el-form :model="productForm" label-width="120px" :rules="productRules" ref="productFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同名称" prop="contractName">
              <el-input v-model="productForm.contractName" placeholder="请输入合同名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量(箱)" prop="quantity">
              <el-input v-model.number="productForm.quantity" placeholder="请输入数量">
                <template #append>箱</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="净重/箱(KG)" prop="netWeight">
              <el-input v-model.number="productForm.netWeight" placeholder="请输入净重">
                <template #append>KG</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计出成率" prop="yieldRate">
              <el-input v-model.number="productForm.yieldRate" placeholder="请输入出成率">
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预计损耗率" prop="lossRate">
              <el-input v-model.number="productForm.lossRate" placeholder="请输入损耗率">
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计含水率" prop="moistureRate">
              <el-input v-model.number="productForm.moistureRate" placeholder="请输入含水率">
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单价" prop="unitPrice">
              <el-input v-model.number="productForm.unitPrice" placeholder="请输入单价">
                <template #append>元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="productForm.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import request from "@/utils/request";

const route = useRoute();
const router = useRouter();

// 编辑模式检测
const isEdit = computed(() => !!route.params.id);
const editId = computed(() => route.params.id as string);
const loading = ref(false);

interface DeliveryInfo {
  deliveryDate: string;
  deliveryNo: string;
  licensePlate: string;
  driver: string;
  driverPhone: string;
  origin: string;
  sender: string;
  senderPhone: string;
  destination: string;
  receiver: string;
  purchaseManager: string;
  confirmSender: string;
}

interface ProductItem {
  contractName: string;
  quantity: number;
  netWeight: number;
  yieldRate: number;
  lossRate: number;
  moistureRate: number;
  unitPrice: number;
  remark: string;
}

const formData = reactive<DeliveryInfo>({
  deliveryDate: "",
  deliveryNo: "",
  licensePlate: "",
  driver: "",
  driverPhone: "",
  origin: "",
  sender: "",
  senderPhone: "",
  destination: "",
  receiver: "",
  purchaseManager: "",
  confirmSender: "",
});

const productList = ref<ProductItem[]>([]);
const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const productFormRef = ref<FormInstance>();

const productForm = reactive<ProductItem>({
  contractName: "",
  quantity: 0,
  netWeight: 0,
  yieldRate: 0,
  lossRate: 0,
  moistureRate: 0,
  unitPrice: 0,
  remark: "",
});

const rules = reactive<FormRules>({
  deliveryDate: [{ required: true, message: "请选择发货日期", trigger: "change" }],
  deliveryNo: [
    { required: true, message: "请输入编号", trigger: "blur" },
    { min: 3, max: 20, message: "编号长度应在3-20位之间", trigger: "blur" },
  ],
  licensePlate: [{ required: true, message: "请输入车牌号", trigger: "blur" }],
  driver: [{ required: true, message: "请输入司机姓名", trigger: "blur" }],
  origin: [{ required: true, message: "请输入起始地", trigger: "blur" }],
  destination: [{ required: true, message: "请输入目的地", trigger: "blur" }],
});

const productRules = reactive<FormRules>({
  contractName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  quantity: [
    { required: true, message: "请输入数量", trigger: "blur" },
    { type: "number", min: 1, message: "数量必须大于0", trigger: "blur" },
  ],
  netWeight: [
    { required: true, message: "请输入净重", trigger: "blur" },
    { type: "number", min: 0.01, message: "净重必须大于0", trigger: "blur" },
  ],
  yieldRate: [{ type: "number", min: 0, max: 100, message: "出成率应在0-100之间", trigger: "blur" }],
  lossRate: [{ type: "number", min: 0, max: 100, message: "损耗率应在0-100之间", trigger: "blur" }],
  moistureRate: [{ type: "number", min: 0, max: 100, message: "含水率应在0-100之间", trigger: "blur" }],
  unitPrice: [
    { required: true, message: "请输入单价", trigger: "blur" },
    { type: "number", min: 0.01, message: "单价必须大于0", trigger: "blur" },
  ],
});

const emptyProductForm: ProductItem = {
  contractName: "",
  quantity: 0,
  netWeight: 0,
  yieldRate: 0,
  lossRate: 0,
  moistureRate: 0,
  unitPrice: 0,
  remark: "",
};

const handleAddProduct = () => {
  Object.assign(productForm, emptyProductForm);
  dialogVisible.value = true;
};

const handleDeleteProduct = (index: number) => {
  productList.value.splice(index, 1);
};

const handleConfirmProduct = async () => {
  await productFormRef.value?.validate((valid) => {
    if (valid) {
      productList.value.push({ ...productForm });
      dialogVisible.value = false;
      ElMessage.success("添加成功");
    }
  });
};

const handleSave = async () => {
  if (productList.value.length === 0) {
    ElMessage.warning("请至少添加一个产品明细");
    return;
  }

  await formRef.value?.validate(async (valid) => {
    if (!valid) return;

    try {
      loading.value = true;

      const payload = {
        ...formData,
        products: productList.value,
      };

      if (isEdit.value) {
        await request.put(`/inbound/${editId.value}`, payload);
      } else {
        await request.post("/inbound", payload);
      }

      ElMessage.success(isEdit.value ? "更新成功" : "保存成功");
      router.push("/inbound");
    } catch (error: any) {
      console.error("保存失败:", error);
      ElMessage.error(error.message || "保存失败");
    } finally {
      loading.value = false;
    }
  });
};

const handleCancel = () => {
  router.push("/inbound");
};

// 加载编辑数据
const loadInboundData = async () => {
  try {
    loading.value = true;
    const data = await request.get<any>(`/inbound/${editId.value}`);

    // 填充表单数据
    Object.assign(formData, {
      deliveryDate: data.deliveryDate || "",
      deliveryNo: data.deliveryNo || "",
      licensePlate: data.licensePlate || "",
      driver: data.driver || "",
      driverPhone: data.driverPhone || "",
      origin: data.origin || "",
      sender: data.sender || "",
      senderPhone: data.senderPhone || "",
      destination: data.destination || "",
      receiver: data.receiver || "",
      purchaseManager: data.purchaseManager || "",
      confirmSender: data.confirmSender || "",
    });

    // 填充产品列表
    productList.value = data.products || [];
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("加载数据失败");
    router.push("/inbound");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (isEdit.value) {
    loadInboundData();
  }
});

const handlePrint = () => window.print();
</script>

<style scoped>
:deep(.el-table) {
  overflow: hidden;
}
:deep(.el-table__body-wrapper),
:deep(.el-table__header-wrapper) {
  overflow: hidden;
}
:deep(.el-table--scrollable-y .el-table__body-wrapper) {
  overflow-y: auto;
}
</style>
