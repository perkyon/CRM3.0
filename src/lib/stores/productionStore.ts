import { create } from 'zustand';
import { KanbanBoard, KanbanTask, KanbanColumn } from '../../types';
import { productionService } from '../api/services';

interface ProductionState {
  // State
  boards: KanbanBoard[];
  selectedBoard: KanbanBoard | null;
  selectedTask: KanbanTask | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (boardData: Omit<KanbanBoard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<KanbanBoard>;
  updateBoard: (id: string, boardData: Partial<KanbanBoard>) => Promise<KanbanBoard>;
  deleteBoard: (id: string) => Promise<void>;
  
  // Task actions
  fetchTask: (id: string) => Promise<void>;
  createTask: (taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<KanbanTask>;
  updateTask: (id: string, taskData: Partial<KanbanTask>) => Promise<KanbanTask>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => Promise<void>;
  updateTaskStatus: (taskId: string, status: KanbanTask['status']) => Promise<void>;
  assignTask: (taskId: string, assigneeId: string) => Promise<void>;
  addTaskComment: (taskId: string, comment: string, authorId: string) => Promise<void>;
  updateTaskChecklist: (taskId: string, checklist: KanbanTask['checklist']) => Promise<void>;
  addTaskAttachment: (taskId: string, file: File, onProgress?: (progress: number) => void) => Promise<void>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  
  // Column actions
  createColumn: (boardId: string, columnData: Omit<KanbanColumn, 'id' | 'tasks'>) => Promise<KanbanColumn>;
  updateColumn: (boardId: string, columnId: string, columnData: Partial<KanbanColumn>) => Promise<KanbanColumn>;
  deleteColumn: (boardId: string, columnId: string) => Promise<void>;
  
  // UI actions
  setSelectedBoard: (board: KanbanBoard | null) => void;
  setSelectedTask: (task: KanbanTask | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  // Initial state
  boards: [],
  selectedBoard: null,
  selectedTask: null,
  isLoading: false,
  error: null,

  // Actions
  fetchBoards: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const boards = await productionService.getBoards();
      
      set({
        boards,
        isLoading: false,
      });
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки досок',
      });
      throw error;
    }
  },

  fetchBoard: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const board = await productionService.getBoard(id);
      
      set({
        selectedBoard: board,
        isLoading: false,
      });
      
      // Update board in boards list if it exists
      const { boards } = get();
      const boardIndex = boards.findIndex(b => b.id === id);
      if (boardIndex !== -1) {
        const updatedBoards = [...boards];
        updatedBoards[boardIndex] = board;
        set({ boards: updatedBoards });
      }
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки доски',
      });
      throw error;
    }
  },

  createBoard: async (boardData: Omit<KanbanBoard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      set({ isLoading: true, error: null });
      
      const newBoard = await productionService.createBoard(boardData);
      
      set((state) => ({
        boards: [...state.boards, newBoard],
        isLoading: false,
      }));
      
      return newBoard;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка создания доски',
      });
      throw error;
    }
  },

  updateBoard: async (id: string, boardData: Partial<KanbanBoard>) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedBoard = await productionService.updateBoard(id, boardData);
      
      set((state) => ({
        boards: state.boards.map(board =>
          board.id === id ? updatedBoard : board
        ),
        selectedBoard: state.selectedBoard?.id === id ? updatedBoard : state.selectedBoard,
        isLoading: false,
      }));
      
      return updatedBoard;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления доски',
      });
      throw error;
    }
  },

  deleteBoard: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await productionService.deleteBoard(id);
      
      set((state) => ({
        boards: state.boards.filter(board => board.id !== id),
        selectedBoard: state.selectedBoard?.id === id ? null : state.selectedBoard,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления доски',
      });
      throw error;
    }
  },

  // Task actions
  fetchTask: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const task = await productionService.getTask(id);
      
      set({
        selectedTask: task,
        isLoading: false,
      });
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки задачи',
      });
      throw error;
    }
  },

  createTask: async (taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      set({ isLoading: true, error: null });
      
      const newTask = await productionService.createTask(taskData);
      
      // Update the board with the new task
      set((state) => ({
        boards: state.boards.map(board => {
          if (board.id === newTask.boardId) {
            return {
              ...board,
              tasks: [...board.tasks, newTask],
            };
          }
          return board;
        }),
        selectedBoard: state.selectedBoard?.id === newTask.boardId 
          ? {
              ...state.selectedBoard,
              tasks: [...state.selectedBoard.tasks, newTask],
            }
          : state.selectedBoard,
        isLoading: false,
      }));
      
      return newTask;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка создания задачи',
      });
      throw error;
    }
  },

  updateTask: async (id: string, taskData: Partial<KanbanTask>) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.updateTask(id, taskData);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === id ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === id ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
      return updatedTask;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления задачи',
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await productionService.deleteTask(id);
      
      // Remove task from boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.filter(task => task.id !== id),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.filter(task => task.id !== id),
        } : null,
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления задачи',
      });
      throw error;
    }
  },

  moveTask: async (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.moveTask(taskId, fromColumnId, toColumnId, newPosition);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка перемещения задачи',
      });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string, status: KanbanTask['status']) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.updateTaskStatus(taskId, status);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления статуса задачи',
      });
      throw error;
    }
  },

  assignTask: async (taskId: string, assigneeId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.assignTask(taskId, assigneeId);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка назначения задачи',
      });
      throw error;
    }
  },

  addTaskComment: async (taskId: string, comment: string, authorId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.addTaskComment(taskId, comment, authorId);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка добавления комментария',
      });
      throw error;
    }
  },

  updateTaskChecklist: async (taskId: string, checklist: KanbanTask['checklist']) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.updateTaskChecklist(taskId, checklist);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления чек-листа',
      });
      throw error;
    }
  },

  addTaskAttachment: async (taskId: string, file: File, onProgress?: (progress: number) => void) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.addTaskAttachment(taskId, file, onProgress);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки файла',
      });
      throw error;
    }
  },

  removeTaskAttachment: async (taskId: string, attachmentId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedTask = await productionService.removeTaskAttachment(taskId, attachmentId);
      
      // Update task in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          tasks: state.selectedBoard.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          ),
        } : null,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления файла',
      });
      throw error;
    }
  },

  // Column actions
  createColumn: async (boardId: string, columnData: Omit<KanbanColumn, 'id' | 'tasks'>) => {
    try {
      set({ isLoading: true, error: null });
      
      const newColumn = await productionService.createBoardColumn(boardId, columnData);
      
      // Update board with new column
      set((state) => ({
        boards: state.boards.map(board => {
          if (board.id === boardId) {
            return {
              ...board,
              columns: [...board.columns, newColumn],
            };
          }
          return board;
        }),
        selectedBoard: state.selectedBoard?.id === boardId 
          ? {
              ...state.selectedBoard,
              columns: [...state.selectedBoard.columns, newColumn],
            }
          : state.selectedBoard,
        isLoading: false,
      }));
      
      return newColumn;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка создания колонки',
      });
      throw error;
    }
  },

  updateColumn: async (boardId: string, columnId: string, columnData: Partial<KanbanColumn>) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedColumn = await productionService.updateBoardColumn(boardId, columnId, columnData);
      
      // Update column in boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.map(column =>
            column.id === columnId ? updatedColumn : column
          ),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          columns: state.selectedBoard.columns.map(column =>
            column.id === columnId ? updatedColumn : column
          ),
        } : null,
        isLoading: false,
      }));
      
      return updatedColumn;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления колонки',
      });
      throw error;
    }
  },

  deleteColumn: async (boardId: string, columnId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await productionService.deleteBoardColumn(boardId, columnId);
      
      // Remove column from boards
      set((state) => ({
        boards: state.boards.map(board => ({
          ...board,
          columns: board.columns.filter(column => column.id !== columnId),
        })),
        selectedBoard: state.selectedBoard ? {
          ...state.selectedBoard,
          columns: state.selectedBoard.columns.filter(column => column.id !== columnId),
        } : null,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления колонки',
      });
      throw error;
    }
  },

  // UI actions
  setSelectedBoard: (board: KanbanBoard | null) => {
    set({ selectedBoard: board });
  },

  setSelectedTask: (task: KanbanTask | null) => {
    set({ selectedTask: task });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
