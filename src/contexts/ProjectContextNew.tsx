import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useProjectStore } from '../lib/stores/projectStore';
import { useAuthStore } from '../lib/stores/authStore';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types';

interface ProjectContextType {
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
  
  // Actions
  fetchProjects: (params?: any) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (projectData: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, projectData: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectStage: (id: string, stage: Project['stage']) => Promise<void>;
  updateProductionSubStage: (id: string, productionSubStage: Project['productionSubStage']) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const {
    projects,
    selectedProject,
    isLoading,
    error,
    pagination,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStage,
    updateProductionSubStage,
    setSelectedProject,
    clearError,
  } = useProjectStore();

  const { isAuthenticated } = useAuthStore();

  // Auto-fetch projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated && projects.length === 0) {
      fetchProjects().catch(console.error);
    }
  }, [isAuthenticated, projects.length, fetchProjects]);

  // Добавляем периодическое обновление проектов для синхронизации с активностью
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchProjects().catch(console.error);
    }, 30000); // Обновляем каждые 30 секунд

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchProjects]);

  const contextValue: ProjectContextType = {
    projects,
    selectedProject,
    isLoading,
    error,
    pagination,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStage,
    updateProductionSubStage,
    setSelectedProject,
    clearError,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
