<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <el-card class="w-96">
      <template #header>
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-800">红枣收购管理系统</h1>
          <p class="text-sm text-gray-500 mt-1">用户登录</p>
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
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="w-full"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-sm text-gray-500">
        还没有账号？
        <router-link to="/register" class="text-blue-500 hover:underline">
          立即注册
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
});

const rules = reactive<FormRules>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

const handleLogin = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.login(formData.username, formData.password);
      ElMessage.success("登录成功");
      router.push("/");
    } catch (error: any) {
      ElMessage.error(error.message || "登录失败");
    } finally {
      loading.value = false;
    }
  });
};
</script>
