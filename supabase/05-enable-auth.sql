-- ============================================
-- 🔐 НАСТРОЙКА АУТЕНТИФИКАЦИИ + RLS
-- ============================================
-- Включаем безопасность с авторизацией

-- ============================================
-- 1. ВКЛЮЧАЕМ RLS на всех таблицах
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ПОЛИТИКИ для AUTHENTICATED пользователей
-- ============================================

-- USERS - только чтение всех, изменять только себя
DROP POLICY IF EXISTS "authenticated_read_users" ON users;
CREATE POLICY "authenticated_read_users" ON users
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated_update_own_user" ON users;
CREATE POLICY "authenticated_update_own_user" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id::uuid);

-- CLIENTS - полный доступ для всех авторизованных
DROP POLICY IF EXISTS "authenticated_all_clients" ON clients;
CREATE POLICY "authenticated_all_clients" ON clients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- CONTACTS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_contacts" ON contacts;
CREATE POLICY "authenticated_all_contacts" ON contacts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ADDRESSES - полный доступ
DROP POLICY IF EXISTS "authenticated_all_addresses" ON addresses;
CREATE POLICY "authenticated_all_addresses" ON addresses
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- CLIENT_TAGS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_client_tags" ON client_tags;
CREATE POLICY "authenticated_all_client_tags" ON client_tags
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- CLIENT_DOCUMENTS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_client_documents" ON client_documents;
CREATE POLICY "authenticated_all_client_documents" ON client_documents
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROJECTS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_projects" ON projects;
CREATE POLICY "authenticated_all_projects" ON projects
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROJECT_DOCUMENTS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_project_documents" ON project_documents;
CREATE POLICY "authenticated_all_project_documents" ON project_documents
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- KANBAN_BOARDS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_kanban_boards" ON kanban_boards;
CREATE POLICY "authenticated_all_kanban_boards" ON kanban_boards
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- KANBAN_COLUMNS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_kanban_columns" ON kanban_columns;
CREATE POLICY "authenticated_all_kanban_columns" ON kanban_columns
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- KANBAN_TASKS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_kanban_tasks" ON kanban_tasks;
CREATE POLICY "authenticated_all_kanban_tasks" ON kanban_tasks
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- TASK_COMMENTS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_task_comments" ON task_comments;
CREATE POLICY "authenticated_all_task_comments" ON task_comments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- TASK_ATTACHMENTS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_task_attachments" ON task_attachments;
CREATE POLICY "authenticated_all_task_attachments" ON task_attachments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- CHECKLIST_ITEMS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_checklist_items" ON checklist_items;
CREATE POLICY "authenticated_all_checklist_items" ON checklist_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ACTIVITIES - полный доступ
DROP POLICY IF EXISTS "authenticated_all_activities" ON activities;
CREATE POLICY "authenticated_all_activities" ON activities
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- INTEGRATIONS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_integrations" ON integrations;
CREATE POLICY "authenticated_all_integrations" ON integrations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- MATERIAL_CATEGORIES - полный доступ
DROP POLICY IF EXISTS "authenticated_all_material_categories" ON material_categories;
CREATE POLICY "authenticated_all_material_categories" ON material_categories
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- MATERIALS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_materials" ON materials;
CREATE POLICY "authenticated_all_materials" ON materials
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- PRODUCTION_ITEMS - полный доступ
DROP POLICY IF EXISTS "authenticated_all_production_items" ON production_items;
CREATE POLICY "authenticated_all_production_items" ON production_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. STORAGE ПОЛИТИКИ для authenticated
-- ============================================

-- Удаляем старые anon политики
DROP POLICY IF EXISTS "anon_read_files" ON storage.objects;
DROP POLICY IF EXISTS "anon_upload_files" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_files" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_files" ON storage.objects;

-- Создаём для authenticated
DROP POLICY IF EXISTS "authenticated_read_files" ON storage.objects;
CREATE POLICY "authenticated_read_files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id IN ('client-documents', 'project-documents'));

DROP POLICY IF EXISTS "authenticated_upload_files" ON storage.objects;
CREATE POLICY "authenticated_upload_files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('client-documents', 'project-documents'));

DROP POLICY IF EXISTS "authenticated_update_files" ON storage.objects;
CREATE POLICY "authenticated_update_files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('client-documents', 'project-documents'));

DROP POLICY IF EXISTS "authenticated_delete_files" ON storage.objects;
CREATE POLICY "authenticated_delete_files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('client-documents', 'project-documents'));

-- ============================================
-- 4. ПРОВЕРКА
-- ============================================

SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '🔒 Включен' ELSE '🔓 Отключен' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

SELECT 
    'Политики созданы: ' || COUNT(*) as message
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================
-- ✅ ГОТОВО!
-- ============================================
-- RLS включен, политики настроены для authenticated
-- Теперь создайте пользователя в Supabase Auth!

