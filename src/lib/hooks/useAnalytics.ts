import { track } from '@vercel/analytics';
import * as Sentry from '@sentry/react';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const trackEvent = (event: AnalyticsEvent) => {
    // Track in Vercel Analytics
    track(event.name, event.properties);
    
    // Add breadcrumb to Sentry
    Sentry.addBreadcrumb({
      message: `Analytics: ${event.name}`,
      category: 'analytics',
      level: 'info',
      data: event.properties,
    });
  };

  const trackPageView = (page: string, properties?: Record<string, any>) => {
    trackEvent({
      name: 'page_view',
      properties: {
        page,
        ...properties,
      },
    });
  };

  const trackUserAction = (action: string, properties?: Record<string, any>) => {
    trackEvent({
      name: 'user_action',
      properties: {
        action,
        ...properties,
      },
    });
  };

  const trackError = (error: string, properties?: Record<string, any>) => {
    trackEvent({
      name: 'error',
      properties: {
        error,
        ...properties,
      },
    });
  };

  const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
    trackEvent({
      name: 'performance',
      properties: {
        metric,
        value,
        ...properties,
      },
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    trackPerformance,
  };
};

// Предопределенные события для CRM
export const CRM_EVENTS = {
  // Клиенты
  CLIENT_CREATED: 'client_created',
  CLIENT_UPDATED: 'client_updated',
  CLIENT_DELETED: 'client_deleted',
  CLIENT_VIEWED: 'client_viewed',
  
  // Проекты
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_VIEWED: 'project_viewed',
  
  // Документы
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_DELETED: 'document_deleted',
  
  // Канбан
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_MOVED: 'task_moved',
  TASK_COMPLETED: 'task_completed',
  
  // Навигация
  PAGE_VIEWED: 'page_viewed',
  SIDEBAR_TOGGLED: 'sidebar_toggled',
  
  // Поиск
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  
  // Ошибки
  API_ERROR: 'api_error',
  UI_ERROR: 'ui_error',
} as const;
