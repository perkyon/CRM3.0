import { supabase, TABLES } from '../config';
import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectSearchParams } from '../../../types';
import { PaginatedResponse } from '../../api/config';
import { handleApiError } from '../../error/ErrorHandler';

export class SupabaseProjectService {
  // Get all projects with pagination and filters
  async getProjects(params?: ProjectSearchParams): Promise<PaginatedResponse<Project>> {
    const { page = 1, limit = 20, search, stage, priority, clientId, managerId } = params || {};
    
    let query = supabase
      .from(TABLES.PROJECTS)
      .select('*, code')
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,site_address.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (stage) {
      query = query.eq('stage', stage);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (managerId) {
      query = query.eq('manager_id', managerId);
    }

    const { data, error, count } = await query;

    if (error) {
      // Check for network/CORS errors
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('Сетевое соединение потеряно') ||
          error.message?.includes('access control checks')) {
        // Try to refresh session and retry once
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Session expired, try to refresh
            await supabase.auth.refreshSession();
          }
        } catch (refreshError) {
          console.warn('Failed to refresh session:', refreshError);
        }
        // Re-throw original error after refresh attempt
      }
      throw handleApiError(error, 'SupabaseProjectService.getProjects');
    }

    // Transform snake_case to camelCase
    const transformedData = (data || []).map(project => ({
      ...project,
      clientId: project.client_id,
      siteAddress: project.site_address,
      managerId: project.manager_id,
      foremanId: project.foreman_id,
      startDate: project.start_date,
      dueDate: project.due_date,
      productionSubStage: project.production_sub_stage,
      riskNotes: project.risk_notes,
      briefComplete: project.brief_complete,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // Get single project by ID
  async getProject(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*, code')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    // Transform snake_case to camelCase
    return {
      ...project,
      clientId: project.client_id,
      siteAddress: project.site_address,
      managerId: project.manager_id,
      foremanId: project.foreman_id,
      startDate: project.start_date,
      dueDate: project.due_date,
      productionSubStage: project.production_sub_stage,
      riskNotes: project.risk_notes,
      briefComplete: project.brief_complete,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const { documents, ...projectInfo } = projectData;

    // Create project with simplified data
    const projectToInsert = {
      title: projectInfo.title,
      client_id: projectInfo.clientId,
      site_address: projectInfo.siteAddress || '',
      manager_id: projectInfo.managerId || '9fc4d042-f598-487c-a383-cccfe0e219db',
      foreman_id: projectInfo.foremanId || null,
      start_date: projectInfo.startDate || null,
      due_date: projectInfo.dueDate || null,
      budget: projectInfo.budget || 0,
      priority: projectInfo.priority || 'medium',
      stage: projectInfo.stage || 'brief',
      production_sub_stage: projectInfo.productionSubStage || null,
      risk_notes: projectInfo.riskNotes || null,
      brief_complete: projectInfo.briefComplete || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };


    console.log('📝 Creating project with data:', projectToInsert);
    
    const { data: project, error: projectError } = await supabase
      .from(TABLES.PROJECTS)
      .insert(projectToInsert)
      .select()
      .single();

    if (projectError) {
      console.error('❌ Project creation error:', projectError);
      console.error('Error details:', {
        message: projectError.message,
        details: projectError.details,
        hint: projectError.hint,
        code: projectError.code
      });
      throw new Error(`Failed to create project: ${projectError.message}. ${projectError.hint || ''}`);
    }

    if (!project) {
      console.error('❌ Project created but no data returned');
      throw new Error('Failed to create project - no data returned. Check RLS policies or run add-project-code.sql');
    }
    
    console.log('✅ Project created successfully:', project);

    // Create default kanban board
    const { data: board, error: boardError } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .insert({
        project_id: project.id,
        title: `${project.title} - Производство`,
      })
      .select()
      .single();

    if (boardError) {
      console.error('Failed to create kanban board:', boardError);
      console.error('Board error details:', boardError.message, boardError.details, boardError.hint);
    } else {
      // Create default columns
      const defaultColumns = [
        { title: 'К выполнению', stage: 'todo', position: 0 },
        { title: 'В работе', stage: 'in_progress', position: 1 },
        { title: 'На проверке', stage: 'review', position: 2 },
        { title: 'Завершено', stage: 'done', position: 3 },
      ];

      const columnsData = defaultColumns.map(col => ({
        ...col,
        board_id: board.id,
        created_at: new Date().toISOString(),
      }));

      await supabase
        .from(TABLES.KANBAN_COLUMNS)
        .insert(columnsData);
    }

    // Update client projects count
    await this.updateClientProjectsCount(project.client_id);

    // Return simplified project data for now
    return {
      ...project,
      clientId: project.client_id,
      siteAddress: project.site_address,
      managerId: project.manager_id,
      foremanId: project.foreman_id,
      startDate: project.start_date,
      dueDate: project.due_date,
      productionSubStage: project.production_sub_stage,
      riskNotes: project.risk_notes,
      briefComplete: project.brief_complete,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      // Add mock related data
      client: { id: project.client_id, name: 'Mock Client', company: 'Mock Company', type: 'ООО' as const },
      manager: { id: project.manager_id, name: 'Mock Manager', email: 'manager@example.com' },
      foreman: project.foreman_id ? { id: project.foreman_id, name: 'Mock Foreman', email: 'foreman@example.com' } : undefined,
      documents: [],
      kanbanBoards: [],
    };
  }

  // Update existing project
  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<Project> {
    const { documents, code, ...projectInfo } = projectData as any;

    // Build update object, filtering out undefined values
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (projectInfo.title !== undefined) updateData.title = projectInfo.title;
    if (projectInfo.siteAddress !== undefined) updateData.site_address = projectInfo.siteAddress;
    if (projectInfo.clientId !== undefined) updateData.client_id = projectInfo.clientId;
    if (projectInfo.managerId !== undefined) updateData.manager_id = projectInfo.managerId;
    if (projectInfo.foremanId !== undefined) updateData.foreman_id = projectInfo.foremanId;
    if (projectInfo.startDate !== undefined) updateData.start_date = projectInfo.startDate;
    if (projectInfo.dueDate !== undefined) updateData.due_date = projectInfo.dueDate;
    if (projectInfo.budget !== undefined) updateData.budget = projectInfo.budget;
    if (projectInfo.priority !== undefined) updateData.priority = projectInfo.priority;
    if (projectInfo.stage !== undefined) updateData.stage = projectInfo.stage;
    if (projectInfo.productionSubStage !== undefined) updateData.production_sub_stage = projectInfo.productionSubStage;
    if (projectInfo.riskNotes !== undefined) updateData.risk_notes = projectInfo.riskNotes;
    if (projectInfo.briefComplete !== undefined) updateData.brief_complete = projectInfo.briefComplete;

    // Update project basic info (code is read-only, managed by DB trigger)
    const { error: projectError } = await supabase
      .from(TABLES.PROJECTS)
      .update(updateData)
      .eq('id', id);

    if (projectError) {
      throw new Error(`Failed to update project: ${projectError.message}`);
    }

    // Return updated project
    return this.getProject(id);
  }

  // Delete project
  async deleteProject(id: string): Promise<void> {
    // Get project info first
    const { data: project } = await supabase
      .from(TABLES.PROJECTS)
      .select('client_id')
      .eq('id', id)
      .single();

    // Delete related data first
    await supabase.from(TABLES.PROJECT_DOCUMENTS).delete().eq('project_id', id);
    
    // Delete kanban data
    const { data: boards } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .select('id')
      .eq('project_id', id);

    if (boards && boards.length > 0) {
      const boardIds = boards.map(b => b.id);
      
      // Delete tasks
      await supabase
        .from(TABLES.KANBAN_TASKS)
        .delete()
        .in('board_id', boardIds);
      
      // Delete columns
      await supabase
        .from(TABLES.KANBAN_COLUMNS)
        .delete()
        .in('board_id', boardIds);
      
      // Delete boards
      await supabase
        .from(TABLES.KANBAN_BOARDS)
        .delete()
        .eq('project_id', id);
    }

    // Delete project
    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    // Update client projects count
    if (project?.client_id) {
      await this.updateClientProjectsCount(project.client_id);
    }
  }

  // Update project stage
  async updateProjectStage(id: string, stage: Project['stage'], subStage?: Project['productionSubStage']): Promise<Project> {
    const updateData: any = {
      stage,
      updated_at: new Date().toISOString(),
    };

    if (subStage !== undefined) {
      updateData.production_sub_stage = subStage;
    }

    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update project stage: ${error.message}`);
    }

    return this.getProject(id);
  }

  // Get project documents
  async getProjectDocuments(projectId: string): Promise<Project['documents']> {
    // Проверяем и обновляем сессию перед запросом
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Пытаемся обновить сессию
      await supabase.auth.refreshSession();
    }

    const { data, error } = await supabase
      .from(TABLES.PROJECT_DOCUMENTS)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      // Если ошибка связана с доступом, пытаемся обновить сессию и повторить
      if (error.message?.includes('access control') || error.message?.includes('Сетевое соединение')) {
        try {
          await supabase.auth.refreshSession();
          // Повторяем запрос после обновления сессии
          const { data: retryData, error: retryError } = await supabase
            .from(TABLES.PROJECT_DOCUMENTS)
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });
          
          if (retryError) throw retryError;
          return retryData || [];
        } catch (refreshError) {
          console.error('Failed to refresh session and retry:', refreshError);
        }
      }
      throw new Error(`Failed to fetch project documents: ${error.message}`);
    }

    return data || [];
  }

  // Upload project document
  async uploadProjectDocument(
    projectId: string,
    file: File,
    category: string = 'other',
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<Project['documents'][0]> {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    const fileName = `${projectId}/${Date.now()}.${fileExt}`;
    
    // Маппинг расширений к типам enum
    const typeMapping: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
      'dwg': 'dwg',
      'dxf': 'dxf',
      '3dm': '3dm',
      'step': 'step',
      'iges': 'iges',
      'jpg': 'jpg',
      'jpeg': 'jpeg',
      'png': 'png',
      'gif': 'gif',
      'mp4': 'mp4',
      'avi': 'avi',
      'mov': 'mov',
      'zip': 'zip',
      'rar': 'rar',
      'txt': 'txt',
    };
    
    const documentType = typeMapping[fileExt] || 'other';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(fileName, file, {
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress(progress.loaded / progress.total * 100);
          }
        },
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-documents')
      .getPublicUrl(fileName);

    // Save document record
    const documentData = {
      project_id: projectId,
      name: file.name,
      original_name: file.name,
      type: documentType,
      category,
      size: file.size,
      url: urlData.publicUrl,
      description: description || null,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      created_at: new Date().toISOString(),
    };

    const { data: document, error: documentError } = await supabase
      .from(TABLES.PROJECT_DOCUMENTS)
      .insert(documentData)
      .select()
      .single();

    if (documentError) {
      throw new Error(`Failed to save document record: ${documentError.message}`);
    }

    return document;
  }

  // Delete project document
  async deleteProjectDocument(projectId: string, documentId: string): Promise<void> {
    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from(TABLES.PROJECT_DOCUMENTS)
      .select('url')
      .eq('id', documentId)
      .eq('project_id', projectId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Delete from storage
    const fileName = document.url.split('/').pop();
    if (fileName) {
      await supabase.storage
        .from('project-documents')
        .remove([`${projectId}/${fileName}`]);
    }

    // Delete document record
    const { error } = await supabase
      .from(TABLES.PROJECT_DOCUMENTS)
      .delete()
      .eq('id', documentId)
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // Private helper: Update client projects count
  private async updateClientProjectsCount(clientId: string): Promise<void> {
    const { count } = await supabase
      .from(TABLES.PROJECTS)
      .select('id', { count: 'exact' })
      .eq('client_id', clientId);

    await supabase
      .from(TABLES.CLIENTS)
      .update({ projects_count: count || 0 })
      .eq('id', clientId);
  }

  // Get projects by client
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        manager:users!manager_id(id, name, email),
        foreman:users!foreman_id(id, name, email)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch client projects: ${error.message}`);
    }

    return data || [];
  }

  // Get projects by manager
  async getProjectsByManager(managerId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        client:clients(id, name, company, type),
        foreman:users!foreman_id(id, name, email)
      `)
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch manager projects: ${error.message}`);
    }

    return data || [];
  }
}

// Export singleton instance
export const supabaseProjectService = new SupabaseProjectService();
