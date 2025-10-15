import { useMemo } from 'react';
import { useOptimizedProjects } from './useOptimizedData';
import { Project } from '../../types';

export function useProjects() {
  const { data: projects, loading, error, refetch } = useOptimizedProjects();

  const getProjectsByStage = useMemo(() => (stage: string) => {
    return projects.filter(project => project.stage === stage);
  }, [projects]);

  const getProjectsByPriority = useMemo(() => (priority: string) => {
    return projects.filter(project => project.priority === priority);
  }, [projects]);

  const getActiveProjects = useMemo(() => {
    return projects.filter(project => 
      project.stage !== 'completed' && 
      project.stage !== 'cancelled'
    );
  }, [projects]);

  const getCompletedProjects = useMemo(() => {
    return projects.filter(project => project.stage === 'completed');
  }, [projects]);

  const getOverdueProjects = useMemo(() => {
    const now = new Date();
    return projects.filter(project => 
      project.dueDate && 
      new Date(project.dueDate) < now &&
      project.stage !== 'completed'
    );
  }, [projects]);

  const getProjectsByClient = useMemo(() => (clientId: string) => {
    return projects.filter(project => project.clientId === clientId);
  }, [projects]);

  return {
    projects,
    loading,
    error,
    loadProjects: refetch,
    getProjectsByStage,
    getProjectsByPriority,
    getActiveProjects,
    getCompletedProjects,
    getOverdueProjects,
    getProjectsByClient
  };
}
