import { supabase, TABLES } from '../config';
import { User, CreateUserRequest } from '../../../types';
import { handleApiError } from '../../error/ErrorHandler';

export class SupabaseUserService {
  // Get all users (filtered by organization if organizationId provided)
  async getUsers(organizationId?: string): Promise<User[]> {
    if (organizationId) {
      // Если указана организация, получаем пользователей через organization_members
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('user_id, profile:users!organization_members_user_id_fkey(*)')
        .eq('organization_id', organizationId)
        .eq('active', true);

      if (membersError) {
        throw handleApiError(membersError, 'SupabaseUserService.getUsers (members)');
      }

      // Извлекаем пользователей из результатов
      const users = (members || [])
        .map((member: any) => member.profile)
        .filter(Boolean)
        .map(this.mapSupabaseUserToUser)
        .sort((a, b) => a.name.localeCompare(b.name));

      return users;
    } else {
      // Если организация не указана, возвращаем всех пользователей
      // (но RLS политики все равно ограничат доступ)
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw handleApiError(error, 'SupabaseUserService.getUsers');
    }

    return (data || []).map(this.mapSupabaseUserToUser);
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('active', true)
      .eq('role', role)
      .order('name', { ascending: true });

    if (error) {
      throw handleApiError(error, 'SupabaseUserService.getUsersByRole');
    }

    return (data || []).map(this.mapSupabaseUserToUser);
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseUserService.getUser');
    }

    return this.mapSupabaseUserToUser(data);
  }

  // Create new user (uses AuthService internally)
  async createUser(userData: CreateUserRequest): Promise<User> {
    const { supabaseAuthService } = await import('./AuthService');
    return await supabaseAuthService.signUp(userData);
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    // Delete user profile first
    const { error: profileError } = await supabase
      .from(TABLES.USERS)
      .delete()
      .eq('id', id);

    if (profileError) {
      throw handleApiError(profileError, 'SupabaseUserService.deleteUser (profile)');
    }

    // Note: Auth user deletion should be handled by a backend function
    // or through Supabase dashboard, as we don't have admin access from client
    // For now, we just delete the profile and mark user as inactive
  }

  // Update user
  async updateUser(id: string, updates: { role?: string; active?: boolean; name?: string; phone?: string }): Promise<User> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseUserService.updateUser');
    }

    return this.mapSupabaseUserToUser(data);
  }

  // Get current user (placeholder for auth integration)
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return this.getUser(user.id);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Get default permissions based on role
  private getDefaultPermissions(role: User['role']): string[] {
    const rolePermissions: Record<User['role'], string[]> = {
      Admin: [
        'clients:read', 'clients:write', 'clients:delete',
        'projects:read', 'projects:write', 'projects:delete',
        'production:read', 'production:write', 'production:delete',
        'users:read', 'users:write', 'users:delete',
        'settings:read', 'settings:write',
        'reports:read',
      ],
      Manager: [
        'clients:read', 'clients:write',
        'projects:read', 'projects:write',
        'production:read', 'production:write',
        'users:read',
        'reports:read',
      ],
      Master: [
        'clients:read',
        'projects:read',
        'production:read', 'production:write',
      ],
      Procurement: [
        'clients:read',
        'projects:read',
        'production:read',
        'inventory:read', 'inventory:write',
      ],
      Accountant: [
        'clients:read',
        'projects:read',
        'finance:read', 'finance:write',
        'reports:read',
      ],
    };

    return rolePermissions[role] || [];
  }

  // Helper method to map Supabase user data to our User interface
  private mapSupabaseUserToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      name: supabaseUser.name,
      email: supabaseUser.email,
      phone: supabaseUser.phone,
      role: supabaseUser.role,
      active: supabaseUser.active,
      avatar: supabaseUser.avatar,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at,
      lastLoginAt: supabaseUser.last_login_at,
      permissions: supabaseUser.permissions || [],
    };
  }
}

export const supabaseUserService = new SupabaseUserService();
