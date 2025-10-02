import { useEffect } from 'react';
import { useAnalytics } from '../../lib/hooks/useAnalytics';

export function PerformanceTracker() {
  const { trackPerformance } = useAnalytics();

  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              trackPerformance('LCP', entry.startTime, {
                url: window.location.pathname,
              });
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.entryType === 'first-input') {
              trackPerformance('FID', (entry as any).processingStart - entry.startTime, {
                url: window.location.pathname,
              });
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          trackPerformance('CLS', clsValue, {
            url: window.location.pathname,
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Cleanup observers
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance tracking not supported:', error);
      }
    }

    // Track page load time
    const handleLoad = () => {
      const loadTime = performance.now();
      trackPerformance('page_load_time', loadTime, {
        url: window.location.pathname,
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [trackPerformance]);

  return null;
}
