import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Worker, isMainThread, parentPort } from "worker_threads";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { initDb } from "./src/utils/db";
import { archiveStaleStories } from "./src/utils/dbOperations";
import { getLiveNews } from "./src/server/services/news.service";
import { sseClients, broadcastSSE } from "./src/server/services/sse.service";

// Routes
import authRoutes from "./src/server/routes/auth.routes";
import newsRoutes from "./src/server/routes/news.routes";
import pulseRoutes from "./src/server/routes/pulse.routes";

// Since we might be running as CJS or ESM depending on environment (tsx vs esbuild)
let dirname = "";
try {
  dirname = path.dirname(fileURLToPath(import.meta.url));
} catch (e) {
  dirname = __dirname;
}

const PORT = Number(process.env.PORT) || 8080;
const isProd = process.env.NODE_ENV === "production" || path.basename(dirname) === "dist";

// --- WORKER THREAD LOGIC ---
if (!isMainThread) {
  // We are in the background worker
  console.log("Worker Thread: Booting up for background news ingestion...");
  
  async function runWorker() {
    try {
      await initDb();
      await archiveStaleStories();
      const result = await getLiveNews();
      parentPort?.postMessage({ type: "success", data: result });
    } catch (err) {
      console.error("Worker Thread Error:", err);
      parentPort?.postMessage({ type: "error", error: String(err) });
    }
  }

  runWorker();
} else {
  // --- MAIN THREAD LOGIC ---
  const app = express();
  // Cloud Run sits behind a reverse proxy; required for express-rate-limit IP keying
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
  app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Security headers middleware
  app.use(helmet({ contentSecurityPolicy: false }));

  // Rate limiting middleware for general traffic
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // allow up to 2000 requests per 15 minutes for normal browsing/SSE
    standardHeaders: true,
    legacyHeaders: false,
    // Cloud Run / X-Forwarded-For: skip permissive validation that throws ValidationError
    validate: false,
  });

  // Apply rate limiting to all requests
  app.use(limiter);

  /**
   * Live RSS background ingestion toggle:
   * - DISABLE_BACKGROUND_INGESTION=true  â†’ always off (wins)
   * - ENABLE_BACKGROUND_INGESTION=true   â†’ always on
   * - otherwise: ON by default in non-production (local/dev) so Home stays fresh
   * Documented in .env.example
   */
  function shouldEnableBackgroundIngestion(): boolean {
    if (process.env.DISABLE_BACKGROUND_INGESTION === "true") return false;
    if (process.env.ENABLE_BACKGROUND_INGESTION === "true") return true;
    // Dist builds often set NODE_ENV=production even on a laptop. Treat unmarked
    // local hosts as default-on; Cloud Run / configured public APP_URL stay opt-in.
    if (process.env.NODE_ENV !== "production") return true;
    if (process.env.K_SERVICE || process.env.CLOUD_RUN_JOB || process.env.FUNCTION_TARGET) return false;
    const appUrl = String(process.env.APP_URL || "").toLowerCase();
    if (appUrl && !/localhost|127\.0\.0\.1/i.test(appUrl) && !appUrl.includes("my_app_url")) return false;
    return true;
  }

  // Function to spawn the background worker
  function spawnNewsWorker() {
    console.log("Main Thread: Spawning background news worker...");
    // We check how the app is running. If tsx, we use fileURLToPath. If node (built), we use __filename.
    let workerPath;
    try {
      workerPath = fileURLToPath(import.meta.url);
    } catch (e) {
      workerPath = __filename;
    }
    
    if (process.env.DISABLE_BACKGROUND_INGESTION === "true") {
      console.log("Main Thread: Background news worker disabled via DISABLE_BACKGROUND_INGESTION flag.");
      return;
    }

    const execArgv = process.execArgv.join(" ").includes("tsx") 
      ? ["--import", "tsx"] 
      : undefined;
    
    const worker = new Worker(workerPath, {
      execArgv,
      resourceLimits: {
        maxOldGenerationSizeMb: 4096,
      }
    });
    
    worker.on("message", (msg) => {
      if (msg.type === "success") {
        console.log("Main Thread: Background worker completed successfully.");
        // We broadcast from main thread because SSE connections are held here
        broadcastSSE("news_updated", { timestamp: Date.now() });
      } else if (msg.type === "error") {
        console.error("Main Thread: Background worker reported an error:", msg.error);
      }
    });

    worker.on("error", (err) => {
      console.error("Main Thread: Background worker crashed:", err);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Main Thread: Background worker stopped with exit code ${code}`);
      }
    });
  }

  process.on("uncaughtException", (err) => {
    console.error("Main Thread Uncaught Exception:", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("Main Thread Unhandled Rejection:", reason);
  });

  async function startServer() {
    await initDb();

    // One-shot ingest on boot when stories table is empty (seed/.data may be missing on fresh revisions)
    let storyCount = 0;
    try {
      const db = await initDb();
      const row = await db.get("SELECT COUNT(*) as c FROM stories");
      storyCount = Number(row?.c || 0);
    } catch (e) {
      console.warn("Boot story count check failed:", e);
    }

    // Spawn background worker for live RSS (default-on for local/dev; see shouldEnableBackgroundIngestion)
    if (shouldEnableBackgroundIngestion()) {
      console.log("Background news ingestion worker ENABLED (set DISABLE_BACKGROUND_INGESTION=true to turn off; ENABLE_BACKGROUND_INGESTION=true forces on).");
      const delayMs = storyCount === 0 ? 0 : 5000;
      console.log("Boot: stories=" + storyCount + "; scheduling first ingest in " + delayMs + "ms");
      setTimeout(spawnNewsWorker, delayMs);
      setInterval(spawnNewsWorker, 2 * 60 * 60 * 1000);
    } else if (storyCount === 0) {
      console.log("Boot: DB empty and background ingestion disabled â€” running one-shot ingest anyway.");
      setTimeout(spawnNewsWorker, 0);
    } else {
      console.log("Background news ingestion worker disabled. Set ENABLE_BACKGROUND_INGESTION=true to enable live RSS polling (or unset DISABLE_BACKGROUND_INGESTION / run non-production for default-on).");
    }

    // Mount API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/news", newsRoutes);
    app.use("/api/pulse", pulseRoutes);

    // SSE Endpoint
    app.get("/api/stream", (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      sseClients.add(res);
      res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
    });

    // Client Serving
    if (isProd) {
      const clientDist = path.basename(dirname) === "dist" ? dirname : path.resolve(dirname, "dist");
      app.use(express.static(clientDist));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(clientDist, "index.html"));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT as number, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

  startServer().catch(console.error);
}
