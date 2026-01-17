import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertTriangle,
  Users,
  Package,
  DollarSign,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  PanelsTopLeft,
  LayoutTemplate,
  Wand2,
  Clock3,
  RefreshCw,
  Plus
} from 'lucide-react';
import { cn } from '../ui/utils';
import { supabaseDashboardService } from '../../lib/supabase/services/DashboardService';
import { toast } from '../../lib/toast';
import { formatCurrency } from '../../lib/utils';
import { useOwnerDashboardLayoutStore, OwnerPanelType, OwnerPanelSize } from '../../lib/stores/ownerDashboardLayoutStore';

export function OwnerDashboard() {
  const navigate = useNavigate();
  const {
    panels,
    addPanel,
    removePanel,
    toggleVisibility,
    updateSize,
    reorderPanels,
    resetLayout,
  } = useOwnerDashboardLayoutStore();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await supabaseDashboardService.getOwnerDashboardData();
      setData(dashboardData);
    } catch (error: any) {
      toast.error(`Ошибка загрузки данных: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 90) return 'text-red-600';
    if (load >= 70) return 'text-orange-600';
    if (load >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const panelLibrary = useMemo(() => OWNER_PANEL_LIBRARY, []);
  const visiblePanels = panels.filter((panel) => panel.isVisible);
  const availablePanels = Object.entries(panelLibrary).filter(
    ([type]) => !panels.some((panel) => panel.type === (type as OwnerPanelType))
  );

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    reorderPanels(draggingId, targetId);
    setDraggingId(null);
  };

  const handleAddPanel = (type: OwnerPanelType) => {
    addPanel(type);
    setIsBuilderMode(true);
  };

  const handleCycleSize = (panelId: string, size: OwnerPanelSize) => {
    const order: OwnerPanelSize[] = ['sm', 'md', 'lg', 'xl'];
    const next = order[(order.indexOf(size) + 1) % order.length];
    updateSize(panelId, next);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Нет данных</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
            <LayoutTemplate className="size-4" />
            <span>Лего-дэшборд</span>
          </div>
          <h1 className="text-2xl font-semibold">Дашборд владельца</h1>
          <p className="text-muted-foreground">Быстрый контроль проблем, денег и загрузки команды</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><PanelsTopLeft className="size-4" /> сетка 12 колонок</span>
            <span className="flex items-center gap-1"><Wand2 className="size-4" /> драфт без бэкенда</span>
            <span className="flex items-center gap-1"><Clock3 className="size-4" /> drag / hide / resize</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} size="sm">
            Обновить
          </Button>
          <Button variant="secondary" onClick={() => navigate('/app/projects')} size="sm">
            Проекты
          </Button>
          <Button onClick={() => navigate('/app/finance')} size="sm">
            Финансы
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
                <DropdownMenuItem key={type} onClick={() => handleAddPanel(type as OwnerPanelType)}>
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

      <div
        className={cn(
          'grid grid-cols-12',
          density === 'compact' ? 'gap-3' : 'gap-6'
        )}
        style={{ gridAutoRows: density === 'compact' ? 'minmax(200px, auto)' : 'minmax(220px, auto)' }}
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
              OWNER_SIZE_CLASSES[panel.size],
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
              {renderOwnerPanel({
                panelType: panel.type,
                data,
                getLoadColor,
                navigate,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const OWNER_PANEL_LIBRARY: Record<
  OwnerPanelType,
  { title: string; description: string }
> = {
  'owner-kpi': { title: 'Главные показатели', description: 'Проекты, горящие, загрузка, просрочки, поступления' },
  'owner-problem-projects': { title: 'Проблемные проекты', description: 'Счётчик и быстрый переход' },
  'owner-payment-risk': { title: 'Оплаты под риском', description: 'Просроченные оплаты по клиентам' },
  'owner-team': { title: 'Команда', description: 'Таблица загрузки команды' },
  'owner-problem-cards': { title: 'Риски по проектам', description: 'Карточки проблемных проектов' },
  'owner-finance': { title: 'Финансы', description: 'Поступления, ожидаемые платежи, проблемы' },
};

const OWNER_SIZE_CLASSES: Record<OwnerPanelSize, string> = {
  sm: 'col-span-12 md:col-span-6 xl:col-span-3',
  md: 'col-span-12 md:col-span-6 xl:col-span-4',
  lg: 'col-span-12 md:col-span-12 xl:col-span-6',
  xl: 'col-span-12',
};

function renderOwnerPanel(params: {
  panelType: OwnerPanelType;
  data: any;
  getLoadColor: (load: number) => string;
  navigate: (path: string) => void;
}) {
  const { panelType, data, getLoadColor, navigate } = params;

  switch (panelType) {
    case 'owner-kpi':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 h-full">
          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Проекты в работе</CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pulse.projectsInWork}</div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Горящие</CardTitle>
              <AlertTriangle className="size-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{data.pulse.urgentProjects}</div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Загрузка команды</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getLoadColor(data.pulse.teamLoadPercent)}`}>
                {data.pulse.teamLoadPercent}%
              </div>
              <Progress value={data.pulse.teamLoadPercent} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Просрочки</CardTitle>
              <AlertTriangle className="size-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{data.pulse.overdueCount}</div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Факт поступления</CardTitle>
              <DollarSign className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.financial.receivedThisMonth)}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    case 'owner-problem-projects':
      return (
        <Card
          className="hover:border-primary/70 transition-colors cursor-pointer border bg-card shadow-sm h-full"
          onClick={() => navigate('/app/projects')}
        >
          <CardHeader>
            <CardTitle className="text-base">Проблемные проекты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{data.problemProjects.length}</div>
            {data.problemProjects[0] && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {data.problemProjects[0].title} — {data.problemProjects[0].risk}
              </p>
            )}
          </CardContent>
        </Card>
      );
    case 'owner-payment-risk':
      return (
        <Card
          className="hover:border-primary/70 transition-colors cursor-pointer border bg-card shadow-sm h-full"
          onClick={() => navigate('/app/finance')}
        >
          <CardHeader>
            <CardTitle className="text-base">Оплаты под риском</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-orange-600">{data.financial.paymentProblems}</div>
            {data.financial.paymentProblemsList[0] && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {data.financial.paymentProblemsList[0].clientName}: просрочка {data.financial.paymentProblemsList[0].daysOverdue} дн.
              </p>
            )}
          </CardContent>
        </Card>
      );
    case 'owner-team':
      return (
        <Accordion type="multiple" className="space-y-3 h-full" defaultValue={['team']}>
          <AccordionItem value="team" className="border rounded-xl px-3 bg-card shadow-sm">
            <AccordionTrigger className="text-left text-base font-medium">Команда</AccordionTrigger>
            <AccordionContent>
              <div className="pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Чем занят</TableHead>
                      <TableHead>Загрузка</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.teamLoad.users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-normal max-w-[520px]">
                          {user.currentTask}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getLoadColor(user.loadPercent)}`}>
                              {user.loadPercent}%
                            </span>
                            <Progress value={user.loadPercent} className="w-20" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-normal max-w-[360px]">
                          {user.comment || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    case 'owner-problem-cards':
      return (
        <Accordion type="multiple" className="space-y-3 h-full" defaultValue={['projects']}>
          <AccordionItem value="projects" className="border rounded-xl px-3 bg-card shadow-sm">
            <AccordionTrigger className="text-left text-base font-medium">Проблемные проекты</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 pt-2">
                {data.problemProjects.map((project: any, index: number) => (
                  <Card
                    key={project.id}
                    className={
                      index === 0
                        ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-500/5'
                        : 'border'
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-base">
                        {project.code ? `${project.code}: ` : ''}{project.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Риск: </span>
                        <span className="text-sm font-medium">{project.risk}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Готовность: </span>
                        <span className="text-sm font-medium">{project.readinessPercent}%</span>
                        <Progress value={project.readinessPercent} className="mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Срок: </span>
                        <span className={`text-sm font-medium ${project.daysLeft < 0 ? 'text-red-600' : ''}`}>
                          {project.daysLeft < 0
                            ? `${Math.abs(project.daysLeft)} дн. просрочка`
                            : `${project.daysLeft} дн.`
                          }
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => navigate(`/app/projects/${project.id}`)}
                      >
                        Открыть проект
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    case 'owner-finance':
      return (
        <Accordion type="multiple" className="space-y-3 h-full" defaultValue={['finance']}>
          <AccordionItem value="finance" className="border rounded-xl px-3 bg-card shadow-sm">
            <AccordionTrigger className="text-left text-base font-medium">Финансы</AccordionTrigger>
            <AccordionContent>
              <Card className="mt-2 border shadow-sm">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Поступило за месяц</div>
                      <div className="text-2xl font-bold">{formatCurrency(data.financial.receivedThisMonth)}</div>
                    </div>
                    <DollarSign className="size-8 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Ожидаем в течение 7 дней</div>
                      <div className="text-xl font-semibold">{formatCurrency(data.financial.expectedIn7Days)}</div>
                    </div>
                  </div>

                  {data.financial.paymentProblems > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <AlertTriangle className="size-4" />
                        <span className="font-medium">
                          Проблемы с оплатами: {data.financial.paymentProblems} клиент(ов)
                        </span>
                      </div>
                      <div className="space-y-1">
                        {data.financial.paymentProblemsList.map((problem: any, idx: number) => (
                          <div key={idx} className="text-sm text-muted-foreground">
                            {problem.clientName}: просрочка {problem.daysOverdue} дн.
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    default:
      return null;
  }
}
