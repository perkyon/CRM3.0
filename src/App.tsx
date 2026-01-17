import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/ui/custom-toaster';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/pages/Dashboard';
import { OwnerDashboard } from './components/pages/OwnerDashboard';
import { Clients } from './components/pages/Clients';
import { Projects } from './components/pages/Projects';
import { KanbanShowcase } from './components/production/SimpleKanbanBoard';
import { ProjectOverview } from './components/pages/ProjectOverview';
import { RolesAndPermissions } from './components/pages/RolesAndPermissions';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectProvider } from './contexts/ProjectContextNew';
import { useAuth } from './contexts/AuthContext';


// Типы для параметров страниц
type PageParams = {
  projectId?: string;
  clientId?: string;
  taskId?: string;
} | null;

export default function App() {
  const { isAuthenticated, loading, login, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<PageParams>(null);
  
  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Показываем страницу входа если не авторизован
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <LoginPage onLogin={login} />
      </ToastProvider>
    );
  }



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
          // Show OwnerDashboard for Admin, regular Dashboard for others
          return user?.role === 'Admin' ? <OwnerDashboard /> : <Dashboard />;
        case 'clients':
          return <Clients />;
        case 'projects':
          return <Projects />;
        case 'project-overview':
          return <ProjectOverview />;
        case 'production':
          return <KanbanShowcase />;
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
          return <RolesAndPermissions />;
        case 'integrations':
          return (
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">Интеграции</h1>
              <div className="text-center py-16 text-muted-foreground">
                <p>Раздел "Интеграции" в разработке</p>
              </div>
            </div>
          );

        default:
          return <Dashboard />;
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
        <AppLayout />
        <div className="lg:ml-64">
          {renderCurrentPage()}
        </div>
      </ProjectProvider>
    </ToastProvider>
  );
}