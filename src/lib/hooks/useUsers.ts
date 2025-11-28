import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabaseUserService } from '../supabase/services/UserService';
import { User } from '../../types';
import { useCurrentOrganization } from './useCurrentOrganization';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentOrganization } = useCurrentOrganization();

  const loadUsers = useCallback(async () => {
    if (!currentOrganization?.id) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await supabaseUserService.getUsers(currentOrganization.id);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки пользователей');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
    loadUsers,
    getUsersByRole,
    getManagers,
    getAdmins,
    getManagersAndAdmins
  };
}
