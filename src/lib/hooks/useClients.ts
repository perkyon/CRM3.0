import { useMemo } from 'react';
import { useOptimizedClients } from './useOptimizedData';
import { Client } from '../../types';

export function useClients() {
  const { data: clients, loading, error, refetch } = useOptimizedClients();

  const getClientsByStatus = useMemo(() => (status: string) => {
    return clients.filter(client => client.status === status);
  }, [clients]);

  const getClientsByType = useMemo(() => (type: string) => {
    return clients.filter(client => client.type === type);
  }, [clients]);

  const getActiveClients = useMemo(() => {
    return clients.filter(client => client.status === 'client' || client.status === 'in_work');
  }, [clients]);

  const getNewClients = useMemo(() => {
    return clients.filter(client => client.status === 'new' || client.status === 'lead');
  }, [clients]);

  return {
    clients,
    loading,
    error,
    loadClients: refetch,
    getClientsByStatus,
    getClientsByType,
    getActiveClients,
    getNewClients
  };
}
