<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold text-gray-800">{{ t("user.title") }}</h2>
          <p class="text-sm text-gray-400">{{ t("user.desc") }}</p>
        </div>
      </template>

      <!-- 搜索 -->
      <el-form :inline="true" class="mb-4">
        <el-form-item :label="t('user.username')">
          <el-input
            v-model="searchForm.username"
            :placeholder="t('user.enterUsername')"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item :label="t('user.role')">
          <el-select
            v-model="searchForm.role"
            :placeholder="t('user.allRoles')"
            clearable
            style="width: 120px"
          >
            <el-option :label="t('user.allRoles')" value="" />
            <el-option :label="t('user.admin')" value="admin" />
            <el-option :label="t('user.normalUser')" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="filterUsers">{{ t("common.search") }}</el-button>
          <el-button @click="resetSearch">{{ t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="username" :label="t('user.username')" width="150" />
        <el-table-column prop="name" :label="t('user.name')" width="120">
          <template #default="{ row }">
            {{ row.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" :label="t('user.phone')" width="150">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="role" :label="t('user.role')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
              {{ row.role === 'admin' ? t('user.admin') : t('user.normalUser') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('user.createdAt')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openRoleDialog(row)">
              <el-icon><Edit /></el-icon>
              {{ t("user.modifyRole") }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              {{ t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex flex-wrap justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="filterUsers"
          @current-change="filterUsers"
        />
      </div>
    </el-card>

    <!-- 修改角色弹窗 -->
    <el-dialog v-model="roleDialogVisible" :title="t('user.modifyRole')" :width="'90%'" style="max-width: 400px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item :label="t('user.username')">
          <el-input :value="roleForm.username" disabled />
        </el-form-item>
        <el-form-item :label="t('user.role')">
          <el-select v-model="roleForm.role" style="width: 100%">
            <el-option :label="t('user.admin')" value="admin" />
            <el-option :label="t('user.normalUser')" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">{{ t("common.cancel") }}</el-button>
        <el-button type="primary" @click="updateRole" :loading="submitLoading">
          {{ t("user.confirmText") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Edit, Delete } from "@element-plus/icons-vue";
import request from "@/utils/request";

interface User {
  id: number;
  username: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const allUsers = ref<User[]>([]);
const tableData = ref<User[]>([]);
const roleDialogVisible = ref(false);

const searchForm = reactive({
  username: "",
  role: "",
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const roleForm = reactive({
  id: 0,
  username: "",
  role: "",
});

const { t } = useI18n();

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await request.get("/users");
    allUsers.value = Array.isArray(res) ? res : [];
    filterUsers();
  } catch (error: any) {
    console.error("获取用户列表失败:", error);
    ElMessage.error(error.message || t("user.fetchFailed"));
  } finally {
    loading.value = false;
  }
};

// 过滤用户
const filterUsers = () => {
  let data = [...allUsers.value];

  if (searchForm.username) {
    data = data.filter((u) =>
      u.username.toLowerCase().includes(searchForm.username.toLowerCase())
    );
  }

  if (searchForm.role) {
    data = data.filter((u) => u.role === searchForm.role);
  }

  pagination.total = data.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  tableData.value = data.slice(start, start + pagination.pageSize);
};

// 重置搜索
const resetSearch = () => {
  searchForm.username = "";
  searchForm.role = "";
  pagination.page = 1;
  filterUsers();
};

// 打开角色修改弹窗
const openRoleDialog = (user: User) => {
  roleForm.id = user.id;
  roleForm.username = user.username;
  roleForm.role = user.role;
  roleDialogVisible.value = true;
};

// 更新角色
const updateRole = async () => {
  submitLoading.value = true;
  try {
    await request.put(`/users/${roleForm.id}/role`, { role: roleForm.role });
    ElMessage.success(t("user.roleUpdateSuccess"));
    roleDialogVisible.value = false;
    fetchUsers();
  } catch (error: any) {
    console.error("更新角色失败:", error);
    ElMessage.error(error.message || t("user.roleUpdateFailed"));
  } finally {
    submitLoading.value = false;
  }
};

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      t("user.deleteConfirm", [user.username]),
      t("header.prompt"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    await request.delete(`/users/${user.id}`);
    ElMessage.success(t("user.deleteSuccess"));
    fetchUsers();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除用户失败:", error);
      ElMessage.error(error.message || t("user.deleteFailed"));
    }
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchUsers();
});
</script>
