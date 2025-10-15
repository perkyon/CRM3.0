import { useMemo } from 'react';
import { useOptimizedKanbanBoards } from './useOptimizedData';
import { KanbanBoard } from '../../types';

export function useKanban(projectId?: string) {
  const { data: boards, loading, error, refetch } = useOptimizedKanbanBoards(projectId);

  const getBoardByProject = useMemo(() => (projectId: string) => {
    return boards.find(board => board.projectId === projectId);
  }, [boards]);

  const getActiveBoards = useMemo(() => {
    return boards.filter(board => board.columns.length > 0);
  }, [boards]);

  const getBoardsWithTasks = useMemo(() => {
    return boards.filter(board => board.tasks && board.tasks.length > 0);
  }, [boards]);

  return {
    boards,
    loading,
    error,
    loadBoards: refetch,
    getBoardByProject,
    getActiveBoards,
    getBoardsWithTasks
  };
}
