import { useMemo } from 'react';
import { useOptimizedUsers } from './useOptimizedData';
import { User } from '../../types';

export function useUsers() {
  const { data: users, loading, error, refetch } = useOptimizedUsers();

  const getUsersByRole = useMemo(() => (role: string) => {
    return users.filter(user => user.role === role);
  }, [users]);

  const getManagers = useMemo(() => {
    return getUsersByRole('Manager');
  }, [getUsersByRole]);

  const getAdmins = useMemo(() => {
    return getUsersByRole('Admin');
  }, [getUsersByRole]);

  const getManagersAndAdmins = useMemo(() => {
    return users.filter(user => user.role === 'Manager' || user.role === 'Admin');
  }, [users]);

  return {
    users,
    loading,
    error,
    loadUsers: refetch,
    getUsersByRole,
    getManagers,
    getAdmins,
    getManagersAndAdmins
  };
}
