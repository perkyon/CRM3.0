import { useEffect } from 'react';
import { useAnalytics } from './useAnalytics';
import * as Sentry from '@sentry/react';

export const usePWAMonitoring = () => {
  const { trackEvent, trackUserAction } = useAnalytics();

  useEffect(() => {
    // Отслеживание установки PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      trackEvent({
        name: 'pwa_install_prompt_shown',
        properties: {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        },
      });

      Sentry.addBreadcrumb({
        message: 'PWA install prompt shown',
        category: 'pwa',
        level: 'info',
      });
    });

    // Отслеживание успешной установки PWA
    window.addEventListener('appinstalled', () => {
      trackEvent({
        name: 'pwa_installed',
        properties: {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        },
      });

      Sentry.addBreadcrumb({
        message: 'PWA installed successfully',
        category: 'pwa',
        level: 'info',
      });
    });

    // Отслеживание Service Worker событий
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, payload } = event.data || {};
        
        if (type) {
          trackEvent({
            name: 'service_worker_event',
            properties: {
              type,
              payload,
              timestamp: Date.now(),
            },
          });

          Sentry.addBreadcrumb({
            message: `Service Worker: ${type}`,
            category: 'sw',
            data: payload,
          });
        }
      });

      // Отслеживание обновлений Service Worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        trackEvent({
          name: 'service_worker_updated',
          properties: {
            timestamp: Date.now(),
          },
        });
      });
    }

    // Отслеживание сетевого статуса
    const handleOnline = () => {
      trackEvent({
        name: 'network_status_changed',
        properties: {
          status: 'online',
          timestamp: Date.now(),
        },
      });

      Sentry.addBreadcrumb({
        message: 'Connection restored',
        category: 'network',
        level: 'info',
      });
    };

    const handleOffline = () => {
      trackEvent({
        name: 'network_status_changed',
        properties: {
          status: 'offline',
          timestamp: Date.now(),
        },
      });

      Sentry.addBreadcrumb({
        message: 'Connection lost',
        category: 'network',
        level: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Отслеживание видимости страницы
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      trackEvent({
        name: 'page_visibility_changed',
        properties: {
          visible: isVisible,
          timestamp: Date.now(),
        },
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Отслеживание ориентации устройства
    const handleOrientationChange = () => {
      trackEvent({
        name: 'orientation_changed',
        properties: {
          orientation: screen.orientation?.type || 'unknown',
          angle: screen.orientation?.angle || 0,
          timestamp: Date.now(),
        },
      });
    };

    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // Отслеживание размера экрана
    const trackScreenSize = () => {
      trackEvent({
        name: 'screen_size',
        properties: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          timestamp: Date.now(),
        },
      });
    };

    // Отслеживаем размер экрана при загрузке
    trackScreenSize();

    // Отслеживание изменения размера окна
    const handleResize = () => {
      trackScreenSize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, [trackEvent, trackUserAction]);
};
