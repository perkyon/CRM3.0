import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Ленивая загрузка компонентов для code splitting
const Dashboard = lazy(() => import('../components/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Clients = lazy(() => import('../components/pages/Clients').then(module => ({ default: module.Clients })));
const Projects = lazy(() => import('../components/pages/Projects').then(module => ({ default: module.Projects })));
const ProjectOverview = lazy(() => import('../components/pages/ProjectOverview').then(module => ({ default: module.ProjectOverview })));
const EnhancedProductionKanban = lazy(() => import('../components/production/EnhancedProductionKanban').then(module => ({ default: module.EnhancedProductionKanban })));
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
  {
    path: '/',
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
        element: <DevelopmentPage title="Роли и права доступа" />
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
