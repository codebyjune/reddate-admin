<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">{{ isEdit ? t('inbound.editTitle') : t('inbound.createTitle') }}</h2>
          <p class="text-sm text-gray-400">{{ isEdit ? t('inbound.editDesc') : t('inbound.createDesc') }}</p>
        </div>
      </template>

      <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
        <div class="mb-4">
          <h3 class="text-base font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">{{ t("inbound.basicInfo") }}</h3>
          <el-row :gutter="20" class="mb-1">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.deliveryDate')" prop="deliveryDate">
                <el-date-picker v-model="formData.deliveryDate" type="date" :placeholder="t('inbound.selectDate')" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.deliveryNo')" prop="deliveryNo">
                <el-input v-model="formData.deliveryNo" :placeholder="t('inbound.enterNo')" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.licensePlate')" prop="licensePlate">
                <el-input v-model="formData.licensePlate" :placeholder="t('inbound.enterPlate')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb-2">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.driver')" prop="driver">
                <el-input v-model="formData.driver" :placeholder="t('inbound.enterDriver')" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.driverPhone')" prop="driverPhone">
                <el-input v-model="formData.driverPhone" :placeholder="t('inbound.driverPhone')" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.origin')" prop="origin">
                <el-input v-model="formData.origin" :placeholder="t('inbound.enterOrigin')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb-2">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.sender')" prop="sender">
                <el-input v-model="formData.sender" :placeholder="t('inbound.sender')" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.senderPhone')" prop="senderPhone">
                <el-input v-model="formData.senderPhone" :placeholder="t('inbound.senderPhone')" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.destination')" prop="destination">
                <el-input v-model="formData.destination" :placeholder="t('inbound.enterDest')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb-2">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('inbound.receiver')" prop="receiver">
                <el-input v-model="formData.receiver" :placeholder="t('inbound.receiver')" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-medium text-gray-700 border-l-4 border-blue-500 pl-2">{{ t("inbound.productDetail") }}</h3>
            <el-button type="primary" @click="handleAddProduct">{{ t("inbound.addProduct") }}</el-button>
          </div>
          <el-table :data="productList" border stripe>
            <el-table-column prop="contractName" :label="t('inbound.contractName')" min-width="120" />
            <el-table-column prop="quantity" :label="t('inbound.boxCount')" width="90" />
            <el-table-column prop="netWeight" :label="t('inbound.netWeightBox')" width="120" />
            <el-table-column prop="yieldRate" :label="t('inbound.yieldRate')" width="90" />
            <el-table-column prop="lossRate" :label="t('inbound.lossRate')" width="90" />
            <el-table-column prop="moistureRate" :label="t('inbound.moistureRate')" width="90" />
            <el-table-column prop="unitPrice" :label="t('inbound.unitPrice')" width="90" />
            <el-table-column prop="remark" :label="t('common.remark')" min-width="100" />
            <el-table-column :label="t('common.action')" width="100">
              <template #default="{ $index }">
                <el-button type="danger" size="small" link @click="handleDeleteProduct($index)">{{ t("common.delete") }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="mb-4">
          <h3 class="text-base font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">{{ t("inbound.signature") }}</h3>
          <el-row :gutter="40">
            <el-col :xs="24" :sm="12">
              <el-form-item :label="t('inbound.purchaseManager')">
                <el-input v-model="formData.purchaseManager" :placeholder="t('inbound.purchaseManager')" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item :label="t('inbound.confirmSender')">
                <el-input v-model="formData.confirmSender" :placeholder="t('inbound.confirmSender')" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-row justify="center" class="mt-6 flex-wrap">
          <el-button type="primary" @click="handleSave">{{ t("common.save") }}</el-button>
          <el-button @click="handleCancel">{{ t("common.cancel") }}</el-button>
          <el-button @click="handlePrint">{{ t("common.print") }}</el-button>
        </el-row>
      </el-form>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="t('inbound.addProductTitle')" :width="'90%'" style="max-width: 600px">
      <el-form :model="productForm" label-width="120px" :rules="productRules" ref="productFormRef">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.contractName')" prop="contractName">
              <el-input v-model="productForm.contractName" :placeholder="t('inbound.enterContractName')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.boxCount')" prop="quantity">
              <el-input v-model.number="productForm.quantity" :placeholder="t('inbound.enterQuantity')">
                <template #append>{{ t("inbound.boxUnit") }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.netWeightBox')" prop="netWeight">
              <el-input v-model.number="productForm.netWeight" :placeholder="t('inbound.enterNetWeight')">
                <template #append>{{ t("inbound.kgUnit") }}</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.yieldRate')" prop="yieldRate">
              <el-input v-model.number="productForm.yieldRate" :placeholder="t('inbound.enterYieldRate')">
                <template #append>{{ t("inbound.percentUnit") }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.lossRate')" prop="lossRate">
              <el-input v-model.number="productForm.lossRate" :placeholder="t('inbound.enterLossRate')">
                <template #append>{{ t("inbound.percentUnit") }}</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.moistureRate')" prop="moistureRate">
              <el-input v-model.number="productForm.moistureRate" :placeholder="t('inbound.enterMoistureRate')">
                <template #append>{{ t("inbound.percentUnit") }}</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('inbound.unitPrice')" prop="unitPrice">
              <el-input v-model.number="productForm.unitPrice" :placeholder="t('inbound.enterUnitPrice')">
                <template #append>{{ t("inbound.yuanUnit") }}</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('common.remark')" prop="remark">
              <el-input v-model="productForm.remark" :placeholder="t('common.remark')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("common.cancel") }}</el-button>
        <el-button type="primary" @click="handleConfirmProduct">{{ t("common.confirm") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import request from "@/utils/request";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

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
  deliveryDate: [{ required: true, message: t("inbound.selectDate"), trigger: "change" }],
  deliveryNo: [
    { required: true, message: t("inbound.enterNo"), trigger: "blur" },
    { min: 3, max: 20, message: t("inbound.noLen"), trigger: "blur" },
  ],
  licensePlate: [{ required: true, message: t("inbound.enterPlate"), trigger: "blur" }],
  driver: [{ required: true, message: t("inbound.enterDriver"), trigger: "blur" }],
  origin: [{ required: true, message: t("inbound.enterOrigin"), trigger: "blur" }],
  destination: [{ required: true, message: t("inbound.enterDest"), trigger: "blur" }],
});

const productRules = reactive<FormRules>({
  contractName: [{ required: true, message: t("inbound.enterContractName"), trigger: "blur" }],
  quantity: [
    { required: true, message: t("inbound.enterQuantity"), trigger: "blur" },
    { type: "number", min: 1, message: "数量必须大于0", trigger: "blur" },
  ],
  netWeight: [
    { required: true, message: t("inbound.enterNetWeight"), trigger: "blur" },
    { type: "number", min: 0.01, message: "净重必须大于0", trigger: "blur" },
  ],
  yieldRate: [{ type: "number", min: 0, max: 100, message: "出成率应在0-100之间", trigger: "blur" }],
  lossRate: [{ type: "number", min: 0, max: 100, message: "损耗率应在0-100之间", trigger: "blur" }],
  moistureRate: [{ type: "number", min: 0, max: 100, message: "含水率应在0-100之间", trigger: "blur" }],
  unitPrice: [
    { required: true, message: t("inbound.enterUnitPrice"), trigger: "blur" },
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
      ElMessage.success(t("inbound.addSuccess"));
    }
  });
};

const handleSave = async () => {
  if (productList.value.length === 0) {
    ElMessage.warning(t("inbound.atLeastOneProduct"));
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

      ElMessage.success(isEdit.value ? t("inbound.updateSuccess") : t("inbound.saveSuccess"));
      router.push("/inbound");
    } catch (error: any) {
      console.error("保存失败:", error);
      ElMessage.error(error.message || t("inbound.saveFailed"));
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
    ElMessage.error(t("inbound.loadFailed"));
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
