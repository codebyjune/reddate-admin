<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">{{ t("sales.title") }}</h2>
          <p class="text-sm text-gray-400">{{ t("sales.desc") }}</p>
        </div>
      </template>

      <!-- 销售类型切换 -->
      <div class="mb-4">
        <el-radio-group v-model="formData.salesType" size="large">
          <el-radio-button value="现货">{{ t("sales.spotSales") }}</el-radio-button>
          <el-radio-button value="期货交割">{{ t("sales.futures") }}</el-radio-button>
        </el-radio-group>
      </div>

      <el-form
        :model="formData"
        label-width="120px"
        :rules="rules"
        ref="formRef"
      >
        <!-- 基础信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2"
          >
            {{ formData.salesType === "现货" ? t('sales.salesInfo') : t('sales.deliveryInfo') }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item
                :label="formData.salesType === '现货' ? t('sales.salesDate') : t('sales.deliveryDate')"
                prop="salesDate"
              >
                <el-date-picker
                  v-model="formData.salesDate"
                  type="date"
                  :placeholder="formData.salesType === '现货' ? t('sales.selectSalesDate') : t('sales.selectDeliveryDate')"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item
                :label="formData.salesType === '现货' ? t('sales.salesNo') : t('sales.deliveryNo')"
                prop="salesNo"
              >
                <el-input v-model="formData.salesNo" :placeholder="t('sales.enterNo')" />
              </el-form-item>
            </el-col>
            <!-- 期货交割：合约月份 -->
            <el-col :xs="24" :sm="12" :md="8" v-if="formData.salesType === '期货交割'">
              <el-form-item :label="t('sales.contractMonth')" prop="contractMonth">
                <el-input
                  v-model="formData.contractMonth"
                  :placeholder="t('sales.enterContractMonth')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 现货：客户信息 -->
        <div class="mb-4" v-if="formData.salesType === '现货'">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-orange-500 pl-2"
          >
            {{ t("sales.customerInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.customerName')" prop="customerName">
                <el-input
                  v-model="formData.customerName"
                  :placeholder="t('sales.enterCustomerName')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.customerPhone')" prop="customerPhone">
                <el-input
                  v-model="formData.customerPhone"
                  :placeholder="t('sales.enterCustomerPhone')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.customerAddress')" prop="customerAddress">
                <el-input
                  v-model="formData.customerAddress"
                  :placeholder="t('sales.enterCustomerAddress')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 期货交割：交割仓库信息 -->
        <div class="mb-4" v-if="formData.salesType === '期货交割'">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-orange-500 pl-2"
          >
            {{ t("sales.warehouseInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.warehouse')" prop="warehouse">
                <el-input
                  v-model="formData.warehouse"
                  :placeholder="t('sales.enterWarehouse')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.warehouseCode')" prop="warehouseCode">
                <el-input
                  v-model="formData.warehouseCode"
                  :placeholder="t('sales.enterWarehouseCode')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.warrantNo')" prop="warrantNo">
                <el-input
                  v-model="formData.warrantNo"
                  :placeholder="t('sales.enterWarrantNo')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 产品信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-purple-500 pl-2"
          >
            {{ t("sales.productInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('sales.productCategory')" prop="productCategory">
                <el-radio-group
                  v-model="formData.productCategory"
                  @change="handleCategoryChange"
                >
                  <el-radio value="normal">{{ t("sales.normal") }}</el-radio>
                  <el-radio value="substandard">{{ t("sales.substandard") }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item
                :label="formData.productCategory === 'normal' ? t('sales.productLevel') : t('sales.substandardType')"
                prop="productLevel"
              >
                <el-select
                  v-model="formData.productLevel"
                  :placeholder="formData.productCategory === 'normal' ? t('sales.selectLevel') : t('sales.selectSubstandardType')"
                  style="width: 100%"
                >
                  <template v-if="formData.productCategory === 'normal'">
                    <el-option :label="t('grade.KingGrade')" value="KingGrade" />
                    <el-option :label="t('grade.SuperPremium')" value="SuperPremium" />
                    <el-option :label="t('grade.PremiumGrade')" value="PremiumGrade" />
                    <el-option :label="t('grade.Grade1')" value="Grade1" />
                    <el-option :label="t('grade.Grade2')" value="Grade2" />
                    <el-option :label="t('grade.Grade3')" value="Grade3" />
                  </template>
                  <template v-else>
                    <el-option :label="t('substandardType.变形')" value="变形" />
                    <el-option :label="t('substandardType.裂口')" value="裂口" />
                    <el-option :label="t('substandardType.干条')" value="干条" />
                    <el-option :label="t('substandardType.烂枣')" value="烂枣" />
                  </template>
                </el-select>
                <div
                  v-if="currentInventory !== null"
                  class="text-xs mt-1"
                  :class="
                    currentInventory > 0 ? 'text-green-500' : 'text-red-500'
                  "
                >
                  {{ t("sales.availableStock", [currentInventory]) }}
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('sales.spec')" prop="spec">
                <el-input v-model="formData.spec" :placeholder="t('sales.enterSpec')">
                  <template #append>{{ t('sales.specUnit') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item
                :label="formData.salesType === '现货' ? t('sales.salesQty') : t('sales.deliveryQty')"
                prop="quantity"
              >
                <el-input
                  v-model.number="formData.quantity"
                  :placeholder="t('sales.enterQty')"
                  type="number"
                >
                  <template #append>{{ t('common.pieces') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item :label="t('sales.netWeight')" prop="netWeight">
                <el-input
                  v-model.number="formData.netWeight"
                  :placeholder="t('sales.enterNetWeight')"
                  type="number"
                >
                  <template #append>{{ t('common.kg') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 价格信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-red-500 pl-2"
          >
            {{ t("sales.priceInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item
                :label="formData.salesType === '现货' ? t('sales.salesUnitPrice') : t('sales.deliverySettlePrice')"
                prop="unitPrice"
              >
                <el-input
                  v-model.number="formData.unitPrice"
                  :placeholder="t('sales.enterUnitPrice')"
                  type="number"
                  @input="calculateTotal"
                >
                  <template #append>{{ t('sales.priceUnit') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item
                :label="formData.salesType === '现货' ? t('sales.totalAmount') : t('sales.settleAmount')"
                prop="totalAmount"
              >
                <el-input
                  v-model="totalAmountDisplay"
                  :placeholder="t('sales.amountAuto')"
                  disabled
                >
                  <template #append>{{ t('common.yuan') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 现货：付款信息 -->
        <div class="mb-4" v-if="formData.salesType === '现货'">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-green-500 pl-2"
          >
            {{ t("sales.paymentInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.paymentMethod')" prop="paymentMethod">
                <el-select
                  v-model="formData.paymentMethod"
                  :placeholder="t('sales.selectPaymentMethod')"
                  style="width: 100%"
                >
                  <el-option :label="t('sales.cash')" value="现金" />
                  <el-option :label="t('sales.bankTransfer')" value="银行转账" />
                  <el-option :label="t('sales.wechat')" value="微信" />
                  <el-option :label="t('sales.alipay')" value="支付宝" />
                  <el-option :label="t('sales.onCredit')" value="赊账" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.paymentStatus')" prop="paymentStatus">
                <el-select
                  v-model="formData.paymentStatus"
                  :placeholder="t('sales.selectPaymentStatus')"
                  style="width: 100%"
                >
                  <el-option :label="t('sales.unpaid')" value="未付款" />
                  <el-option :label="t('sales.partialPaid')" value="部分付款" />
                  <el-option :label="t('sales.paid')" value="已付款" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.paidAmount')" prop="paidAmount">
                <el-input
                  v-model.number="formData.paidAmount"
                  :placeholder="t('sales.enterPaidAmount')"
                  type="number"
                >
                  <template #append>{{ t('common.yuan') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 期货交割：交割状态 -->
        <div class="mb-4" v-if="formData.salesType === '期货交割'">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-green-500 pl-2"
          >
            {{ t("sales.deliveryStatus") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.deliveryStatus')" prop="deliveryStatus">
                <el-select
                  v-model="formData.deliveryStatus"
                  :placeholder="t('sales.selectDeliveryStatus')"
                  style="width: 100%"
                >
                  <el-option :label="t('sales.pendingDelivery')" value="待交割" />
                  <el-option :label="t('sales.delivered')" value="已交割" />
                  <el-option :label="t('sales.cancelled')" value="已注销" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('sales.settleAmountLabel')" prop="settleAmount">
                <el-input
                  v-model.number="formData.settleAmount"
                  :placeholder="t('sales.enterSettleAmount')"
                  type="number"
                >
                  <template #append>{{ t('common.yuan') }}</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 经办人信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-gray-500 pl-2"
          >
            {{ t("sales.managerInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item
                :label="formData.salesType === '现货' ? t('sales.salesPerson') : t('sales.deliveryManager')"
                prop="salesPerson"
              >
                <el-input
                  v-model="formData.salesPerson"
                  :placeholder="t('sales.enterPersonName')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="16">
              <el-form-item :label="t('common.remark')" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :placeholder="t('sales.enterRemark')"
                  :rows="1"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-row justify="center" class="mt-6 flex-wrap">
          <el-button type="primary" @click="handleSave">{{ t("common.save") }}</el-button>
          <el-button @click="handleCancel">{{ t("common.reset") }}</el-button>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { useI18n } from "vue-i18n";

interface SalesInfo {
  salesType: string;
  salesDate: string;
  salesNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productCategory: string; // normal: 等级内, substandard: 等外品
  productLevel: string;
  spec: string;
  quantity: number;
  netWeight: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAmount: number;
  // 期货交割专用
  contractMonth: string;
  warehouse: string;
  warehouseCode: string;
  warrantNo: string;
  deliveryStatus: string;
  settleAmount: number;
  salesPerson: string;
  remark: string;
}

const formData = reactive<SalesInfo>({
  salesType: "现货",
  salesDate: "",
  salesNo: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  productCategory: "normal",
  productLevel: "Grade1",
  spec: "",
  quantity: 0,
  netWeight: 0,
  unitPrice: 0,
  totalAmount: 0,
  paymentMethod: "",
  paymentStatus: "未付款",
  paidAmount: 0,
  contractMonth: "",
  warehouse: "",
  warehouseCode: "",
  warrantNo: "",
  deliveryStatus: "待交割",
  settleAmount: 0,
  salesPerson: "",
  remark: "",
});

const formRef = ref<FormInstance>();
const { t } = useI18n();

// 库存数据
const inventoryData = ref<
  Record<string, { available: number; gradeName: string }>
>({});
// 等外品库存数据
const substandardInventoryData = ref<
  Record<string, { available: number; typeName: string }>
>({});

// 获取库存数据
const fetchInventory = async () => {
  try {
    // 获取等级内产品库存
    const normalRes = await request.get("/inventory/available");
    if (Array.isArray(normalRes)) {
      normalRes.forEach((item: any) => {
        inventoryData.value[item.grade] = {
          available: item.available,
          gradeName: item.gradeName,
        };
      });
    }

    // 获取等外品库存
    const substandardRes = await request.get(
      "/inventory/substandard-available",
    );
    if (Array.isArray(substandardRes)) {
      substandardRes.forEach((item: any) => {
        substandardInventoryData.value[item.substandardType] = {
          available: item.available,
          typeName: item.typeName,
        };
      });
    }
  } catch (e) {
    console.error("获取库存失败:", e);
  }
};

// 产品类型切换时重置产品等级
const handleCategoryChange = () => {
  if (formData.productCategory === "normal") {
    formData.productLevel = "Grade1";
  } else {
    formData.productLevel = "变形";
  }
};

onMounted(() => {
  fetchInventory();
});

// 计算总金额
const totalAmountDisplay = computed(() => {
  return formData.totalAmount.toFixed(2);
});

// 当前选中产品的可销售库存
const currentInventory = computed(() => {
  if (formData.productCategory === "normal") {
    const gradeInventory = inventoryData.value[formData.productLevel];
    return gradeInventory ? gradeInventory.available : null;
  } else {
    const substandardInventory =
      substandardInventoryData.value[formData.productLevel];
    return substandardInventory ? substandardInventory.available : null;
  }
});

const calculateTotal = () => {
  formData.totalAmount = formData.netWeight * formData.unitPrice;
};

const rules = reactive<FormRules>({
  salesDate: [{ required: true, message: t("sales.selectSalesDate"), trigger: "change" }],
  productLevel: [
    { required: true, message: t("sales.selectLevel"), trigger: "change" },
  ],
  quantity: [
    { required: true, message: t("sales.enterQty"), trigger: "blur" },
    { type: "number", min: 1, message: t("sales.qtyGreaterThan0"), trigger: "blur" },
  ],
  netWeight: [
    { required: true, message: t("sales.enterNetWeight"), trigger: "blur" },
    { type: "number", min: 0.01, message: t("sales.netWeightGreaterThan0"), trigger: "blur" },
  ],
  unitPrice: [
    { required: true, message: t("sales.enterUnitPrice"), trigger: "blur" },
    { type: "number", min: 0.01, message: t("sales.unitPriceGreaterThan0"), trigger: "blur" },
  ],
  // 现货必填
  customerName: [
    {
      validator: (_rule, value, callback) => {
        if (formData.salesType === "现货" && !value) {
          callback(new Error(t("sales.enterCustomerName")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  // 期货交割必填
  contractMonth: [
    {
      validator: (_rule, value, callback) => {
        if (formData.salesType === "期货交割" && !value) {
          callback(new Error(t("sales.enterContractMonth")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  warehouse: [
    {
      validator: (_rule, value, callback) => {
        if (formData.salesType === "期货交割" && !value) {
          callback(new Error(t("sales.enterWarehouse")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

const handleSave = async () => {
  try {
    await formRef.value?.validate();
    calculateTotal();

    // 检查库存
    if (formData.productCategory === "normal") {
      const gradeInventory = inventoryData.value[formData.productLevel];
      if (gradeInventory && gradeInventory.available < formData.quantity) {
        ElMessage.warning(
          t("sales.insufficientStock", [
            gradeInventory.gradeName,
            gradeInventory.available,
            formData.quantity,
          ]),
        );
        return;
      }
    } else {
      const substandardInventory =
        substandardInventoryData.value[formData.productLevel];
      if (
        substandardInventory &&
        substandardInventory.available < formData.quantity
      ) {
        ElMessage.warning(
          t("sales.insufficientStock", [
            substandardInventory.typeName,
            substandardInventory.available,
            formData.quantity,
          ]),
        );
        return;
      }
    }

    await request.post("/sales", formData);

    ElMessage.success(t("sales.saveSuccess", [formData.salesType]));
    // 刷新库存数据
    fetchInventory();
    formRef.value?.resetFields();
    // 重置产品类型
    formData.productCategory = "normal";
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(error.message || t("sales.saveFailed"));
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
};
</script>

<style scoped></style>
