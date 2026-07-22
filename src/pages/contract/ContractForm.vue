<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">{{ t("contract.title") }}</h2>
          <p class="text-sm text-gray-400">{{ t("contract.desc") }}</p>
        </div>
      </template>

      <el-form
        :model="formData"
        label-width="120px"
        :rules="rules"
        ref="formRef"
      >
        <!-- 合同基础信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2"
          >
            {{ t("contract.basicInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.contractNo')" prop="contractNo">
                <el-input
                  v-model="formData.contractNo"
                  :placeholder="t('contract.enterContractNo')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.signDate')" prop="signDate">
                <el-date-picker
                  v-model="formData.signDate"
                  type="date"
                  :placeholder="t('contract.selectDate')"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 乙方信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-orange-500 pl-2"
          >
            {{ t("contract.partyB") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.partyBName')" prop="partyBName">
                <el-input
                  v-model="formData.partyBName"
                  :placeholder="t('contract.enterPartyBName')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.idCard')" prop="partyBIdCard">
                <el-input
                  v-model="formData.partyBIdCard"
                  :placeholder="t('contract.enterIdCard')"
                  maxlength="18"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.phone')" prop="partyBPhone">
                <el-input
                  v-model="formData.partyBPhone"
                  :placeholder="t('contract.enterPhone')"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.bankCard')" prop="partyBBankCard">
                <el-input
                  v-model="formData.partyBBankCard"
                  :placeholder="t('contract.enterBankCard')"
                  maxlength="19"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 订购信息 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-purple-500 pl-2"
          >
            {{ t("contract.orderInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.plantingArea')" prop="plantingArea">
                <el-input
                  v-model.number="formData.plantingArea"
                  :placeholder="t('contract.enterPlantingArea')"
                >
                  <template #append>亩</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.purchaseQty')" prop="purchaseQuantity">
                <el-input
                  v-model.number="formData.purchaseQuantity"
                  :placeholder="t('contract.enterPurchaseQty')"
                >
                  <template #append>吨</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 收购价格 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-red-500 pl-2"
          >
            {{ t("contract.price") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.unitPrice')" prop="unitPrice">
                <el-input
                  v-model.number="formData.unitPrice"
                  :placeholder="t('contract.enterUnitPrice')"
                >
                  <template #append>元/公斤</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.deposit')" prop="deposit">
                <el-input
                  v-model.number="formData.deposit"
                  :placeholder="t('contract.enterDeposit')"
                >
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 派驻纸箱 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-cyan-500 pl-2"
          >
            {{ t("contract.boxInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.boxQty')" prop="boxQuantity">
                <el-input
                  v-model.number="formData.boxQuantity"
                  :placeholder="t('contract.enterBoxQty')"
                >
                  <template #append>个</template>
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
            {{ t("contract.managerInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item :label="t('contract.purchaseManager')" prop="purchaseManager">
                <el-input
                  v-model="formData.purchaseManager"
                  :placeholder="t('contract.enterManager')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 合同图片 -->
        <div class="mb-4">
          <h3
            class="text-base font-medium text-gray-700 mb-3 border-l-4 border-teal-500 pl-2"
          >
            {{ t("contract.imageInfo") }}
          </h3>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item :label="t('contract.uploadImage')" prop="contractImage">
                <el-upload
                  class="contract-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handleUploadSuccess"
                  :before-upload="beforeUpload"
                  name="file"
                  accept="image/*"
                >
                  <img
                    v-if="formData.contractImage"
                    :src="formData.contractImage"
                    class="contract-image"
                  />
                  <el-icon v-else class="contract-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
                <div class="text-gray-400 text-sm mt-2 ml-6">
                  {{ t("contract.imageHint") }}
                </div>
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
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import request from "@/utils/request";

interface ContractInfo {
  contractNo: string;
  signDate: string;
  partyBName: string;
  partyBIdCard: string;
  partyBPhone: string;
  partyBBankCard: string;
  plantingArea: number;
  purchaseQuantity: number;
  unitPrice: number;
  deposit: number;
  boxQuantity: number;
  purchaseManager: string;
  contractImage: string;
}

const formData = reactive<ContractInfo>({
  contractNo: "",
  signDate: "",
  partyBName: "",
  partyBIdCard: "",
  partyBPhone: "",
  partyBBankCard: "",
  plantingArea: 0,
  purchaseQuantity: 0,
  unitPrice: 0,
  deposit: 0,
  boxQuantity: 0,
  purchaseManager: "",
  contractImage: "",
});

const uploadUrl = "/api/upload";

const formRef = ref<FormInstance>();

const { t } = useI18n();

const rules = reactive<FormRules>({
  contractNo: [{ required: true, message: t("contract.enterContractNo"), trigger: "blur" }],
  signDate: [{ required: true, message: t("contract.selectDate"), trigger: "change" }],
  partyBName: [{ required: true, message: t("contract.enterPartyBName"), trigger: "blur" }],
  partyBIdCard: [
    { required: true, message: t("contract.enterIdCard"), trigger: "blur" },
    {
      pattern: /^\d{17}[\dXx]$/,
      message: t("contract.idCardFormat"),
      trigger: "blur",
    },
  ],
  partyBPhone: [{ required: true, message: t("contract.enterPhone"), trigger: "blur" }],
  plantingArea: [
    {
      type: "number",
      min: 0.01,
      message: "种植面积必须大于0",
      trigger: "blur",
    },
  ],
  purchaseQuantity: [
    {
      type: "number",
      min: 0.01,
      message: "购买数量必须大于0",
      trigger: "blur",
    },
  ],
  unitPrice: [
    { required: true, message: "请输入收购单价", trigger: "blur" },
    { type: "number", min: 0.01, message: "单价必须大于0", trigger: "blur" },
  ],
  deposit: [
    { type: "number", min: 0, message: "定金不能为负数", trigger: "blur" },
  ],
  boxQuantity: [
    { type: "number", min: 0, message: "纸箱数量不能为负数", trigger: "blur" },
  ],
});

const handleSave = async () => {
  try {
    // 验证表单
    await formRef.value?.validate();

    // 发送请求
    await request.post("/contracts", formData);

    ElMessage.success(t("contract.saveSuccess"));
    formRef.value?.resetFields();
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(error.message || t("contract.saveFailed"));
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
};

// 上传前校验
const beforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  //rawFile是用户选择的原始文件类型
//   rawFile = {
//   name: "photo.jpg",        // 文件名
//   size: 1024000,            // 文件大小（字节）
//   type: "image/jpeg",       // 文件 MIME 类型
//   lastModified: 1234567890, // 最后修改时间
// }
  const isImage = rawFile.type.startsWith("image/");
  const isLt5M = rawFile.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error(t("contract.onlyImage"));
    return false;
  }
  if (!isLt5M) {
    ElMessage.error(t("contract.imageTooLarge"));
    return false;
  }
  return true;
};

// 上传成功
const handleUploadSuccess: UploadProps["onSuccess"] = (response) => {
  formData.contractImage = response.url;
  ElMessage.success(t("contract.uploadSuccess"));
  
};
</script>

<style scoped>
.contract-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.contract-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.contract-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.contract-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
