import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import usersRouter from "./routes/users.js";
import machinesRouter from "./routes/machines.js";
import workOrdersRouter from "./routes/workOrders.js";
import sparePartsRouter from "./routes/spareParts.js";
import manualsRouter from "./routes/manuals.js";
import aiRouter from "./routes/ai.js";
import pmPlansRouter from "./routes/pmPlans.js";
import partWithdrawalsRouter from "./routes/partWithdrawals.js";
import knowledgeRouter from "./routes/knowledge.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigins,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
});

app.use("/api/users", usersRouter);
app.use("/api/machines", machinesRouter);
app.use("/api/work-orders", workOrdersRouter);
app.use("/api/spare-parts", sparePartsRouter);
app.use("/api/manuals", manualsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/pm-plans", pmPlansRouter);
app.use("/api/part-withdrawals", partWithdrawalsRouter);
app.use("/api/knowledge", knowledgeRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: "Route not found" } });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`mtcenter-backend listening on http://localhost:${config.port}`);
});
