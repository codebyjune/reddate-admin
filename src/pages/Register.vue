<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <el-card class="w-96">
      <template #header>
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-800">红枣收购管理系统</h1>
          <p class="text-sm text-gray-500 mt-1">用户注册</p>
        </div>
      </template>

      <el-form :model="formData" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item prop="name">
          <el-input
            v-model="formData.name"
            placeholder="姓名（选填）"
            prefix-icon="UserFilled"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="手机号（选填）"
            prefix-icon="Phone"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="w-full"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-sm text-gray-500">
        已有账号？
        <router-link to="/login" class="text-blue-500 hover:underline">
          立即登录
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== formData.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度应在3-20位之间", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
});

const handleRegister = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.register({
        username: formData.username,
        password: formData.password,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
      });
      ElMessage.success("注册成功");
      router.push("/");
    } catch (error: any) {
      ElMessage.error(error.message || "注册失败");
    } finally {
      loading.value = false;
    }
  });
};
</script>
