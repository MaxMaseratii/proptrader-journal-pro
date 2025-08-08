import { useState, useEffect } from 'react';

// Optimized debounce hook for form inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Specialized debounce for search inputs
export function useSearchDebounce(searchTerm: string, delay: number = 500) {
  return useDebounce(searchTerm, delay);
}