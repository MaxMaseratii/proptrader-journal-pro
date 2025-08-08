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
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
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
      staleTime: 10 * 60 * 1000, // 10 minutes - billing data changes less frequently
      cacheTime: 20 * 60 * 1000, // 20 minutes
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
      staleTime: 3 * 60 * 1000, // 3 minutes - profile data can change more frequently
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}