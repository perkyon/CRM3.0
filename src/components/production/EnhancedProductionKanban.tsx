import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { mockKanbanBoards, mockUsers, defaultKanbanColumns } from '../../lib/mockData';
import { KanbanBoard, KanbanColumn, KanbanTask, User as UserType } from '../../types';
import { ModernKanbanColumn, AddColumnCard } from './ModernKanbanColumn';
import { ModernTaskDetail } from './ModernTaskDetail';

interface EnhancedProductionKanbanProps {
  projectId?: string;
  onNavigate?: (page: string, params?: { projectId?: string; clientId?: string; taskId?: string }) => void;
}

interface DraggedItem {
  type: 'task' | 'column';
  data: KanbanTask | KanbanColumn;
  sourceColumnId?: string;
}

export function EnhancedProductionKanban({ projectId, onNavigate }: EnhancedProductionKanbanProps) {
  const [boards, setBoards] = useState<KanbanBoard[]>(mockKanbanBoards);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

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

  const createBoardForProject = (projectId: string) => {
    if (!projectId) return;
    
    const newBoard: KanbanBoard = {
      id: `BOARD-${projectId}`,
      projectId: projectId,
      title: `Производство проекта ${projectId}`,
      columns: defaultKanbanColumns.map((col, index) => ({
        id: `COL-${projectId}-${index}`,
        ...col
      })),
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBoards(prev => [...prev, newBoard]);
    toast.success('Канбан-доска создана для проекта');
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

  const addTask = (columnId: string, title: string, description?: string) => {
    if (!currentBoard) return;

    const newTask: KanbanTask = {
      id: `TASK-${Date.now()}`,
      projectId: currentBoard.projectId,
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
      order: currentBoard.tasks.filter(t => t.columnId === columnId).length
    };

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, tasks: [...board.tasks, newTask] }
        : board
    ));

    toast.success(`Задача "${title}" добавлена`);
  };

  const updateTask = (taskId: string, updates: Partial<KanbanTask>) => {
    if (!currentBoard) return;

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { 
            ...board, 
            tasks: board.tasks.map(task => 
              task.id === taskId 
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
            )
          }
        : board
    ));
  };

  const moveTask = (taskId: string, targetColumnId: string, targetOrder?: number) => {
    if (!currentBoard) return;

    const task = currentBoard.tasks.find(t => t.id === taskId);
    if (!task) return;

    const targetColumn = currentBoard.columns.find(col => col.id === targetColumnId);
    const sourceColumn = currentBoard.columns.find(col => col.id === task.columnId);

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { 
            ...board, 
            tasks: board.tasks.map(t => 
              t.id === taskId 
                ? { 
                    ...t, 
                    columnId: targetColumnId, 
                    order: targetOrder ?? board.tasks.filter(task => task.columnId === targetColumnId).length,
                    updatedAt: new Date().toISOString()
                  }
                : t
            )
          }
        : board
    ));

    toast.success(`Задача перемещена: ${sourceColumn?.title} → ${targetColumn?.title}`);
  };

  const deleteTask = (taskId: string) => {
    if (!currentBoard) return;

    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { ...board, tasks: board.tasks.filter(task => task.id !== taskId) }
        : board
    ));

    toast.success('Задача удалена');
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

  if (!currentBoard) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-medium mb-4">Канбан-доска не найдена</h2>
          {projectId && (
            <Button onClick={() => createBoardForProject(projectId)}>
              Создать доску для проекта
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          {projectId && onNavigate && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('project-overview', { projectId })}>
                <ArrowLeft className="size-4 mr-2" />
                Назад к проекту
              </Button>
              <div className="border-l border-border h-6"></div>
            </>
          )}
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
                  <Select value={filters.assignee || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value === "all" ? "" : value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все исполнители</SelectItem>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-32">
                  <label className="text-sm">Приоритет</label>
                  <Select value={filters.priority || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === "all" ? "" : value }))}>
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
        <div className="overflow-x-auto overflow-y-hidden bg-blue-50 p-4 rounded-lg" style={{ maxHeight: 'calc(100vh - 280px)' }}>
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
              users={mockUsers}
              columns={currentBoard.columns}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}









