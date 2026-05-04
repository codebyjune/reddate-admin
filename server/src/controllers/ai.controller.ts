import { Readable } from "node:stream";
import { Request, Response } from "express";
import { convertToModelMessages, streamText } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  formatRetrievedContext,
  retrieveRelevantChunks,
  type RetrievedChunk,
} from "../lib/knowledge/retrieve";

// Provider 在模块加载时初始化一次即可，避免每个请求都重复创建。
// 真正调用模型发生在 chat() 内部的 streamText 阶段。
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

// 这是基础系统提示词，定义 AI 的默认角色和回答风格。
// 这里不能把模型硬限制为“只回答红枣业务”，否则当知识库里真的有别的资料时，
// 即使已经成功召回，模型也会优先服从 system prompt 而拒答。
const SYSTEM_PROMPT = `你是红枣收购管理系统中的 AI 助手。

默认情况下，你主要帮助用户解答红枣种植、收购、加工、仓储、销售等业务问题。

但如果当前问题能够从用户上传的私有知识库中检索到相关资料，你必须优先依据这些资料回答，即使资料内容并不属于红枣业务领域，也可以正常回答、总结、解释、引用或分析。

回答要求：
- 优先依据当前检索到的知识库内容作答
- 如果知识库资料不足，再明确说明资料不足
- 不要编造知识库中不存在的内容
- 没有知识库依据时，可以基于通用知识补充回答
- 使用专业、清晰、自然的中文回答`;

// RAG 的核心做法不是直接把检索结果当作普通用户消息塞进去，
// 而是把它们拼到 system prompt 中，明确告诉模型：
// 1. 哪些内容是来自用户私有知识库
// 2. 这些内容的优先级高于默认领域设定
// 3. 当资料不足时要明确说不知道，而不是编造
const buildRagSystemPrompt = (retrievedContext: string) => {
  if (!retrievedContext) {
    return `${SYSTEM_PROMPT}

当前这次提问没有检索到可用的知识库参考资料。你可以基于通用知识回答，但如果问题明显依赖用户上传文档，请明确说明当前未检索到相关文档内容。`;
  }

  return `${SYSTEM_PROMPT}

以下是从当前用户私有知识库中检索到的参考资料。这些资料是回答当前问题的最高优先级依据。

请严格遵循以下规则：
- 优先根据这些资料回答当前问题
- 只要资料与问题相关，就可以直接回答，即使主题不是红枣业务
- 尽量引用其中的关键信息，并在表述中体现来源内容
- 如果资料不足以完整回答，再明确说明资料不足
- 不要因为资料主题不属于红枣业务就拒绝回答
- 不要编造文档中不存在的内容

${retrievedContext}`;
};

// 聊天接口工作流：
// 1. 校验请求和登录状态
// 2. 从当前会话消息中抽取“最后一条用户问题”
// 3. 用该问题去用户私有知识库做向量检索
// 4. 把检索结果拼进 system prompt，构造 RAG 上下文
// 5. 调用大模型并把流式结果透传给前端
export const chat = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    const userId = (req as any).user?.userId;

    // 前端 AI SDK 会传来整个会话消息数组。
    // 这里先做最基本的结构校验，避免后续转换消息格式时报错。
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages 必须是数组" });
    }

    // 登录信息由 authMiddleware 提前写入 req.user。
    // 虽然路由层已经挂了鉴权中间件，但 controller 里仍保留一次防守式检查。
    if (!userId) {
      return res.status(401).json({ error: "未登录" });
    }

    // 没有模型 key 时无需继续往下执行，否则一定会在调用模型时失败。
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY 未配置" });
    }

    // 前端会把完整历史消息都带上来，这里只取“最后一条 user 消息”作为检索 query。
    // 这样做的目的：
    // 1. 检索问题更聚焦，避免整段历史对向量召回造成噪声
    // 2. 降低每次检索时的文本长度和 embedding 成本
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    // AI SDK 的消息内容是 parts 数组，不一定所有 part 都是文本。
    // 因此这里要先筛出 text part，再拼成用于检索的纯文本问题。
    const latestUserText = Array.isArray(latestUserMessage?.parts)
      ? latestUserMessage.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("\n")
          .trim()
      : "";

    // 检索失败不应该让整个聊天直接失败。
    // 这里采用降级策略：知识库不可用时，仍允许模型基于通用知识继续回答。
    let retrievedChunks: RetrievedChunk[] = [];
    if (latestUserText) {
      try {
        retrievedChunks = await retrieveRelevantChunks(userId, latestUserText);
      } catch (error) {
        console.error("知识库检索失败:", error);
        retrievedChunks = [];
      }
    }

    // 检索结果会先格式化成可读文本，再拼入 system prompt。
    // convertToModelMessages 负责把前端 UI 消息结构转成模型 SDK 可消费的消息格式。
    const retrievedContext = formatRetrievedContext(retrievedChunks);
    const modelMessages = await convertToModelMessages(messages);

    // AbortController 用来把 HTTP 连接状态和模型流式生成绑定在一起。
    // 当前端中断连接、刷新页面或请求正常结束后，都应该及时停止模型生成，
    // 否则模型可能还在后台继续跑，白白消耗 token 和请求资源。
    const abortController = new AbortController();

    const abortStream = () => {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    };

    req.on("close", abortStream);
    res.on("finish", abortStream);

    // streamText 会返回一个可持续读取的流式结果对象。
    // system 中已经包含基础角色设定 + 可选的知识库上下文，
    // messages 则保留当前对话历史，用于让模型理解多轮会话。
    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: buildRagSystemPrompt(retrievedContext),
      messages: modelMessages,
      abortSignal: abortController.signal,
    });

    // AI SDK 提供了面向前端 UI 的流式 Response 封装。
    // 这里不自己手写 SSE 格式，而是直接复用 SDK 的响应结构。
    const response = result.toUIMessageStreamResponse();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 理论上流式响应应该带 body；如果没有，说明 SDK 响应异常，
    // 此时要先解绑事件监听，再返回错误，避免留下无意义的 abort 绑定。
    if (!response.body) {
      req.off("close", abortStream);
      res.off("finish", abortStream);
      return res.status(500).json({ error: "AI 响应流不可用" });
    }

    // Web Stream 需要转成 Node.js Readable 才能 pipe 到 Express response。
    // 至此控制权就交给流本身，前端会一边接收一边渲染 AI 回复。
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    // 如果还没开始写响应头，直接返回标准 JSON 错误。
    // 如果已经进入流式输出阶段，则只能结束响应，避免再次写入 header/body。
    console.error("AI 对话错误:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "AI 服务调用失败",
      });
    } else {
      res.end();
    }
  }
};
