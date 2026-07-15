import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { seedIfEmpty } from "./lib/seed.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", router);

// ── Serve React frontend in production ────────────────────────────────────────
// When NODE_ENV=production the Express server serves the pre-built Vite output.
// This makes the whole app deployable as a single service on Railway / Render / Fly.
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Works for both `node dist/index.mjs` run from any cwd
  const staticDir =
    process.env.STATIC_DIR ||
    path.resolve(__dirname, "../../legal-rag/dist/public");

  app.use(express.static(staticDir));

  // SPA fallback – serve index.html for every non-API route
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

// Seed database with legal documents on startup
seedIfEmpty().catch((err) => logger.error({ err }, "Failed to seed database"));

export default app;
