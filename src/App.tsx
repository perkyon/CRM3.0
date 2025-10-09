import React, { useState } from 'react';
import { ToastProvider } from './components/ui/custom-toaster';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/pages/Dashboard';
import { Clients } from './components/pages/Clients';
import { Projects } from './components/pages/Projects';
import { EnhancedProductionKanban } from './components/production/EnhancedProductionKanban';
import { ProjectOverview } from './components/pages/ProjectOverview';
import { ProjectProvider } from './contexts/ProjectContext';
import './lib/supabase/debug-kanban';


// Типы для параметров страниц
type PageParams = {
  projectId?: string;
  clientId?: string;
  taskId?: string;
} | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<PageParams>(null);



  const handleNavigate = (page: string, params?: PageParams) => {
    try {
      setCurrentPage(page);
      setPageParams(params || null);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderCurrentPage = () => {
    try {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard onNavigate={handleNavigate} />;
        case 'clients':
          return <Clients onNavigate={handleNavigate} />;
        case 'projects':
          return <Projects onNavigate={handleNavigate} />;
        case 'project-overview':
          return <ProjectOverview projectId={pageParams?.projectId || ''} onNavigate={handleNavigate} />;
        case 'production':
          return <EnhancedProductionKanban projectId={pageParams?.projectId} onNavigate={handleNavigate} />;
        case 'inventory':
          return (
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">Склад</h1>
              <div className="text-center py-16 text-muted-foreground">
                <p>Раздел "Склад" в разработке</p>
              </div>
            </div>
          );
        case 'finance':
          return (
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">Финансы</h1>
              <div className="text-center py-16 text-muted-foreground">
                <p>Раздел "Финансы" в разработке</p>
              </div>
            </div>
          );
        case 'settings':
          return (
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">Настройки</h1>
              <div className="text-center py-16 text-muted-foreground">
                <p>Раздел "Настройки" в разработке</p>
              </div>
            </div>
          );
        case 'roles':
          return (
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">Роли и права доступа</h1>
              <div className="text-center py-16 text-muted-foreground">
                <p>Раздел "Роли" в разработке</p>
              </div>
            </div>
          );
        case 'integrations':
          return (
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">Интеграции</h1>
              <div className="text-center py-16 text-muted-foreground">
                <p>Раздел "Интеграции" в разработке</p>
              </div>
            </div>
          );
        case 'workflow-demo':
          return <WorkflowDemo />;

        default:
          return <Dashboard onNavigate={handleNavigate} />;
      }
    } catch (error) {
      console.error('Render error:', error);
      return (
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-4 text-destructive">Ошибка</h1>
          <div className="text-center py-16 text-muted-foreground">
            <p>Произошла ошибка при загрузке страницы</p>
          </div>
        </div>
      );
    }
  };

  return (
    <ToastProvider>
      <ProjectProvider>
        <div className="min-h-screen bg-background">
          <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
            {renderCurrentPage()}
          </AppLayout>
        </div>
      </ProjectProvider>
    </ToastProvider>
  );
}