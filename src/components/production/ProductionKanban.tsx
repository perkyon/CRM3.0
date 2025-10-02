import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { 
  ArrowLeft,
  Plus,
  FileText
} from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContextNew';
import { KanbanBoard, KanbanTask } from '../../types';
import { supabaseKanbanService } from '../../lib/supabase/services/KanbanService';
import { toast } from '../../lib/toast';
import { KanbanTaskCard } from './KanbanTaskCard';

interface ProductionKanbanProps {
  projectId?: string;
  onNavigate?: (page: string, params?: { projectId?: string; clientId?: string; taskId?: string }) => void;
}

export function ProductionKanban({ projectId, onNavigate }: ProductionKanbanProps) {
  const { projects, selectedProject } = useProjects();
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load kanban boards for project
  useEffect(() => {
    if (projectId) {
      loadProjectBoards(projectId);
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadProjectBoards = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const projectBoards = await supabaseKanbanService.getProjectBoards(projectId);
      setBoards(projectBoards);
    } catch (error: any) {
      setError(error.message);
      toast.error(`Ошибка загрузки досок: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultBoard = async () => {
    if (!projectId) return;
    
    try {
      const project = projects.find(p => p.id === projectId) || selectedProject;
      const boardTitle = project ? `Производство: ${project.title}` : 'Производственная доска';
      
      const newBoard = await supabaseKanbanService.createBoard({
        projectId,
        title: boardTitle,
        description: 'Доска для отслеживания производственных задач',
      });
      
      setBoards([newBoard]);
      toast.success('Доска создана');
    } catch (error: any) {
      toast.error(`Ошибка создания доски: ${error.message}`);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Загрузка производственных досок...</span>
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
              <h3 className="text-red-800 font-medium">Ошибка загрузки</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => projectId && loadProjectBoards(projectId)}
            >
              Повторить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle no boards state
  if (projectId && boards.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Нет производственных досок</h3>
          <p className="text-muted-foreground mb-4">
            Создайте доску для отслеживания производственных задач
          </p>
          <Button onClick={createDefaultBoard}>
            <Plus className="w-4 h-4 mr-2" />
            Создать доску
          </Button>
        </div>
      </div>
    );
  }

  const currentProject = projectId ? (projects.find(p => p.id === projectId) || selectedProject) : null;
  const currentBoard = boards[0]; // Use first board for now

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {projectId && onNavigate && (
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('project-overview', { projectId })}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к обзору проекта
          </Button>
          {currentProject && (
            <>
              <div className="border-l border-border h-6"></div>
              <div>
                <h2 className="font-medium">{currentProject.title}</h2>
                <p className="text-sm text-muted-foreground">Производственная доска</p>
              </div>
            </>
          )}
        </div>
      )}
      
      {!projectId && (
        <div>
          <h1 className="text-2xl font-medium">Производство</h1>
          <p className="text-muted-foreground">Канбан-доска для управления производственными процессами</p>
        </div>
      )}

      {currentBoard && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {currentBoard.columns?.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: column.color || '#6b7280' }}
                        />
                        <span>{column.title}</span>
                      </div>
                      <Badge variant="secondary">{column.tasks?.length || 0}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.tasks && column.tasks.length > 0 ? (
                      column.tasks.map((task) => (
                        <KanbanTaskCard
                          key={task.id}
                          task={task}
                          onViewDetails={() => setSelectedTask(task)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Нет задач
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {!projectId && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Выберите проект</h3>
          <p className="text-muted-foreground mb-4">
            Для просмотра производственных досок выберите проект
          </p>
        </div>
      )}

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedTask?.title}</SheetTitle>
            <SheetDescription>
              Детали задачи
            </SheetDescription>
          </SheetHeader>
          
          {selectedTask && (
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Описание</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTask.description || 'Описание не указано'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Исполнитель</h4>
                <p className="text-sm">
                  {selectedTask.assignee?.name || 'Не назначен'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Приоритет</h4>
                <Badge className={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority === 'high' ? 'Высокий' : 
                   selectedTask.priority === 'medium' ? 'Средний' : 'Низкий'}
                </Badge>
              </div>
              
              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Чек-лист</h4>
                  <div className="space-y-2">
                    {selectedTask.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={item.completed}
                          readOnly
                          className="rounded"
                        />
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
