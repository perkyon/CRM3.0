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

