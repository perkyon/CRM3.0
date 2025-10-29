-- ============================================
-- 🔓 ОТКЛЮЧЕНИЕ RLS для разработки
-- ============================================
-- Запустите этот скрипт если есть ошибки 403/CORS

-- 1. Отключаем RLS на всех таблицах
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_items DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем все политики (если остались)
DROP POLICY IF EXISTS "anon_read_users" ON users;
DROP POLICY IF EXISTS "anon_all_clients" ON clients;
DROP POLICY IF EXISTS "anon_all_contacts" ON contacts;
DROP POLICY IF EXISTS "anon_all_addresses" ON addresses;
DROP POLICY IF EXISTS "anon_all_client_tags" ON client_tags;
DROP POLICY IF EXISTS "anon_all_client_documents" ON client_documents;
DROP POLICY IF EXISTS "anon_all_projects" ON projects;
DROP POLICY IF EXISTS "anon_all_project_documents" ON project_documents;
DROP POLICY IF EXISTS "anon_all_project_stages" ON project_stages;
DROP POLICY IF EXISTS "anon_all_kanban_boards" ON kanban_boards;
DROP POLICY IF EXISTS "anon_all_kanban_columns" ON kanban_columns;
DROP POLICY IF EXISTS "anon_all_kanban_tasks" ON kanban_tasks;
DROP POLICY IF EXISTS "anon_all_task_comments" ON task_comments;
DROP POLICY IF EXISTS "anon_all_task_attachments" ON task_attachments;
DROP POLICY IF EXISTS "anon_all_checklist_items" ON checklist_items;
DROP POLICY IF EXISTS "anon_all_activities" ON activities;
DROP POLICY IF EXISTS "anon_all_integrations" ON integrations;
DROP POLICY IF EXISTS "anon_all_material_categories" ON material_categories;
DROP POLICY IF EXISTS "anon_all_materials" ON materials;
DROP POLICY IF EXISTS "anon_all_production_items" ON production_items;

-- 3. Проверка статуса RLS
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '🔒 Включен' ELSE '🔓 Отключен' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- ============================================
-- ✅ RLS отключен для всех таблиц!
-- ============================================
-- Теперь можно работать без аутентификации

