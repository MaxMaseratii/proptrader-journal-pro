// Advanced monitoring and alerting system for ultra-scale deployment
import { EventEmitter } from 'events';
import { pool } from './db';
import redis from './redis';
import { csvProcessingQueue, analyticsQueue } from './backgroundJobs';

interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
}

interface MetricData {
  timestamp: number;
  value: number;
  metadata?: any;
}

export class AdvancedMonitoringSystem extends EventEmitter {
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Map<string, number> = new Map(); // last alert timestamp
  private thresholds: AlertThreshold[] = [
    // Response time alerts
    { metric: 'response_time_avg', operator: 'gt', value: 500, severity: 'medium', cooldown: 5 },
    { metric: 'response_time_p95', operator: 'gt', value: 1000, severity: 'high', cooldown: 5 },
    
    // Error rate alerts
    { metric: 'error_rate', operator: 'gt', value: 5, severity: 'high', cooldown: 2 },
    { metric: 'error_rate', operator: 'gt', value: 10, severity: 'critical', cooldown: 1 },
    
    // Database alerts
    { metric: 'db_connection_usage', operator: 'gt', value: 80, severity: 'medium', cooldown: 10 },
    { metric: 'db_connection_usage', operator: 'gt', value: 95, severity: 'critical', cooldown: 2 },
    { metric: 'db_query_time', operator: 'gt', value: 1000, severity: 'high', cooldown: 5 },
    
    // Memory alerts
    { metric: 'memory_usage', operator: 'gt', value: 80, severity: 'medium', cooldown: 10 },
    { metric: 'memory_usage', operator: 'gt', value: 95, severity: 'critical', cooldown: 2 },
    
    // Queue alerts
    { metric: 'queue_length', operator: 'gt', value: 100, severity: 'medium', cooldown: 5 },
    { metric: 'queue_length', operator: 'gt', value: 500, severity: 'high', cooldown: 2 },
    
    // Cache alerts
    { metric: 'cache_hit_rate', operator: 'lt', value: 70, severity: 'medium', cooldown: 15 },
    { metric: 'redis_memory_usage', operator: 'gt', value: 80, severity: 'high', cooldown: 10 },
  ];

  constructor() {
    super();
    this.startMetricsCollection();
    this.setupAlertHandlers();
  }

  // Start collecting metrics at regular intervals
  private startMetricsCollection(): void {
    // Collect basic metrics every 30 seconds
    setInterval(async () => {
      await this.collectSystemMetrics();
    }, 30000);

    // Collect database metrics every minute
    setInterval(async () => {
      await this.collectDatabaseMetrics();
    }, 60000);

    // Collect queue metrics every 15 seconds
    setInterval(async () => {
      await this.collectQueueMetrics();
    }, 15000);

    // Collect Redis metrics every minute
    setInterval(async () => {
      await this.collectRedisMetrics();
    }, 60000);
  }

  // Collect system-level metrics
  private async collectSystemMetrics(): Promise<void> {
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    this.recordMetric('memory_usage', memUsagePercent, {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    });

    // CPU usage (simplified - would need more complex monitoring in production)
    const cpuUsage = process.cpuUsage();
    this.recordMetric('cpu_user_time', cpuUsage.user);
    this.recordMetric('cpu_system_time', cpuUsage.system);

    // Process uptime
    this.recordMetric('uptime', process.uptime());
  }

  // Collect database metrics
  private async collectDatabaseMetrics(): Promise<void> {
    try {
      // Connection pool metrics
      const connectionUsage = (pool.totalCount / 100) * 100; // Assuming max 100
      this.recordMetric('db_connection_usage', connectionUsage, {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      });

      // Query performance metrics
      const queryStart = Date.now();
      await pool.query('SELECT 1');
      const queryTime = Date.now() - queryStart;
      this.recordMetric('db_query_time', queryTime);

      // Database size metrics (if accessible)
      const sizeQuery = `
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as bytes
        FROM pg_tables 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 5
      `;
      
      const sizeResult = await pool.query(sizeQuery);
      if (sizeResult.rows.length > 0) {
        const totalSize = sizeResult.rows.reduce((sum, row) => sum + parseInt(row.bytes), 0);
        this.recordMetric('db_total_size', totalSize, { tables: sizeResult.rows });
      }

    } catch (error) {
      console.error('Error collecting database metrics:', error);
      this.recordMetric('db_error_count', 1);
    }
  }

  // Collect queue metrics
  private async collectQueueMetrics(): Promise<void> {
    try {
      const csvWaiting = await csvProcessingQueue.waiting();
      const csvActive = await csvProcessingQueue.active();
      const analyticsWaiting = await analyticsQueue.waiting();
      const analyticsActive = await analyticsQueue.active();

      const totalQueueLength = csvWaiting.length + csvActive.length + 
                              analyticsWaiting.length + analyticsActive.length;

      this.recordMetric('queue_length', totalQueueLength, {
        csv: { waiting: csvWaiting.length, active: csvActive.length },
        analytics: { waiting: analyticsWaiting.length, active: analyticsActive.length }
      });

      // Queue processing rate
      const csvCompleted = await csvProcessingQueue.completed();
      const analyticsCompleted = await analyticsQueue.completed();
      
      this.recordMetric('queue_completed_csv', csvCompleted.length);
      this.recordMetric('queue_completed_analytics', analyticsCompleted.length);

    } catch (error) {
      console.error('Error collecting queue metrics:', error);
      this.recordMetric('queue_error_count', 1);
    }
  }

  // Collect Redis metrics
  private async collectRedisMetrics(): Promise<void> {
    try {
      const info = await redis.info('memory');
      const lines = info.split('\r\n');
      
      let usedMemory = 0;
      let maxMemory = 0;
      
      for (const line of lines) {
        if (line.startsWith('used_memory:')) {
          usedMemory = parseInt(line.split(':')[1]);
        } else if (line.startsWith('maxmemory:')) {
          maxMemory = parseInt(line.split(':')[1]);
        }
      }
      
      if (maxMemory > 0) {
        const memoryUsagePercent = (usedMemory / maxMemory) * 100;
        this.recordMetric('redis_memory_usage', memoryUsagePercent, {
          used: usedMemory,
          max: maxMemory
        });
      }

      // Test cache responsiveness
      const cacheStart = Date.now();
      await redis.ping();
      const cacheResponseTime = Date.now() - cacheStart;
      this.recordMetric('redis_response_time', cacheResponseTime);

    } catch (error) {
      console.error('Error collecting Redis metrics:', error);
      this.recordMetric('redis_error_count', 1);
    }
  }

  // Record a metric value
  public recordMetric(name: string, value: number, metadata?: any): void {
    const metricData: MetricData = {
      timestamp: Date.now(),
      value,
      metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metricData);

    // Keep only last 1000 data points per metric
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Check for alerts
    this.checkAlerts(name, value);
  }

  // Check if any alert thresholds are breached
  private checkAlerts(metricName: string, value: number): void {
    const relevantThresholds = this.thresholds.filter(t => t.metric === metricName);
    
    for (const threshold of relevantThresholds) {
      let alertTriggered = false;
      
      switch (threshold.operator) {
        case 'gt':
          alertTriggered = value > threshold.value;
          break;
        case 'lt':
          alertTriggered = value < threshold.value;
          break;
        case 'eq':
          alertTriggered = value === threshold.value;
          break;
      }

      if (alertTriggered) {
        const alertKey = `${metricName}_${threshold.severity}`;
        const lastAlert = this.alerts.get(alertKey) || 0;
        const now = Date.now();
        const cooldownMs = threshold.cooldown * 60 * 1000;

        if (now - lastAlert > cooldownMs) {
          this.triggerAlert(metricName, value, threshold);
          this.alerts.set(alertKey, now);
        }
      }
    }
  }

  // Trigger an alert
  private triggerAlert(metricName: string, value: number, threshold: AlertThreshold): void {
    const alert = {
      timestamp: Date.now(),
      metric: metricName,
      value,
      threshold: threshold.value,
      operator: threshold.operator,
      severity: threshold.severity,
      message: `${metricName} is ${value}, threshold: ${threshold.operator} ${threshold.value}`
    };

    // Emit alert event
    this.emit('alert', alert);

    // Log alert
    console.warn(`🚨 Alert [${threshold.severity.toUpperCase()}]: ${alert.message}`);

    // In production, send to alerting system (PagerDuty, Slack, etc.)
    this.sendToAlertingSystem(alert);
  }

  // Send alert to external alerting system
  private async sendToAlertingSystem(alert: any): Promise<void> {
    // This would integrate with PagerDuty, Slack, email, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example webhook call
      try {
        // await fetch(process.env.ALERT_WEBHOOK_URL, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(alert)
        // });
      } catch (error) {
        console.error('Failed to send alert to external system:', error);
      }
    }
  }

  // Setup alert event handlers
  private setupAlertHandlers(): void {
    this.on('alert', (alert) => {
      // Custom alert handling logic
      if (alert.severity === 'critical') {
        // Immediate action for critical alerts
        console.error(`🚨 CRITICAL ALERT: ${alert.message}`);
      }
    });
  }

  // Get metric statistics
  public getMetricStats(name: string, timeframe?: number): {
    current: number;
    average: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const now = Date.now();
    const relevantMetrics = timeframe 
      ? metrics.filter(m => now - m.timestamp <= timeframe)
      : metrics;

    if (relevantMetrics.length === 0) return null;

    const values = relevantMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      current: values[values.length - 1],
      average: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  // Get all metrics for dashboard
  public getAllMetrics(): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    
    for (const [name, data] of this.metrics.entries()) {
      result[name] = this.getMetricStats(name, 5 * 60 * 1000); // Last 5 minutes
    }
    
    return result;
  }

  // Export metrics in Prometheus format
  public getPrometheusMetrics(): string {
    let output = '';
    
    for (const [name, data] of this.metrics.entries()) {
      if (data.length === 0) continue;
      
      const latest = data[data.length - 1];
      const metricName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      output += `# HELP ${metricName} ${name} metric\n`;
      output += `# TYPE ${metricName} gauge\n`;
      output += `${metricName} ${latest.value} ${latest.timestamp}\n\n`;
    }
    
    return output;
  }
}

export const advancedMonitoring = new AdvancedMonitoringSystem();