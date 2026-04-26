import { Readable } from "node:stream";
import { Router } from "express";
import { convertToModelMessages, streamText } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { formatRetrievedContext, retrieveRelevantChunks } from "../lib/knowledge/retrieve";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

// 创建 DeepSeek provider
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

// 系统提示词
const SYSTEM_PROMPT = `你是红枣收购管理系统的 AI 助手。你的职责是帮助用户解答关于红枣种植、收购、加工、仓储、销售等方面的问题。

你可以提供以下帮助：
- 红枣种植技术和管理建议
- 红枣品质分级标准（枣王、超特、特级、一级、二级、三级）
- 收购合同相关咨询
- 加工生产流程指导
- 库存管理建议
- 销售价格和市场分析

请用专业、简洁的中文回答用户问题。`;

const buildRagSystemPrompt = (retrievedContext: string) => {
  if (!retrievedContext) {
    return `${SYSTEM_PROMPT}

当前用户还没有可用的知识库参考资料。你可以基于通用知识回答，但如果问题明显依赖用户上传文档，请明确说明未检索到相关文档内容。`;
  }

  return `${SYSTEM_PROMPT}

以下是从当前用户私有知识库中检索到的参考资料。请优先基于这些资料回答，并尽量引用其中的关键信息。如果参考资料不足以回答，请明确说明资料不足，不要编造文档中不存在的内容。

${retrievedContext}`;
};

// AI 对话接口 - 返回 AI SDK UI message stream
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = (req as any).user?.userId;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages 必须是数组" });
    }

    if (!userId) {
      return res.status(401).json({ error: "未登录" });
    }

    // 检查 API Key 是否配置
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY 未配置" });
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    const latestUserText = Array.isArray(latestUserMessage?.parts)
      ? latestUserMessage.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("\n")
          .trim()
      : "";

    const retrievedChunks = latestUserText
      ? await retrieveRelevantChunks(userId, latestUserText)
      : [];
    const retrievedContext = formatRetrievedContext(retrievedChunks);

    const modelMessages = await convertToModelMessages(messages);
    const abortController = new AbortController();

    const abortStream = () => {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    };

    req.on("close", abortStream);
    res.on("finish", abortStream);

    // 调用 DeepSeek 流式生成
    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: buildRagSystemPrompt(retrievedContext),
      messages: modelMessages,
      abortSignal: abortController.signal,
    });

    const response = result.toUIMessageStreamResponse();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (!response.body) {
      req.off("close", abortStream);
      res.off("finish", abortStream);
      return res.status(500).json({ error: "AI 响应流不可用" });
    }

    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.error("AI 对话错误:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "AI 服务调用失败",
      });
    } else {
      res.end();
    }
  }
});

export default router;
