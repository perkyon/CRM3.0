import { supabase } from '../config';
import { Organization, OrganizationMember, User, SubscriptionPlan } from '../../../types';

export class OrganizationService {
  /**
   * Создать новую организацию с пользователем
   */
  async createOrganizationWithUser(data: {
    organization: {
      name: string;
      slug: string;
      website?: string;
    };
    user: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    };
    subscriptionPlan: SubscriptionPlan;
  }) {
    const { organization, user, subscriptionPlan } = data;

    // 1. Создать пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (authError) {
      throw new Error(`Ошибка создания пользователя: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Пользователь не был создан');
    }

    const userId = authData.user.id;

    // 2. Создать профиль пользователя
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: 'Admin',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (userError) {
      throw new Error(`Ошибка создания профиля: ${userError.message}`);
    }

    // 3. Создать организацию
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organization.name,
        slug: organization.slug,
        website: organization.website || null,
        status: 'active',
        settings: {},
        max_users: this.getPlanLimits(subscriptionPlan).users,
        max_projects: this.getPlanLimits(subscriptionPlan).projects,
        max_storage_gb: this.getPlanLimits(subscriptionPlan).storage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orgError) {
      throw new Error(`Ошибка создания организации: ${orgError.message}`);
    }

    // 4. Установить default_organization_id для пользователя
    await supabase
      .from('users')
      .update({ default_organization_id: orgData.id })
      .eq('id', userId);

    // 5. Добавить пользователя в организацию как Admin
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: orgData.id,
        user_id: userId,
        role: 'Admin',
        active: true,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (memberError) {
      throw new Error(`Ошибка добавления пользователя: ${memberError.message}`);
    }

    // 6. Создать подписку
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: orgData.id,
        plan: subscriptionPlan,
        status: subscriptionPlan === 'free' ? 'active' : 'trialing',
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (subError) {
      throw new Error(`Ошибка создания подписки: ${subError.message}`);
    }

    return {
      organization: orgData,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: 'Admin' as const,
      },
    };
  }

  /**
   * Получить лимиты для плана
   */
  private getPlanLimits(plan: SubscriptionPlan) {
    const limits = {
      free: { users: 3, projects: 5, storage: 1 },
      starter: { users: 10, projects: 50, storage: 10 },
      professional: { users: 50, projects: -1, storage: 100 },
      enterprise: { users: -1, projects: -1, storage: 1000 },
    };
    return limits[plan];
  }

  /**
   * Получить организацию по slug
   */
  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapOrganization(data);
  }

  /**
   * Получить организации пользователя
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations (*)
      `)
      .eq('user_id', userId)
      .eq('active', true);

    if (error || !data) {
      return [];
    }

    return data
      .map((item: any) => item.organizations)
      .filter(Boolean)
      .map((org: any) => this.mapOrganization(org));
  }

  /**
   * Маппинг данных из БД в тип Organization
   */
  private mapOrganization(data: any): Organization {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logo_url,
      website: data.website,
      status: data.status,
      settings: data.settings || {},
      maxUsers: data.max_users,
      maxProjects: data.max_projects,
      maxStorageGb: data.max_storage_gb,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    };
  }
}

export const organizationService = new OrganizationService();

