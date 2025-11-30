import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENVS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

const validateEnv = () => {
  for (const key of REQUIRED_ENVS) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

const TRIAL_DAYS = 14;
const TRIAL_LIMITS = {
  max_users: 5,
  max_projects: 5,
  max_storage_gb: 2,
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    validateEnv();

    const { name, company, email, password } = req.body || {};

    if (!name || !company || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
    }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Создаем пользователя
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (userError || !userData.user) {
      return res.status(400).json({ error: userError?.message || 'Не удалось создать пользователя' });
    }

    // 2. Создаем организацию с триалом
    const trialStartsAt = new Date();
    const trialEndsAt = new Date(trialStartsAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    let slug = slugify(company);
    if (!slug) {
      slug = `org-${Date.now()}`;
    }

    // Проверяем доступность slug
    const { data: existingSlug } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: company,
        slug,
        status: 'active',
        plan: 'trial',
        trial_starts_at: trialStartsAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        trial_active: true,
        max_users: TRIAL_LIMITS.max_users,
        max_projects: TRIAL_LIMITS.max_projects,
        max_storage_gb: TRIAL_LIMITS.max_storage_gb,
      })
      .select()
      .single();

    if (orgError || !organization) {
      return res.status(400).json({ error: orgError?.message || 'Не удалось создать организацию' });
    }

    // 3. Добавляем пользователя в организацию
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: userData.user.id,
        role: 'Admin',
        active: true,
      });

    if (memberError) {
      return res.status(400).json({ error: memberError.message });
    }

    // 4. Обновляем профиль пользователя
    await supabaseAdmin
      .from('users')
      .update({
        name,
        default_organization_id: organization.id,
      })
      .eq('id', userData.user.id);

    // 5. Создаем запись о подписке (trial)
    await supabaseAdmin.from('subscriptions').insert({
      organization_id: organization.id,
      plan: 'free',
      status: 'trialing',
      current_period_start: trialStartsAt.toISOString(),
      current_period_end: trialEndsAt.toISOString(),
      cancel_at_period_end: true,
    });

    return res.status(201).json({
      message: 'Организация успешно создана',
      organizationId: organization.id,
      trialEndsAt: trialEndsAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Ошибка сервера' });
  }
}

