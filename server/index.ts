import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { performanceMonitor } from "./monitoring";
import { initializeDatabaseOptimizations } from "./databaseOptimizations";
import { setupCDNOptimization } from "./cdnOptimization";
import { loadBalancerOptimizer } from "./loadBalancer";
import { advancedMonitoring } from "./advancedMonitoring";

const app = express();

// Performance monitoring middleware (always enabled)
app.use(performanceMonitor.requestMonitor());

// Ultra-scale health checks and monitoring endpoints
app.get('/health', (req, res) => loadBalancerOptimizer.handleHealthCheck(req, res));
app.get('/ready', (req, res) => loadBalancerOptimizer.handleReadinessCheck(req, res));
app.get('/live', (req, res) => loadBalancerOptimizer.handleLivenessCheck(req, res));

// Advanced metrics endpoints
app.get('/metrics', async (req, res) => {
  try {
    const metrics = advancedMonitoring.getAllMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/metrics/prometheus', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(advancedMonitoring.getPrometheusMetrics());
});

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Enable gzip compression
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  
  // Rate limiting for production
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Stricter rate limiting for LLM API
  const llmLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 LLM requests per minute
    message: 'Too many AI requests, please wait before trying again.',
  });
  app.use('/api/trading-companion', llmLimiter);
}

// CDN and static asset optimization
setupCDNOptimization(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database optimizations
  await initializeDatabaseOptimizations();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
