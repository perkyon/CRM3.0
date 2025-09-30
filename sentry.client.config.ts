import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Performance Monitoring
  tracesSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Filter out development errors
  beforeSend(event) {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Set user context
  initialScope: {
    tags: {
      component: 'crm-frontend',
    },
  },
});
