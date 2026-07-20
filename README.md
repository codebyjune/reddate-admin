# 红枣收购管理系统

红枣收购、加工、销售全流程管理的后台系统。

## 功能模块

- **用户管理** - 注册登录、JWT 认证、角色权限（首个注册用户自动为 `admin`，其余为 `user`）
- **合同管理** - 与农户签订收购合同，上传合同图片
- **入库管理** - 入库随车单、产品明细、等级分类
- **生产管理** - 红枣加工记录、批次管理、班次记录
- **等外品管理** - 残次品记录（变形、裂口、干条、烂枣）
- **销售管理** - 现货销售、期货交割
- **库存概览** - 数据统计、图表展示
- **AI 助手** - 基于 DeepSeek 的对话，支持私有知识库 RAG
- **知识库** - PDF 文档上传、解析、向量化（pgvector），按用户隔离

## 技术栈

### 前端
- Vue 3 + TypeScript + Vite
- Element Plus（中文 locale）+ Tailwind CSS v4
- ECharts（vue-echarts）
- Pinia + Vue Router
- AI SDK Vue（`@ai-sdk/vue` + `ai`）

### 后端
- Express + TypeScript
- Prisma ORM
- PostgreSQL + pgvector（向量存储）
- JWT 认证 + bcryptjs
- Multer 文件上传
- AI SDK（`ai` + `@ai-sdk/deepseek`）
- SiliconFlow Embedding API（`BAAI/bge-m3`）

## 项目结构

```
├── src/                       # 前端源码（Vue 3）
│   ├── components/            # 公共组件
│   ├── pages/                 # 页面组件（含 ai/、auth/、contract/、inbound/ 等）
│   ├── router/                # 路由配置
│   ├── stores/                # Pinia 状态管理
│   ├── utils/                 # 工具函数
│   └── Layouts/               # 布局
├── server/                    # 后端源码
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── routes/            # 路由
│   │   ├── middlewares/       # 中间件
│   │   ├── lib/               # 工具库（含 knowledge/ RAG 模块）
│   │   └── index.ts           # 入口
│   ├── prisma/
│   │   ├── schema.prisma      # 数据模型（含 pgvector 向量字段）
│   │   ├── migrations/        # 迁移
│   │   └── seed.ts            # 示例合同数据
│   ├── uploads/               # 上传文件（git ignore）
│   └── ecosystem.config.js    # PM2 配置
├── dist/                      # 前端构建产物
├── prisma.config.ts           # 根目录的 Prisma 配置代理
└── deploy.sh                  # 一键部署脚本
```

## 本地开发

### 环境要求

- Node.js 20.19+（推荐 22 LTS）
- pnpm（推荐）或 npm
- PostgreSQL 14+ 且启用 `vector` 扩展
- （可选）DeepSeek API Key：用于 AI 助手
- （可选）SiliconFlow API Key：用于知识库 Embedding

### 1. 启动 PostgreSQL（带 pgvector）

最简便的方式是用 Docker：

```bash
docker run -d --name reddate-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=reddate \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

如果是已有实例，先连进去执行：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. 安装依赖

```bash
# 前端
pnpm install

# 后端
cd server
pnpm install
```

### 3. 配置后端环境变量

```bash
cd server
cp .env.example .env
```

编辑 `server/.env`：

```env
# 必填
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reddate
JWT_SECRET=随便一串强密码

# 选填 - 启用 AI 对话
DEEPSEEK_API_KEY=sk-...

# 选填 - 启用知识库 / 文档 RAG
SILICONFLOW_API_KEY=sk-...
SILICONFLOW_EMBEDDING_MODEL=BAAI/bge-m3
SILICONFLOW_EMBEDDING_URL=https://api.siliconflow.cn/v1/embeddings
```

> 未配置 `DEEPSEEK_API_KEY` 时，`/api/ai/chat` 会返回 500。
> 未配置 `SILICONFLOW_API_KEY` 时，知识库上传与 RAG 检索不可用，其它功能不受影响。

### 4. 初始化数据库

```bash
cd server
pnpm db:generate       # 生成 Prisma Client
pnpm db:migrate        # 应用 PostgreSQL + pgvector 基线迁移
pnpm db:seed           # 写入 20 条示例合同（无默认账号）
```

日常开发修改 `schema.prisma` 后，可用 `pnpm db:push` 快速同步本地数据库；生产环境统一使用 `pnpm db:migrate`。

### 5. 启动开发服务

开两个终端：

```bash
# 终端 1 - 后端（端口 3000）
cd server
pnpm dev

# 终端 2 - 前端（端口 5173，Vite 已将 /api 与 /uploads 代理到 3000）
pnpm dev
```

浏览器访问 `http://localhost:5173`。

### 6. 注册账号

项目**不提供默认账号**，首个通过 `/api/auth/register` 注册的用户会自动成为 `admin`，后续注册的都是 `user`。也可登录后在「系统管理 → 用户管理」维护用户。

## AI 与知识库使用流程

1. 普通用户登录后，进入侧边栏「我的文档」上传 PDF（单文件 ≤ 20MB）。
2. 后台自动：解析 PDF → 按 350/60 字符切块 → 调 SiliconFlow `BAAI/bge-m3` 生成 embedding → 写入 `knowledge_chunk_embeddings`（pgvector），文档状态从 `pending` → `processing` → `ready` / `failed`。
3. 进入「AI 助手」对话，发送问题时后端会用同款 embedding 模型检索当前用户私有 Top-5 片段，拼接进系统提示词后再调用 DeepSeek 流式生成。检索按 `ownerId` 隔离，用户之间互不可见。

## 主要 API

所有业务接口前缀 `/api`，受保护接口需在 Header 中携带 `Authorization: Bearer <token>`。

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/register` | POST | 注册（首个用户自动 admin） |
| `/api/auth/login` | POST | 登录，返回 JWT |
| `/api/auth/profile` | GET | 当前用户信息 |
| `/api/contracts` | GET/POST | 合同列表 / 新建 |
| `/api/contracts/:id` | GET/PUT/DELETE | 单个合同 |
| `/api/inbound` | GET/POST | 入库随车单 |
| `/api/inbound/:id` | GET/PUT/DELETE | 单个入库单 |
| `/api/production` | GET/POST | 生产记录 |
| `/api/production/:id` | GET/PUT/DELETE | 单条生产记录 |
| `/api/substandards` | GET/POST | 等外品记录 |
| `/api/substandards/:id` | GET/PUT/DELETE | 单条等外品 |
| `/api/sales` | GET/POST | 销售记录 |
| `/api/sales/:id` | GET/PUT/DELETE | 单条销售记录 |
| `/api/inventory/available` | GET | 各等级可销售库存 |
| `/api/inventory/available/:grade` | GET | 单等级可销售库存 |
| `/api/inventory/substandard-available` | GET | 等外品可销售库存 |
| `/api/upload` | POST | 合同图片上传（JPG/PNG/WEBP，≤5MB） |
| `/api/users` | GET | 用户列表（需 admin） |
| `/api/users/:id/role` | PUT | 修改用户角色（需 admin） |
| `/api/users/:id` | DELETE | 删除用户（需 admin） |
| `/api/ai/chat` | POST | AI 流式对话（需 `DEEPSEEK_API_KEY`） |
| `/api/knowledge/documents` | GET/POST | 知识库 PDF 列表 / 上传 |
| `/api/knowledge/documents/:id` | DELETE | 删除知识库 PDF |
| `/uploads/*` | GET | 静态访问上传文件 |

## 生产部署

详见 [DEPLOY.md](./DEPLOY.md)。简述：

```bash
pnpm build                              # 前端 → dist/
cd server && pnpm build && pnpm db:migrate
pm2 start ecosystem.config.js
```

`server/.env` 必须包含 `DATABASE_URL`（PostgreSQL + pgvector）、`JWT_SECRET`、`PORT`，按需填 `DEEPSEEK_API_KEY` / `SILICONFLOW_API_KEY`。

## 更新代码

```bash
git pull
pnpm install
pnpm build
cd server && pnpm install && pnpm build
pm2 restart all
```

## License

MIT
