// Production optimizations for million-user scalability

// Database query optimization
export const optimizeDbQueries = {
  // Enable query caching
  cacheQueries: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  
  // Connection pool optimization
  connectionPool: {
    max: 100,
    min: 5,
    idleTimeoutMillis: 60000,
  },
  
  // Query optimization settings
  queryTimeout: 30000,
  statementTimeout: 30000,
};

// Frontend performance optimizations
export const frontendOptimizations = {
  // Enable service worker for caching
  enableServiceWorker: true,
  
  // Code splitting configuration
  codeSplitting: {
    chunks: 'all',
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
      common: {
        minChunks: 2,
        chunks: 'all',
        enforce: true,
      },
    },
  },
  
  // Bundle optimization
  bundleOptimization: {
    splitChunks: true,
    treeshaking: true,
    minification: true,
  },
};

// API optimization settings
export const apiOptimizations = {
  // Response compression
  compression: {
    level: 6,
    threshold: 1024,
  },
  
  // Rate limiting
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // requests per window
    },
    llm: {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // LLM requests per minute
    },
    csvImport: {
      windowMs: 60 * 1000, // 1 minute
      max: 5, // CSV imports per minute
    },
  },
  
  // Caching strategies
  caching: {
    analytics: 300, // 5 minutes
    accounts: 600, // 10 minutes
    trades: 180, // 3 minutes
    userProfile: 900, // 15 minutes
  },
};

// Monitoring and alerting thresholds
export const monitoringThresholds = {
  responseTime: {
    warning: 500, // ms
    critical: 2000, // ms
  },
  
  connectionPool: {
    utilizationWarning: 70, // %
    utilizationCritical: 90, // %
  },
  
  memory: {
    warningThreshold: 80, // %
    criticalThreshold: 95, // %
  },
  
  queueLength: {
    warning: 100,
    critical: 500,
  },
};

// CDN configuration for static assets
export const cdnConfig = {
  // Static asset paths that should be served from CDN
  staticAssets: [
    '/assets/**',
    '/images/**',
    '/fonts/**',
    '*.css',
    '*.js',
  ],
  
  // Cache headers for different asset types
  cacheHeaders: {
    images: 'public, max-age=31536000', // 1 year
    fonts: 'public, max-age=31536000', // 1 year
    css: 'public, max-age=86400', // 1 day
    js: 'public, max-age=86400', // 1 day
  },
};

// Background job configuration
export const backgroundJobConfig = {
  // Queue priorities
  priorities: {
    csvImport: 10,
    analytics: 5,
    notifications: 3,
    cleanup: 1,
  },
  
  // Retry configuration
  retries: {
    attempts: 3,
    backoffType: 'exponential',
    backoffDelay: 2000,
  },
  
  // Job retention
  retention: {
    completed: 100,
    failed: 50,
  },
};