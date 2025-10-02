import React, { useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { mockDashboardKPIs, mockClients } from '../../lib/mockData';
import { useProjects } from '../../contexts/ProjectContext';
import { formatCurrency, formatDate, getDaysUntilDue } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { useAnalytics, CRM_EVENTS } from '../../lib/hooks/useAnalytics';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { trackPageView, trackUserAction } = useAnalytics();
  const kpis = mockDashboardKPIs;
  const activeProjects = projects.filter(p => p.stage !== 'done');
  const overdueProjects = activeProjects.filter(p => getDaysUntilDue(p.dueDate) < 0);
  const recentClients = mockClients.slice(0, 3);

  // Отслеживание просмотра страницы
  useEffect(() => {
    trackPageView('dashboard', {
      activeProjects: activeProjects.length,
      overdueProjects: overdueProjects.length,
      totalClients: mockClients.length,
    });
  }, [trackPageView, activeProjects.length, overdueProjects.length]);

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
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(client.lastActivity)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={client.status}>
                    {client.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}