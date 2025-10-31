import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { toast } from '../../lib/toast';
import { 
  ArrowLeft,
  Filter,
  Search,
  X
} from 'lucide-react';
import { useUsers } from '../../lib/hooks/useUsers';
import { KanbanBoard, KanbanColumn, KanbanTask, User as UserType } from '../../types';
import { supabaseKanbanService } from '../../lib/supabase/services/KanbanService';
import { ModernKanbanColumn, AddColumnCard } from './ModernKanbanColumn';
import { ModernTaskDetail } from './ModernTaskDetail';
import { EmptyKanbanState, ErrorState, LoadingState } from '../ui/empty-state';

// Default kanban columns
const defaultKanbanColumns = [
  { id: '550e8400-e29b-41d4-a716-446655440020', title: 'К выполнению', position: 0, color: '#6b7280' },
  { id: '550e8400-e29b-41d4-a716-446655440021', title: 'В работе', position: 1, color: '#3b82f6' },
  { id: '550e8400-e29b-41d4-a716-446655440022', title: 'На проверке', position: 2, color: '#f59e0b' },
  { id: '550e8400-e29b-41d4-a716-446655440023', title: 'Завершено', position: 3, color: '#10b981' },
];

interface EnhancedProductionKanbanProps {
  projectId?: string;
  onNavigate?: (page: string, params?: { projectId?: string; clientId?: string; taskId?: string }) => void;
}

interface DraggedItem {
  type: 'task' | 'column';
  data: KanbanTask | KanbanColumn;
  sourceColumnId?: string;
}

export function EnhancedProductionKanban({ projectId: propProjectId, onNavigate }: EnhancedProductionKanbanProps) {
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || urlProjectId;
  
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { users } = useUsers();

  // Load boards from Supabase
  useEffect(() => {
    const loadBoards = async () => {
      try {
        setIsLoading(true);
        
        // Load boards from Supabase
        
        if (projectId) {
          try {
            console.log('[Kanban] Loading boards for project:', projectId);
            const projectBoards = await supabaseKanbanService.getProjectBoards(projectId);
            console.log('[Kanban] Loaded boards:', projectBoards);
            setBoards(projectBoards);
            
            // If no boards found, create one in Supabase
            if (projectBoards.length === 0) {
              console.log('[Kanban] No boards found, creating...');
              await createBoardForProject(projectId);
            }
          } catch (error) {
            console.error('[Kanban] Failed to load kanban boards from Supabase:', error);
            // Fallback to creating a board
            await createBoardForProject(projectId);
          }
        } else {
          // Create a default board if no project specified
          console.log('[Kanban] No projectId, creating default board');
          const defaultBoard: KanbanBoard = {
            id: 'default-board',
            projectId: 'default',
            title: 'Общая производственная доска',
            columns: defaultKanbanColumns.map((col, index) => ({
              id: `COL-default-${index}`,
              title: col.title,
              stage: col.title.toLowerCase().replace(/\s+/g, '_'),
              order: col.position,
              isDefault: true,
              color: col.color
            })),
            tasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setBoards([defaultBoard]);
        }
      } catch (error) {
        console.error('[Kanban] Failed to load kanban boards:', error);
        // Create default board on error
        const defaultBoard: KanbanBoard = {
          id: 'default-board',
          projectId: 'default',
          title: 'Общая производственная доска',
          columns: defaultKanbanColumns.map((col, index) => ({
            id: `COL-default-${index}`,
            title: col.title,
            stage: col.title.toLowerCase().replace(/\s+/g, '_'),
            order: col.position,
            isDefault: true,
            color: col.color
          })),
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
          };
        setBoards([defaultBoard]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBoards();
  }, [projectId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    tags: ''
  });
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const currentBoard = projectId ? boards.find(b => b.projectId === projectId) : boards[0];

  // Создание новой доски при отсутствии проекта
  useEffect(() => {
    if (projectId && !currentBoard) {
      createBoardForProject(projectId);
    }
  }, [projectId, currentBoard]);

  const createBoardForProject = async (projectId: string) => {
    if (!projectId) return;
    
    try {
      // Создаем доску в Supabase
      const newBoard = await supabaseKanbanService.createBoard({
        projectId: projectId,
        title: `Производство проекта ${projectId}`,
        description: `Канбан-доска для проекта ${projectId}`
      });

      // Создаем колонки в Supabase
      for (let i = 0; i < defaultKanbanColumns.length; i++) {
        const col = defaultKanbanColumns[i];
        await supabaseKanbanService.createColumn({
          boardId: newBoard.id,
          title: col.title,
          position: col.position
        });
      }

      // Загружаем обновленную доску
      const updatedBoards = await supabaseKanbanService.getProjectBoards(projectId);
      setBoards(updatedBoards);
      
      toast.success('Канбан-доска создана для проекта');
    } catch (error) {
      console.error('Failed to create board in Supabase:', error);
      toast.error('Ошибка создания канбан-доски');
    }
  };

  const addColumn = (title: string) => {
    if (!currentBoard) return;

    const newColumn: KanbanColumn = {
      id: `COL-${Date.now()}`,
      title,
      stage: title.toLowerCase().replace(/\s+/g, '_'),
      order: currentBoard.columns.length,
      isDefault: false
    };

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, columns: [...board.columns, newColumn] }
        : board
    ));

    toast.success(`Колонка "${title}" добавлена`);
  };

  const updateColumn = (columnId: string, updates: Partial<KanbanColumn>) => {
    if (!currentBoard) return;

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { 
            ...board, 
            columns: board.columns.map(col => 
              col.id === columnId ? { ...col, ...updates } : col
            )
          }
        : board
    ));
  };

  const deleteColumn = (columnId: string) => {
    if (!currentBoard) return;

    const column = currentBoard.columns.find(col => col.id === columnId);
    if (column?.isDefault) {
      toast.error('Нельзя удалить базовую колонку');
      return;
    }

    // Перемещаем задачи в первую колонку
    const tasksToMove = currentBoard.tasks.filter(task => task.columnId === columnId);
    const firstColumnId = currentBoard.columns[0]?.id;

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { 
            ...board, 
            columns: board.columns.filter(col => col.id !== columnId),
            tasks: board.tasks.map(task => 
              task.columnId === columnId 
                ? { ...task, columnId: firstColumnId }
                : task
            )
          }
        : board
    ));

    toast.success(`Колонка удалена${tasksToMove.length > 0 ? `, ${tasksToMove.length} задач перемещено` : ''}`);
  };

  const addTask = async (columnId: string, title: string, description?: string) => {
    console.log('[Kanban] addTask called:', { columnId, title, currentBoard: currentBoard?.id, boardsCount: boards.length });
    
    if (!currentBoard) {
      console.error('[Kanban] No current board found');
      toast.error('Доска не найдена');
      return;
    }

    // Проверяем, что колонка существует в БД (не дефолтная)
    const column = currentBoard.columns.find(col => col.id === columnId);
    console.log('[Kanban] Column found:', { columnId, column: column?.title, allColumns: currentBoard.columns.map(c => ({ id: c.id, title: c.title })) });
    
    if (!column) {
      console.error('[Kanban] Column not found:', columnId);
      toast.error('Колонка не найдена');
      return;
    }

    // Если это дефолтная колонка (начинается с COL-default) или общая доска, создаем только локально
    const isDefaultBoard = columnId.startsWith('COL-default') || !currentBoard.id || currentBoard.id === 'default-board';
    console.log('[Kanban] Is default board:', isDefaultBoard, { columnId, boardId: currentBoard.id });
    
    if (isDefaultBoard) {
      // Это общая доска или дефолтные колонки - не сохраняем в БД, только локально
      const position = currentBoard.tasks.filter(t => t.columnId === columnId).length;
      
      const newTask: KanbanTask = {
        id: `TASK-${Date.now()}`,
        projectId: currentBoard.projectId || 'default',
        columnId,
        title,
        description,
        priority: 'medium',
        tags: [],
        checklist: [],
        attachments: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: position
      };

      setBoards(prev => {
        const updated = prev.map(board => 
          board.id === currentBoard.id 
            ? { ...board, tasks: [...board.tasks, newTask] }
            : board
        );
        console.log('[Kanban] Updated boards after adding task:', updated);
        return updated;
      });

      toast.success(`Задача "${title}" добавлена`);
      return;
    }

    try {
      const position = currentBoard.tasks.filter(t => t.columnId === columnId).length;
      
      // Сохраняем в БД только если есть реальная доска и projectId
      const savedTask = await supabaseKanbanService.createTask({
        columnId,
        title,
        description,
        priority: 'medium',
        position,
        tags: []
      });

      // Обновляем локальное состояние
      const newTask: KanbanTask = {
        id: savedTask.id,
        projectId: currentBoard.projectId,
        columnId,
        title: savedTask.title,
        description: savedTask.description,
        priority: savedTask.priority,
        tags: savedTask.tags || [],
        checklist: [],
        attachments: [],
        comments: savedTask.comments || [],
        createdAt: savedTask.created_at,
        updatedAt: savedTask.updated_at,
        order: savedTask.position,
        assignee: savedTask.assignee ? {
          id: savedTask.assignee.id,
          name: savedTask.assignee.name || '',
          email: savedTask.assignee.email || ''
        } : undefined,
        dueDate: savedTask.due_date || undefined
      };

      setBoards(prev => prev.map(board => 
        board.id === currentBoard.id 
          ? { ...board, tasks: [...board.tasks, newTask] }
          : board
      ));

      toast.success(`Задача "${title}" добавлена`);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(`Ошибка создания задачи: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<KanbanTask>) => {
    if (!currentBoard) return;

    try {
      // Сохраняем в БД
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.assignee) updateData.assigneeId = updates.assignee.id;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.dueDate) updateData.dueDate = updates.dueDate;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.order !== undefined) updateData.position = updates.order;
      if (updates.columnId) updateData.columnId = updates.columnId;

      const savedTask = await supabaseKanbanService.updateTask(taskId, updateData);

      // Обновляем локальное состояние
      setBoards(prev => prev.map(board => 
        board.id === currentBoard.id 
          ? { 
              ...board, 
              tasks: board.tasks.map(task => 
                task.id === taskId 
                  ? {
                      ...task,
                      ...updates,
                      updatedAt: savedTask.updated_at,
                      comments: savedTask.comments || task.comments,
                      assignee: savedTask.assignee ? {
                        id: savedTask.assignee.id,
                        name: savedTask.assignee.name || '',
                        email: savedTask.assignee.email || ''
                      } : task.assignee
                    }
                  : task
              )
            }
          : board
      ));
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast.error(`Ошибка обновления задачи: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const moveTask = async (taskId: string, targetColumnId: string, targetOrder?: number) => {
    if (!currentBoard) return;

    const task = currentBoard.tasks.find(t => t.id === taskId);
    if (!task) return;

    const targetColumn = currentBoard.columns.find(col => col.id === targetColumnId);
    const sourceColumn = currentBoard.columns.find(col => col.id === task.columnId);

    try {
      const finalOrder = targetOrder ?? currentBoard.tasks.filter(t => t.columnId === targetColumnId).length;
      
      // Сохраняем в БД
      await supabaseKanbanService.moveTask(taskId, targetColumnId, finalOrder);

      // Обновляем локальное состояние
      setBoards(prev => prev.map(board => 
        board.id === currentBoard.id 
          ? { 
              ...board, 
              tasks: board.tasks.map(t => 
                t.id === taskId 
                  ? { 
                      ...t, 
                      columnId: targetColumnId, 
                      order: finalOrder,
                      updatedAt: new Date().toISOString()
                    }
                  : t
              )
            }
          : board
      ));

      toast.success(`Задача перемещена: ${sourceColumn?.title} → ${targetColumn?.title}`);
    } catch (error: any) {
      console.error('Failed to move task:', error);
      toast.error(`Ошибка перемещения задачи: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!currentBoard) return;

    try {
      // Удаляем из БД
      await supabaseKanbanService.deleteTask(taskId);

      // Обновляем локальное состояние
      setBoards(prev => prev.map(board => 
        board.id === currentBoard.id 
          ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
          : board
      ));

      toast.success('Задача удалена');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(`Ошибка удаления задачи: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, item: DraggedItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem) return;

    if (draggedItem.type === 'task') {
      const task = draggedItem.data as KanbanTask;
      if (task.columnId !== targetColumnId) {
        moveTask(task.id, targetColumnId);
      }
    }

    setDraggedItem(null);
  };

  // Фильтрация задач
  const getFilteredTasks = (columnId: string) => {
    if (!currentBoard || !columnId) return [];

    let tasks = currentBoard.tasks.filter(task => task.columnId === columnId);

    // Поиск
    if (searchQuery && searchQuery.trim()) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Фильтры
    if (filters.assignee && filters.assignee.trim()) {
      tasks = tasks.filter(task => task.assigneeId === filters.assignee);
    }

    if (filters.priority && filters.priority.trim()) {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }

    if (filters.tags && filters.tags.trim()) {
      tasks = tasks.filter(task => 
        task.tags.some(tag => tag.toLowerCase().includes(filters.tags.toLowerCase()))
      );
    }

    return tasks.sort((a, b) => a.order - b.order);
  };



  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ assignee: '', priority: '', tags: '' });
  };

  const hasActiveFilters = searchQuery || filters.assignee || filters.priority || filters.tags;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-medium mb-4">Загрузка канбан-досок...</h2>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="p-6 lg:p-8">
        {isLoading ? (
          <LoadingState 
            title="Загрузка канбан-доски..."
            description="Получаем данные из базы"
          />
        ) : (
          <EmptyKanbanState 
            onCreateBoard={() => projectId && createBoardForProject(projectId)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-full h-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4 mr-2" />
            Назад
          </Button>
          <div className="border-l border-border h-6"></div>
          <div>
            <h1 className="text-2xl font-medium">{currentBoard.title}</h1>
            <p className="text-muted-foreground">
              {currentBoard.tasks.length} задач в {currentBoard.columns.length} колонках
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-sm">
                <label className="text-sm">Поиск</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск задач..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-40">
                  <label className="text-sm">Исполнитель</label>
                  <Select value={filters.assignee || "all"} onValueChange={(value: string) => setFilters(prev => ({ ...prev, assignee: value === "all" ? "" : value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все исполнители</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-32">
                  <label className="text-sm">Приоритет</label>
                  <Select value={filters.priority || "all"} onValueChange={(value: string) => setFilters(prev => ({ ...prev, priority: value === "all" ? "" : value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Все" />
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

                <div className="min-w-32">
                  <label className="text-sm">Теги</label>
                  <Input
                    placeholder="Поиск по тегам"
                    value={filters.tags}
                    onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="h-10">
                      <X className="size-4 mr-2" />
                      Очистить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="relative w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto bg-blue-50 p-4 rounded-lg" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
          {currentBoard.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <ModernKanbanColumn
                key={column.id}
                column={column}
                tasks={getFilteredTasks(column.id)}
                onAddTask={(title, description) => addTask(column.id, title, description)}
                onUpdateColumn={(updates) => updateColumn(column.id, updates)}
                onDeleteColumn={() => deleteColumn(column.id)}
                onTaskClick={setSelectedTask}
                onDragStart={handleDragStart}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                isDragOver={dragOverColumn === column.id}
              />
            ))}

          {/* Add Column Button */}
          <AddColumnCard onAddColumn={addColumn} />
          </div>
        </div>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <SheetContent 
          className="w-full sm:max-w-5xl p-0 overflow-hidden" 
          side="right"
          aria-describedby="task-detail-sheet-description"
        >
          <SheetDescription id="task-detail-sheet-description" className="sr-only">
            Детальная информация о задаче и возможности редактирования
          </SheetDescription>
          {selectedTask && (
            <ModernTaskDetail
              task={selectedTask}
              onUpdateTask={(updates) => updateTask(selectedTask.id, updates)}
              onDeleteTask={() => {
                deleteTask(selectedTask.id);
                setSelectedTask(null);
              }}
              onClose={() => setSelectedTask(null)}
              users={users}
              columns={currentBoard.columns}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}









