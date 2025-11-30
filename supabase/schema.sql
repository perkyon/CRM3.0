-- ============================================
-- 🔥 СВЕЖАЯ УСТАНОВКА БД С НУЛЯ
-- ============================================
-- CRM для мебельной мастерской
-- Полная схема базы данных

-- ============================================
-- 1. УДАЛЕНИЕ СТАРЫХ ДАННЫХ (если есть)
-- ============================================

-- Удаляем все таблицы
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS kanban_tasks CASCADE;
DROP TABLE IF EXISTS kanban_columns CASCADE;
DROP TABLE IF EXISTS kanban_boards CASCADE;
DROP TABLE IF EXISTS production_items CASCADE;
DROP TABLE IF EXISTS project_documents CASCADE;
DROP TABLE IF EXISTS client_documents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS client_tags CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS material_categories CASCADE;

-- Удаляем старые типы
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS client_type CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS preferred_channel CASCADE;
DROP TYPE IF EXISTS project_stage CASCADE;
DROP TYPE IF EXISTS production_sub_stage CASCADE;
DROP TYPE IF EXISTS priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS document_category CASCADE;
DROP TYPE IF EXISTS client_document_category CASCADE;
DROP TYPE IF EXISTS tag_color CASCADE;
DROP TYPE IF EXISTS tag_type CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;
DROP TYPE IF EXISTS production_item_type CASCADE;
DROP TYPE IF EXISTS production_item_status CASCADE;

-- Удаляем функции
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS generate_project_code CASCADE;
DROP FUNCTION IF EXISTS set_project_code CASCADE;

-- ============================================
-- 2. РАСШИРЕНИЯ
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 3. СОЗДАНИЕ ТИПОВ (ENUM)
-- ============================================

-- Роли пользователей
CREATE TYPE user_role AS ENUM (
    'Admin',
    'Manager',
    'Master',
    'Procurement',
    'Accountant'
);

-- Типы клиентов
CREATE TYPE client_type AS ENUM (
    'Физ. лицо',
    'ИП',
    'ООО'
);

-- Статусы клиентов
CREATE TYPE client_status AS ENUM (
    'lead',
    'new',
    'in_work',
    'lost',
    'client'
);

-- Предпочитаемые каналы связи
CREATE TYPE preferred_channel AS ENUM (
    'WhatsApp',
    'Telegram',
    'Email',
    'Phone'
);

-- Этапы проекта
CREATE TYPE project_stage AS ENUM (
    'brief',
    'preliminary_design',
    'client_approval',
    'tech_project',
    'tech_approval',
    'production',
    'quality_check',
    'packaging',
    'delivery',
    'installation',
    'completed',
    'cancelled',
    -- Legacy для совместимости
    'design',
    'procurement',
    'assembly',
    'done'
);

-- Подэтапы производства
CREATE TYPE production_sub_stage AS ENUM (
    'cutting',
    'drilling',
    'sanding',
    'painting',
    'qa',
    'assembly',
    'finishing',
    'quality_control',
    'packaging'
);

-- Приоритеты
CREATE TYPE priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Статусы задач
CREATE TYPE task_status AS ENUM (
    'todo',
    'in_progress',
    'review',
    'done'
);

-- Типы документов
CREATE TYPE document_type AS ENUM (
    'pdf',
    'doc', 'docx',
    'xls', 'xlsx',
    'dwg', 'dxf',
    '3dm', 'step', 'iges',
    'jpg', 'jpeg', 'png', 'gif',
    'mp4', 'avi', 'mov',
    'zip', 'rar',
    'txt',
    'other'
);

-- Категории документов проектов
CREATE TYPE document_category AS ENUM (
    'brief',
    'design',
    'technical',
    'estimate',
    'contract',
    'photo',
    'video',
    'other'
);

-- Категории документов клиентов
CREATE TYPE client_document_category AS ENUM (
    'contract',
    'passport',
    'inn',
    'invoice',
    'receipt',
    'photo',
    'other'
);

-- Цвета тегов
CREATE TYPE tag_color AS ENUM (
    'red', 'orange', 'yellow', 'green',
    'blue', 'purple', 'pink', 'gray'
);

-- Типы тегов
CREATE TYPE tag_type AS ENUM (
    'priority',
    'category',
    'custom'
);

-- Типы адресов
CREATE TYPE address_type AS ENUM (
    'physical',
    'billing'
);

-- Типы производственных элементов
CREATE TYPE production_item_type AS ENUM (
    'furniture',
    'component'
);

-- Статусы производственных элементов
CREATE TYPE production_item_status AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'on_hold'
);

-- ============================================
-- 4. СОЗДАНИЕ ТАБЛИЦ
-- ============================================

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'Master',
    active BOOLEAN NOT NULL DEFAULT true,
    avatar TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Таблица клиентов
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type client_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    preferred_channel preferred_channel NOT NULL,
    source VARCHAR(255),
    status client_status NOT NULL DEFAULT 'new',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    projects_count INTEGER DEFAULT 0,
    ar_balance DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица контактов клиентов
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    messengers JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица адресов
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type address_type NOT NULL,
    street TEXT,
    city VARCHAR(100),
    zip_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица тегов клиентов
CREATE TABLE client_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color tag_color NOT NULL,
    type tag_type NOT NULL DEFAULT 'custom',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица проектов
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    site_address TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    foreman_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    due_date DATE,
    budget DECIMAL(12,2),
    priority priority NOT NULL DEFAULT 'medium',
    stage project_stage NOT NULL DEFAULT 'brief',
    production_sub_stage production_sub_stage,
    risk_notes TEXT,
    brief_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица документов клиентов
CREATE TABLE client_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    type document_type NOT NULL,
    category client_document_category NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица документов проектов
CREATE TABLE project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    type document_type NOT NULL,
    category document_category NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица канбан досок
CREATE TABLE kanban_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица колонок канбан
CREATE TABLE kanban_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES kanban_boards(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица задач канбан
CREATE TABLE kanban_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES kanban_boards(id) ON DELETE CASCADE,
    column_id UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    production_item_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority priority NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица комментариев к задачам
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES kanban_tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица вложений задач
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES kanban_tasks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    type document_type NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица чеклистов задач
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES kanban_tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица производственных элементов (мебель и компоненты)
CREATE TABLE production_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES production_items(id) ON DELETE CASCADE,
    type production_item_type NOT NULL,
    code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'шт',
    material JSONB,
    specs JSONB,
    progress_percent INTEGER DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    status production_item_status DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица активностей (audit log)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица интеграций
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    tokens JSONB DEFAULT '{}',
    scopes TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Категории материалов
CREATE TABLE material_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Справочник материалов
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES material_categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    min_level DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(255),
    price DECIMAL(12,2),
    supplier VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. СОЗДАНИЕ ИНДЕКСОВ
-- ============================================

-- Индексы для users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- Индексы для clients
CREATE INDEX idx_clients_owner_id ON clients(owner_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Индексы для contacts
CREATE INDEX idx_contacts_client_id ON contacts(client_id);
CREATE INDEX idx_contacts_is_primary ON contacts(is_primary);

-- Индексы для addresses
CREATE INDEX idx_addresses_client_id ON addresses(client_id);

-- Индексы для projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_foreman_id ON projects(foreman_id);
CREATE INDEX idx_projects_stage ON projects(stage);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_code ON projects(code);

-- Индексы для documents
CREATE INDEX idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);

-- Индексы для kanban
CREATE INDEX idx_kanban_boards_project_id ON kanban_boards(project_id);
CREATE INDEX idx_kanban_columns_board_id ON kanban_columns(board_id);
CREATE INDEX idx_kanban_tasks_board_id ON kanban_tasks(board_id);
CREATE INDEX idx_kanban_tasks_column_id ON kanban_tasks(column_id);
CREATE INDEX idx_kanban_tasks_project_id ON kanban_tasks(project_id);
CREATE INDEX idx_kanban_tasks_assignee_id ON kanban_tasks(assignee_id);
CREATE INDEX idx_kanban_tasks_production_item_id ON kanban_tasks(production_item_id);

-- Индексы для production_items
CREATE INDEX idx_production_items_project_id ON production_items(project_id);
CREATE INDEX idx_production_items_parent_id ON production_items(parent_id);
CREATE INDEX idx_production_items_type ON production_items(type);

-- Индексы для activities
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Индексы для materials
CREATE INDEX idx_materials_sku ON materials(sku);
CREATE INDEX idx_materials_category_id ON materials(category_id);

-- ============================================
-- 6. СОЗДАНИЕ ФУНКЦИЙ
-- ============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Функция генерации кода проекта
CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number INTEGER;
    new_code TEXT;
BEGIN
    -- Получаем максимальный номер
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 'PRJ-(.*)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM projects
    WHERE code ~ '^PRJ-[0-9]+$';
    
    -- Формируем код с ведущими нулями
    new_code := 'PRJ-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN new_code;
END;
$$;

-- Функция установки кода проекта
CREATE OR REPLACE FUNCTION set_project_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.code IS NULL THEN
        NEW.code := generate_project_code();
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================
-- 7. СОЗДАНИЕ ТРИГГЕРОВ
-- ============================================

-- Триггеры для updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_boards_updated_at 
    BEFORE UPDATE ON kanban_boards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_tasks_updated_at 
    BEFORE UPDATE ON kanban_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_items_updated_at 
    BEFORE UPDATE ON production_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at 
    BEFORE UPDATE ON integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at 
    BEFORE UPDATE ON task_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер для автогенерации кода проекта
CREATE TRIGGER set_project_code_trigger 
    BEFORE INSERT ON projects 
    FOR EACH ROW EXECUTE FUNCTION set_project_code();

-- ============================================
-- 8. ОТКЛЮЧЕНИЕ RLS (для разработки)
-- ============================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ✅ БАЗА ДАННЫХ СОЗДАНА!
-- ============================================

SELECT 'База данных успешно создана!' as message;

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
    
    -- План и триал
    plan subscription_plan DEFAULT 'free',
    trial_starts_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    trial_active BOOLEAN DEFAULT false,
    
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

