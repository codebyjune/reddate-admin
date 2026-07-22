<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLayoutStore } from "@/stores/layout";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const layoutStore = useLayoutStore();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.isAdmin);
const menuCollapse = computed(() =>
  layoutStore.isMobile ? false : layoutStore.isCollapse,
);
</script>

<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#2f3e4d"
    class="h-full"
    default-active="/inventory"
    text-color="#fff"
    :collapse="menuCollapse"
    router
  >
    <el-menu-item index="/inventory">
      <el-icon><DataLine /></el-icon>
      <span>{{ t("nav.inventory") }}</span>
    </el-menu-item>
    <el-sub-menu index="production">
      <template #title>
        <el-icon><Edit /></el-icon>
        <span>{{ t("nav.production") }}</span>
      </template>
      <el-menu-item index="/production">{{ t("nav.productionEntry") }}</el-menu-item>
      <el-menu-item index="/production-list">{{ t("nav.productionList") }}</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="purchase">
      <template #title>
        <el-icon><ShoppingCart /></el-icon>
        <span>{{ t("nav.purchase") }}</span>
      </template>
      <el-menu-item index="/contract">{{ t("nav.contractEntry") }}</el-menu-item>
      <el-menu-item index="/contract-list">{{ t("nav.contractList") }}</el-menu-item>
      <el-menu-item index="/inbound/create">{{ t("nav.inboundEntry") }}</el-menu-item>
      <el-menu-item index="/inbound">{{ t("nav.inboundList") }}</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="sales">
      <template #title>
        <el-icon><Sell /></el-icon>
        <span>{{ t("nav.sales") }}</span>
      </template>
      <el-menu-item index="/sales">{{ t("nav.salesEntry") }}</el-menu-item>
      <el-menu-item index="/sales-list">{{ t("nav.salesList") }}</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/ai-dialog">
      <el-icon><ChatDotRound /></el-icon>
      <span>{{ t("nav.ai") }}</span>
    </el-menu-item>
    <el-menu-item index="/knowledge-documents">
      <el-icon><Document /></el-icon>
      <span>{{ t("nav.documents") }}</span>
    </el-menu-item>
    <el-sub-menu index="system" v-if="isAdmin">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>{{ t("nav.system") }}</span>
      </template>
      <el-menu-item index="/user-management">{{ t("nav.userManagement") }}</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
