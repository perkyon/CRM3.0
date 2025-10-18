import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowLeft, 
  Plus,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react';
import { 
  ProductionStageType, 
  ProductionTaskStatus, 
  ProductionStage, 
  ProjectSubComponent,
  User as UserType
} from '../../types';
import { toast } from '../../lib/toast';
import { useUsers } from '../../lib/hooks/useUsers';

// Иконки для этапов производства
const stageIcons: Record<ProductionStageType, React.ReactNode> = {
  cnc_cutting: (
    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  pre_assembly: (
    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  sanding: (
    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  painting: (
    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  quality_control: (
    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  packaging: (
    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  delivery: (
    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  ),
  installation: (
    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
      </svg>
    </div>
  )
};

// Названия этапов
const stageNames: Record<ProductionStageType, string> = {
  cnc_cutting: 'ЧПУ/раскрой',
  pre_assembly: 'Предсборка',
  sanding: 'Шлифовка',
  painting: 'Покраска',
  quality_control: 'Контроль качества',
  packaging: 'Упаковка',
  delivery: 'Доставка',
  installation: 'Монтаж'
};

// Цвета статусов
const statusColors: Record<ProductionTaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700'
};

// Названия статусов
const statusNames: Record<ProductionTaskStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершено',
  on_hold: 'Приостановлено',
  cancelled: 'Отменено'
};

interface ProductionKanbanProps {
  subComponentId: string;
  subComponentName: string;
  onStageUpdate: (stageId: string, updates: Partial<ProductionStage>) => void;
}

export function ProductionKanban({ 
  subComponentId, 
  subComponentName, 
  onStageUpdate 
}: ProductionKanbanProps) {
  const navigate = useNavigate();
  const { users } = useUsers();
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string>('');

  // Загружаем этапы производства
  useEffect(() => {
    loadProductionStages();
  }, [subComponentId]);

  const loadProductionStages = async () => {
    try {
      // TODO: Загрузить этапы производства из API
      // const productionStages = await productionService.getProductionStages(subComponentId);
      // setStages(productionStages);
      
      // Временные данные для демонстрации
      const mockStages: ProductionStage[] = [
        {
          id: '1',
          subComponentId,
          stageType: 'cnc_cutting',
          name: 'Вырез на ЧПУ',
          orderIndex: 1,
          estimatedHours: 4,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          subComponentId,
          stageType: 'sanding',
          name: 'Шлифовка',
          orderIndex: 2,
          estimatedHours: 2,
          status: 'in_progress',
          assigneeId: users[0]?.id,
          assignee: users[0],
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          subComponentId,
          stageType: 'painting',
          name: 'Покраска',
          orderIndex: 3,
          estimatedHours: 3,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          subComponentId,
          stageType: 'assembly',
          name: 'Сборка',
          orderIndex: 4,
          estimatedHours: 6,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setStages(mockStages);
    } catch (error) {
      console.error('Error loading production stages:', error);
    }
  };

  const handleStageStatusChange = async (stageId: string, newStatus: ProductionTaskStatus) => {
    try {
      const updates: Partial<ProductionStage> = { status: newStatus };
      
      if (newStatus === 'in_progress') {
        updates.startDate = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.endDate = new Date().toISOString();
      }
      
      // TODO: Обновить статус через API
      // await productionService.updateProductionStage(stageId, updates);
      
      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, ...updates } : stage
      ));
      
      onStageUpdate(stageId, updates);
      toast.success('Статус обновлен');
    } catch (error) {
      console.error('Error updating stage status:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleAssigneeChange = async (stageId: string, assigneeId: string) => {
    try {
      const updates: Partial<ProductionStage> = { 
        assigneeId: assigneeId || undefined 
      };
      
      // TODO: Обновить исполнителя через API
      // await productionService.updateProductionStage(stageId, updates);
      
      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { 
          ...stage, 
          ...updates,
          assignee: assigneeId ? users.find(u => u.id === assigneeId) : undefined
        } : stage
      ));
      
      onStageUpdate(stageId, updates);
      toast.success('Исполнитель назначен');
    } catch (error) {
      console.error('Error updating assignee:', error);
      toast.error('Ошибка назначения исполнителя');
    }
  };

  const getStageIcon = (stageType: ProductionStageType) => {
    return stageIcons[stageType];
  };

  const getStatusIcon = (status: ProductionTaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'in_progress':
        return <Play className="size-4 text-blue-600" />;
      case 'on_hold':
        return <Pause className="size-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="size-4 text-red-600" />;
      default:
        return <Clock className="size-4 text-gray-600" />;
    }
  };

  const filteredStages = stages.filter(stage => {
    const matchesSearch = stage.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = selectedAssignee === 'all' || stage.assigneeId === selectedAssignee;
    // const matchesPriority = selectedPriority === 'all' || stage.priority === selectedPriority;
    
    return matchesSearch && matchesAssignee;
  });

  const stagesByType = filteredStages.reduce((acc, stage) => {
    if (!acc[stage.stageType]) {
      acc[stage.stageType] = [];
    }
    acc[stage.stageType].push(stage);
    return acc;
  }, {} as Record<ProductionStageType, ProductionStage[]>);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Элемент "{subComponentName}"</h1>
          <p className="text-muted-foreground">Управление этапами производства</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Поиск задач..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Исполнитель" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все исполнители</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Поиск по тегам"
          value={selectedTags}
          onChange={(e) => setSelectedTags(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Object.entries(stageNames).map(([stageType, stageName]) => {
          const stageTypeKey = stageType as ProductionStageType;
          const stageTasks = stagesByType[stageTypeKey] || [];
          
          return (
            <div key={stageType} className="flex-shrink-0 w-80">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStageIcon(stageTypeKey)}
                      <CardTitle className="text-sm">{stageName}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stageTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageTasks.map(stage => (
                    <Card key={stage.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{stage.name}</h4>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(stage.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${statusColors[stage.status]}`}
                          >
                            {statusNames[stage.status]}
                          </Badge>
                          {stage.estimatedHours && (
                            <span className="text-xs text-muted-foreground">
                              {stage.estimatedHours}ч
                            </span>
                          )}
                        </div>
                        
                        {stage.assignee && (
                          <div className="flex items-center gap-2">
                            <User className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {stage.assignee.name}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          <Select
                            value={stage.status}
                            onValueChange={(value) => handleStageStatusChange(stage.id, value as ProductionTaskStatus)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Ожидает</SelectItem>
                              <SelectItem value="in_progress">В работе</SelectItem>
                              <SelectItem value="completed">Завершено</SelectItem>
                              <SelectItem value="on_hold">Приостановлено</SelectItem>
                              <SelectItem value="cancelled">Отменено</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={stage.assigneeId || 'unassigned'}
                            onValueChange={(value) => handleAssigneeChange(stage.id, value === 'unassigned' ? '' : value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Исполнитель" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Не назначен</SelectItem>
                              {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-xs"
                    onClick={() => {
                      // TODO: Добавить новую задачу
                      toast.info('Функция добавления задач в разработке');
                    }}
                  >
                    <Plus className="size-3 mr-1" />
                    Добавить карточку
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
        
        {/* Add New Column */}
        <div className="flex-shrink-0 w-80">
          <Card className="border-dashed">
            <CardContent className="p-6 flex items-center justify-center h-32">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // TODO: Добавить новый этап
                  toast.info('Функция добавления этапов в разработке');
                }}
              >
                <Plus className="size-4 mr-2" />
                Добавить ещё одну колонку
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
