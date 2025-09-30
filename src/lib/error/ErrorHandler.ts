import { toast } from '../toast';

export interface AppError {
  code?: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
  userId?: string;
  url?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle API errors
  handleApiError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: error.code || 'API_ERROR',
      message: this.getErrorMessage(error),
      details: error.details || error,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showUserMessage(appError);
    return appError;
  }

  // Handle network errors
  handleNetworkError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: 'Проблемы с подключением к серверу. Проверьте интернет-соединение.',
      details: error,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showUserMessage(appError);
    return appError;
  }

  // Handle validation errors
  handleValidationError(errors: Record<string, string[]>, context?: string): AppError {
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: 'Ошибки валидации формы',
      details: errors,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showValidationMessages(errors);
    return appError;
  }

  // Handle authentication errors
  handleAuthError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: 'AUTH_ERROR',
      message: 'Ошибка аутентификации. Пожалуйста, войдите в систему заново.',
      details: error,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showUserMessage(appError);
    
    // Redirect to login if needed
    if (error.code === 'UNAUTHORIZED' || error.status === 401) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    return appError;
  }

  // Handle permission errors
  handlePermissionError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: 'PERMISSION_ERROR',
      message: 'У вас нет прав для выполнения этого действия.',
      details: error,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showUserMessage(appError);
    return appError;
  }

  // Handle file upload errors
  handleFileUploadError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: 'FILE_UPLOAD_ERROR',
      message: this.getFileUploadErrorMessage(error),
      details: error,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showUserMessage(appError);
    return appError;
  }

  // Handle real-time connection errors
  handleRealtimeError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: 'REALTIME_ERROR',
      message: 'Проблемы с подключением в реальном времени. Данные могут быть неактуальными.',
      details: error,
      timestamp: new Date(),
      context,
      url: window.location.href,
    };

    this.logError(appError);
    this.showUserMessage(appError, 'warning');
    return appError;
  }

  // Log error to console and queue
  private logError(error: AppError): void {
    // Add to queue
    this.errorQueue.push(error);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorHandler:', error);
    }

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      this.sendToErrorService(error);
    }
  }

  // Show user-friendly message
  private showUserMessage(error: AppError, type: 'error' | 'warning' | 'info' = 'error'): void {
    const message = this.getUserFriendlyMessage(error);
    
    switch (type) {
      case 'warning':
        toast(message, { type: 'warning' });
        break;
      case 'info':
        toast(message, { type: 'info' });
        break;
      default:
        toast(message, { type: 'error' });
    }
  }

  // Show validation error messages
  private showValidationMessages(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        toast(`${field}: ${message}`, { type: 'error' });
      });
    });
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(error: AppError): string {
    const messages: Record<string, string> = {
      'API_ERROR': 'Произошла ошибка при обращении к серверу',
      'NETWORK_ERROR': 'Проблемы с подключением к интернету',
      'VALIDATION_ERROR': 'Проверьте правильность заполнения формы',
      'AUTH_ERROR': 'Ошибка авторизации. Войдите в систему заново',
      'PERMISSION_ERROR': 'У вас нет прав для выполнения этого действия',
      'FILE_UPLOAD_ERROR': 'Ошибка загрузки файла',
      'REALTIME_ERROR': 'Проблемы с подключением в реальном времени',
    };

    return messages[error.code || ''] || error.message || 'Произошла неизвестная ошибка';
  }

  // Get detailed error message
  private getErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.statusText) {
      return error.response.statusText;
    }
    return 'Произошла неизвестная ошибка';
  }

  // Get file upload error message
  private getFileUploadErrorMessage(error: any): string {
    if (error.message?.includes('size')) {
      return 'Файл слишком большой. Максимальный размер: 10MB';
    }
    if (error.message?.includes('type')) {
      return 'Неподдерживаемый тип файла';
    }
    if (error.message?.includes('network')) {
      return 'Ошибка загрузки файла. Проверьте подключение к интернету';
    }
    return 'Ошибка загрузки файла';
  }

  // Send error to external service (Sentry, LogRocket, etc.)
  private sendToErrorService(error: AppError): void {
    // Example implementation for Sentry
    // Sentry.captureException(new Error(error.message), {
    //   tags: {
    //     errorCode: error.code,
    //     context: error.context,
    //   },
    //   extra: {
    //     details: error.details,
    //     url: error.url,
    //     timestamp: error.timestamp,
    //   },
    // });

    // Example implementation for custom error service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(error),
    // }).catch(console.error);
  }

  // Get error queue for debugging
  getErrorQueue(): AppError[] {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byCode: Record<string, number>;
    recent: AppError[];
  } {
    const byCode: Record<string, number> = {};
    this.errorQueue.forEach(error => {
      byCode[error.code || 'UNKNOWN'] = (byCode[error.code || 'UNKNOWN'] || 0) + 1;
    });

    return {
      total: this.errorQueue.length,
      byCode,
      recent: this.errorQueue.slice(-10),
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleApiError = (error: any, context?: string) => 
  errorHandler.handleApiError(error, context);

export const handleNetworkError = (error: any, context?: string) => 
  errorHandler.handleNetworkError(error, context);

export const handleValidationError = (errors: Record<string, string[]>, context?: string) => 
  errorHandler.handleValidationError(errors, context);

export const handleAuthError = (error: any, context?: string) => 
  errorHandler.handleAuthError(error, context);

export const handlePermissionError = (error: any, context?: string) => 
  errorHandler.handlePermissionError(error, context);

export const handleFileUploadError = (error: any, context?: string) => 
  errorHandler.handleFileUploadError(error, context);

export const handleRealtimeError = (error: any, context?: string) => 
  errorHandler.handleRealtimeError(error, context);
