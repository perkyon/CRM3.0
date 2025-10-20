import { supabase } from '../config';
import { ProductionItem, ProductionMaterial, ProductionSpecs, KanbanTask } from '../../../types';

/**
 * Service for managing production items (furniture and components)
 */
export const supabaseProductionItemService = {
  /**
   * Get all production items for a project with their tasks
   */
  async getProjectProductionTree(projectId: string): Promise<ProductionItem[]> {
    try {
      // Fetch production items
      const { data: items, error: itemsError } = await supabase
        .from('production_items')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        return [];
      }

      // Fetch tasks for these items
      const itemIds = items.map(item => item.id);
      const { data: tasks, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select('*')
        .in('production_item_id', itemIds)
        .order('position', { ascending: true });

      if (tasksError) throw tasksError;

      // Build tree structure
      const itemsMap = new Map<string, ProductionItem>();
      
      // Convert DB format to app format
      items.forEach(item => {
        itemsMap.set(item.id, {
          id: item.id,
          projectId: item.project_id,
          parentId: item.parent_id,
          type: item.type,
          code: item.code,
          name: item.name,
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit || 'шт',
          material: item.material as ProductionMaterial,
          specs: item.specs as ProductionSpecs,
          progressPercent: item.progress_percent || 0,
          position: item.position || 0,
          status: item.status || 'planned',
          notes: item.notes,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          children: [],
          tasks: []
        });
      });

      // Attach tasks to items
      if (tasks) {
        tasks.forEach(task => {
          if (task.production_item_id) {
            const item = itemsMap.get(task.production_item_id);
            if (item) {
              item.tasks = item.tasks || [];
              item.tasks.push({
                id: task.id,
                projectId: task.board_id, // Map from board to project
                columnId: task.column_id,
                title: task.title,
                description: task.description,
                assigneeId: task.assignee_id,
                dueDate: task.due_date,
                priority: task.priority,
                tags: task.tags || [],
                checklist: [],
                attachments: [],
                comments: [],
                createdAt: task.created_at,
                updatedAt: task.updated_at,
                order: task.position || 0
              } as KanbanTask);
            }
          }
        });
      }

      // Build hierarchy
      const rootItems: ProductionItem[] = [];
      
      itemsMap.forEach(item => {
        if (item.parentId) {
          const parent = itemsMap.get(item.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });

      return rootItems;
    } catch (error) {
      console.error('Error fetching production tree:', error);
      throw error;
    }
  },

  /**
   * Create a new production item
   */
  async createItem(item: Omit<ProductionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductionItem> {
    try {
      const { data, error } = await supabase
        .from('production_items')
        .insert({
          project_id: item.projectId,
          parent_id: item.parentId,
          type: item.type,
          code: item.code,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          material: item.material || {},
          specs: item.specs || {},
          progress_percent: item.progressPercent || 0,
          position: item.position || 0,
          status: item.status || 'planned',
          notes: item.notes
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        projectId: data.project_id,
        parentId: data.parent_id,
        type: data.type,
        code: data.code,
        name: data.name,
        quantity: parseFloat(data.quantity) || 1,
        unit: data.unit,
        material: data.material,
        specs: data.specs,
        progressPercent: data.progress_percent || 0,
        position: data.position || 0,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        children: [],
        tasks: []
      };
    } catch (error) {
      console.error('Error creating production item:', error);
      throw error;
    }
  },

  /**
   * Update a production item
   */
  async updateItem(id: string, updates: Partial<ProductionItem>): Promise<ProductionItem> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.code !== undefined) updateData.code = updates.code;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.unit !== undefined) updateData.unit = updates.unit;
      if (updates.material !== undefined) updateData.material = updates.material;
      if (updates.specs !== undefined) updateData.specs = updates.specs;
      if (updates.progressPercent !== undefined) updateData.progress_percent = updates.progressPercent;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('production_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        projectId: data.project_id,
        parentId: data.parent_id,
        type: data.type,
        code: data.code,
        name: data.name,
        quantity: parseFloat(data.quantity) || 1,
        unit: data.unit,
        material: data.material,
        specs: data.specs,
        progressPercent: data.progress_percent || 0,
        position: data.position || 0,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating production item:', error);
      throw error;
    }
  },

  /**
   * Delete a production item (and its children)
   */
  async deleteItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('production_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting production item:', error);
      throw error;
    }
  },

  /**
   * Link a task to a production item
   */
  async linkTaskToItem(taskId: string, itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ production_item_id: itemId })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking task to item:', error);
      throw error;
    }
  },

  /**
   * Calculate progress based on completed tasks
   */
  calculateItemProgress(item: ProductionItem): number {
    if (!item.tasks || item.tasks.length === 0) {
      return 0;
    }

    const completedTasks = item.tasks.filter(task => 
      task.columnId && task.columnId.includes('done') // Assuming done column has 'done' in ID
    ).length;

    return Math.round((completedTasks / item.tasks.length) * 100);
  }
};

