import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import contractRoutes from "./routes/contract.routes";
import inboundRoutes from "./routes/inbound.routes";
import productionRoutes from "./routes/production.routes";
import rejectRoutes from "./routes/reject.routes";
import salesRoutes from "./routes/sales.routes";
import uploadRoutes from "./routes/upload.routes";
import userRoutes from "./routes/user.routes";
import inventoryRoutes from "./routes/inventory.routes";

const app: express.Application = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 访问上传的图片
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/inbound", inboundRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/rejects", rejectRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: "接口不存在" });
});

// 错误处理
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("服务器错误:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
);

export default app;
