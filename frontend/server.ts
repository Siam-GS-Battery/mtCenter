import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Dev-only server: mounts Vite in middleware mode so the app runs with HMR.
// In production the backend Express server serves both /api/* and this
// app's static build directly (single-service deployment) — this file is
// no longer used in production and has no build/start script anymore.
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NCMMs AI Assistant dev server running on http://localhost:${PORT}`);
  });
}

startServer();
