<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <el-card class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-800">{{ t("app.fullName") }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ t("auth.userRegister") }}</p>
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
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            :placeholder="t('auth.confirmPassword')"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('auth.name')"
            prefix-icon="UserFilled"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="formData.phone"
            :placeholder="t('auth.phone')"
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
            {{ t("auth.register") }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-sm text-gray-500">
        {{ t("auth.hasAccount") }}
        <router-link to="/login" class="text-blue-500 hover:underline">
          {{ t("auth.loginNow") }}
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
  confirmPassword: "",
  name: "",
  phone: "",
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== formData.password) {
    callback(new Error(t("auth.passwordMismatch")));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  username: [
    { required: true, message: t("auth.enterUsername"), trigger: "blur" },
    { min: 3, max: 20, message: t("auth.usernameLen"), trigger: "blur" },
  ],
  password: [
    { required: true, message: t("auth.enterPassword"), trigger: "blur" },
    { min: 6, message: t("auth.passwordLen"), trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: t("auth.enterConfirmPassword"), trigger: "blur" },
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
      ElMessage.success(t("auth.registerSuccess"));
      router.push("/");
    } catch (error: any) {
      ElMessage.error(error.message || t("auth.registerFailed"));
    } finally {
      loading.value = false;
    }
  });
};
</script>
