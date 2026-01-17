import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription } from '../ui/sheet';
import { toast } from '../../lib/toast';
import { 
  ArrowLeft,
  LayoutDashboard,
  ListOrdered,
  Calendar,
  User,
  Clock,
  BarChart3,
  SlidersHorizontal,
  Plus,
  Bell,
  MessageCircle,
  MessageSquare
} from 'lucide-react';
import { useUsers } from '../../lib/hooks/useUsers';
import { useCurrentOrganization } from '../../lib/hooks/useCurrentOrganization';
import { KanbanBoard, KanbanColumn, KanbanTask } from '../../types';
import { supabaseKanbanService } from '../../lib/supabase/services/KanbanService';
import { supabase, TABLES } from '../../lib/supabase/config';
import { ModernKanbanColumn, AddColumnCard } from './ModernKanbanColumn';
import { ModernTaskDetail } from './ModernTaskDetail';
import { EmptyKanbanState, LoadingState } from '../ui/empty-state';
import { cn } from '../../lib/utils';

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
  const { currentOrganization } = useCurrentOrganization();
  
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { users } = useUsers();

  const loadBoard = useCallback(async () => {
      if (!currentOrganization?.id) {
      setBoards([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        try {
          console.log('[Kanban] Loading general boards for organization:', currentOrganization.id);
          const generalBoards = await supabaseKanbanService.getGeneralBoards(currentOrganization.id);
          console.log('[Kanban] Loaded general boards:', generalBoards);
          
          const transformedBoards = generalBoards.map(board => {
            const allTasks: any[] = [];
            const columns = (board.columns || []).map((col: any) => {
              const colTasks = (col.tasks || []).map((task: any) => ({
                id: task.id,
              projectId: null,
                columnId: task.column_id || col.id,
                title: task.title,
                description: task.description || '',
                assigneeId: task.assignee_id,
                assignee: task.assignee ? {
                  id: task.assignee.id,
                  name: task.assignee.name || '',
                  email: task.assignee.email || ''
                } : undefined,
                dueDate: task.due_date,
                priority: task.priority || 'medium',
                tags: task.tags || [],
                checklist: (task.checklist || []).map((item: any) => ({
                  id: item.id,
                  text: item.text,
                  completed: item.completed || false,
                  assigneeId: item.assignee_id,
                  dueDate: item.due_date
                })),
                comments: (task.comments || []).map((comment: any) => ({
                  id: comment.id,
                  text: comment.content || comment.text,
                  authorId: comment.author_id || comment.author?.id,
                  createdAt: comment.created_at,
                  updatedAt: comment.updated_at
                })),
                  attachments: task.attachments || [],
                  createdAt: task.created_at,
                  updatedAt: task.updated_at,
                  order: task.position || 0
                }));
                allTasks.push(...colTasks);
                
                return {
                  id: col.id,
                  title: col.title,
                  stage: col.stage || col.title.toLowerCase().replace(/\s+/g, '_'),
                  order: col.position || col.order || 0,
                  isDefault: false,
                  color: col.color
                };
              });
              
              return {
                ...board,
            projectId: null,
                columns,
                tasks: allTasks
              };
            });
            
          if (transformedBoards.length > 0) {
            setBoards([transformedBoards[0]]);
          } else {
            console.log('[Kanban] No board found, creating single board in DB...');
            const newBoard = await supabaseKanbanService.createBoard({
              projectId: null,
              title: 'Общая производственная доска',
              description: 'Главная канбан-доска CRM',
              organizationId: currentOrganization.id
            });
            
            for (let i = 0; i < defaultKanbanColumns.length; i++) {
              const col = defaultKanbanColumns[i];
              await supabaseKanbanService.createColumn({
                boardId: newBoard.id,
                title: col.title,
                position: col.position
              });
            }
            
            const loadedBoard = await supabaseKanbanService.getBoard(newBoard.id);
            const allTasks: any[] = [];
            const columns = ((loadedBoard?.columns || []) as any[]).map((col: any) => {
              const colTasks = (col.tasks || []).map((task: any) => ({
                id: task.id,
                projectId: null,
                columnId: task.column_id || col.id,
                title: task.title,
                description: task.description || '',
                assigneeId: task.assignee_id,
                assignee: task.assignee ? {
                  id: task.assignee.id,
                  name: task.assignee.name || '',
                  email: task.assignee.email || ''
                } : undefined,
                dueDate: task.due_date,
                priority: task.priority || 'medium',
                tags: task.tags || [],
                checklist: (task.checklist || []).map((item: any) => ({
                  id: item.id,
                  text: item.text || '',
                  completed: item.completed || false,
                  assigneeId: item.assignee_id,
                  dueDate: item.due_date
                })),
                comments: (task.comments || []).map((comment: any) => ({
                  id: comment.id,
                  text: comment.content || comment.text || '',
                  authorId: comment.author_id || comment.author?.id,
                  createdAt: comment.created_at,
                  updatedAt: comment.updated_at
                })),
                attachments: task.attachments || [],
                createdAt: task.created_at,
                updatedAt: task.updated_at,
                order: task.position || 0
              }));
              allTasks.push(...colTasks);
              
              return {
                id: col.id,
                title: col.title,
                stage: col.stage || col.title.toLowerCase().replace(/\s+/g, '_'),
                order: col.position || col.order || 0,
                isDefault: false,
                color: col.color
              };
            });
            
            const transformedBoard: KanbanBoard = {
              ...loadedBoard!,
              projectId: null,
              columns,
              tasks: allTasks
            };
            
            setBoards([transformedBoard]);
          }
        } catch (error) {
          console.error('[Kanban] Failed to load board:', error);
          const defaultBoard: KanbanBoard = {
            id: 'default-board',
            projectId: null,
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
      } finally {
        setIsLoading(false);
      }
  }, [currentOrganization?.id]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    tags: '',
    deadline: ''
  });
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Всегда одна доска - первая в массиве
  const currentBoard = boards[0];

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
    console.log('[Kanban] addTask called:', { columnId, title, currentBoard: currentBoard?.id });
    
    if (!currentBoard) {
      toast.error('Доска не найдена');
      return;
    }

    const column = currentBoard.columns.find(col => col.id === columnId);
    if (!column) {
      toast.error('Колонка не найдена');
      return;
    }

    try {
      let realBoardId = currentBoard.id;
      let realColumnId = columnId;
      
      // КРИТИЧНО: Если доска не существует в БД (default-board), создаем её ПЕРЕД созданием задачи
      if (!currentBoard.id || currentBoard.id === 'default-board' || currentBoard.id.startsWith('default')) {
        console.log('[Kanban] Board not in DB, creating now...');
        
        // Создаем доску в БД (projectId может быть null)
        const projectIdForBoard = currentBoard.projectId && currentBoard.projectId !== 'default' 
          ? currentBoard.projectId 
          : null;
          
        if (!currentOrganization?.id) {
          throw new Error('Organization ID is required');
        }
        const newBoard = await supabaseKanbanService.createBoard({
          projectId: projectIdForBoard,
          title: currentBoard.title || 'Общая производственная доска',
          description: 'Общая канбан-доска для задач',
          organizationId: currentOrganization.id
        });
        
        realBoardId = newBoard.id;
        
        // Загружаем обновленную доску с трансформацией
        const updatedBoard = await supabaseKanbanService.getBoard(newBoard.id);
        
        // Трансформируем данные из БД в формат фронтенда
        const transformedBoard = {
          ...updatedBoard,
          tasks: (updatedBoard.tasks || []).map((task: any) => ({
            id: task.id,
            projectId: task.project_id || updatedBoard.project_id,
            columnId: task.column_id,
            title: task.title,
            description: task.description,
            assigneeId: task.assignee_id,
            assignee: task.assignee ? {
              id: task.assignee.id,
              name: task.assignee.name || '',
              email: task.assignee.email || ''
            } : undefined,
            dueDate: task.due_date,
            priority: task.priority || 'medium',
            tags: task.tags || [],
            checklist: (task.checklist || []).map((item: any) => ({
              id: item.id,
              text: item.text,
              completed: item.completed || false,
              assigneeId: item.assignee_id,
              dueDate: item.due_date
            })),
            comments: (task.comments || []).map((comment: any) => ({
              id: comment.id,
              text: comment.content || comment.text,
              authorId: comment.author_id || comment.author?.id,
              createdAt: comment.created_at,
              updatedAt: comment.updated_at
            })),
            attachments: task.attachments || [],
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            order: task.position || 0
          }))
        };
        
        // Обновляем локальное состояние с трансформированной доской
        setBoards(prev => prev.map(board => 
          board.id === currentBoard.id 
            ? transformedBoard
            : board
        ));
        
        // Ищем реальную колонку по названию (т.к. createBoard создает дефолтные колонки)
        const realColumn = transformedBoard.columns.find(col => 
          col.title === column.title || col.title.toLowerCase() === column.title.toLowerCase()
        ) || transformedBoard.columns[0];
        
        if (!realColumn) {
          throw new Error('Колонка не найдена после создания доски');
        }
        
        realColumnId = realColumn.id;
      } else {
        // Доска существует, проверяем колонку
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(columnId);
        
        if (!isUUID || columnId === 'default' || columnId.startsWith('COL-default-')) {
          console.log('[Kanban] Column ID invalid, looking up real column:', columnId);
          
          // Ищем реальную колонку в БД
          const { data: columns, error: columnsError } = await supabase
            .from(TABLES.KANBAN_COLUMNS)
            .select('id, title, position')
            .eq('board_id', realBoardId)
            .order('position');
            
          if (columnsError || !columns || columns.length === 0) {
            throw new Error(`Колонки не найдены: ${columnsError?.message || 'Нет колонок в доске'}`);
          }
          
          // Ищем по названию или по индексу
          let realColumn;
          if (columnId.startsWith('COL-default-')) {
            const colIndex = parseInt(columnId.split('-')[2]) || 0;
            realColumn = columns[colIndex] || columns[0];
          } else {
            realColumn = columns.find(col => col.title === column.title) || columns[0];
          }
          
          realColumnId = realColumn.id;
        }
      }
      
      // ФИНАЛЬНАЯ проверка что columnId валидный UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realColumnId)) {
        throw new Error(`Некорректный ID колонки после обработки: ${realColumnId}`);
      }
      
      console.log('[Kanban] Using column ID:', realColumnId);

      // Получаем обновленную доску для правильного подсчета позиции
      const currentBoardForPosition = boards.find(b => b.id === realBoardId) || currentBoard;
      const position = currentBoardForPosition.tasks.filter(t => t.columnId === realColumnId).length;
      
      // ВСЕ задачи сохраняются в БД с реальным UUID колонки
      const savedTask = await supabaseKanbanService.createTask({
        columnId: realColumnId, // Используем реальный UUID
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
        columnId: realColumnId,
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

      // Обновляем правильную доску (используя realBoardId)
    setBoards(prev => prev.map(board => 
        board.id === realBoardId 
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
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.assignee) updateData.assigneeId = updates.assignee.id;
      if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId; // Поддержка прямого assigneeId
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.order !== undefined) updateData.position = updates.order;
      if (updates.columnId !== undefined) updateData.columnId = updates.columnId;

      // Если обновляется чек-лист - сохраняем его отдельно в БД
      if (updates.checklist !== undefined) {
        await supabaseKanbanService.updateTaskChecklist(taskId, updates.checklist);
      }

      // Обновляем основные поля задачи
      const savedTask = await supabaseKanbanService.updateTask(taskId, updateData);

      // Обновляем локальное состояние с данными из БД
    setBoards(prev => prev.map(board => 
      board.id === currentBoard.id 
        ? { 
            ...board, 
            tasks: board.tasks.map(task => 
              task.id === taskId 
                  ? {
                      ...task,
                      // Используем данные из БД для всех полей
                      title: savedTask.title || task.title,
                      description: savedTask.description ?? task.description,
                      assigneeId: savedTask.assignee_id || task.assigneeId,
                      assignee: savedTask.assignee ? {
                        id: savedTask.assignee.id,
                        name: savedTask.assignee.name || '',
                        email: savedTask.assignee.email || ''
                      } : task.assignee,
                      dueDate: savedTask.due_date || task.dueDate,
                      tags: savedTask.tags || task.tags || [],
                      comments: savedTask.comments || task.comments || [],
                      checklist: savedTask.checklist || task.checklist || updates.checklist || [],
                      priority: savedTask.priority || task.priority,
                      updatedAt: savedTask.updated_at || task.updatedAt,
                    }
                : task
            )
          }
        : board
    ));
      
      // Обновляем selectedTask если он открыт
      if (selectedTask && selectedTask.id === taskId) {
        // Трансформируем данные из БД в формат фронтенда
        const transformedComments = (savedTask.comments || []).map((comment: any) => ({
          id: comment.id,
          text: comment.content || comment.text,
          authorId: comment.author_id || comment.author?.id || comment.authorId,
          createdAt: comment.created_at || comment.createdAt,
          updatedAt: comment.updated_at || comment.updatedAt
        }));
        
        const transformedChecklist = (savedTask.checklist || []).map((item: any) => ({
          id: item.id,
          text: item.text,
          completed: item.completed || false,
          assigneeId: item.assignee_id,
          dueDate: item.due_date
        }));
        
        const updatedTask = currentBoard.tasks.find(t => t.id === taskId);
        setSelectedTask({
          ...updatedTask!,
          // КРИТИЧНО: используем данные из БД, не из локального состояния
          title: savedTask.title || updatedTask?.title || 'Без названия',
          description: savedTask.description !== undefined ? savedTask.description : (updatedTask?.description || ''),
          assigneeId: savedTask.assignee_id || updatedTask?.assigneeId,
          assignee: savedTask.assignee ? {
            id: savedTask.assignee.id,
            name: savedTask.assignee.name || '',
            email: savedTask.assignee.email || ''
          } : (updatedTask?.assignee || undefined),
          dueDate: savedTask.due_date || updatedTask?.dueDate,
          tags: savedTask.tags || updatedTask?.tags || [],
          comments: transformedComments,
          checklist: transformedChecklist,
          priority: savedTask.priority || updatedTask?.priority || 'medium',
          updatedAt: savedTask.updated_at || updatedTask?.updatedAt,
        });
      }
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

    if (filters.deadline && filters.deadline.trim()) {
      const now = new Date();
      tasks = tasks.filter(task => {
        if (!task.dueDate) {
          return filters.deadline === 'without';
        }
        const due = new Date(task.dueDate);
        if (filters.deadline === 'with') return true;
        if (filters.deadline === 'overdue') return due < now;
        if (filters.deadline === 'upcoming') return due >= now;
        return true;
      });
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
    setFilters({ assignee: '', priority: '', tags: '', deadline: '' });
  };

  const hasActiveFilters = searchQuery || filters.assignee || filters.priority || filters.tags || filters.deadline;

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
            onCreateBoard={loadBoard}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#f3f6fb] via-white to-[#eef2f7] rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 lg:px-8 py-4 bg-white/95 backdrop-blur border-b border-slate-200 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="size-4 mr-2" />
              Назад
            </Button>
            <div className="h-6 border-l border-slate-200" />
            <h1 className="text-xl font-semibold text-slate-900">{currentBoard.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#eef2f7] text-sm font-semibold text-slate-700">
              {currentBoard.tasks.length} задач
            </span>
            <span className="px-3 py-1 rounded-full bg-[#eef2f7] text-sm font-semibold text-slate-700">
              {currentBoard.columns.length} колонок
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-3 bg-[#f2f4f8] border-b border-slate-200/70">
        <div className="flex flex-wrap items-center gap-2">
          <NavPill icon={LayoutDashboard} label="Доска" active />
          <NavPill icon={ListOrdered} label="Гант" />
          <NavPill icon={Calendar} label="Календарь" />
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="text-slate-600">
            <Plus className="size-4 mr-1" />
            Добавить
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
          <FilterPill
            icon={User}
            label="Все исполнители"
            value={filters.assignee}
            options={[
              { value: 'all', label: 'Все исполнители' },
              ...users.map(u => ({ value: u.id, label: u.name }))
            ]}
            onChange={(value) => setFilters(prev => ({ ...prev, assignee: value === 'all' ? '' : value }))}
          />
          <FilterPill
            icon={Clock}
            label="Все дедлайны"
            value={filters.deadline}
            options={[
              { value: 'all', label: 'Все дедлайны' },
              { value: 'with', label: 'Есть дата' },
              { value: 'without', label: 'Без даты' },
              { value: 'overdue', label: 'Просрочены' },
              { value: 'upcoming', label: 'Будущие' }
            ]}
            onChange={(value) => setFilters(prev => ({ ...prev, deadline: value === 'all' ? '' : value }))}
          />
          <FilterPill
            icon={BarChart3}
            label="Все приоритеты"
            value={filters.priority}
            options={[
              { value: 'all', label: 'Все приоритеты' },
              { value: 'low', label: 'Низкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'high', label: 'Высокий' },
              { value: 'urgent', label: 'Срочный' }
            ]}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value === 'all' ? '' : value }))}
          />
          <Button variant="outline" size="sm" className="h-11 rounded-xl border-slate-200 bg-white text-slate-700">
            <Plus className="size-4 mr-1" />
            Добавить фильтр
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 lg:px-6 pb-6 overflow-hidden">
        <div
          className="h-full rounded-2xl border border-slate-200 shadow-inner overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="h-full overflow-x-auto overflow-y-auto px-3">
            <div className="flex py-4" style={{ minWidth: 'max-content', gap: '26px' }}>
              {currentBoard.columns
                .sort((a, b) => a.order - b.order)
                .map((column, idx) => (
                  <ModernKanbanColumn
                    key={column.id}
                    column={column}
                    columnIndex={idx}
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

              <AddColumnCard onAddColumn={addColumn} />
            </div>
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
          {selectedTask && currentBoard && (() => {
            // Находим актуальную задачу из доски или используем selectedTask
            const currentTask = currentBoard.tasks.find(t => t.id === selectedTask.id);
            const taskToDisplay = currentTask || selectedTask;
            
            // Убеждаемся что все поля правильно заполнены
            const task: KanbanTask = {
              id: taskToDisplay.id,
              projectId: taskToDisplay.projectId,
              columnId: taskToDisplay.columnId,
              title: taskToDisplay.title || 'Без названия',
              description: taskToDisplay.description || '',
              assigneeId: taskToDisplay.assigneeId,
              assignee: taskToDisplay.assignee,
              dueDate: taskToDisplay.dueDate,
              priority: taskToDisplay.priority || 'medium',
              tags: taskToDisplay.tags || [],
              checklist: taskToDisplay.checklist || [],
              comments: taskToDisplay.comments || [],
              attachments: taskToDisplay.attachments || [],
              createdAt: taskToDisplay.createdAt,
              updatedAt: taskToDisplay.updatedAt,
              order: taskToDisplay.order || 0
            };
            
            return (
            <ModernTaskDetail
                task={task}
              onUpdateTask={(updates) => updateTask(selectedTask.id, updates)}
              onDeleteTask={() => {
                deleteTask(selectedTask.id);
                setSelectedTask(null);
              }}
              onClose={() => setSelectedTask(null)}
              users={users}
                columns={currentBoard.columns.map(col => ({ id: col.id, title: col.title, stage: col.stage }))}
            />
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NavPill({ icon: Icon, label, active = false }: { icon: React.ElementType; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2 h-11 px-4 rounded-2xl border text-base font-semibold transition-all',
        active
          ? 'bg-[#eef4ff] text-[#2f5fd4] border-[#d7e2ff] shadow-[0_6px_16px_rgba(47,95,212,0.18)]'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm'
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function FilterPill({
  icon: Icon,
  label,
  value,
  options,
  onChange
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || 'all'} onValueChange={onChange}>
      <SelectTrigger className="h-11 min-w-[180px] rounded-xl border-[#d9deeb] bg-[#f7f8fb] shadow-sm px-3">
        <div className="flex items-center gap-2 w-full text-slate-700 font-semibold">
          <Icon className="size-4" />
          <span className="flex-1 text-left truncate">
            <SelectValue placeholder={label} />
          </span>
          <SlidersHorizontal className="size-4 text-slate-400" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
