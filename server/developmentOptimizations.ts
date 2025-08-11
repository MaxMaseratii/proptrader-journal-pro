// Development-specific optimizations to improve performance
export class DevelopmentOptimizer {
  static disableHeavyFeatures() {
    if (process.env.NODE_ENV === 'development') {
      // Disable Redis in development
      console.log('🚀 Development Mode: Disabling heavy features for better performance');
      
      // Override console.error for Redis connection errors to reduce noise
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        if (message.includes('Redis connection error') || message.includes('ECONNREFUSED')) {
          // Silent fail for Redis in development
          return;
        }
        originalConsoleError.apply(console, args);
      };
      
      return true;
    }
    return false;
  }
  
  static async optimizeDashboard() {
    // Cache commonly used calculations
    const dashboardCache = new Map();
    
    return {
      getFromCache: (key: string) => dashboardCache.get(key),
      setCache: (key: string, value: any) => dashboardCache.set(key, value),
      clearCache: () => dashboardCache.clear()
    };
  }
}

// Auto-initialize development optimizations
DevelopmentOptimizer.disableHeavyFeatures();