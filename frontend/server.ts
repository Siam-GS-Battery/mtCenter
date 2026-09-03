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

// Do NOT add express.json()/body-parser middleware here: it would drain the
// request body stream before vite's /api proxy (see vite.config.ts) forwards
// the request to the backend, leaving the backend waiting on a body that
// never arrives — this caused every POST with a body to hang and time out
// with 408. This dev server never reads req.body itself (it only mounts
// vite middlewares and serves the SPA), so no body parser belongs here.

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
