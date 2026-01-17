import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Users, 
  Calendar,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  LayoutTemplate,
  Wand2,
  PanelsTopLeft,
  Clock3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { useProjects } from '../../contexts/ProjectContextNew';
import { useClientStore } from '../../lib/stores/clientStore';
import { formatCurrency, formatDate, getDaysUntilDue } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { useAnalytics } from '../../lib/hooks/useAnalytics';
import { supabaseDashboardService, DashboardStats } from '../../lib/supabase/services/DashboardService';
import { toast } from '../../lib/toast';
import { Client, DashboardKPIs, Project } from '../../types';
import { realtimeService } from '../../lib/supabase/realtime';
import { projectStageNames } from '../../lib/constants';
import { useDashboardLayoutStore, DashboardPanelType, DashboardPanelSize } from '../../lib/stores/dashboardLayoutStore';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { clients } = useClientStore();
  const { trackPageView, trackUserAction } = useAnalytics();
  const {
    panels,
    addPanel,
    removePanel,
    toggleVisibility,
    updateSize,
    reorderPanels,
    resetLayout,
  } = useDashboardLayoutStore();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
  const panelLibrary = useMemo(
    () => PANEL_LIBRARY,
    []
  );
  const visiblePanels = panels.filter((panel) => panel.isVisible);
  const availablePanels = Object.entries(panelLibrary).filter(
    ([type]) => !panels.some((panel) => panel.type === (type as DashboardPanelType))
  );

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    reorderPanels(draggingId, targetId);
    setDraggingId(null);
  };

  const handleAddPanel = (type: DashboardPanelType) => {
    addPanel(type);
    setIsBuilderMode(true);
  };

  const handleCycleSize = (panelId: string, size: DashboardPanelSize) => {
    const order: DashboardPanelSize[] = ['sm', 'md', 'lg', 'xl'];
    const next = order[(order.indexOf(size) + 1) % order.length];
    updateSize(panelId, next);
  };

  const handleActivityNavigation = (activity: DashboardStats['recentActivities'][number]) => {
    if (activity.entityType === 'project') {
      navigate(`/app/projects/${activity.entityId}`);
      return;
    }
    navigate(`/app/clients?clientId=${activity.entityId}`);
  };

  const getActivityLabel = (activity: DashboardStats['recentActivities'][number]) => {
    switch (activity.type) {
      case 'project_created':
        return 'Проект';
      case 'project_updated':
        return 'Обновление';
      case 'client_updated':
        return 'Клиент';
      default:
        return 'Клиент';
    }
  };

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
            <LayoutTemplate className="size-4" />
            <span>Лего-дэшборд</span>
          </div>
          <h1 className="text-2xl font-semibold">Панель управления</h1>
          <p className="text-muted-foreground max-w-2xl">
            Собирайте панель как конструктор: карточки можно перетаскивать, скрывать,
            менять размер и добавлять новые блоки. Данные остаются прежними, управление стало гибким.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><PanelsTopLeft className="size-4" /> сетка 12 колонок</span>
            <span className="flex items-center gap-1"><Wand2 className="size-4" /> драфт без бэкенда</span>
            <span className="flex items-center gap-1"><Clock3 className="size-4" /> undo через сброс</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
            trackUserAction('create_project_clicked', { source: 'dashboard_header' });
            navigate('/app/projects');
            }}
          >
            <Plus className="size-4 mr-2" />
            Создать проект
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                <Plus className="size-4 mr-2" />
                Добавить панель
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Панели</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availablePanels.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">Все панели уже на сетке</div>
              )}
              {availablePanels.map(([type, meta]) => (
                <DropdownMenuItem key={type} onClick={() => handleAddPanel(type as DashboardPanelType)}>
                  <div className="space-y-1">
                    <div className="font-medium">{meta.title}</div>
                    <div className="text-xs text-muted-foreground">{meta.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={resetLayout}>
            <RefreshCw className="size-4 mr-2" />
            Сбросить сетку
          </Button>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <span className="text-sm">Конструктор</span>
            <Switch checked={isBuilderMode} onCheckedChange={setIsBuilderMode} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <span className="text-sm">Плотность</span>
            <Select value={density} onValueChange={(v) => setDensity(v as 'comfortable' | 'compact')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Плотность" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="comfortable">Стандарт</SelectItem>
                <SelectItem value="compact">Компактно</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
                onClick={() => navigate('/app/projects')}
              >
                Просмотреть
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div
        className={cn(
          'grid grid-cols-12',
          density === 'compact' ? 'gap-3' : 'gap-6'
        )}
        style={{ gridAutoRows: density === 'compact' ? 'minmax(180px, auto)' : 'minmax(220px, auto)' }}
      >
        {visiblePanels.map((panel) => (
          <div
            key={panel.id}
            draggable={isBuilderMode}
            onDragStart={() => isBuilderMode && handleDragStart(panel.id)}
            onDragOver={(e) => {
              if (!isBuilderMode) return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (!isBuilderMode) return;
              e.preventDefault();
              handleDrop(panel.id);
            }}
            className={cn(
              SIZE_CLASSES[panel.size],
              'relative',
              isBuilderMode ? 'border border-dashed border-primary/40 rounded-xl bg-muted/30' : ''
            )}
          >
            {isBuilderMode && (
              <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between rounded-lg border bg-background/90 px-2 py-1 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GripVertical className="size-4" />
                  <span>{panelLibrary[panel.type].title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleVisibility(panel.id)}
                  >
                    {panel.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleCycleSize(panel.id, panel.size)}
                    title="Сменить ширину"
                  >
                    <PanelsTopLeft className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => removePanel(panel.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className={cn('h-full', isBuilderMode ? 'pt-12' : '')}>
              {renderPanelContent({
                panelType: panel.type,
                kpis,
                overdueProjects,
                activeProjects,
                recentClients,
                dashboardStats,
                onNavigate: navigate,
                onActivityClick: handleActivityNavigation,
                trackUserAction,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PANEL_LIBRARY: Record<
  DashboardPanelType,
  { title: string; description: string }
> = {
  'kpi-orders': { title: 'Проекты в работе', description: 'Все активные заказы и сколько просрочено' },
  'kpi-load': { title: 'Загрузка цеха', description: 'Процент загрузки производства' },
  'kpi-revenue': { title: 'Выручка за месяц', description: 'Текущая выручка за отчетный месяц' },
  'kpi-materials': { title: 'Дефицит материалов', description: 'Недостающие позиции и быстрый переход в склад' },
  'active-projects': { title: 'Активные проекты', description: 'Топ-5 проектов со сроками и статусом' },
  'recent-activity': { title: 'Недавняя активность', description: 'История изменений по проектам и клиентам' },
  deadlines: { title: 'Крайние сроки', description: 'Дела с ближайшими сроками и рисками' },
  clients: { title: 'Клиенты', description: 'Свежие клиенты и их статусы' },
};

const SIZE_CLASSES: Record<DashboardPanelSize, string> = {
  sm: 'col-span-12 md:col-span-6 xl:col-span-3',
  md: 'col-span-12 md:col-span-6 xl:col-span-4',
  lg: 'col-span-12 xl:col-span-8',
  xl: 'col-span-12',
};

function renderPanelContent(params: {
  panelType: DashboardPanelType;
  kpis: DashboardKPIs;
  overdueProjects: DashboardStats['upcomingDeadlines'];
  activeProjects: Project[];
  recentClients: Client[];
  dashboardStats: DashboardStats;
  onNavigate: (path: string) => void;
  onActivityClick: (activity: DashboardStats['recentActivities'][number]) => void;
  trackUserAction: (action: string, properties?: Record<string, any>) => void;
}) {
  const {
    panelType,
    kpis,
    overdueProjects,
    activeProjects,
    recentClients,
    dashboardStats,
    onNavigate,
    onActivityClick,
    trackUserAction,
  } = params;

  switch (panelType) {
    case 'kpi-orders':
      return (
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
      );
    case 'kpi-load':
      return (
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
      );
    case 'kpi-revenue':
      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка за месяц</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.monthlyRevenue)}</div>
          </CardContent>
        </Card>
      );
    case 'kpi-materials':
      return (
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
                onNavigate('/app/inventory');
              }}
            >
              Открыть дефицит
            </Button>
          </CardContent>
        </Card>
      );
    case 'active-projects':
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Активные проекты
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('/app/projects')}
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
                  <div key={project.id} className="flex items-center justify-between rounded-lg border bg-card/70 p-3 transition-colors hover:bg-card">
                    <div className="flex-1">
	                      <div className="flex items-center gap-2">
	                        <h4 className="font-medium">{project.title}</h4>
	                        <StatusBadge status={project.stage}>
	                          {projectStageNames[project.stage] || project.stage}
	                        </StatusBadge>
	                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.id} • {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'text-sm',
                        daysLeft < 0 ? 'text-destructive' : daysLeft < 3 ? 'text-orange-600' : 'text-muted-foreground'
                      )}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} дн. просрочка` : `${daysLeft} дн.`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    case 'recent-activity':
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Недавняя активность
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('/app/clients')}
              >
                Все клиенты
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.recentActivities.slice(0, 5).map((activity) => {
                const isProjectActivity = activity.entityType === 'project';
                const stageLabel = activity.stage ? (projectStageNames[activity.stage] || activity.stage) : null;

                return (
                  <button
                    key={activity.id}
                    type="button"
                    className="w-full flex items-center justify-between gap-4 rounded-lg border bg-card/70 p-3 text-left transition-colors hover:bg-card"
                    onClick={() => onActivityClick(activity)}
                  >
                    <div className="flex items-start gap-3">
                    <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {isProjectActivity ? (
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
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                          {isProjectActivity && stageLabel && (
                            <p>Этап: {stageLabel}</p>
                          )}
                          {isProjectActivity && activity.managerName && (
                            <p>Менеджер: {activity.managerName}</p>
                          )}
                          {!isProjectActivity && activity.clientStatus && (
                            <p>Статус: {activity.clientStatus}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivityClick(activity);
                      }}
                    >
                      {getActivityLabel(activity)}
                    </Button>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    case 'deadlines':
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Крайние сроки
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('/app/projects')}
              >
                Доска
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardStats.upcomingDeadlines.slice(0, 5).map((deadline) => (
              <div key={deadline.projectId} className="rounded-lg border bg-card/70 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{deadline.projectTitle}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-4" /> {formatDate(deadline.dueDate)}
                    </p>
                  </div>
                  <div className={cn(
                    'text-sm font-medium',
                    deadline.daysLeft < 0 ? 'text-destructive' : deadline.daysLeft < 3 ? 'text-orange-600' : 'text-muted-foreground'
                  )}>
                    {deadline.daysLeft < 0 ? `${Math.abs(deadline.daysLeft)} дн. просрочено` : `${deadline.daysLeft} дн.`}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    case 'clients':
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Новые клиенты
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('/app/clients')}
              >
                Все клиенты
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClients.slice(0, 5).map((client) => (
              <div key={client.id} className="rounded-lg border bg-card/70 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                  <StatusBadge status={client.status || 'active'}>
                    {client.status || 'active'}
                  </StatusBadge>
      </div>
    </div>
            ))}
          </CardContent>
        </Card>
  );
    default:
      return null;
  }
}
