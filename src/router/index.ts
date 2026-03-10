import { createWebHistory, createRouter } from "vue-router";
import DefaultLayout from "../Layouts/DefaultLayout.vue";
import InventoryOverview from "../pages/InventoryOverview.vue";
import ProductionPage from "../pages/RedDateProcessForm.vue";
import ProductionListPage from "../pages/ProductionList.vue";
import InboundPage from "../pages/InboundDeliveryForm.vue";
import InboundListPage from "../pages/InboundList.vue";
import ContractPage from "../pages/ContractForm.vue";
import ContractListPage from "../pages/ContractList.vue";
import SalesPage from "../pages/SalesForm.vue";
import SalesListPage from "../pages/SalesList.vue";
import UserManagement from "../pages/UserManagement.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";

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
        component: InventoryOverview,
      },
      {
        path: "production",
        name: "production",
        component: ProductionPage,
      },
      {
        path: "production-list",
        name: "production-list",
        component: ProductionListPage,
      },
      {
        path: "inbound",
        name: "inbound",
        component: InboundListPage,
      },
      {
        path: "inbound/create",
        name: "inbound-create",
        component: InboundPage,
      },
      {
        path: "inbound/edit/:id",
        name: "inbound-edit",
        component: InboundPage,
      },
      {
        path: "contract",
        name: "contract",
        component: ContractPage,
      },
      {
        path: "contract-list",
        name: "contract-list",
        component: ContractListPage,
      },
      {
        path: "sales",
        name: "sales",
        component: SalesPage,
      },
      {
        path: "sales-list",
        name: "sales-list",
        component: SalesListPage,
      },
      {
        path: "user-management",
        name: "user-management",
        component: UserManagement,
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
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
