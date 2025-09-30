import { apiService } from '../client';
import { API_ENDPOINTS, PaginatedResponse } from '../config';
import { KanbanBoard, KanbanTask, KanbanColumn } from '../../types';

export class ProductionService {
  // Get all production boards
  async getBoards(): Promise<KanbanBoard[]> {
    const response = await apiService.get<KanbanBoard[]>(API_ENDPOINTS.production.boards);
    return response.data;
  }

  // Get single board by ID
  async getBoard(id: string): Promise<KanbanBoard> {
    const response = await apiService.get<KanbanBoard>(API_ENDPOINTS.production.board(id));
    return response.data;
  }

  // Create new board
  async createBoard(boardData: Omit<KanbanBoard, 'id' | 'createdAt' | 'updatedAt'>): Promise<KanbanBoard> {
    const response = await apiService.post<KanbanBoard>(
      API_ENDPOINTS.production.boards,
      boardData
    );
    return response.data;
  }

  // Update board
  async updateBoard(id: string, boardData: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const response = await apiService.put<KanbanBoard>(
      API_ENDPOINTS.production.board(id),
      boardData
    );
    return response.data;
  }

  // Delete board
  async deleteBoard(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.production.board(id));
  }

  // Get board tasks
  async getBoardTasks(boardId: string): Promise<KanbanTask[]> {
    const response = await apiService.get<KanbanTask[]>(
      `${API_ENDPOINTS.production.board(boardId)}/tasks`
    );
    return response.data;
  }

  // Get single task
  async getTask(id: string): Promise<KanbanTask> {
    const response = await apiService.get<KanbanTask>(API_ENDPOINTS.production.task(id));
    return response.data;
  }

  // Create new task
  async createTask(taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<KanbanTask> {
    const response = await apiService.post<KanbanTask>(
      API_ENDPOINTS.production.tasks,
      taskData
    );
    return response.data;
  }

  // Update task
  async updateTask(id: string, taskData: Partial<KanbanTask>): Promise<KanbanTask> {
    const response = await apiService.put<KanbanTask>(
      API_ENDPOINTS.production.task(id),
      taskData
    );
    return response.data;
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.production.task(id));
  }

  // Move task between columns
  async moveTask(
    taskId: string, 
    fromColumnId: string, 
    toColumnId: string, 
    newPosition: number
  ): Promise<KanbanTask> {
    const response = await apiService.patch<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/move`,
      {
        fromColumnId,
        toColumnId,
        newPosition,
      }
    );
    return response.data;
  }

  // Update task status
  async updateTaskStatus(taskId: string, status: KanbanTask['status']): Promise<KanbanTask> {
    const response = await apiService.patch<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/status`,
      { status }
    );
    return response.data;
  }

  // Assign task to user
  async assignTask(taskId: string, assigneeId: string): Promise<KanbanTask> {
    const response = await apiService.patch<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/assign`,
      { assigneeId }
    );
    return response.data;
  }

  // Add task comment
  async addTaskComment(taskId: string, comment: string, authorId: string): Promise<KanbanTask> {
    const response = await apiService.post<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/comments`,
      { comment, authorId }
    );
    return response.data;
  }

  // Update task checklist
  async updateTaskChecklist(taskId: string, checklist: KanbanTask['checklist']): Promise<KanbanTask> {
    const response = await apiService.patch<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/checklist`,
      { checklist }
    );
    return response.data;
  }

  // Add task attachment
  async addTaskAttachment(
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<KanbanTask> {
    const response = await apiService.upload<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/attachments`,
      file,
      onProgress
    );
    return response.data;
  }

  // Remove task attachment
  async removeTaskAttachment(taskId: string, attachmentId: string): Promise<KanbanTask> {
    const response = await apiService.delete<KanbanTask>(
      `${API_ENDPOINTS.production.task(taskId)}/attachments/${attachmentId}`
    );
    return response.data;
  }

  // Get board columns
  async getBoardColumns(boardId: string): Promise<KanbanColumn[]> {
    const response = await apiService.get<KanbanColumn[]>(
      `${API_ENDPOINTS.production.board(boardId)}/columns`
    );
    return response.data;
  }

  // Create board column
  async createBoardColumn(
    boardId: string, 
    columnData: Omit<KanbanColumn, 'id' | 'tasks'>
  ): Promise<KanbanColumn> {
    const response = await apiService.post<KanbanColumn>(
      `${API_ENDPOINTS.production.board(boardId)}/columns`,
      columnData
    );
    return response.data;
  }

  // Update board column
  async updateBoardColumn(
    boardId: string, 
    columnId: string, 
    columnData: Partial<KanbanColumn>
  ): Promise<KanbanColumn> {
    const response = await apiService.put<KanbanColumn>(
      `${API_ENDPOINTS.production.board(boardId)}/columns/${columnId}`,
      columnData
    );
    return response.data;
  }

  // Delete board column
  async deleteBoardColumn(boardId: string, columnId: string): Promise<void> {
    await apiService.delete(
      `${API_ENDPOINTS.production.board(boardId)}/columns/${columnId}`
    );
  }
}

// Export singleton instance
export const productionService = new ProductionService();
