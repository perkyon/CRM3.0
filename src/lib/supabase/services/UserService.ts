import { supabase, TABLES } from '../config';
import { User } from '../../../types';
import { handleApiError } from '../../error/ErrorHandler';

export class SupabaseUserService {
  // Get all users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw handleApiError(error, 'SupabaseUserService.getUsers');
    }

    return (data || []).map(this.mapSupabaseUserToUser);
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
