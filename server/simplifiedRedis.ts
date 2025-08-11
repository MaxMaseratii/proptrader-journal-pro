// Simplified Redis with development fallback
import { CacheService } from './redis';

// In-memory cache for development when Redis is unavailable
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  static async get<T>(key: string): Promise<T | null> {
    // Development mode - no caching to ensure fresh data
    return null;
  }

  static async set(key: string, value: any, ttl: number = 300): Promise<void> {
    // Development mode - no caching
    return;
  }

  static async del(key: string): Promise<void> {
    // Development mode - no-op
    return;
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    // Development mode - no-op
    return;
  }

  static getDashboardKey(userId: string, accountId: string): string {
    return `dashboard:${userId}:${accountId}`;
  }

  static getAccountsKey(userId: string): string {
    return `accounts:${userId}`;
  }

  static getTradesKey(userId: string, accountId: string): string {
    return `trades:${userId}:${accountId}`;
  }
}

// Export the simplified cache for development
export const DevCacheService = process.env.NODE_ENV === 'development' ? MemoryCache : CacheService;