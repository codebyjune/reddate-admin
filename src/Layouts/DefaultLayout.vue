<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import Aside from "@/components/Aside.vue";
import Header from "@/components/Header.vue";
import { useLayoutStore } from "@/stores/layout";

const layoutStore = useLayoutStore();
const route = useRoute();

watch(
  () => route.path,
  () => {
    layoutStore.closeDrawer();
  },
);
</script>

<template>
  <div class="h-full">
    <el-container class="h-full">
      <!-- Desktop sidebar -->
      <el-aside
        v-if="!layoutStore.isMobile"
        class="h-full"
        :width="layoutStore.isCollapse ? '64px' : '200px'"
      >
        <Aside />
      </el-aside>

      <!-- Mobile drawer -->
      <el-drawer
        v-if="layoutStore.isMobile"
        v-model="layoutStore.drawerVisible"
        direction="ltr"
        :size="200"
        :with-header="false"
      >
        <Aside />
      </el-drawer>

      <el-container>
        <el-header style="padding: 0"><Header /></el-header>
        <el-main><RouterView /></el-main>
      </el-container>
    </el-container>
  </div>
</template>
