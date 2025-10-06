-- DISABLE RLS TEMPORARILY FOR DEVELOPMENT
-- This script disables RLS on all tables to fix 400/409 errors

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (they're not needed when RLS is disabled)
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

DROP POLICY IF EXISTS "clients_select_policy" ON clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON clients;
DROP POLICY IF EXISTS "clients_update_policy" ON clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON clients;

DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

DROP POLICY IF EXISTS "contacts_select_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON contacts;

DROP POLICY IF EXISTS "addresses_select_policy" ON addresses;
DROP POLICY IF EXISTS "addresses_insert_policy" ON addresses;
DROP POLICY IF EXISTS "addresses_update_policy" ON addresses;
DROP POLICY IF EXISTS "addresses_delete_policy" ON addresses;

DROP POLICY IF EXISTS "client_tags_select_policy" ON client_tags;
DROP POLICY IF EXISTS "client_documents_select_policy" ON client_documents;
DROP POLICY IF EXISTS "project_documents_select_policy" ON project_documents;
DROP POLICY IF EXISTS "kanban_boards_select_policy" ON kanban_boards;
DROP POLICY IF EXISTS "kanban_columns_select_policy" ON kanban_columns;
DROP POLICY IF EXISTS "kanban_tasks_select_policy" ON kanban_tasks;
DROP POLICY IF EXISTS "task_comments_select_policy" ON task_comments;
DROP POLICY IF EXISTS "task_attachments_select_policy" ON task_attachments;
DROP POLICY IF EXISTS "checklist_items_select_policy" ON checklist_items;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "integrations_select_policy" ON integrations;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'clients', 'projects', 'contacts', 'addresses')
ORDER BY tablename;

-- Test queries to make sure they work
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_clients FROM clients;
SELECT COUNT(*) as total_projects FROM projects;
SELECT COUNT(*) as total_contacts FROM contacts;
SELECT COUNT(*) as total_addresses FROM addresses;
