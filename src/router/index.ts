import { createWebHistory, createRouter } from "vue-router";
import DefaultLayout from "@/Layouts/DefaultLayout.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/inventory",
      },
      {
        path: "inventory",
        name: "inventory",
        component: () => import("@/pages/inventory/InventoryOverview.vue"),
      },
      {
        path: "production",
        name: "production",
        component: () => import("@/pages/production/ProductionForm.vue"),
      },
      {
        path: "production-list",
        name: "production-list",
        component: () => import("@/pages/production/ProductionList.vue"),
      },
      {
        path: "inbound",
        name: "inbound",
        component: () => import("@/pages/inbound/InboundList.vue"),
      },
      {
        path: "inbound/create",
        name: "inbound-create",
        component: () => import("@/pages/inbound/InboundForm.vue"),
      },
      {
        path: "inbound/edit/:id",
        name: "inbound-edit",
        component: () => import("@/pages/inbound/InboundForm.vue"),
      },
      {
        path: "contract",
        name: "contract",
        component: () => import("@/pages/contract/ContractForm.vue"),
      },
      {
        path: "contract-list",
        name: "contract-list",
        component: () => import("@/pages/contract/ContractList.vue"),
      },
      {
        path: "sales",
        name: "sales",
        component: () => import("@/pages/sales/SalesForm.vue"),
      },
      {
        path: "sales-list",
        name: "sales-list",
        component: () => import("@/pages/sales/SalesList.vue"),
      },
      {
        path: "ai-dialog",
        name: "ai-dialog",
        component: () => import("@/pages/ai/AIDialog.vue"),
      },
      {
        path: "user-management",
        name: "user-management",
        component: () => import("@/pages/user/UserManagement.vue"),
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/auth/Login.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/pages/auth/Register.vue"),
    meta: { guest: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (to.meta.requiresAuth && !token) {
    next("/login");
    return;
  }

  if (to.meta.guest && token) {
    next("/");
    return;
  }

  // 管理员权限检查
  if (to.meta.requiresAdmin) {
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || user.role !== "admin") {
        ElMessage.warning("无权限访问该页面");
        next("/");
        return;
      }
    } catch {
      next("/login");
      return;
    }
  }

  next();
});

export default router;
