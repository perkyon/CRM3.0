import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedDataOptions<T> {
  fetchFn: () => Promise<T[]>;
  dependencies?: any[];
  enabled?: boolean;
  staleTime?: number; // время в мс, после которого данные считаются устаревшими
  cacheTime?: number; // время в мс, после которого данные удаляются из кэша
  retryCount?: number;
  retryDelay?: number;
}

interface UseOptimizedDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

// Простой кэш для хранения данных
const cache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

export function useOptimizedData<T>({
  fetchFn,
  dependencies = [],
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 минут
  cacheTime = 30 * 60 * 1000, // 30 минут
  retryCount = 3,
  retryDelay = 1000
}: UseOptimizedDataOptions<T>): UseOptimizedDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Создаем ключ кэша на основе зависимостей
  const cacheKey = JSON.stringify(dependencies);

  // Функция для получения данных из кэша
  const getCachedData = useCallback(() => {
    const cached = cache.get(cacheKey);
    if (cached) {
      const now = Date.now();
      // Проверяем, не устарели ли данные
      if (now - cached.timestamp < cached.staleTime) {
        return cached.data;
      }
      // Если данные устарели, но еще в кэше, возвращаем их для мгновенного отображения
      if (now - cached.timestamp < cacheTime) {
        return cached.data;
      }
      // Удаляем устаревшие данные из кэша
      cache.delete(cacheKey);
    }
    return null;
  }, [cacheKey, staleTime, cacheTime]);

  // Функция для сохранения данных в кэш
  const setCachedData = useCallback((newData: T[]) => {
    cache.set(cacheKey, {
      data: newData,
      timestamp: Date.now(),
      staleTime
    });
  }, [cacheKey, staleTime]);

  // Функция для загрузки данных
  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn();
      
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setData(result);
      setCachedData(result);
      retryCountRef.current = 0;
    } catch (err) {
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
      
      if (retryCountRef.current < retryCount && !isRetry) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(errorMessage);
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled, retryCount, retryDelay, setCachedData]);

  // Функция для принудительного обновления
  const refetch = useCallback(async () => {
    cache.delete(cacheKey);
    await fetchData();
  }, [cacheKey, fetchData]);

  // Функция для инвалидации кэша
  const invalidate = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  // Эффект для загрузки данных
  useEffect(() => {
    // Сначала проверяем кэш
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
    }

    // Загружаем данные, если их нет в кэше или они устарели
    fetchData();
  }, [fetchData, getCachedData]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
}

// Хук для оптимизированной загрузки пользователей
export function useOptimizedUsers() {
  const { supabaseUserService } = require('../supabase/services/UserService');
  
  return useOptimizedData({
    fetchFn: () => supabaseUserService.getUsers(),
    staleTime: 10 * 60 * 1000, // 10 минут
    cacheTime: 60 * 60 * 1000, // 1 час
  });
}

// Хук для оптимизированной загрузки клиентов
export function useOptimizedClients() {
  const { supabaseClientService } = require('../supabase/services/ClientService');
  
  return useOptimizedData({
    fetchFn: () => supabaseClientService.getClients(),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 30 * 60 * 1000, // 30 минут
  });
}

// Хук для оптимизированной загрузки проектов
export function useOptimizedProjects() {
  const { supabaseProjectService } = require('../supabase/services/ProjectService');
  
  return useOptimizedData({
    fetchFn: () => supabaseProjectService.getProjects(),
    staleTime: 2 * 60 * 1000, // 2 минуты
    cacheTime: 15 * 60 * 1000, // 15 минут
  });
}

// Хук для оптимизированной загрузки канбан досок
export function useOptimizedKanbanBoards(projectId?: string) {
  const { supabaseKanbanService } = require('../supabase/services/KanbanService');
  
  return useOptimizedData({
    fetchFn: () => projectId 
      ? supabaseKanbanService.getBoardsByProject(projectId)
      : supabaseKanbanService.getBoards(),
    dependencies: [projectId],
    staleTime: 1 * 60 * 1000, // 1 минута
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
}

// Утилита для очистки всего кэша
export function clearAllCache() {
  cache.clear();
}

// Утилита для получения статистики кэша
export function getCacheStats() {
  const now = Date.now();
  let totalEntries = 0;
  let staleEntries = 0;
  let expiredEntries = 0;

  for (const [key, value] of cache.entries()) {
    totalEntries++;
    if (now - value.timestamp > value.staleTime) {
      staleEntries++;
    }
    if (now - value.timestamp > 30 * 60 * 1000) { // 30 минут
      expiredEntries++;
    }
  }

  return {
    totalEntries,
    staleEntries,
    expiredEntries,
    cacheSize: cache.size
  };
}
