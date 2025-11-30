import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useProjectStore } from '../lib/stores/projectStore';
import { useAuthStore } from '../lib/stores/authStore';
import { useCurrentOrganization } from '../lib/hooks/useCurrentOrganization';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types';
import { supabaseProjectService } from '../lib/supabase/services/ProjectService';

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
    createProject: storeCreateProject,
    updateProject,
    deleteProject,
    updateProjectStage,
    updateProductionSubStage,
    setSelectedProject,
    clearError,
    subscribeToRealtime,
    unsubscribeFromRealtime,
  } = useProjectStore();

  const { isAuthenticated } = useAuthStore();
  const { currentOrganization, isTrialExpired } = useCurrentOrganization();

  // Auto-fetch projects when user is authenticated and organization is loaded
  useEffect(() => {
    if (isAuthenticated && currentOrganization?.id && projects.length === 0) {
      fetchProjects({ organizationId: currentOrganization.id }).catch(console.error);
    }
  }, [isAuthenticated, currentOrganization?.id, projects.length, fetchProjects]);

  // Fallback: периодическое обновление если realtime не работает
  useEffect(() => {
    if (!isAuthenticated || !currentOrganization?.id) return;
    
    const interval = setInterval(() => {
      fetchProjects({ organizationId: currentOrganization.id }).catch(console.error);
    }, 60000); // Обновляем каждую минуту как fallback

    return () => clearInterval(interval);
  }, [isAuthenticated, currentOrganization?.id, fetchProjects]);

  // Подключаемся к realtime обновлениям проектов
  useEffect(() => {
    if (!isAuthenticated) return;
    
    try {
      subscribeToRealtime();
    } catch (error) {
      console.error('Error subscribing to realtime:', error);
    }
    
    return () => {
      try {
        unsubscribeFromRealtime();
      } catch (error) {
        console.error('Error unsubscribing from realtime:', error);
      }
    };
  }, [isAuthenticated, subscribeToRealtime, unsubscribeFromRealtime]);

  const guardedCreateProject = async (projectData: CreateProjectRequest) => {
    if (!currentOrganization?.id) {
      throw new Error('Организация не выбрана');
    }

    if (isTrialExpired) {
      throw new Error('Срок пробного периода истёк. Обновите тариф, чтобы продолжить работу.');
    }

    if (currentOrganization.maxProjects > 0) {
      try {
        const totalProjects = await supabaseProjectService.countProjectsByOrganization(currentOrganization.id);
        if (totalProjects >= currentOrganization.maxProjects) {
          throw new Error('Достигнут лимит проектов для текущего плана. Обновите тариф, чтобы продолжить.');
        }
      } catch (error: any) {
        console.error('Error checking project limits:', error);
        throw error;
      }
    }

    return storeCreateProject(projectData);
  };

  const contextValue: ProjectContextType = {
    projects,
    selectedProject,
    isLoading,
    error,
    pagination,
    fetchProjects,
    fetchProject,
    createProject: guardedCreateProject,
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
