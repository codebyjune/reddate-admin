import { Router } from "express";
import { convertToModelMessages, streamText } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
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

// AI 对话接口 - 返回 AI SDK UI message stream
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages 必须是数组" });
    }

    // 检查 API Key 是否配置
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY 未配置" });
    }

    const modelMessages = await convertToModelMessages(messages);

    // 调用 DeepSeek 流式生成
    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
    });

    const response = result.toUIMessageStreamResponse();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: "AI 响应流不可用" });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }

    res.end();
  } catch (error) {
    console.error("AI 对话错误:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "AI 服务调用失败",
    });
  }
});

export default router;
