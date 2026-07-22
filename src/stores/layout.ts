import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout", () => {
  const isCollapse = ref(false);
  const isMobile = ref(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const drawerVisible = ref(false);

  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value;
  };

  const toggleDrawer = () => {
    drawerVisible.value = !drawerVisible.value;
  };

  const closeDrawer = () => {
    drawerVisible.value = false;
  };

  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value) {
      drawerVisible.value = false;
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize);
  }

  return {
    isCollapse,
    isMobile,
    drawerVisible,
    toggleCollapse,
    toggleDrawer,
    closeDrawer,
  };
});
