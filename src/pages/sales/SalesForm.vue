<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">销售信息录入</h2>
          <p class="text-sm text-gray-400">现货销售 / 期货交割登记</p>
        </div>
      </template>

      <!-- 销售类型切换 -->
      <div class="mb-4">
        <el-radio-group v-model="formData.salesType" size="large">
          <el-radio-button value="现货">现货销售</el-radio-button>
          <el-radio-button value="期货交割">期货交割</el-radio-button>
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
            {{ formData.salesType === "现货" ? "销售信息" : "交割信息" }}
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item
                :label="formData.salesType === '现货' ? '销售日期' : '交割日期'"
                prop="salesDate"
              >
                <el-date-picker
                  v-model="formData.salesDate"
                  type="date"
                  :placeholder="
                    formData.salesType === '现货'
                      ? '选择销售日期'
                      : '选择交割日期'
                  "
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="formData.salesType === '现货' ? '销售单号' : '交割单号'"
                prop="salesNo"
              >
                <el-input v-model="formData.salesNo" placeholder="请输入单号" />
              </el-form-item>
            </el-col>
            <!-- 期货交割：合约月份 -->
            <el-col :span="8" v-if="formData.salesType === '期货交割'">
              <el-form-item label="期货合约" prop="contractMonth">
                <el-input
                  v-model="formData.contractMonth"
                  placeholder="如：CJ2401"
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
            客户信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="客户名称" prop="customerName">
                <el-input
                  v-model="formData.customerName"
                  placeholder="请输入客户名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="customerPhone">
                <el-input
                  v-model="formData.customerPhone"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户地址" prop="customerAddress">
                <el-input
                  v-model="formData.customerAddress"
                  placeholder="请输入客户地址"
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
            交割仓库
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="交割仓库" prop="warehouse">
                <el-input
                  v-model="formData.warehouse"
                  placeholder="请输入交割仓库名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="仓库代码" prop="warehouseCode">
                <el-input
                  v-model="formData.warehouseCode"
                  placeholder="请输入仓库代码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="仓单编号" prop="warrantNo">
                <el-input
                  v-model="formData.warrantNo"
                  placeholder="请输入仓单编号"
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
            产品信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="产品类型" prop="productCategory">
                <el-radio-group
                  v-model="formData.productCategory"
                  @change="handleCategoryChange"
                >
                  <el-radio value="normal">等级内</el-radio>
                  <el-radio value="substandard">等外品</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                :label="
                  formData.productCategory === 'normal'
                    ? '产品等级'
                    : '等外品类型'
                "
                prop="productLevel"
              >
                <el-select
                  v-model="formData.productLevel"
                  :placeholder="
                    formData.productCategory === 'normal'
                      ? '请选择产品等级'
                      : '请选择等外品类型'
                  "
                  style="width: 100%"
                >
                  <template v-if="formData.productCategory === 'normal'">
                    <el-option label="枣王" value="KingGrade" />
                    <el-option label="超特" value="SuperPremium" />
                    <el-option label="特级" value="PremiumGrade" />
                    <el-option label="一级" value="Grade1" />
                    <el-option label="二级" value="Grade2" />
                    <el-option label="三级" value="Grade3" />
                  </template>
                  <template v-else>
                    <el-option label="变形" value="变形" />
                    <el-option label="裂口" value="裂口" />
                    <el-option label="干条" value="干条" />
                    <el-option label="烂枣" value="烂枣" />
                  </template>
                </el-select>
                <div
                  v-if="currentInventory !== null"
                  class="text-xs mt-1"
                  :class="
                    currentInventory > 0 ? 'text-green-500' : 'text-red-500'
                  "
                >
                  可销售库存: {{ currentInventory }} 件
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="规格" prop="spec">
                <el-input v-model="formData.spec" placeholder="如：5">
                  <template #append>kg/件</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                :label="formData.salesType === '现货' ? '销售数量' : '交割数量'"
                prop="quantity"
              >
                <el-input
                  v-model.number="formData.quantity"
                  placeholder="请输入数量"
                  type="number"
                >
                  <template #append>件</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="净重" prop="netWeight">
                <el-input
                  v-model.number="formData.netWeight"
                  placeholder="请输入净重"
                  type="number"
                >
                  <template #append>kg</template>
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
            价格信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item
                :label="
                  formData.salesType === '现货' ? '销售单价' : '交割结算价'
                "
                prop="unitPrice"
              >
                <el-input
                  v-model.number="formData.unitPrice"
                  placeholder="请输入单价"
                  type="number"
                  @input="calculateTotal"
                >
                  <template #append>元/kg</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="formData.salesType === '现货' ? '总金额' : '结算金额'"
                prop="totalAmount"
              >
                <el-input
                  v-model="totalAmountDisplay"
                  placeholder="自动计算"
                  disabled
                >
                  <template #append>元</template>
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
            付款信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="付款方式" prop="paymentMethod">
                <el-select
                  v-model="formData.paymentMethod"
                  placeholder="请选择付款方式"
                  style="width: 100%"
                >
                  <el-option label="现金" value="现金" />
                  <el-option label="银行转账" value="银行转账" />
                  <el-option label="微信" value="微信" />
                  <el-option label="支付宝" value="支付宝" />
                  <el-option label="赊账" value="赊账" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="付款状态" prop="paymentStatus">
                <el-select
                  v-model="formData.paymentStatus"
                  placeholder="请选择付款状态"
                  style="width: 100%"
                >
                  <el-option label="未付款" value="未付款" />
                  <el-option label="部分付款" value="部分付款" />
                  <el-option label="已付款" value="已付款" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="已付金额" prop="paidAmount">
                <el-input
                  v-model.number="formData.paidAmount"
                  placeholder="请输入已付金额"
                  type="number"
                >
                  <template #append>元</template>
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
            交割状态
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="交割状态" prop="deliveryStatus">
                <el-select
                  v-model="formData.deliveryStatus"
                  placeholder="请选择交割状态"
                  style="width: 100%"
                >
                  <el-option label="待交割" value="待交割" />
                  <el-option label="已交割" value="已交割" />
                  <el-option label="已注销" value="已注销" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="结算金额" prop="settleAmount">
                <el-input
                  v-model.number="formData.settleAmount"
                  placeholder="请输入结算金额"
                  type="number"
                >
                  <template #append>元</template>
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
            经办人信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item
                :label="formData.salesType === '现货' ? '销售员' : '交割经办人'"
                prop="salesPerson"
              >
                <el-input
                  v-model="formData.salesPerson"
                  placeholder="请输入姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  placeholder="请输入备注信息"
                  :rows="1"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-row justify="center" class="mt-6">
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">重置</el-button>
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

interface SalesInfo {
  salesType: string;
  salesDate: string;
  salesNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productCategory: string; // normal: 等级内, reject: 等外品
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
  salesDate: [{ required: true, message: "请选择日期", trigger: "change" }],
  productLevel: [
    { required: true, message: "请选择产品等级", trigger: "change" },
  ],
  quantity: [
    { required: true, message: "请输入数量", trigger: "blur" },
    { type: "number", min: 1, message: "数量必须大于0", trigger: "blur" },
  ],
  netWeight: [
    { required: true, message: "请输入净重", trigger: "blur" },
    { type: "number", min: 0.01, message: "净重必须大于0", trigger: "blur" },
  ],
  unitPrice: [
    { required: true, message: "请输入单价", trigger: "blur" },
    { type: "number", min: 0.01, message: "单价必须大于0", trigger: "blur" },
  ],
  // 现货必填
  customerName: [
    {
      validator: (_rule, value, callback) => {
        if (formData.salesType === "现货" && !value) {
          callback(new Error("请输入客户名称"));
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
          callback(new Error("请输入期货合约"));
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
          callback(new Error("请输入交割仓库"));
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
          `${gradeInventory.gradeName}库存不足！当前可销售库存：${gradeInventory.available} 件，需销售：${formData.quantity} 件`,
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
          `${substandardInventory.typeName}库存不足！当前可销售库存：${substandardInventory.available} 件，需销售：${formData.quantity} 件`,
        );
        return;
      }
    }

    await request.post("/sales", formData);

    ElMessage.success(`${formData.salesType}信息保存成功`);
    // 刷新库存数据
    fetchInventory();
    formRef.value?.resetFields();
    // 重置产品类型
    formData.productCategory = "normal";
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(error.message || "保存失败");
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
};
</script>

<style scoped></style>
