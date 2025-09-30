import { useCallback } from 'react';
import { errorHandler, AppError } from '../error/ErrorHandler';

export interface UseErrorHandlerReturn {
  handleError: (error: any, context?: string) => AppError;
  handleApiError: (error: any, context?: string) => AppError;
  handleNetworkError: (error: any, context?: string) => AppError;
  handleValidationError: (errors: Record<string, string[]>, context?: string) => AppError;
  handleAuthError: (error: any, context?: string) => AppError;
  handlePermissionError: (error: any, context?: string) => AppError;
  handleFileUploadError: (error: any, context?: string) => AppError;
  handleRealtimeError: (error: any, context?: string) => AppError;
  getErrorStats: () => ReturnType<typeof errorHandler.getErrorStats>;
  clearErrors: () => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const handleError = useCallback((error: any, context?: string) => {
    return errorHandler.handleApiError(error, context);
  }, []);

  const handleApiError = useCallback((error: any, context?: string) => {
    return errorHandler.handleApiError(error, context);
  }, []);

  const handleNetworkError = useCallback((error: any, context?: string) => {
    return errorHandler.handleNetworkError(error, context);
  }, []);

  const handleValidationError = useCallback((errors: Record<string, string[]>, context?: string) => {
    return errorHandler.handleValidationError(errors, context);
  }, []);

  const handleAuthError = useCallback((error: any, context?: string) => {
    return errorHandler.handleAuthError(error, context);
  }, []);

  const handlePermissionError = useCallback((error: any, context?: string) => {
    return errorHandler.handlePermissionError(error, context);
  }, []);

  const handleFileUploadError = useCallback((error: any, context?: string) => {
    return errorHandler.handleFileUploadError(error, context);
  }, []);

  const handleRealtimeError = useCallback((error: any, context?: string) => {
    return errorHandler.handleRealtimeError(error, context);
  }, []);

  const getErrorStats = useCallback(() => {
    return errorHandler.getErrorStats();
  }, []);

  const clearErrors = useCallback(() => {
    errorHandler.clearErrorQueue();
  }, []);

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleAuthError,
    handlePermissionError,
    handleFileUploadError,
    handleRealtimeError,
    getErrorStats,
    clearErrors,
  };
}
