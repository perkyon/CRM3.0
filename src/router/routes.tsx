import React, { lazy } from 'react';
import { RouteObject, Navigate, useParams } from 'react-router-dom';
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
const DashboardWrapper = lazyWithErrorHandling(() => import('../components/pages/DashboardWrapper').then(module => ({ default: module.DashboardWrapper })));
const Clients = lazyWithErrorHandling(() => import('../components/pages/Clients').then(module => ({ default: module.Clients })));
const Communications = lazyWithErrorHandling(() => import('../components/pages/Communications').then(module => ({ default: module.Communications })));
const TelegramDirect = lazyWithErrorHandling(() => import('../components/pages/TelegramDirect').then(module => ({ default: module.TelegramDirect })));
const TelegramComparison = lazyWithErrorHandling(() => import('../components/pages/TelegramComparison').then(module => ({ default: module.TelegramComparison })));
const Projects = lazyWithErrorHandling(() => import('../components/pages/Projects').then(module => ({ default: module.Projects })));
const ProjectOverview = lazyWithErrorHandling(() => import('../components/pages/ProjectOverview').then(module => ({ default: module.ProjectOverview })));
const ProductionManager = lazyWithErrorHandling(() => import('../components/pages/ProductionManager').then(module => ({ default: module.ProductionManager })));
const KanbanShowcase = lazyWithErrorHandling(() => import('../components/production/SimpleKanbanBoard').then(module => ({ default: module.KanbanShowcase })));
const RolesAndPermissions = lazyWithErrorHandling(() => import('../components/pages/RolesAndPermissions').then(module => ({ default: module.RolesAndPermissions })));
const Settings = lazyWithErrorHandling(() => import('../components/pages/Settings').then(module => ({ default: module.Settings })));
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

// Компонент для редиректа старых URL проектов
const ProjectRedirect = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return <Navigate to={`/app/projects/${projectId}`} replace />;
};

// Компонент для редиректа старых URL production
const ProductionRedirect = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return <Navigate to={`/app/production/${projectId}`} replace />;
};

// Определение роутов
export const routes: RouteObject[] = [
  // Редирект старых URL на новые
  {
    path: '/projects/:projectId',
    element: <ProjectRedirect />
  },
  {
    path: '/production/:projectId',
    element: <ProductionRedirect />
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
        element: <DashboardWrapper />
      },
      {
        path: 'dashboard',
        element: <DashboardWrapper />
      },
      {
        path: 'clients',
        element: <Clients />
      },
      {
        path: 'communications',
        element: <Communications />
      },
      {
        path: 'telegram-direct',
        element: <TelegramDirect />
      },
      {
        path: 'telegram-comparison',
        element: <TelegramComparison />
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
        element: <KanbanShowcase />
      },
      {
        path: 'production/:projectId',
        element: <ProductionManager />
      },
      {
        path: 'production/:projectId/kanban',
        element: <KanbanShowcase />
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
        element: <Settings />
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
