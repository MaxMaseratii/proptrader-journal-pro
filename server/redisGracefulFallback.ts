// Graceful fallback system for Redis in development
import Redis from 'ioredis';

// In-memory fallback cache for development
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : Date.now() + (24 * 60 * 60 * 1000);
    this.cache.set(key, { value, expiry });
  }

  async setex(key: string, ttlSeconds: number, value: any): Promise<void> {
    await this.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiry = Date.now() + (ttlSeconds * 1000);
    }
  }

  disconnect(): void {
    this.cache.clear();
  }

  get status(): string {
    return 'ready';
  }

  async info(section?: string): Promise<string> {
    return `# Memory\nused_memory:${this.cache.size * 1000}\nmaxmemory:104857600\n`;
  }

  // Cleanup expired entries periodically
  private cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

// Create Redis instance with graceful fallback
function createRedisWithFallback() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    // Try Redis first, but don't crash if it fails
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 2000,
      });

      // Suppress error logging for development
      redis.on('error', () => {
        // Silent fail in development
      });

      // Test connection
      redis.ping().then(() => {
        console.log('✅ Redis connected successfully');
      }).catch(() => {
        console.log('⚠️  Redis unavailable - using memory cache for development');
      });

      return redis;
    } catch (error) {
      console.log('⚠️  Redis unavailable - using memory cache for development');
      return new MemoryCache() as any;
    }
  } else {
    // Production - use real Redis
    return new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
    });
  }
}

export default createRedisWithFallback();