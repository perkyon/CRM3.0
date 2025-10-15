import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useUsers } from './useUsers';

// Mock Supabase
vi.mock('../supabase/services/UserService', () => ({
  supabaseUserService: {
    getUsers: vi.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+7 495 123-45-67',
        role: 'Manager',
        active: true,
        avatar: null
      }
    ])
  }
}));

describe('useUsers', () => {
  it('should load users successfully', async () => {
    const { result } = renderHook(() => useUsers());

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].name).toBe('Test User');
  });

  it('should filter users by role', async () => {
    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const managers = result.current.getUsersByRole('Manager');
    expect(managers).toHaveLength(1);
    expect(managers[0].role).toBe('Manager');
  });
});
