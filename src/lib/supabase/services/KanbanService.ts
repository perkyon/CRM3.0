import { supabase, TABLES } from '../config';
import { KanbanBoard, KanbanColumn, KanbanTask } from '../../../types';
import { handleApiError } from '../../error/ErrorHandler';

export interface CreateKanbanBoardRequest {
  projectId: string;
  title: string;
  description?: string;
}

export interface UpdateKanbanBoardRequest {
  title?: string;
  description?: string;
}

export interface CreateKanbanColumnRequest {
  boardId: string;
  title: string;
  position: number;
}

export interface UpdateKanbanColumnRequest {
  title?: string;
  position?: number;
}

export interface CreateKanbanTaskRequest {
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  position: number;
  tags?: string[];
}

export interface UpdateKanbanTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  position?: number;
  columnId?: string;
  tags?: string[];
  status?: 'todo' | 'in_progress' | 'review' | 'done';
}

export class SupabaseKanbanService {
  // ==================== KANBAN BOARDS ====================
  
  // Get all boards for a project
  async getProjectBoards(projectId: string): Promise<KanbanBoard[]> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .select(`
        *,
        columns:kanban_columns(
          *,
          tasks:kanban_tasks(
            *,
            assignee:users!kanban_tasks_assignee_id_fkey(id, name, email, avatar),
            comments:task_comments(
              *,
              author:users!task_comments_author_id_fkey(id, name, avatar)
            ),
            attachments:task_attachments(*),
            checklist:checklist_items(*)
          )
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.getProjectBoards');
    }

    return data || [];
  }

  // Get single board by ID
  async getBoard(id: string): Promise<KanbanBoard> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .select(`
        *,
        columns:kanban_columns(
          *,
          tasks:kanban_tasks(
            *,
            assignee:users!kanban_tasks_assignee_id_fkey(id, name, email, avatar),
            comments:task_comments(
              *,
              author:users!task_comments_author_id_fkey(id, name, avatar)
            ),
            attachments:task_attachments(*),
            checklist:checklist_items(*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.getBoard');
    }

    return data;
  }

  // Create new board
  async createBoard(boardData: CreateKanbanBoardRequest): Promise<KanbanBoard> {
    const { data: board, error: boardError } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .insert({
        project_id: boardData.projectId,
        title: boardData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (boardError) {
      throw handleApiError(boardError, 'SupabaseKanbanService.createBoard');
    }

    // Create default columns
    const defaultColumns = [
      { title: 'К выполнению', position: 0, color: '#6b7280' },
      { title: 'В работе', position: 1, color: '#3b82f6' },
      { title: 'На проверке', position: 2, color: '#f59e0b' },
      { title: 'Завершено', position: 3, color: '#10b981' },
    ];

    const { error: columnsError } = await supabase
      .from(TABLES.KANBAN_COLUMNS)
      .insert(
        defaultColumns.map(col => ({
          board_id: board.id,
          title: col.title,
          stage: col.title.toLowerCase().replace(/\s+/g, '_'),
          position: col.position,
          created_at: new Date().toISOString(),
        }))
      );

    if (columnsError) {
      console.error('Failed to create default columns:', columnsError);
      // Don't throw error, board creation should still succeed
    }

    return this.getBoard(board.id);
  }

  // Update board
  async updateBoard(id: string, boardData: UpdateKanbanBoardRequest): Promise<KanbanBoard> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .update({
        ...boardData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.updateBoard');
    }

    return this.getBoard(id);
  }

  // Delete board
  async deleteBoard(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .delete()
      .eq('id', id);

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.deleteBoard');
    }
  }

  // ==================== KANBAN COLUMNS ====================
  
  // Create new column
  async createColumn(columnData: CreateKanbanColumnRequest): Promise<KanbanColumn> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_COLUMNS)
      .insert({
        board_id: columnData.boardId,
        title: columnData.title,
        stage: columnData.title.toLowerCase().replace(/\s+/g, '_'),
        position: columnData.position,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.createColumn');
    }

    return data;
  }

  // Update column
  async updateColumn(id: string, columnData: UpdateKanbanColumnRequest): Promise<KanbanColumn> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_COLUMNS)
      .update({
        ...columnData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.updateColumn');
    }

    return data;
  }

  // Delete column
  async deleteColumn(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.KANBAN_COLUMNS)
      .delete()
      .eq('id', id);

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.deleteColumn');
    }
  }

  // Reorder columns
  async reorderColumns(boardId: string, columnOrders: { id: string; position: number }[]): Promise<void> {
    const updates = columnOrders.map(({ id, position }) => 
      supabase
        .from(TABLES.KANBAN_COLUMNS)
        .update({ position, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    for (const { error } of results) {
      if (error) {
        throw handleApiError(error, 'SupabaseKanbanService.reorderColumns');
      }
    }
  }

  // ==================== KANBAN TASKS ====================
  
  // Create new task
  async createTask(taskData: CreateKanbanTaskRequest): Promise<KanbanTask> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_TASKS)
      .insert({
        column_id: taskData.columnId,
        title: taskData.title,
        description: taskData.description,
        assignee_id: taskData.assigneeId,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        position: taskData.position,
        tags: taskData.tags || [],
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        assignee:users!kanban_tasks_assignee_id_fkey(id, name, email, avatar),
        comments:task_comments(
          *,
          author:users!task_comments_author_id_fkey(id, name, avatar)
        ),
        attachments:task_attachments(*),
        checklist:checklist_items(*)
      `)
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.createTask');
    }

    return data;
  }

  // Update task
  async updateTask(id: string, taskData: UpdateKanbanTaskRequest): Promise<KanbanTask> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_TASKS)
      .update({
        ...taskData,
        column_id: taskData.columnId,
        assignee_id: taskData.assigneeId,
        due_date: taskData.dueDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        assignee:users!kanban_tasks_assignee_id_fkey(id, name, email, avatar),
        comments:task_comments(
          *,
          author:users!task_comments_author_id_fkey(id, name, avatar)
        ),
        attachments:task_attachments(*),
        checklist:checklist_items(*)
      `)
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.updateTask');
    }

    return data;
  }

  // Move task to different column
  async moveTask(taskId: string, newColumnId: string, newPosition: number): Promise<KanbanTask> {
    return this.updateTask(taskId, {
      columnId: newColumnId,
      position: newPosition,
    });
  }

  // Get single task with all relations
  async getTask(id: string): Promise<KanbanTask> {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_TASKS)
      .select(`
        *,
        assignee:users!kanban_tasks_assignee_id_fkey(id, name, email, avatar),
        comments:task_comments(
          *,
          author:users!task_comments_author_id_fkey(id, name, avatar)
        ),
        attachments:task_attachments(*),
        checklist:checklist_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.getTask');
    }

    return data;
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.KANBAN_TASKS)
      .delete()
      .eq('id', id);

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.deleteTask');
    }
  }

  // Reorder tasks within column
  async reorderTasks(columnId: string, taskOrders: { id: string; position: number }[]): Promise<void> {
    const updates = taskOrders.map(({ id, position }) => 
      supabase
        .from(TABLES.KANBAN_TASKS)
        .update({ position, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    for (const { error } of results) {
      if (error) {
        throw handleApiError(error, 'SupabaseKanbanService.reorderTasks');
      }
    }
  }

  // ==================== TASK COMMENTS ====================
  
  // Add comment to task
  async addTaskComment(taskId: string, content: string, authorId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.TASK_COMMENTS)
      .insert({
        task_id: taskId,
        content,
        author_id: authorId,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.addTaskComment');
    }
  }

  // ==================== TASK ATTACHMENTS ====================
  
  // Upload task attachment
  async uploadTaskAttachment(
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file, {
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress(progress.loaded / progress.total * 100);
          }
        },
      });

    if (uploadError) {
      throw handleApiError(uploadError, 'SupabaseKanbanService.uploadTaskAttachment');
    }

    const { data: urlData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(fileName);

    const { error: attachmentError } = await supabase
      .from(TABLES.TASK_ATTACHMENTS)
      .insert({
        task_id: taskId,
        name: file.name,
        original_name: file.name,
        type: fileExt || 'unknown',
        size: file.size,
        url: urlData.publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
      });

    if (attachmentError) {
      throw handleApiError(attachmentError, 'SupabaseKanbanService.uploadTaskAttachment');
    }
  }

  // ==================== CHECKLIST ITEMS ====================
  
  // Add checklist item to task
  async addChecklistItem(taskId: string, text: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CHECKLIST_ITEMS)
      .insert({
        task_id: taskId,
        text,
        completed: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.addChecklistItem');
    }
  }

  // Toggle checklist item completion
  async toggleChecklistItem(itemId: string, completed: boolean): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CHECKLIST_ITEMS)
      .update({ 
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) {
      throw handleApiError(error, 'SupabaseKanbanService.toggleChecklistItem');
    }
  }
}

export const supabaseKanbanService = new SupabaseKanbanService();
