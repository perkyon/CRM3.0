import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { DatePicker } from '../ui/date-picker';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from '../../lib/toast';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,

  Loader2
} from 'lucide-react';
import { projectStageNames, stageOrder } from '../../lib/constants';
import { useUsers } from '../../lib/hooks/useUsers';
import { calculatePriorityFromDueDate, formatCurrency, formatDate, getDaysUntilDue } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { useAnalytics, CRM_EVENTS } from '../../lib/hooks/useAnalytics';
import { Project, ProjectStage } from '../../types';
import { useProjects } from '../../contexts/ProjectContextNew';
import { useClientStore } from '../../lib/stores/clientStore';
import { useCurrentOrganization } from '../../lib/hooks/useCurrentOrganization';
import { EmptyProjectsState, ErrorState, LoadingState } from '../ui/empty-state';

export function Projects() {
  const navigate = useNavigate();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const { clients, fetchClients } = useClientStore();
  const { trackUserAction } = useAnalytics();
  const { users, getUsersByRole, loading: usersLoading } = useUsers();
  const { currentOrganization } = useCurrentOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Состояния для форм и диалогов
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для фильтров
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  
  // Форма создания проекта
  const [newProject, setNewProject] = useState({
    title: '',
    clientId: '',
    siteAddress: '',
    managerId: '',
    foremanId: '',
    startDate: '',
    dueDate: '',
    budget: '',
    priority: 'medium' as Project['priority']
  });

  // Загрузка клиентов при монтировании
  useEffect(() => {
    if (fetchClients) {
    console.log('🔄 Loading clients...');
    fetchClients().then(() => {
      console.log('✅ Clients loaded:', clients.length);
    }).catch((err) => {
      console.error('❌ Failed to load clients:', err);
    });
    }
  }, [fetchClients, clients.length]);

  // Получение прогресса по стадиям
  const getStageProgress = (stage: ProjectStage): number => {
    const stageIndex = stageOrder.indexOf(stage);
    return ((stageIndex + 1) / stageOrder.length) * 100;
  };

  // Функции для работы с проектами
  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.clientId || !newProject.managerId) {
      toast('Заполните обязательные поля', { type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));

      const autoPriority = calculatePriorityFromDueDate(newProject.dueDate || null);

      const project: Omit<Project, 'id'> = {
        clientId: newProject.clientId,
        title: newProject.title,
        siteAddress: newProject.siteAddress,
        managerId: newProject.managerId,
        foremanId: newProject.foremanId || newProject.managerId,
        startDate: newProject.startDate || new Date().toISOString().split('T')[0],
        dueDate: newProject.dueDate,
        budget: parseFloat(newProject.budget) || 0,
        priority: autoPriority,
        stage: 'brief',
        briefComplete: false,
        createdAt: new Date().toISOString()
      };

      if (!currentOrganization?.id) {
        toast('Ошибка: организация не найдена', { type: 'error' });
        return;
      }

      await createProject({
        title: newProject.title,
        clientId: newProject.clientId,
        siteAddress: newProject.siteAddress,
        managerId: newProject.managerId,
        foremanId: newProject.foremanId || undefined,
        startDate: newProject.startDate || undefined,
        dueDate: newProject.dueDate || undefined,
        budget: parseFloat(newProject.budget) || 0,
        priority: autoPriority,
        stage: 'brief' as Project['stage'],
        briefComplete: false,
        organizationId: currentOrganization.id, // Добавляем organizationId
      });
      
      toast('Проект успешно создан', { type: 'success' });
      setIsCreateDialogOpen(false);
      setNewProject({
        title: '',
        clientId: '',
        siteAddress: '',
        managerId: '',
        foremanId: '',
        startDate: '',
        dueDate: '',
        budget: '',
        priority: 'medium'
      });
    } catch (error: any) {
      console.error('❌ Ошибка создания проекта:', error);
      const errorMessage = error?.message || error?.toString() || 'Неизвестная ошибка';
      toast(`Ошибка при создании проекта: ${errorMessage}`, { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Функция редактирования проекта
  const handleEditProject = async () => {
    console.log('📝 Starting project update...');
    console.log('Selected project:', selectedProject);
    console.log('New project data:', newProject);
    
    if (!selectedProject || !newProject.title || !newProject.clientId || !newProject.managerId) {
      console.error('❌ Missing required fields:', {
        hasSelectedProject: !!selectedProject,
        hasTitle: !!newProject.title,
        hasClientId: !!newProject.clientId,
        hasManagerId: !!newProject.managerId
      });
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsLoading(true);
    try {
      const autoPriority = calculatePriorityFromDueDate(newProject.dueDate || null);

      const updateData = {
        clientId: newProject.clientId,
        title: newProject.title,
        siteAddress: newProject.siteAddress,
        managerId: newProject.managerId,
        foremanId: newProject.foremanId || newProject.managerId,
        startDate: newProject.startDate,
        dueDate: newProject.dueDate,
        budget: parseFloat(newProject.budget) || 0,
        priority: autoPriority
      };
      
      console.log('📤 Sending update data:', updateData);
      
      const result = await updateProject(selectedProject.id, updateData);
      
      console.log('✅ Project updated successfully:', result);
      
      toast.success('Проект успешно обновлен');
      setIsEditDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('❌ Error updating project:', error);
      toast.error(`Ошибка при обновлении проекта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция удаления проекта
  const handleDeleteProject = async (project: Project) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      deleteProject(project.id);
      toast('Проект удален', { type: 'success' });
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      toast('Ошибка при удалении проекта', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Функция открытия диалога редактирования
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setNewProject({
      title: project.title || '',
      clientId: project.clientId || '',
      siteAddress: project.siteAddress || '',
      managerId: project.managerId || '',
      foremanId: project.foremanId || '',
      startDate: project.startDate || '',
      dueDate: project.dueDate || '',
      budget: project.budget?.toString() || '',
      priority: project.priority || 'medium'
    });
    setIsEditDialogOpen(true);
  };

  // Функция открытия диалога удаления
  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  // Фильтрация и поиск проектов
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = !searchQuery || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.siteAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || project.stage === stageFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      const minBudget = budgetMin ? parseFloat(budgetMin) : 0;
      const maxBudget = budgetMax ? parseFloat(budgetMax) : Infinity;
      const matchesBudget = project.budget >= minBudget && project.budget <= maxBudget;
      
      return matchesSearch && matchesStage && matchesPriority && matchesBudget;
    });
  }, [projects, searchQuery, stageFilter, priorityFilter, budgetMin, budgetMax]);

  return (
    <div className="space-y-6 p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Проекты</h1>
          <p className="text-muted-foreground">
            Управление проектами и отслеживание производства
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Создать проект
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="new-project-visible-description">
            <DialogHeader>
              <DialogTitle>Новый проект</DialogTitle>
              <DialogDescription id="new-project-visible-description">
                Создайте новый производственный проект, указав основные параметры и ответственных лиц.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название проекта *</Label>
                <Input 
                  id="title"
                  placeholder="Введите название проекта" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Клиент *</Label>
                <Select 
                  value={newProject.clientId} 
                  onValueChange={(value) => setNewProject({...newProject, clientId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Адрес объекта</Label>
                <Input 
                  id="address"
                  placeholder="Введите адрес объекта" 
                  value={newProject.siteAddress}
                  onChange={(e) => setNewProject({...newProject, siteAddress: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Менеджер *</Label>
                <Select 
                  value={newProject.managerId} 
                  onValueChange={(value) => setNewProject({...newProject, managerId: value})}
                  disabled={usersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={usersLoading ? "Загрузка..." : "Выберите менеджера"} />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">Загрузка пользователей...</div>
                    ) : getUsersByRole('Manager').length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Нет пользователей с ролью "Менеджер"
                      </div>
                    ) : (
                      getUsersByRole('Manager').map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="foreman">Начальник цеха</Label>
                <Select 
                  value={newProject.foremanId} 
                  onValueChange={(value) => setNewProject({...newProject, foremanId: value})}
                  disabled={usersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={usersLoading ? "Загрузка..." : "Выберите начальника цеха"} />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">Загрузка пользователей...</div>
                    ) : getUsersByRole('Master').length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Нет пользователей с ролью "Мастер"
                      </div>
                    ) : (
                      getUsersByRole('Master').map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Дата старта</Label>
                <DatePicker
                  date={newProject.startDate ? new Date(newProject.startDate) : undefined}
                  onDateChange={(date) => {
                    setNewProject({...newProject, startDate: date ? date.toISOString().split('T')[0] : ''});
                  }}
                  placeholder="Выберите дату"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Дедлайн</Label>
                <DatePicker
                  date={newProject.dueDate ? new Date(newProject.dueDate) : undefined}
                  onDateChange={(date) => {
                    const value = date ? date.toISOString().split('T')[0] : '';
                    setNewProject(prev => ({
                      ...prev,
                      dueDate: value,
                      priority: calculatePriorityFromDueDate(value || null)
                    }));
                  }}
                  placeholder="Выберите дату"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Бюджет (₽)</Label>
                <Input 
                  id="budget"
                  type="number" 
                  placeholder="0" 
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select 
                  value={newProject.priority} 
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="urgent">Срочный</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Приоритет рассчитывается автоматически от даты сдачи.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Создать проект
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Поиск по названию, адресу или ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все стадии" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все стадии</SelectItem>
                  {Object.entries(projectStageNames).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Все приоритеты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Filter className="size-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица проектов */}
      <Card>
        <CardHeader>
          <CardTitle>Проекты ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Проект</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Стадия</TableHead>
                <TableHead>Прогресс</TableHead>
                <TableHead>Бюджет</TableHead>
                <TableHead>Дедлайн</TableHead>
                <TableHead>Приоритет</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const client = clients.find(c => c.id === project.clientId);
                const manager = users.find(u => u.id === project.managerId);
                const daysUntilDue = getDaysUntilDue(project.dueDate);
                
                return (
                  <TableRow 
                    key={project.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      trackUserAction('project_opened', { 
                        projectId: project.id, 
                        projectTitle: project.title,
                        source: 'projects_table_click' 
                      });
                      navigate(`/app/projects/${project.code || project.id}`);
                    }}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.code || project.id} • {manager?.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client?.name || 'Не указан'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.stage}>
                        {projectStageNames[project.stage]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <Progress value={getStageProgress(project.stage)} className="w-[60px]" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(getStageProgress(project.stage))}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell>
                      <div className={`${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue < 7 ? 'text-orange-600' : ''}`}>
                        {formatDate(project.dueDate)}
                        {daysUntilDue !== null && (
                          <div className="text-xs">
                            {daysUntilDue < 0 ? `Просрочен на ${Math.abs(daysUntilDue)} дн.` : 
                             daysUntilDue === 0 ? 'Сегодня' :
                             `Осталось ${daysUntilDue} дн.`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.priority}>
                        {project.priority === 'low' ? 'Низкий' :
                         project.priority === 'medium' ? 'Средний' :
                         project.priority === 'high' ? 'Высокий' : 'Срочный'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate(`/app/projects/${project.code || project.id}`);
                          }}>
                            <Eye className="size-4 mr-2" />
                            Открыть
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openEditDialog(project);
                          }}>
                            <Edit className="size-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              openDeleteDialog(project);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredProjects.length === 0 && !isLoading && !error && (
            <EmptyProjectsState onCreateProject={() => setIsCreateDialogOpen(true)} />
          )}
          
          {error && (
            <ErrorState 
              title="Ошибка загрузки проектов"
              description={error}
              onRetry={() => {
                setError(null);
                // Перезагрузить проекты
                window.location.reload();
              }}
            />
          )}
          
          {isLoading && (
            <LoadingState 
              title="Загрузка проектов..."
              description="Получаем данные из базы"
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-project-main-visible-description">
          <DialogHeader>
            <DialogTitle>Редактировать проект</DialogTitle>
            <DialogDescription id="edit-project-main-visible-description">
              Внесите изменения в проект и сохраните их.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название проекта *</Label>
              <Input 
                id="edit-title"
                placeholder="Введите название проекта" 
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client">Клиент *</Label>
              <Select 
                value={newProject.clientId} 
                onValueChange={(value) => setNewProject({...newProject, clientId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-address">Адрес объекта</Label>
              <Input 
                id="edit-address"
                placeholder="Введите адрес объекта" 
                value={newProject.siteAddress}
                onChange={(e) => setNewProject({...newProject, siteAddress: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Менеджер *</Label>
              <Select 
                value={newProject.managerId} 
                onValueChange={(value) => setNewProject({...newProject, managerId: value})}
                disabled={usersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={usersLoading ? "Загрузка..." : "Выберите менеджера"} />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">Загрузка пользователей...</div>
                  ) : getUsersByRole('Manager').length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Нет пользователей с ролью "Менеджер"
                    </div>
                  ) : (
                    getUsersByRole('Manager').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-foreman">Начальник цеха</Label>
              <Select 
                value={newProject.foremanId} 
                onValueChange={(value) => setNewProject({...newProject, foremanId: value})}
                disabled={usersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={usersLoading ? "Загрузка..." : "Выберите начальника цеха"} />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">Загрузка пользователей...</div>
                  ) : getUsersByRole('Master').length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Нет пользователей с ролью "Мастер"
                    </div>
                  ) : (
                    getUsersByRole('Master').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-start-date">Дата старта</Label>
              <DatePicker
                date={newProject.startDate ? new Date(newProject.startDate) : undefined}
                onDateChange={(date) => {
                  setNewProject({...newProject, startDate: date ? date.toISOString().split('T')[0] : ''});
                }}
                placeholder="Выберите дату"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-due-date">Дедлайн</Label>
              <DatePicker
                date={newProject.dueDate ? new Date(newProject.dueDate) : undefined}
                onDateChange={(date) => {
                  const value = date ? date.toISOString().split('T')[0] : '';
                  setNewProject(prev => ({
                    ...prev,
                    dueDate: value,
                    priority: calculatePriorityFromDueDate(value || null)
                  }));
                }}
                placeholder="Выберите дату"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget">Бюджет (₽)</Label>
              <Input 
                id="edit-budget"
                type="number" 
                placeholder="0" 
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Приоритет</Label>
              <Select 
                value={newProject.priority} 
                  disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                </SelectContent>
              </Select>
                <p className="text-xs text-muted-foreground">
                  Приоритет определяется автоматически в зависимости от дедлайна.
                </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleEditProject} 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent aria-describedby="delete-project-description">
          <AlertDialogDescription id="delete-project-description" className="sr-only">
            Подтверждение удаления проекта
          </AlertDialogDescription>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить проект "{selectedProject?.title}"? 
              Это действие нельзя отменить. Все данные проекта будут безвозвратно утеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedProject && handleDeleteProject(selectedProject)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Удалить проект
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}