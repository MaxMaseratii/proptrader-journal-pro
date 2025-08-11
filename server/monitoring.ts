import { pool } from './db';
import redis from './redis';
import { csvProcessingQueue, analyticsQueue } from './backgroundJobs';

// Performance monitoring for million-user scale
export class PerformanceMonitor {
  private metrics: {
    requests: number;
    errors: number;
    responseTime: number[];
    dbConnections: number;
    cacheHits: number;
    cacheMisses: number;
    queueLength: number;
  } = {
    requests: 0,
    errors: 0,
    responseTime: [],
    dbConnections: 0,
    cacheHits: 0,
    cacheMisses: 0,
    queueLength: 0,
  };

  // Middleware for request monitoring
  requestMonitor() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      this.metrics.requests++;

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.metrics.responseTime.push(duration);
        
        // Keep only last 1000 response times
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime.shift();
        }

        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
      });

      next();
    };
  }

  // Database connection monitoring
  async getDbMetrics() {
    try {
      const result = await pool.query(`
        SELECT 
          count(*) as total_connections,
          count(*) filter (where state = 'active') as active_connections,
          count(*) filter (where state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      return {
        totalConnections: parseInt(result.rows[0]?.total_connections || '0'),
        activeConnections: parseInt(result.rows[0]?.active_connections || '0'),
        idleConnections: parseInt(result.rows[0]?.idle_connections || '0'),
        poolSize: pool.totalCount,
        poolAvailable: pool.idleCount,
        poolWaiting: pool.waitingCount,
      };
    } catch (error) {
      console.error('Error fetching database metrics:', error);
      return null;
    }
  }

  // Redis monitoring
  async getRedisMetrics() {
    try {
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: redis.status === 'ready',
      };
    } catch (error) {
      console.error('Error fetching Redis metrics:', error);
      return null;
    }
  }

  // Queue monitoring
  async getQueueMetrics() {
    try {
      const csvWaiting = await csvProcessingQueue.waiting();
      const csvActive = await csvProcessingQueue.active();
      const csvCompleted = await csvProcessingQueue.completed();
      const csvFailed = await csvProcessingQueue.failed();

      const analyticsWaiting = await analyticsQueue.waiting();
      const analyticsActive = await analyticsQueue.active();
      const analyticsCompleted = await analyticsQueue.completed();
      const analyticsFailed = await analyticsQueue.failed();

      return {
        csvProcessing: {
          waiting: csvWaiting.length,
          active: csvActive.length,
          completed: csvCompleted.length,
          failed: csvFailed.length,
        },
        analytics: {
          waiting: analyticsWaiting.length,
          active: analyticsActive.length,
          completed: analyticsCompleted.length,
          failed: analyticsFailed.length,
        },
      };
    } catch (error) {
      console.error('Error fetching queue metrics:', error);
      return null;
    }
  }

  // Application performance metrics
  getAppMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
      : 0;

    const p95ResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.sort((a, b) => a - b)[Math.floor(this.metrics.responseTime.length * 0.95)]
      : 0;

    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests) * 100 : 0,
      averageResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0 
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 
        : 0,
    };
  }

  // Comprehensive health check
  async getHealthStatus() {
    const dbMetrics = await this.getDbMetrics();
    const redisMetrics = await this.getRedisMetrics();
    const queueMetrics = await this.getQueueMetrics();
    const appMetrics = this.getAppMetrics();

    // Health thresholds
    const isHealthy = {
      database: dbMetrics && dbMetrics.activeConnections < 80, // 80% of pool
      redis: redisMetrics && redisMetrics.connected,
      queues: queueMetrics && 
        queueMetrics.csvProcessing.waiting < 100 && 
        queueMetrics.analytics.waiting < 50,
      responseTime: appMetrics.averageResponseTime < 500,
      errorRate: appMetrics.errorRate < 5,
    };

    const overallHealth = Object.values(isHealthy).every(Boolean);

    return {
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: isHealthy,
      metrics: {
        database: dbMetrics,
        redis: redisMetrics,
        queues: queueMetrics,
        application: appMetrics,
      },
    };
  }

  // Cache hit/miss tracking
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  // Reset metrics (for periodic reporting)
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      dbConnections: 0,
      cacheHits: 0,
      cacheMisses: 0,
      queueLength: 0,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();