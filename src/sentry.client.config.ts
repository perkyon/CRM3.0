import * as Sentry from '@sentry/react';

// Инициализируем Sentry только если есть DSN
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay (только в продакшене)
    replaysSessionSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 1.0 : 0,
    
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Filter out development errors
    beforeSend(event) {
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        console.log('Sentry event (dev mode):', event);
        return null; // Не отправляем в development
      }
      return event;
    },
    
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    
    // Set user context
    initialScope: {
      tags: {
        component: 'crm-frontend',
        version: '1.0.0',
      },
    },
  });
  
  console.log('Sentry initialized for environment:', import.meta.env.VITE_NODE_ENV);
} else {
  console.log('Sentry DSN not found, skipping initialization');
}
