<template>
  <div class="p-4 h-[calc(100vh-120px)] flex flex-col">
    <el-card shadow="never" class="flex-1 flex flex-col overflow-hidden">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon :size="20" class="text-blue-500"
            ><ChatDotRound
          /></el-icon>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">AI 助手</h2>
            <p class="text-xs text-gray-400">红枣收购管理系统智能助手</p>
          </div>
        </div>
      </template>

      <!-- 消息列表 -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto space-y-4 mb-4 px-2"
      >
        <!-- 欢迎消息 -->
        <div v-if="chat.messages.length === 0" class="text-center py-12">
          <el-icon :size="48" class="text-gray-300 mb-4"
            ><ChatDotRound
          /></el-icon>
          <p class="text-gray-400 text-sm">你好！我是红枣管理系统的 AI 助手</p>
          <p class="text-gray-400 text-xs mt-1">
            可以问我关于红枣种植、收购、加工、销售的问题
          </p>
        </div>

        <!-- 消息气泡 -->
        <div
          v-for="(message, index) in chat.messages"
          :key="message.id || index"
          :class="[
            'flex gap-3',
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
          ]"
        >
          <!-- 头像 -->
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0',
              message.role === 'user'
                ? 'bg-blue-500'
                : 'bg-linear-to-br from-green-400 to-green-600',
            ]"
          >
            <el-icon v-if="message.role === 'user'"><User /></el-icon>
            <el-icon v-else><ChatDotRound /></el-icon>
          </div>

          <!-- 消息内容 -->
          <div
            :class="[
              'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              message.role === 'user'
                ? 'bg-blue-500 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-800 rounded-tl-sm',
            ]"
          >
            <!-- 加载中动画 -->
            <div
              v-if="showLoadingDots(message, index)"
              class="flex items-center gap-1 py-1"
            >
              <span
                class="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style="animation-delay: 0ms"
              ></span>
              <span
                class="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style="animation-delay: 150ms"
              ></span>
              <span
                class="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                style="animation-delay: 300ms"
              ></span>
            </div>

            <!-- 文本内容 -->
            <div v-else class="whitespace-pre-wrap">{{ getMessageText(message) }}</div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="border-t pt-4 px-2">
        <div class="flex gap-2">
          <el-input
            v-model="input"
            type="textarea"
            :rows="2"
            placeholder="请输入您的问题，按 Enter 发送，Shift+Enter 换行..."
            resize="none"
            :disabled="isLoading"
            @keydown="handleKeydown"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
          <el-button
            type="primary"
            :loading="isLoading"
            :disabled="!input.trim() || isLoading"
            class="self-end"
            @click="sendMessage"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
        <p class="text-xs text-gray-400 mt-2 text-center">
          AI 生成内容仅供参考，请以实际情况为准
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { ChatDotRound, User, Promotion } from "@element-plus/icons-vue";
import { Chat } from "@ai-sdk/vue";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";

const messagesContainer = ref<HTMLDivElement>();
const input = ref("");
const isComposing = ref(false);

// 创建 Chat 实例，使用 DefaultChatTransport 配置 API 端点
const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/ai/chat",
    headers: () => {
      const token = localStorage.getItem("token");
      return {
        Authorization: `Bearer ${token}`,
      };
    },
  }),
});

// 计算加载状态
const isLoading = computed(() => {
  return chat.status === "submitted" || chat.status === "streaming";
});

// 获取消息文本内容
const getMessageText = (message: UIMessage): string => {
  if (!message.parts) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
};

const showLoadingDots = (message: UIMessage, index: number): boolean => {
  return (
    message.role === "assistant" &&
    isLoading.value &&
    index === chat.messages.length - 1 &&
    getMessageText(message).trim().length === 0
  );
};

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(() => chat.messages.length, scrollToBottom, { immediate: true });
watch(() => chat.messages.map(getMessageText).join("\n"), scrollToBottom);

// 发送消息
const sendMessage = async () => {
  const text = input.value.trim();
  if (!text || isLoading.value) return;

  try {
    await chat.sendMessage({ text });
    input.value = "";
  } catch (error) {
    console.error("AI 消息发送失败:", error);
    input.value = text;
    ElMessage.error(
      error instanceof Error ? error.message : "AI 对话发送失败，请稍后重试"
    );
  }
};

// 键盘事件：Enter 发送，Shift+Enter 换行
const handleKeydown = (e: KeyboardEvent) => {
  if (e.isComposing || isComposing.value) {
    return;
  }

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const handleCompositionStart = () => {
  isComposing.value = true;
};

const handleCompositionEnd = () => {
  isComposing.value = false;
};
</script>

<style scoped>
/* 自定义滚动条 */
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

/* 动画 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
