import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

// Optimized query hook with aggressive caching for production
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  const optimizedQueryFn = useCallback(queryFn, []);
  
  const optimizedOptions = useMemo(() => ({
    staleTime: 1 * 60 * 1000, // 1 minute - faster refresh
    cacheTime: 3 * 60 * 1000, // 3 minutes cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Single retry for speed
    ...options
  }), [options]);

  return useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    ...optimizedOptions
  });
}

// Specialized hook for billing data
export function useBillingQuery() {
  return useOptimizedQuery(
    ['billing-data'],
    async () => {
      const response = await fetch('/api/billing', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch billing data');
      return response.json();
    },
    {
      staleTime: 30 * 1000, // 30 seconds - faster billing refresh
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Specialized hook for profile data
export function useProfileQuery() {
  return useOptimizedQuery(
    ['user-profile'],
    async () => {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    {
      staleTime: 30 * 1000, // 30 seconds - faster profile refresh
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}