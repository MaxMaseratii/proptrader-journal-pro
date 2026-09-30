const express = require("express");
const { registerRoutes } = require("./routes");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { performanceMonitor } = require("./monitoring");
const { initializeDatabaseOptimizations } = require("./databaseOptimizations");
const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const path = require("path");

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Add error handling for missing environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.set('trust proxy', 1);

// Performance monitoring middleware
app.use(performanceMonitor.requestMonitor());

// Health check endpoint for load balancers
app.get('/health', async (req, res) => {
  try {
    const health = await performanceMonitor.getHealthStatus();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint for monitoring
app.get('/metrics', async (req, res) => {
  try {
    const health = await performanceMonitor.getHealthStatus();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Production optimizations
// Enable gzip compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Session configuration
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  name: 'proptrader.sid'
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register API routes
registerRoutes(app);

// Initialize database optimizations
initializeDatabaseOptimizations().catch(console.error);

// Serve static files in production
const publicPath = path.resolve(__dirname, 'public');

// Serve static files from the public directory
app.use(express.static(publicPath));

// Catch-all handler: send back React's index.html file
app.get('*', (req, res) => {
  const indexPath = path.resolve(publicPath, 'index.html');
  res.sendFile(indexPath);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Production Mode: Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`💾 Database connected: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;