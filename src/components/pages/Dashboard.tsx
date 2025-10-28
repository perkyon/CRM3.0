import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  Users, 
  Calendar,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContextNew';
import { useClientStore } from '../../lib/stores/clientStore';
import { formatCurrency, formatDate, getDaysUntilDue } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { useAnalytics, CRM_EVENTS } from '../../lib/hooks/useAnalytics';
import { supabaseDashboardService, DashboardStats } from '../../lib/supabase/services/DashboardService';
import { toast } from '../../lib/toast';
import { DashboardKPIs } from '../../types';
import { realtimeService } from '../../lib/supabase/realtime';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { clients } = useClientStore();
  const { trackPageView, trackUserAction } = useAnalytics();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Подключаемся к realtime обновлениям для активности
  useEffect(() => {
    let unsubscribeProjects: any = null;
    let unsubscribeClients: any = null;
    
    const setupRealtime = async () => {
      try {
        const { realtimeService } = await import('../../lib/supabase/realtime');
        
        // Подписываемся на изменения проектов и клиентов для обновления активности
        unsubscribeProjects = realtimeService.subscribeToProjects(
          () => loadDashboardData(), // Перезагружаем данные при изменении проектов
          () => loadDashboardData(),
          () => loadDashboardData()
        );
        
        unsubscribeClients = realtimeService.subscribeToClients(
          () => loadDashboardData(), // Перезагружаем данные при изменении клиентов
          () => loadDashboardData(),
          () => loadDashboardData()
        );
      } catch (error) {
        console.error('Error setting up realtime subscriptions:', error);
      }
    };

    setupRealtime();

    return () => {
      try {
        if (unsubscribeProjects) {
          realtimeService.unsubscribe('projects');
        }
        if (unsubscribeClients) {
          realtimeService.unsubscribe('clients');
        }
      } catch (error) {
        console.error('Error cleaning up realtime subscriptions:', error);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [stats, kpiData] = await Promise.all([
        supabaseDashboardService.getDashboardStats(),
        supabaseDashboardService.getKPIs()
      ]);
      
      setDashboardStats(stats);
      setKpis(kpiData);
    } catch (error: any) {
      setError(error.message);
      toast.error(`Ошибка загрузки данных: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeProjects = projects.filter(p => p.stage !== 'done');
  const overdueProjects = dashboardStats?.upcomingDeadlines.filter(d => d.daysLeft < 0) || [];
  const recentClients = clients.slice(0, 3);

  // Отслеживание просмотра страницы
  useEffect(() => {
    if (kpis) {
      trackPageView('dashboard', {
        activeProjects: kpis.ordersInProgress,
        overdueProjects: overdueProjects.length,
        totalClients: clients.length,
      });
    }
  }, [trackPageView, kpis, overdueProjects.length]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Загрузка данных панели управления...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-medium">Ошибка загрузки данных</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
            >
              Повторить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!kpis || !dashboardStats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Нет данных</h3>
          <p className="text-muted-foreground mb-4">Данные панели управления недоступны</p>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Загрузить данные
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium">Панель управления</h1>
          <p className="text-muted-foreground">Обзор деятельности мастерской</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            trackUserAction('create_project_clicked', { source: 'dashboard_header' });
            navigate('/projects');
          }}>
            <Plus className="size-4 mr-2" />
            Создать проект
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Проекты в работе</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.ordersInProgress}</div>
            <p className="text-xs text-muted-foreground">
              {overdueProjects.length > 0 && (
                <span className="text-destructive">
                  {overdueProjects.length} просрочено
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Загрузка цеха</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.shopLoadPercent}%</div>
            <Progress value={kpis.shopLoadPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка за месяц</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.monthlyRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Дефицит материалов</CardTitle>
            <AlertTriangle className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis.materialDeficit}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                trackUserAction('inventory_clicked', { source: 'dashboard_kpi' });
                navigate('/inventory');
              }}
            >
              Открыть дефицит
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueProjects.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive">
                  Просроченные проекты ({overdueProjects.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Требуется внимание к срокам выполнения
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/projects')}
              >
                Просмотреть
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Активные проекты
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/projects')}
              >
                Все проекты
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.slice(0, 5).map((project) => {
                const daysLeft = getDaysUntilDue(project.dueDate);
                return (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{project.title}</h4>
                        <StatusBadge status={project.stage}>
                          {project.stage}
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.id} • {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${daysLeft < 0 ? 'text-destructive' : daysLeft < 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} дн. просрочка` : `${daysLeft} дн.`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Недавняя активность
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/clients')}
              >
                Все клиенты
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {activity.type === 'project_created' || activity.type === 'project_updated' ? (
                        <Package className="size-5 text-primary" />
                      ) : (
                        <Users className="size-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{activity.description}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type === 'project_created' ? 'Проект' : 
                     activity.type === 'project_updated' ? 'Обновление' : 
                     'Клиент'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}