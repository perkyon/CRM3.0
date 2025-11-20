import { supabase, TABLES } from '../config';
import { handleApiError } from '../../error/ErrorHandler';

export interface UserSettings {
  // Персонализация
  language?: string;
  theme?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  weekStart?: string;
  
  // Email
  emailSignature?: string;
  emailNotifications?: boolean;
  
  // Уведомления
  pushNotifications?: boolean;
  projectUpdates?: boolean;
  clientUpdates?: boolean;
  taskReminders?: boolean;
  deadlineReminders?: boolean;
  mentionNotifications?: boolean;
  
  // Безопасность
  twoFactorAuth?: boolean;
  sessionTimeout?: number;
}

export interface OrganizationSettings {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export class SupabaseSettingsService {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    // Пока используем localStorage, так как поле settings может отсутствовать в БД
    // В будущем можно добавить поле settings JSONB в таблицу users
    try {
      const stored = localStorage.getItem(`user_settings_${userId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
    // Пока используем localStorage
    // В будущем можно добавить поле settings JSONB в таблицу users
    try {
      localStorage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
    } catch (error) {
      throw new Error('Failed to save settings');
    }
  }

  // Get organization settings
  async getOrganizationSettings(organizationId: string): Promise<OrganizationSettings> {
    const { data, error } = await supabase
      .from('organizations')
      .select('settings, name')
      .eq('id', organizationId)
      .single();

    if (error) {
      throw handleApiError(error, 'SupabaseSettingsService.getOrganizationSettings');
    }

    return {
      ...(data?.settings as OrganizationSettings || {}),
      name: data?.name,
    };
  }

  // Update organization settings
  async updateOrganizationSettings(organizationId: string, settings: OrganizationSettings): Promise<void> {
    const { name, ...otherSettings } = settings;
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name) {
      updateData.name = name;
    }

    if (Object.keys(otherSettings).length > 0) {
      updateData.settings = otherSettings;
    }

    const { error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organizationId);

    if (error) {
      throw handleApiError(error, 'SupabaseSettingsService.updateOrganizationSettings');
    }
  }
}

export const supabaseSettingsService = new SupabaseSettingsService();

