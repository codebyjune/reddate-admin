<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <el-card class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-800">{{ t("app.name") }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ t("auth.login") }}</p>
        </div>
      </template>

      <el-form :model="formData" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            :placeholder="t('auth.username')"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            :placeholder="t('auth.password')"
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
            {{ t("auth.login") }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-sm text-gray-500">
        {{ t("auth.noAccount") }}
        <router-link to="/register" class="text-blue-500 hover:underline">
          {{ t("auth.registerNow") }}
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = reactive({
  username: "",
  password: "",
});

const rules = reactive<FormRules>({
  username: [{ required: true, message: t("auth.enterUsername"), trigger: "blur" }],
  password: [{ required: true, message: t("auth.enterPassword"), trigger: "blur" }],
});

const handleLogin = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await authStore.login(formData.username, formData.password);
      ElMessage.success(t("auth.loginSuccess"));
      router.push("/");
    } catch (error: any) {
      ElMessage.error(error.message || t("auth.loginFailed"));
    } finally {
      loading.value = false;
    }
  });
};
</script>
