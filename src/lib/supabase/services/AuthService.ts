import { supabase, TABLES } from '../config';
import { User, LoginRequest, LoginResponse, CreateUserRequest, UpdateUserRequest } from '../../../types';

export class SupabaseAuthService {
  // Sign in with email and password
  async signIn(credentials: LoginRequest): Promise<LoginResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('Authentication failed: No user or session returned');
    }

    // Get user profile from our users table
    const userProfile = await this.getUserProfile(data.user.id);
    
    return {
      user: userProfile,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in || 3600,
    };
  }

  // Sign up new user
  async signUp(userData: CreateUserRequest): Promise<User> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      throw new Error(`Registration failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Registration failed: No user returned');
    }

    // Create user profile
    const userProfile = {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      active: userData.active ?? true,
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
      permissions: this.getDefaultPermissions(userData.role),
    };

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert(userProfile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  }

  // Sign out
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return this.getUserProfile(user.id);
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  // Update user profile
  async updateUserProfile(userId: string, userData: UpdateUserRequest): Promise<User> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(`Failed to send reset email: ${error.message}`);
    }
  }

  // Update password after reset
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  // Upload avatar
  async uploadAvatar(file: File, userId: string): Promise<{ avatarUrl: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true, // Replace existing file
      });

    if (error) {
      // Более понятное сообщение об ошибке
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        throw new Error(
          'Bucket "avatars" не найден в Supabase Storage. ' +
          'Пожалуйста, выполните SQL скрипт supabase/create-storage-buckets.sql в Supabase SQL Editor.'
        );
      }
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with new avatar URL
    await this.updateUserProfile(userId, { avatar: urlData.publicUrl });

    return { avatarUrl: urlData.publicUrl };
  }

  // Delete avatar
  async deleteAvatar(userId: string): Promise<void> {
    // Get current avatar URL
    const user = await this.getUserProfile(userId);
    if (user.avatar) {
      const fileName = user.avatar.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${fileName}`]);
      }
    }

    // Update user profile
    await this.updateUserProfile(userId, { avatar: null });
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

  // Check if user has permission
  hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions.includes(permission);
  }

  // Get session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return session;
  }

  // Refresh session
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw new Error(`Failed to refresh session: ${error.message}`);
    }

    return data;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService();
