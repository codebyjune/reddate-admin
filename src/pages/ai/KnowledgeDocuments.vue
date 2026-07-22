<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ t("documents.title") }}</h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ t("documents.desc") }}
            </p>
          </div>
          <el-upload
            :show-file-list="false"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
            accept="application/pdf,.pdf"
          >
            <el-button type="primary" :loading="uploading">
              <el-icon><UploadFilled /></el-icon>
              {{ t("documents.upload") }}
            </el-button>
          </el-upload>
        </div>
      </template>

    <el-alert
        :title="t('documents.alert')"
        type="info"
        :closable="false"
        class="mb-4"
      />

      <el-table :data="documents" v-loading="loading" stripe>
        <el-table-column prop="name" :label="t('documents.fileName')" min-width="280" />
        <el-table-column :label="t('documents.size')" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('documents.statusCol')" width="140">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status] || 'info'">
              {{ statusTextMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('documents.pages')" width="100">
          <template #default="{ row }">
            {{ row.pageCount ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column :label="t('documents.uploadTime')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('documents.errorMsg')" min-width="180">
          <template #default="{ row }">
            {{ row.errorMessage || "-" }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              {{ t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Delete, UploadFilled } from "@element-plus/icons-vue";
import type { UploadProps, UploadRequestOptions } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";

interface KnowledgeDocument {
  id: number;
  name: string;
  mimeType: string;
  filePath: string;
  fileSize: number;
  status: string;
  pageCount: number | null;
  errorMessage: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

const documents = ref<KnowledgeDocument[]>([]);
const loading = ref(false);
const uploading = ref(false);

const { t } = useI18n();

const statusTextMap: Record<string, string> = {
  pending: t("documents.pending"),
  processing: t("documents.processing"),
  ready: t("documents.ready"),
  failed: t("documents.failed"),
};

const statusTypeMap: Record<string, "info" | "warning" | "success" | "danger"> = {
  pending: "info",
  processing: "warning",
  ready: "success",
  failed: "danger",
};

const fetchDocuments = async () => {
  loading.value = true;
  try {
    documents.value = await request.get<KnowledgeDocument[]>("/knowledge/documents");
  } catch (error: any) {
    ElMessage.error(error.message || t("documents.fetchFailed"));
  } finally {
    loading.value = false;
  }
};

const beforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  const isPdf = rawFile.type === "application/pdf";
  const isLt20M = rawFile.size / 1024 / 1024 < 20;

  if (!isPdf) {
    ElMessage.error(t("documents.onlyPdf"));
    return false;
  }

  if (!isLt20M) {
    ElMessage.error(t("documents.tooLarge"));
    return false;
  }

  return true;
};

const handleUpload = async (options: UploadRequestOptions) => {
  const formData = new FormData();
  formData.append("file", options.file);

  uploading.value = true;
  try {
    await request.post<KnowledgeDocument>("/knowledge/documents", formData);

    ElMessage.success(t("documents.uploadSuccess"));
    await fetchDocuments();
    options.onSuccess?.({});
  } catch (error: any) {
    ElMessage.error(error.message || t("documents.uploadFailed"));
    options.onError?.(error);
  } finally {
    uploading.value = false;
  }
};

const handleDelete = async (document: KnowledgeDocument) => {
  try {
    await ElMessageBox.confirm(t("documents.deleteConfirm", [document.name]), t("header.prompt"), {
      type: "warning",
    });

    await request.delete(`/knowledge/documents/${document.id}`);
    ElMessage.success(t("documents.deleteSuccess"));
    await fetchDocuments();
  } catch (error: any) {
    if (error === "cancel" || error === "close") {
      return;
    }

    ElMessage.error(error.message || t("documents.deleteFailed"));
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchDocuments();
});
</script>
