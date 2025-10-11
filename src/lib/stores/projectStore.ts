import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectSearchParams } from '../../types';
import { supabaseProjectService } from '../supabase/services/ProjectService';
import { PaginatedResponse } from '../api/config';

interface ProjectState {
  // State
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ProjectSearchParams;

  // Actions
  fetchProjects: (params?: ProjectSearchParams) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (projectData: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, projectData: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStage: (id: string, stage: Project['stage']) => Promise<void>;
  updateProductionSubStage: (id: string, productionSubStage: Project['productionSubStage']) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectSearchParams>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 20,
  },

  // Actions
  fetchProjects: async (params?: ProjectSearchParams) => {
    try {
      set({ isLoading: true, error: null });
      
      const searchParams = { ...get().filters, ...params };
      const response: PaginatedResponse<Project> = await supabaseProjectService.getProjects(searchParams);
      
      set({
        projects: response.data,
        pagination: response.pagination,
        filters: searchParams,
        isLoading: false,
      });
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки проектов',
      });
      throw error;
    }
  },

  fetchProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const project = await supabaseProjectService.getProject(id);
      
      set({
        selectedProject: project,
        isLoading: false,
      });
      
      // Update project in projects list if it exists
      const { projects } = get();
      const projectIndex = projects.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        const updatedProjects = [...projects];
        updatedProjects[projectIndex] = project;
        set({ projects: updatedProjects });
      }
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки проекта',
      });
      throw error;
    }
  },

  createProject: async (projectData: CreateProjectRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const newProject = await supabaseProjectService.createProject(projectData);
      
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));
      
      return newProject;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка создания проекта',
      });
      throw error;
    }
  },

  updateProject: async (id: string, projectData: UpdateProjectRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedProject = await supabaseProjectService.updateProject(id, projectData);
      
      set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? updatedProject : project
        ),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        isLoading: false,
      }));
      
      return updatedProject;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления проекта',
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await supabaseProjectService.deleteProject(id);
      
      set((state) => ({
        projects: state.projects.filter(project => project.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка удаления проекта',
      });
      throw error;
    }
  },

  updateProjectStage: async (id: string, stage: Project['stage']) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedProject = await supabaseProjectService.updateProjectStage(id, stage);
      
      set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? updatedProject : project
        ),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления стадии проекта',
      });
      throw error;
    }
  },

  updateProductionSubStage: async (id: string, productionSubStage: Project['productionSubStage']) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedProject = await supabaseProjectService.updateProjectStage(id, undefined, productionSubStage);
      
      set((state) => ({
        projects: state.projects.map(project =>
          project.id === id ? updatedProject : project
        ),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        isLoading: false,
      }));
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка обновления подстадии производства',
      });
      throw error;
    }
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  setFilters: (filters: Partial<ProjectSearchParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        projects: state.projects,
        selectedProject: state.selectedProject,
        pagination: state.pagination,
      }),
    }
  )
);
