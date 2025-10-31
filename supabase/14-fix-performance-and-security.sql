-- ============================================
-- 🚀 ИСПРАВЛЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ И БЕЗОПАСНОСТИ
-- ============================================
-- Решение предупреждений Performance Advisor

-- ============================================
-- 1. ДЕЛАЕМ kanban_boards НЕЗАВИСИМОЙ ОТ ПРОЕКТОВ
-- ============================================

-- Проверяем текущее состояние
DO $$
BEGIN
  -- Удаляем NOT NULL ограничение если оно есть
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kanban_boards' 
    AND column_name = 'project_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE kanban_boards ALTER COLUMN project_id DROP NOT NULL;
  END IF;
END $$;

-- Комментарий для ясности
COMMENT ON COLUMN kanban_boards.project_id IS 'Опциональная привязка к проекту. NULL означает общую доску CRM';

-- ============================================
-- 2. УДАЛЯЕМ ДУБЛИРУЮЩИЕСЯ RLS ПОЛИТИКИ (anon)
-- ============================================
-- Удаляем все anon_* политики, оставляем только authenticated_*
-- Это улучшит производительность, так как не будет множественных permissive политик

-- Activities
DROP POLICY IF EXISTS "anon_all_activities" ON activities;

-- Addresses
DROP POLICY IF EXISTS "anon_all_addresses" ON addresses;

-- Client Documents
DROP POLICY IF EXISTS "anon_all_client_documents" ON client_documents;

-- Client Tags
DROP POLICY IF EXISTS "anon_all_client_tags" ON client_tags;

-- Clients
DROP POLICY IF EXISTS "anon_all_clients" ON clients;

-- Contacts
DROP POLICY IF EXISTS "anon_all_contacts" ON contacts;

-- Kanban Boards
DROP POLICY IF EXISTS "anon_all_kanban_boards" ON kanban_boards;

-- Kanban Columns
DROP POLICY IF EXISTS "anon_all_kanban_columns" ON kanban_columns;

-- Kanban Tasks
DROP POLICY IF EXISTS "anon_all_kanban_tasks" ON kanban_tasks;

-- Material Categories
DROP POLICY IF EXISTS "anon_all_material_categories" ON material_categories;

-- Materials
DROP POLICY IF EXISTS "anon_all_materials" ON materials;

-- Production Components
DROP POLICY IF EXISTS "anon_all_production_components" ON production_components;

-- Production Stages
DROP POLICY IF EXISTS "anon_all_production_stages" ON production_stages;

-- Production Item Stages
DROP POLICY IF EXISTS "anon_all_production_item_stages" ON production_item_stages;

-- Production Component Parts
DROP POLICY IF EXISTS "anon_all_production_component_parts" ON production_component_parts;

-- Production Component Materials
DROP POLICY IF EXISTS "anon_all_production_component_materials" ON production_component_materials;

-- Production Items
DROP POLICY IF EXISTS "anon_all_production_items" ON production_items;

-- Project Documents
DROP POLICY IF EXISTS "anon_all_project_documents" ON project_documents;

-- Projects
DROP POLICY IF EXISTS "anon_all_projects" ON projects;

-- Users (только SELECT, остальные уже правильные)
DROP POLICY IF EXISTS "anon_read_users" ON users;

-- ============================================
-- 3. ИСПРАВЛЯЕМ AUTH RLS INIT PLAN ДЛЯ users
-- ============================================
-- Заменяем auth.uid() на (select auth.uid()) чтобы избежать переоценки для каждой строки

DROP POLICY IF EXISTS "authenticated_update_own_user" ON users;
CREATE POLICY "authenticated_update_own_user" ON users
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id::uuid);

-- ============================================
-- 4. ИСПРАВЛЯЕМ ФУНКЦИИ - ДОБАВЛЯЕМ SET search_path
-- ============================================
-- Это предотвращает security vulnerabilities

-- Функция для production_zones
CREATE OR REPLACE FUNCTION update_production_zones_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Функция для production_components
CREATE OR REPLACE FUNCTION update_production_components_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Функция для component_parts
CREATE OR REPLACE FUNCTION update_component_parts_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 5. ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ============================================

-- Проверяем что project_id теперь nullable
SELECT 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'kanban_boards' AND column_name = 'project_id';

-- Проверяем что нет дублирующихся политик
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN (
  'activities', 'addresses', 'clients', 'contacts', 
  'kanban_boards', 'kanban_columns', 'kanban_tasks',
  'projects', 'users'
)
AND policyname LIKE 'anon_%'
ORDER BY tablename, policyname;

-- Если запрос вернул строки - значит еще есть anon политики (это плохо)
-- Если пусто - всё хорошо

