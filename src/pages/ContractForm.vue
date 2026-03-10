<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">红枣收购合同</h2>
          <p class="text-sm text-gray-400">录入收购合同信息</p>
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
            合同基础信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="合同编号" prop="contractNo">
                <el-input
                  v-model="formData.contractNo"
                  placeholder="请输入合同编号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="签订日期" prop="signDate">
                <el-date-picker
                  v-model="formData.signDate"
                  type="date"
                  placeholder="选择签订日期"
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
            乙方（销售方）
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="名称" prop="partyBName">
                <el-input
                  v-model="formData.partyBName"
                  placeholder="请输入乙方名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="身份证号" prop="partyBIdCard">
                <el-input
                  v-model="formData.partyBIdCard"
                  placeholder="请输入身份证号"
                  maxlength="18"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="partyBPhone">
                <el-input
                  v-model="formData.partyBPhone"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="银行卡号" prop="partyBBankCard">
                <el-input
                  v-model="formData.partyBBankCard"
                  placeholder="请输入银行卡号"
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
            订购数量及面积
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="种植面积" prop="plantingArea">
                <el-input
                  v-model.number="formData.plantingArea"
                  placeholder="请输入种植面积"
                >
                  <template #append>亩</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="购买数量" prop="purchaseQuantity">
                <el-input
                  v-model.number="formData.purchaseQuantity"
                  placeholder="请输入购买数量"
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
            收购价格
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="收购单价" prop="unitPrice">
                <el-input
                  v-model.number="formData.unitPrice"
                  placeholder="请输入单价"
                >
                  <template #append>元/公斤</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="预付定金" prop="deposit">
                <el-input
                  v-model.number="formData.deposit"
                  placeholder="请输入定金"
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
            派驻纸箱
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="纸箱数量" prop="boxQuantity">
                <el-input
                  v-model.number="formData.boxQuantity"
                  placeholder="请输入纸箱数量"
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
            经办人信息
          </h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="采购负责人" prop="purchaseManager">
                <el-input
                  v-model="formData.purchaseManager"
                  placeholder="请输入采购负责人"
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
            合同图片
          </h3>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="上传图片" prop="contractImage">
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
                  支持上传合同扫描件或照片，格式：JPG、PNG
                </div>
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
import { reactive, ref } from "vue";
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

const rules = reactive<FormRules>({
  contractNo: [{ required: true, message: "请输入合同编号", trigger: "blur" }],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "change" }],
  partyBName: [{ required: true, message: "请输入乙方名称", trigger: "blur" }],
  partyBIdCard: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    {
      pattern: /^\d{17}[\dXx]$/,
      message: "身份证号格式不正确",
      trigger: "blur",
    },
  ],
  partyBPhone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
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

    ElMessage.success("合同保存成功");
    formRef.value?.resetFields();
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(error.message || "保存失败");
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
    ElMessage.error("只能上传图片文件！");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB！");
    return false;
  }
  return true;
};

// 上传成功
const handleUploadSuccess: UploadProps["onSuccess"] = (response) => {
  formData.contractImage = response.url;
  ElMessage.success("图片上传成功");
  
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
