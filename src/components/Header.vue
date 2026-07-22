<template>
  <div
    class="flex h-full justify-between items-center px-5 border-b border-[#f1f3f5]"
  >
    <!-- 左侧：菜单折叠按钮 -->
    <div
      class="flex items-center justify-center w-10 h-10 bg-white rounded-full hover:bg-amber-500 transition-colors duration-200 cursor-pointer"
      @click="toggleMenu"
    >
      <el-icon class="text-lg">
        <component :is="menuIcon" />
      </el-icon>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="flex items-center gap-4">
      <!-- 当前日期 -->
      <div class="text-gray-600 text-sm hidden md:flex items-center gap-2">
        <span>{{ currentDate }}</span>
      </div>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <div
          class="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors text-sm text-gray-600"
        >
          <el-icon><Promotion /></el-icon>
          <span class="hidden sm:inline">{{ locale === "zh-CN" ? "中文" : "EN" }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN" :disabled="locale === 'zh-CN'">
              中文
            </el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="locale === 'en-US'">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

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
              {{ authStore.user?.name || authStore.user?.username || t("header.user") }}
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
              <span>{{ t("header.profile") }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>{{ t("header.logout") }}</span>
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
import { useI18n } from "vue-i18n";
import { ArrowLeft, ArrowRight, Expand, Promotion } from "@element-plus/icons-vue";
import { useLayoutStore } from "@/stores/layout";
import { useAuthStore } from "@/stores/auth";

const { t, locale } = useI18n();
const router = useRouter();
const layoutStore = useLayoutStore();
const authStore = useAuthStore();

const toggleMenu = () => {
  if (layoutStore.isMobile) {
    layoutStore.toggleDrawer();
  } else {
    layoutStore.toggleCollapse();
  }
};

const menuIcon = computed(() => {
  if (layoutStore.isMobile) return Expand;
  return layoutStore.isCollapse ? ArrowRight : ArrowLeft;
});

const userAvatar = computed(() => {
  const name = authStore.user?.name || authStore.user?.username || t("header.user");
  return name.charAt(0).toUpperCase();
});

const roleText = computed(() => {
  const role = authStore.user?.role;
  if (role === "admin") return t("header.admin");
  return t("header.user");
});

const currentDate = computed(() => {
  const now = new Date();
  const weekDaysZh = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekDaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDays = locale.value === "zh-CN" ? weekDaysZh : weekDaysEn;
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDay = weekDays[now.getDay()];
  return locale.value === "zh-CN"
    ? `${year}年${month}月${day}日 ${weekDay}`
    : `${year}/${month}/${day} ${weekDay}`;
});

const handleLanguageChange = (lang: string) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
  window.location.reload();
};

const handleCommand = (command: string) => {
  switch (command) {
    case "profile":
      ElMessage.info(t("header.profileWip"));
      break;
    case "logout":
      handleLogout();
      break;
  }
};

const handleLogout = () => {
  ElMessageBox.confirm(t("header.logoutConfirm"), t("header.prompt"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  })
    .then(() => {
      authStore.logout();
      ElMessage.success(t("header.logoutSuccess"));
      router.push("/login");
    })
    .catch(() => {});
};
</script>

