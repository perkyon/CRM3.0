import { apiService } from '../client';
import { API_ENDPOINTS, PaginatedResponse } from '../config';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../types';

export class ProjectService {
  // Get all projects with pagination and filters
  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
    priority?: string;
    clientId?: string;
    managerId?: string;
  }): Promise<PaginatedResponse<Project>> {
    const response = await apiService.get<PaginatedResponse<Project>>(
      API_ENDPOINTS.projects.list,
      { params }
    );
    return response.data;
  }

  // Get single project by ID
  async getProject(id: string): Promise<Project> {
    const response = await apiService.get<Project>(API_ENDPOINTS.projects.get(id));
    return response.data;
  }

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await apiService.post<Project>(
      API_ENDPOINTS.projects.create,
      projectData
    );
    return response.data;
  }

  // Update existing project
  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<Project> {
    const response = await apiService.put<Project>(
      API_ENDPOINTS.projects.update(id),
      projectData
    );
    return response.data;
  }

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.projects.delete(id));
  }

  // Update project stage
  async updateProjectStage(id: string, stage: Project['stage']): Promise<Project> {
    const response = await apiService.patch<Project>(
      `${API_ENDPOINTS.projects.get(id)}/stage`,
      { stage }
    );
    return response.data;
  }

  // Update project production sub-stage
  async updateProductionSubStage(
    id: string, 
    productionSubStage: Project['productionSubStage']
  ): Promise<Project> {
    const response = await apiService.patch<Project>(
      `${API_ENDPOINTS.projects.get(id)}/production-sub-stage`,
      { productionSubStage }
    );
    return response.data;
  }

  // Get project documents
  async getProjectDocuments(projectId: string): Promise<Project['documents']> {
    const response = await apiService.get<Project['documents']>(
      `${API_ENDPOINTS.projects.get(projectId)}/documents`
    );
    return response.data;
  }

  // Upload project document
  async uploadProjectDocument(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Project['documents'][0]> {
    const response = await apiService.upload<Project['documents'][0]>(
      `${API_ENDPOINTS.projects.get(projectId)}/documents/upload`,
      file,
      onProgress
    );
    return response.data;
  }

  // Delete project document
  async deleteProjectDocument(projectId: string, documentId: string): Promise<void> {
    await apiService.delete(
      `${API_ENDPOINTS.projects.get(projectId)}/documents/${documentId}`
    );
  }

  // Get project materials
  async getProjectMaterials(projectId: string): Promise<any[]> {
    const response = await apiService.get<any[]>(
      `${API_ENDPOINTS.projects.get(projectId)}/materials`
    );
    return response.data;
  }

  // Update project materials
  async updateProjectMaterials(projectId: string, materials: any[]): Promise<any[]> {
    const response = await apiService.put<any[]>(
      `${API_ENDPOINTS.projects.get(projectId)}/materials`,
      { materials }
    );
    return response.data;
  }

  // Get project timeline/activities
  async getProjectTimeline(projectId: string): Promise<any[]> {
    const response = await apiService.get<any[]>(
      `${API_ENDPOINTS.projects.get(projectId)}/timeline`
    );
    return response.data;
  }
}

// Export singleton instance
export const projectService = new ProjectService();
