import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

// Компонент загрузки
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="text-muted-foreground">Загрузка...</span>
    </div>
  </div>
);

// Создаем роутер
const router = createBrowserRouter(routes);

// Основной компонент роутера
export function AppRouter() {
  React.useEffect(() => {
    // Логируем загрузку роутера
    if (import.meta.env.DEV) {
      console.log('AppRouter mounted');
  }
  }, []);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      />
    </Suspense>
  );
}
