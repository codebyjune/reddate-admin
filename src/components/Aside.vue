<script setup lang="ts">
import { computed } from "vue";
import { useLayoutStore } from "../stores/layout";
import { useAuthStore } from "../stores/auth";

const layoutStore = useLayoutStore();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.isAdmin);
</script>

<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#2f3e4d"
    class="h-full"
    default-active="/inventory"
    text-color="#fff"
    :collapse="layoutStore.isCollapse"
    router
  >
    <el-menu-item index="/inventory">
      <el-icon><DataLine /></el-icon>
      <span>库存概览</span>
    </el-menu-item>
    <el-sub-menu index="production">
      <template #title>
        <el-icon><Edit /></el-icon>
        <span>生产管理</span>
      </template>
      <el-menu-item index="/production">生产录入</el-menu-item>
      <el-menu-item index="/production-list">生产记录</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="purchase">
      <template #title>
        <el-icon><ShoppingCart /></el-icon>
        <span>采购管理</span>
      </template>
      <el-menu-item index="/contract">合同录入</el-menu-item>
      <el-menu-item index="/contract-list">合同列表</el-menu-item>
      <el-menu-item index="/inbound/create">入库录入</el-menu-item>
      <el-menu-item index="/inbound">入库记录</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="sales">
      <template #title>
        <el-icon><Sell /></el-icon>
        <span>销售管理</span>
      </template>
      <el-menu-item index="/sales">销售录入</el-menu-item>
      <el-menu-item index="/sales-list">销售列表</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="system" v-if="isAdmin">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>系统管理</span>
      </template>
      <el-menu-item index="/user-management">用户管理</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
