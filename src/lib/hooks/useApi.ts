import { useState, useCallback } from 'react';
import { handleApiError } from '../api/client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  updateFunction: (data: T) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const execute = useCallback(async (data: T, optimisticData?: T) => {
    setIsUpdating(true);
    
    try {
      const result = await updateFunction(data);
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFunction, onSuccess, onError]);

  return {
    execute,
    isUpdating,
  };
}

// Hook for pagination
export function usePagination<T>(
  fetchFunction: (params: any) => Promise<{ data: T[]; pagination: any }>,
  initialParams: any = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (params: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction({ ...initialParams, ...params });
      setData(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialParams]);

  const loadMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPages) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction({
        ...initialParams,
        page: pagination.page + 1,
      });
      setData(prev => [...prev, ...result.data]);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialParams, pagination.page, pagination.totalPages]);

  const refresh = useCallback(() => {
    fetch({ page: 1 });
  }, [fetch]);

  return {
    data,
    pagination,
    loading,
    error,
    fetch,
    loadMore,
    refresh,
  };
}
