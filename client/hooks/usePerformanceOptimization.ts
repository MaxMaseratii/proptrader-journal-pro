import { useEffect, useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Custom hook for performance optimization in million-user scale
export function usePerformanceOptimization() {
  const queryClient = useQueryClient();

  // Optimize query invalidation with batch processing
  const optimizedInvalidateQueries = useCallback((patterns: string[]) => {
    // Batch invalidations to reduce re-renders
    requestAnimationFrame(() => {
      patterns.forEach(pattern => {
        queryClient.invalidateQueries({ queryKey: [pattern] });
      });
    });
  }, [queryClient]);

  // Debounced query invalidation for frequent updates
  const debouncedInvalidation = useMemo(() => {
    const debounceMap = new Map();
    
    return (queryKey: string, delay: number = 300) => {
      if (debounceMap.has(queryKey)) {
        clearTimeout(debounceMap.get(queryKey));
      }
      
      const timeoutId = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        debounceMap.delete(queryKey);
      }, delay);
      
      debounceMap.set(queryKey, timeoutId);
    };
  }, [queryClient]);

  // Memory cleanup for unused queries
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.getQueryCache().findAll().forEach(query => {
        const timeSinceLastUsed = Date.now() - (query.getObserversCount() > 0 ? Date.now() : query.state.dataUpdatedAt);
        
        // Remove queries not used in 10 minutes
        if (timeSinceLastUsed > 10 * 60 * 1000 && query.getObserversCount() === 0) {
          queryClient.getQueryCache().remove(query);
        }
      });
    }, 5 * 60 * 1000); // Run every 5 minutes

    return () => clearInterval(interval);
  }, [queryClient]);

  return {
    optimizedInvalidateQueries,
    debouncedInvalidation,
  };
}

// Virtual scrolling hook for large datasets
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
  
  return useMemo(() => {
    if (items.length <= visibleCount) {
      return {
        virtualItems: items,
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * itemHeight,
      };
    }

    // Calculate visible range (this would be enhanced with scroll position)
    const startIndex = 0; // Would be calculated from scroll position
    const endIndex = Math.min(startIndex + visibleCount, items.length - 1);
    
    return {
      virtualItems: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, visibleCount]);
}

// Optimized API calls with intelligent caching
export function useOptimizedQuery<TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
  } = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes  
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchInterval: options.refetchInterval ?? false,
    // Enable background refetching for better UX
    refetchOnMount: 'always',
    // Retry configuration for production reliability
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.warn(`Query ${queryKey.join('/')} failed, retrying... (${failureCount + 1}/3)`);
        return true;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Bundle size optimization - lazy load heavy components
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => <div>Loading...</div>
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    importFunc()
      .then(module => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [importFunc]);

  if (error) {
    console.error('Failed to load component:', error);
    return fallback;
  }

  if (loading || !Component) {
    return fallback;
  }

  return Component;
}

// Performance monitoring hook
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) {
        console.warn(`Component ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && renderTime > 500) {
        // Would send to monitoring service
        console.error(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}