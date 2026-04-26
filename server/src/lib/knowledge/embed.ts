const SILICONFLOW_EMBEDDING_URL =
  process.env.SILICONFLOW_EMBEDDING_URL ||
  "https://api.siliconflow.cn/v1/embeddings";
const SILICONFLOW_EMBEDDING_MODEL =
  process.env.SILICONFLOW_EMBEDDING_MODEL || "BAAI/bge-m3";

interface EmbeddingApiResponse {
  data?: Array<{
    embedding: number[];
  }>;
}

const EMBEDDING_MAX_CHARS = 350;
const EMBEDDING_OVERLAP_CHARS = 60;

const splitForEmbedding = (text: string) => {
  const normalized = text.trim();
  if (normalized.length <= EMBEDDING_MAX_CHARS) {
    return [normalized];
  }

  const parts: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + EMBEDDING_MAX_CHARS, normalized.length);

    if (end < normalized.length) {
      const breakpoints = [
        normalized.lastIndexOf("\n", end),
        normalized.lastIndexOf("。", end),
        normalized.lastIndexOf("！", end),
        normalized.lastIndexOf("？", end),
        normalized.lastIndexOf("；", end),
        normalized.lastIndexOf("，", end),
        normalized.lastIndexOf(" ", end),
      ];
      const breakpoint = breakpoints.find(
        (index) => index > start + Math.floor(EMBEDDING_MAX_CHARS * 0.6)
      );

      if (typeof breakpoint === "number") {
        end = breakpoint + 1;
      }
    }

    const part = normalized.slice(start, end).trim();
    if (part) {
      parts.push(part);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - EMBEDDING_OVERLAP_CHARS, start + 1);
  }

  return parts;
};

const averageEmbeddings = (vectors: number[][]) => {
  if (vectors.length === 0) {
    throw new Error("没有可用于平均的向量");
  }

  if (vectors.length === 1) {
    return vectors[0];
  }

  const dimension = vectors[0].length;
  const summed = new Array<number>(dimension).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < dimension; i += 1) {
      summed[i] += vector[i];
    }
  }

  return summed.map((value) => value / vectors.length);
};

const requestEmbedding = async (input: string): Promise<number[]> => {
  const response = await fetch(SILICONFLOW_EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      model: SILICONFLOW_EMBEDDING_MODEL,
      input,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`SiliconFlow embedding 调用失败: ${message}`);
  }

  const result = (await response.json()) as EmbeddingApiResponse;
  const embedding = result.data?.[0]?.embedding;

  if (!embedding || embedding.length === 0) {
    throw new Error("SiliconFlow embedding 返回为空");
  }

  return embedding;
};

export const getEmbeddingModelName = () => SILICONFLOW_EMBEDDING_MODEL;

export const embedText = async (input: string): Promise<number[]> => {
  if (!process.env.SILICONFLOW_API_KEY) {
    throw new Error("SILICONFLOW_API_KEY 未配置");
  }

  const parts = splitForEmbedding(input);

  if (parts.length === 0) {
    throw new Error("embedding 输入为空");
  }

  const embeddings: number[][] = [];
  for (const part of parts) {
    embeddings.push(await requestEmbedding(part));
  }

  return averageEmbeddings(embeddings);
};
