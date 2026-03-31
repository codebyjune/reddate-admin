<template>
  <div class="p-4">
    <!-- 主Tab切换 -->
    <el-tabs v-model="activeTab" class="mb-4">
      <el-tab-pane label="原料库存" name="material">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Box /></el-icon>
            原料库存
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="成品库存" name="product">
        <template #label>
          <span class="flex items-center gap-1">
            <el-icon><Goods /></el-icon>
            成品库存
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 原料库存 -->
    <MaterialInventory v-if="activeTab === 'material'" />

    <!-- 成品库存 -->
    <div v-if="activeTab === 'product'">
      <el-tabs v-model="productSubTab" class="mb-4">
        <el-tab-pane label="成品" name="normal" />
        <el-tab-pane label="等外品" name="substandard" />
      </el-tabs>

      <ProductInventory v-if="productSubTab === 'normal'" />
      <SubstandardInventory v-if="productSubTab === 'substandard'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Box, Goods } from "@element-plus/icons-vue";
import MaterialInventory from "@/components/MaterialInventory.vue";
import ProductInventory from "@/components/ProductInventory.vue";
import SubstandardInventory from "@/components/SubstandardInventory.vue";

const activeTab = ref("product");
const productSubTab = ref("normal");
</script>

<style scoped>
:deep(.el-table .el-table__cell) {
  padding: 12px 16px;
}
</style>
