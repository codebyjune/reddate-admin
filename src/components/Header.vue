<template>
  <div
    class="flex h-full justify-between items-center px-5 border-b border-[#f1f3f5]"
  >
    <!-- 左侧：菜单折叠按钮 -->
    <div
      class="flex items-center justify-center w-10 h-10 bg-white rounded-full hover:bg-amber-500 transition-colors duration-200 cursor-pointer"
      @click="layoutStore.toggleCollapse"
    >
      <el-icon class="text-lg">
        <component :is="layoutStore.isCollapse ? ArrowRight : ArrowLeft" />
      </el-icon>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="flex items-center gap-4">
      <!-- 当前日期 -->
      <div class="text-gray-600 text-sm hidden md:flex items-center gap-2">
        <span>{{ currentDate }}</span>
      </div>

      <!-- 用户下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div
          class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          <el-avatar :size="36" class="bg-amber-500">
            {{ userAvatar }}
          </el-avatar>
          <div class="hidden sm:block">
            <div class="text-sm font-medium text-gray-800">
              {{ authStore.user?.name || authStore.user?.username || "用户" }}
            </div>
            <div class="text-xs text-gray-500">
              {{ roleText }}
            </div>
          </div>
          <el-icon class="text-gray-400">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { useLayoutStore } from "../stores/layout";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const layoutStore = useLayoutStore();
const authStore = useAuthStore();

// 用户头像显示文字
const userAvatar = computed(() => {
  const name = authStore.user?.name || authStore.user?.username || "用";
  return name.charAt(0).toUpperCase();
});

// 角色显示文字
const roleText = computed(() => {
  const role = authStore.user?.role;
  if (role === "admin") return "管理员";
  return "普通用户";
});

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  const weekDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDay = weekDays[now.getDay()];
  return `${year}年${month}月${day}日 ${weekDay}`;
});

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case "profile":
      // TODO: 跳转到个人信息页面
      ElMessage.info("个人信息页面开发中");
      break;
    case "logout":
      handleLogout();
      break;
  }
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      authStore.logout();
      ElMessage.success("已退出登录");
      router.push("/login");
    })
    .catch(() => {
      // 取消退出
    });
};
</script>
