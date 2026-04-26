<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">我的文档</h2>
            <p class="text-sm text-gray-400 mt-1">
              上传你自己的 PDF 文档，后续 AI 将基于这些文档回答问题
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
              上传 PDF
            </el-button>
          </el-upload>
        </div>
      </template>

    <el-alert
        title="第一版仅支持 PDF。上传后文档会进入后台解析和索引，状态会自动从待处理更新为处理中或已就绪。"
        type="info"
        :closable="false"
        class="mb-4"
      />

      <el-table :data="documents" v-loading="loading" stripe>
        <el-table-column prop="name" label="文件名" min-width="280" />
        <el-table-column label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status] || 'info'">
              {{ statusTextMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="页数" width="100">
          <template #default="{ row }">
            {{ row.pageCount ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="失败原因" min-width="180">
          <template #default="{ row }">
            {{ row.errorMessage || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
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

const statusTextMap: Record<string, string> = {
  pending: "待处理",
  processing: "处理中",
  ready: "已就绪",
  failed: "失败",
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
    ElMessage.error(error.message || "获取文档列表失败");
  } finally {
    loading.value = false;
  }
};

const beforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
  const isPdf = rawFile.type === "application/pdf";
  const isLt20M = rawFile.size / 1024 / 1024 < 20;

  if (!isPdf) {
    ElMessage.error("只能上传 PDF 文件");
    return false;
  }

  if (!isLt20M) {
    ElMessage.error("PDF 大小不能超过 20MB");
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

    ElMessage.success("PDF 上传成功，正在后台建立索引");
    await fetchDocuments();
    options.onSuccess?.({});
  } catch (error: any) {
    ElMessage.error(error.message || "PDF 上传失败");
    options.onError?.(error);
  } finally {
    uploading.value = false;
  }
};

const handleDelete = async (document: KnowledgeDocument) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档“${document.name}”吗？`, "提示", {
      type: "warning",
    });

    await request.delete(`/knowledge/documents/${document.id}`);
    ElMessage.success("删除成功");
    await fetchDocuments();
  } catch (error: any) {
    if (error === "cancel") {
      return;
    }

    ElMessage.error(error.message || "删除失败");
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
