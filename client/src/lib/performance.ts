// Performance Monitoring and Optimization
import { useEffect } from 'react';

// Performance thresholds for prop trading app
const PERFORMANCE_THRESHOLDS = {
  FCP: 1500, // First Contentful Paint - 1.5s
  LCP: 2500, // Largest Contentful Paint - 2.5s 
  FID: 100,  // First Input Delay - 100ms
  CLS: 0.1,  // Cumulative Layout Shift - 0.1
  TTFB: 600, // Time to First Byte - 600ms
};

// Performance grade calculator
const getPerformanceGrade = (metric: string, value: number): string => {
  const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!threshold) return 'N/A';
  
  const ratio = value / threshold;
  if (ratio <= 0.75) return 'A+';
  if (ratio <= 1.0) return 'A';
  if (ratio <= 1.25) return 'B';
  if (ratio <= 1.5) return 'C';
  return 'D';
};

// Send performance metrics to analytics
const logPerformanceMetric = (name: string, value: number) => {
  const grade = getPerformanceGrade(name, value);
  
  console.log(`🚀 Performance Metric: ${name}`, {
    value: value,
    grade,
    threshold: PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS],
    timestamp: new Date().toISOString()
  });
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Monitor bundle loading time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    logPerformanceMetric('LOAD_TIME', loadTime);
  });

  // Monitor bundle size
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    console.log('📡 Network Info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    });
  }
};

// Performance utility for manual measurements
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`⏱️ ${name}: ${end - start}ms`);
};

// Component performance wrapper
export const withPerformance = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  displayName: string
) => {
  const WrappedComponent = (props: T) => {
    const start = performance.now();
    
    useEffect(() => {
      const end = performance.now();
      console.log(`🎯 ${displayName} render time: ${end - start}ms`);
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformance(${displayName})`;
  return WrappedComponent;
};