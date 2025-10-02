import { useEffect } from 'react';
import { useAnalytics } from './useAnalytics';

export const usePerformanceTracking = () => {
  const { trackPerformance } = useAnalytics();

  useEffect(() => {
    // Track Core Web Vitals
    if ('web-vital' in window) {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            trackPerformance('LCP', entry.startTime, {
              url: window.location.pathname,
            });
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'first-input') {
            trackPerformance('FID', (entry as any).processingStart - entry.startTime, {
              url: window.location.pathname,
            });
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        trackPerformance('CLS', clsValue, {
          url: window.location.pathname,
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      trackPerformance('page_load_time', loadTime, {
        url: window.location.pathname,
      });
    });

    // Track API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        trackPerformance('api_response_time', duration, {
          url: args[0]?.toString() || 'unknown',
          status: response.status,
          method: args[1]?.method || 'GET',
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        trackPerformance('api_response_time', duration, {
          url: args[0]?.toString() || 'unknown',
          status: 'error',
          method: args[1]?.method || 'GET',
          error: true,
        });
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [trackPerformance]);
};
