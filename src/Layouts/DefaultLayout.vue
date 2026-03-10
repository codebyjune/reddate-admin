<script setup lang="ts">
import Aside from "../components/Aside.vue";
import Header from "../components/Header.vue";
import { useLayoutStore } from "../stores/layout";

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="h-full">
    <el-container class="h-full">
      <el-aside
        class="h-full"
        :width="layoutStore.isCollapse ? '64px' : '200px'"
      >
        <Aside />
      </el-aside>
      <el-container>
        <el-header style="padding: 0"><Header /></el-header>
        <el-main><RouterView /></el-main>
      </el-container>
    </el-container>
  </div>
</template>
