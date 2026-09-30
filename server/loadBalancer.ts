// Load balancer configuration and health check optimizations
import { Request, Response } from 'express';
import { performanceMonitor } from './monitoring';
import { pool } from './db';
import redis from './redis';

export class LoadBalancerOptimizer {
  private static instance: LoadBalancerOptimizer;
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 10000; // 10 seconds

  static getInstance(): LoadBalancerOptimizer {
    if (!LoadBalancerOptimizer.instance) {
      LoadBalancerOptimizer.instance = new LoadBalancerOptimizer();
    }
    return LoadBalancerOptimizer.instance;
  }

  // Comprehensive health check for load balancers
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: number;
    details: any;
    uptime: number;
  }> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.lastHealthCheck < 5000) {
      return {
        status: this.healthStatus,
        timestamp: this.lastHealthCheck,
        details: { cached: true },
        uptime: process.uptime()
      };
    }

    const checks = {
      database: false,
      redis: false,
      memory: false,
      cpu: false,
      queues: false
    };

    try {
      // Database connectivity check
      const dbStart = Date.now();
      await pool.query('SELECT 1');
      const dbResponseTime = Date.now() - dbStart;
      checks.database = dbResponseTime < 1000; // 1 second max
      
      // Redis connectivity check
      const redisStart = Date.now();
      await redis.ping();
      const redisResponseTime = Date.now() - redisStart;
      checks.redis = redisResponseTime < 500; // 500ms max
      
      // Memory usage check
      const memUsage = process.memoryUsage();
      const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      checks.memory = memUsagePercent < 90; // 90% max
      
      // CPU usage check (simplified)
      const cpuUsage = process.cpuUsage();
      checks.cpu = true; // Always true for now, would need more complex CPU monitoring
      
      // Queue health check
      const health = await performanceMonitor.getHealthStatus();
      checks.queues = health.status !== 'error';

    } catch (error) {
      console.error('Health check error:', error);
    }

    // Determine overall health status
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    if (healthyChecks === totalChecks) {
      this.healthStatus = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      this.healthStatus = 'degraded';
    } else {
      this.healthStatus = 'unhealthy';
    }

    this.lastHealthCheck = now;

    return {
      status: this.healthStatus,
      timestamp: now,
      details: {
        checks,
        healthyChecks,
        totalChecks,
        score: Math.round((healthyChecks / totalChecks) * 100)
      },
      uptime: process.uptime()
    };
  }

  // Load balancer-friendly health endpoint
  async handleHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.performHealthCheck();
      
      // Set appropriate HTTP status code
      let statusCode = 200;
      if (health.status === 'degraded') {
        statusCode = 200; // Still accept traffic but with warning
      } else if (health.status === 'unhealthy') {
        statusCode = 503; // Remove from load balancer rotation
      }

      res.status(statusCode).json({
        status: health.status,
        timestamp: health.timestamp,
        uptime: health.uptime,
        details: health.details,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Health check failed',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Readiness check for Kubernetes-style deployments
  async handleReadinessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Readiness is more strict than health
      const dbCheck = await pool.query('SELECT 1');
      const redisCheck = await redis.ping();
      
      if (dbCheck && redisCheck === 'PONG') {
        res.status(200).json({
          status: 'ready',
          timestamp: Date.now(),
          checks: {
            database: true,
            redis: true
          }
        });
      } else {
        throw new Error('Dependencies not ready');
      }
    } catch (error) {
      res.status(503).json({
        status: 'not_ready',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Liveness check for Kubernetes
  handleLivenessCheck(req: Request, res: Response): void {
    // Simple check - if the process is running, it's alive
    res.status(200).json({
      status: 'alive',
      timestamp: Date.now(),
      uptime: process.uptime(),
      pid: process.pid
    });
  }

  // Graceful shutdown handler
  setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      
      // Mark as unhealthy to remove from load balancer
      this.healthStatus = 'unhealthy';
      
      // Give load balancer time to remove this instance
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        // Close database connections
        await pool.end();
        console.log('Database connections closed');
        
        // Close Redis connections
        redis.disconnect();
        console.log('Redis connections closed');
        
        // Exit gracefully
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  // Auto-scaling metrics for cloud providers
  getScalingMetrics(): {
    cpu: number;
    memory: number;
    connections: number;
    queueLength: number;
    responseTime: number;
  } {
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    return {
      cpu: 0, // Would need proper CPU monitoring
      memory: memUsagePercent,
      connections: pool.totalCount,
      queueLength: 0, // Would get from queue monitoring
      responseTime: 0 // Would get from performance monitor
    };
  }
}

export const loadBalancerOptimizer = LoadBalancerOptimizer.getInstance();