import React, { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Компонент для ошибки загрузки модуля
const ModuleErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className="text-center space-y-4 max-w-md">
      <h1 className="text-2xl font-medium text-destructive">Ошибка загрузки</h1>
      <p className="text-muted-foreground">
        Не удалось загрузить компонент. Это может быть проблема с кешем.
      </p>
      <p className="text-sm text-muted-foreground">
        {error.message}
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Попробовать снова
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
        >
          Обновить страницу
        </button>
      </div>
    </div>
  </div>
);

// Обертка для lazy с обработкой ошибок
const lazyWithErrorHandling = (importFn: () => Promise<any>) => {
  return lazy(() =>
    importFn().catch((error) => {
      console.error('Error loading module:', error);
      // Возвращаем компонент с ошибкой
      return {
        default: () => (
          <ModuleErrorFallback
            error={error}
            retry={() => window.location.reload()}
          />
        ),
      };
    })
  );
};

// Ленивая загрузка компонентов для code splitting
const Dashboard = lazyWithErrorHandling(() => import('../components/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Clients = lazyWithErrorHandling(() => import('../components/pages/Clients').then(module => ({ default: module.Clients })));
const Projects = lazyWithErrorHandling(() => import('../components/pages/Projects').then(module => ({ default: module.Projects })));
const ProjectOverview = lazyWithErrorHandling(() => import('../components/pages/ProjectOverview').then(module => ({ default: module.ProjectOverview })));
const ProductionManager = lazyWithErrorHandling(() => import('../components/pages/ProductionManager').then(module => ({ default: module.ProductionManager })));
const EnhancedProductionKanban = lazyWithErrorHandling(() => import('../components/production/EnhancedProductionKanban').then(module => ({ default: module.EnhancedProductionKanban })));
const RolesAndPermissions = lazyWithErrorHandling(() => import('../components/pages/RolesAndPermissions').then(module => ({ default: module.RolesAndPermissions })));
const Pricing = lazyWithErrorHandling(() => import('../components/pages/Pricing').then(module => ({ default: module.Pricing })));
const Onboarding = lazyWithErrorHandling(() => import('../components/pages/Onboarding').then(module => ({ default: module.Onboarding })));
const PaymentSuccess = lazyWithErrorHandling(() => import('../components/pages/PaymentSuccess').then(module => ({ default: module.PaymentSuccess })));
const Landing = lazyWithErrorHandling(() => import('../components/pages/Landing').then(module => ({ default: module.Landing })));
const Login = lazyWithErrorHandling(() => import('../components/pages/Login').then(module => ({ default: module.Login })));
const OrgLogin = lazyWithErrorHandling(() => import('../components/pages/OrgLogin').then(module => ({ default: module.OrgLogin })));
// const WorkflowDemo = lazy(() => import('../components/demo/WorkflowDemo').then(module => ({ default: module.WorkflowDemo })));

// Компонент для страниц в разработке
const DevelopmentPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-medium mb-4">{title}</h1>
    <div className="text-center py-16 text-muted-foreground">
      <p>Раздел "{title}" в разработке</p>
    </div>
  </div>
);

// Определение роутов
export const routes: RouteObject[] = [
  // Редирект старых URL на новые
  {
    path: '/projects/:projectId',
    element: <Navigate to={(location) => `/app${location.pathname}`} replace />
  },
  // Публичные страницы (без AppLayout)
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/pricing',
    element: <Pricing />
  },
  {
    path: '/onboarding',
    element: <Onboarding />
  },
  {
    path: '/payment/success',
    element: <PaymentSuccess />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/org/:slug/login',
    element: <OrgLogin />
  },
  // Защищенные страницы (с AppLayout)
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'clients',
        element: <Clients />
      },
      {
        path: 'projects',
        element: <Projects />
      },
      {
        path: 'projects/:projectId',
        element: <ProjectOverview />
      },
      {
        path: 'production',
        element: <EnhancedProductionKanban />
      },
      {
        path: 'production/:projectId',
        element: <ProductionManager />
      },
      {
        path: 'production/:projectId/kanban',
        element: <EnhancedProductionKanban />
      },
      {
        path: 'inventory',
        element: <DevelopmentPage title="Склад" />
      },
      {
        path: 'finance',
        element: <DevelopmentPage title="Финансы" />
      },
      {
        path: 'settings',
        element: <DevelopmentPage title="Настройки" />
      },
      {
        path: 'roles',
        element: <RolesAndPermissions />
      },
      {
        path: 'integrations',
        element: <DevelopmentPage title="Интеграции" />
      },
      {
        path: '*',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-medium mb-4 text-destructive">Страница не найдена</h1>
            <div className="text-center py-16 text-muted-foreground">
              <p>Запрашиваемая страница не существует</p>
            </div>
          </div>
        )
      }
    ]
  }
];
