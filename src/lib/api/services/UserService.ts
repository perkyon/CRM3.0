import { apiService } from '../client';
import { API_ENDPOINTS, PaginatedResponse } from '../config';
import { User, CreateUserRequest, UpdateUserRequest } from '../../types';

export class UserService {
  // Get all users with pagination and filters
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    active?: boolean;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<PaginatedResponse<User>>(
      API_ENDPOINTS.users.list,
      { params }
    );
    return response.data;
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.users.get(id));
    return response.data;
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/profile');
    return response.data;
  }

  // Update current user profile
  async updateCurrentUser(userData: UpdateUserRequest): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', userData);
    return response.data;
  }

  // Create new user (admin only)
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiService.post<User>(
      API_ENDPOINTS.users.list,
      userData
    );
    return response.data;
  }

  // Update user (admin only)
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiService.put<User>(
      API_ENDPOINTS.users.update(id),
      userData
    );
    return response.data;
  }

  // Delete user (admin only)
  async deleteUser(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.users.get(id));
  }

  // Change user password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Reset user password (admin only)
  async resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await apiService.post<{ temporaryPassword: string }>(
      `${API_ENDPOINTS.users.get(id)}/reset-password`
    );
    return response.data;
  }

  // Update user role (admin only)
  async updateUserRole(id: string, role: User['role']): Promise<User> {
    const response = await apiService.patch<User>(
      `${API_ENDPOINTS.users.get(id)}/role`,
      { role }
    );
    return response.data;
  }

  // Activate/deactivate user (admin only)
  async toggleUserStatus(id: string, active: boolean): Promise<User> {
    const response = await apiService.patch<User>(
      `${API_ENDPOINTS.users.get(id)}/status`,
      { active }
    );
    return response.data;
  }

  // Get user permissions
  async getUserPermissions(id: string): Promise<string[]> {
    const response = await apiService.get<string[]>(
      `${API_ENDPOINTS.users.get(id)}/permissions`
    );
    return response.data;
  }

  // Update user permissions (admin only)
  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    const response = await apiService.patch<User>(
      `${API_ENDPOINTS.users.get(id)}/permissions`,
      { permissions }
    );
    return response.data;
  }

  // Get user activity log
  async getUserActivity(id: string, params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<any>> {
    const response = await apiService.get<PaginatedResponse<any>>(
      `${API_ENDPOINTS.users.get(id)}/activity`,
      { params }
    );
    return response.data;
  }

  // Upload user avatar
  async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ avatarUrl: string }> {
    const response = await apiService.upload<{ avatarUrl: string }>(
      '/auth/avatar',
      file,
      onProgress
    );
    return response.data;
  }

  // Delete user avatar
  async deleteAvatar(): Promise<void> {
    await apiService.delete('/auth/avatar');
  }
}

// Export singleton instance
export const userService = new UserService();
