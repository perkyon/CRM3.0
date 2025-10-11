import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../components/auth/LoginPage';

// Создаем роутер
const router = createBrowserRouter(routes);

// Компонент загрузки
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="text-muted-foreground">Загрузка...</span>
    </div>
  </div>
);

// Основной компонент роутера
export function AppRouter() {
  const { isAuthenticated, loading, login } = useAuth();
  
  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return <LoadingFallback />;
  }
  
  // Показываем страницу входа если не авторизован
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
