-- ============================================
-- 🚀 SaaS МИГРАЦИЯ - Мультитенантность
-- ============================================
-- Превращаем CRM в SaaS платформу с поддержкой множества организаций

-- ============================================
-- 1. СОЗДАНИЕ ТИПОВ ДЛЯ SaaS
-- ============================================

-- Планы подписки (с проверкой существования)
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM (
        'free',
        'starter',
        'professional',
        'enterprise'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Статусы подписки (с проверкой существования)
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'active',
        'canceled',
        'past_due',
        'trialing',
        'incomplete',
        'incomplete_expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Статусы организации (с проверкой существования)
DO $$ BEGIN
    CREATE TYPE organization_status AS ENUM (
        'active',
        'suspended',
        'deleted'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. ТАБЛИЦА ОРГАНИЗАЦИЙ
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly имя (например: "my-workshop")
    logo_url TEXT,
    website VARCHAR(255),
    status organization_status NOT NULL DEFAULT 'active',
    
    -- Настройки организации
    settings JSONB DEFAULT '{}', -- Кастомные настройки
    
    -- Лимиты (зависят от плана)
    max_users INTEGER DEFAULT 5,
    max_projects INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 1,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Индекс для быстрого поиска по slug
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- ============================================
-- 3. ТАБЛИЦА УЧАСТНИКОВ ОРГАНИЗАЦИИ
-- ============================================

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Роль в организации (может отличаться от глобальной роли)
    role user_role NOT NULL DEFAULT 'Manager',
    
    -- Приглашение
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Статус
    active BOOLEAN DEFAULT true,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: один пользователь может быть в организации только один раз
    UNIQUE(organization_id, user_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_active ON organization_members(active);

-- ============================================
-- 4. ТАБЛИЦА ПОДПИСОК
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- План подписки
    plan subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    
    -- Биллинг
    stripe_subscription_id VARCHAR(255), -- ID подписки в Stripe
    stripe_customer_id VARCHAR(255), -- ID клиента в Stripe
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================
-- 5. ДОБАВЛЕНИЕ organization_id В СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ
-- ============================================

-- Добавляем organization_id в clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(organization_id);

-- Добавляем organization_id в projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);

-- Добавляем organization_id в users (для владельца организации)
-- Это будет использоваться для определения, какая организация является "домашней" для пользователя
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS default_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_default_org_id ON users(default_organization_id);

-- ============================================
-- 6. ФУНКЦИИ ДЛЯ РАБОТЫ С ОРГАНИЗАЦИЯМИ
-- ============================================

-- Функция для получения текущей организации пользователя
CREATE OR REPLACE FUNCTION get_user_organization(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Сначала проверяем default_organization_id
    SELECT default_organization_id INTO org_id
    FROM users
    WHERE id = user_uuid;
    
    -- Если нет, берем первую активную организацию пользователя
    IF org_id IS NULL THEN
        SELECT om.organization_id INTO org_id
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.user_id = user_uuid
          AND om.active = true
          AND o.status = 'active'
        ORDER BY om.joined_at ASC
        LIMIT 1;
    END IF;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки доступа пользователя к организации
CREATE OR REPLACE FUNCTION user_has_access_to_org(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.user_id = user_uuid
          AND om.organization_id = org_uuid
          AND om.active = true
          AND o.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. ОБНОВЛЕНИЕ RLS ПОЛИТИК ДЛЯ МУЛЬТИТЕНАНТНОСТИ
-- ============================================

-- Включаем RLS для organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Пользователи видят только организации, в которых они состоят
DROP POLICY IF EXISTS "users_see_own_organizations" ON organizations;
CREATE POLICY "users_see_own_organizations" ON organizations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
              AND om.user_id = auth.uid()
              AND om.active = true
        )
    );

-- Включаем RLS для organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Пользователи видят только свои членства
DROP POLICY IF EXISTS "users_see_own_memberships" ON organization_members;
CREATE POLICY "users_see_own_memberships" ON organization_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Включаем RLS для subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Пользователи видят подписки своих организаций
DROP POLICY IF EXISTS "users_see_org_subscriptions" ON subscriptions;
CREATE POLICY "users_see_org_subscriptions" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Обновляем политики для clients (добавляем проверку organization_id)
DROP POLICY IF EXISTS "authenticated_all_clients" ON clients;
DROP POLICY IF EXISTS "authenticated_org_clients" ON clients;
CREATE POLICY "authenticated_org_clients" ON clients
    FOR ALL
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- Обновляем политики для projects
DROP POLICY IF EXISTS "authenticated_all_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_org_projects" ON projects;
CREATE POLICY "authenticated_org_projects" ON projects
    FOR ALL
    TO authenticated
    USING (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    )
    WITH CHECK (
        organization_id IS NOT NULL AND
        user_has_access_to_org(auth.uid(), organization_id)
    );

-- ============================================
-- 8. ТРИГГЕРЫ ДЛЯ ОБНОВЛЕНИЯ updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_members_updated_at ON organization_members;
CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. МИГРАЦИЯ СУЩЕСТВУЮЩИХ ДАННЫХ
-- ============================================

-- Создаем дефолтную организацию для существующих пользователей
DO $$
DECLARE
    default_org_id UUID;
    user_record RECORD;
BEGIN
    -- Получаем или создаем дефолтную организацию
    SELECT id INTO default_org_id
    FROM organizations
    WHERE slug = 'default';
    
    -- Если не существует - создаем
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug, status)
        VALUES ('Default Organization', 'default', 'active')
        RETURNING id INTO default_org_id;
    END IF;
    
    -- Для каждого существующего пользователя:
    FOR user_record IN SELECT id FROM users LOOP
        -- Добавляем пользователя в организацию
        INSERT INTO organization_members (organization_id, user_id, role, active)
        VALUES (default_org_id, user_record.id, 'Admin', true)
        ON CONFLICT DO NOTHING;
        
        -- Устанавливаем дефолтную организацию
        UPDATE users
        SET default_organization_id = default_org_id
        WHERE id = user_record.id;
    END LOOP;
    
    -- Обновляем существующие clients и projects
    UPDATE clients
    SET organization_id = default_org_id
    WHERE organization_id IS NULL;
    
    UPDATE projects
    SET organization_id = default_org_id
    WHERE organization_id IS NULL;
    
    -- Создаем дефолтную подписку
    INSERT INTO subscriptions (organization_id, plan, status)
    VALUES (default_org_id, 'free', 'active')
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 10. КОММЕНТАРИИ
-- ============================================

COMMENT ON TABLE organizations IS 'Организации (workspaces) в SaaS системе';
COMMENT ON TABLE organization_members IS 'Участники организаций';
COMMENT ON TABLE subscriptions IS 'Подписки организаций';
COMMENT ON FUNCTION get_user_organization IS 'Получить текущую организацию пользователя';
COMMENT ON FUNCTION user_has_access_to_org IS 'Проверить доступ пользователя к организации';

