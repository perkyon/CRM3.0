-- ENABLE RLS WITH PROPER POLICIES
-- This script enables RLS on all tables with appropriate policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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
DROP POLICY IF EXISTS "client_tags_insert_policy" ON client_tags;
DROP POLICY IF EXISTS "client_tags_update_policy" ON client_tags;
DROP POLICY IF EXISTS "client_tags_delete_policy" ON client_tags;

DROP POLICY IF EXISTS "client_documents_select_policy" ON client_documents;
DROP POLICY IF EXISTS "client_documents_insert_policy" ON client_documents;
DROP POLICY IF EXISTS "client_documents_update_policy" ON client_documents;
DROP POLICY IF EXISTS "client_documents_delete_policy" ON client_documents;

DROP POLICY IF EXISTS "project_documents_select_policy" ON project_documents;
DROP POLICY IF EXISTS "project_documents_insert_policy" ON project_documents;
DROP POLICY IF EXISTS "project_documents_update_policy" ON project_documents;
DROP POLICY IF EXISTS "project_documents_delete_policy" ON project_documents;

DROP POLICY IF EXISTS "kanban_boards_select_policy" ON kanban_boards;
DROP POLICY IF EXISTS "kanban_boards_insert_policy" ON kanban_boards;
DROP POLICY IF EXISTS "kanban_boards_update_policy" ON kanban_boards;
DROP POLICY IF EXISTS "kanban_boards_delete_policy" ON kanban_boards;

DROP POLICY IF EXISTS "kanban_columns_select_policy" ON kanban_columns;
DROP POLICY IF EXISTS "kanban_columns_insert_policy" ON kanban_columns;
DROP POLICY IF EXISTS "kanban_columns_update_policy" ON kanban_columns;
DROP POLICY IF EXISTS "kanban_columns_delete_policy" ON kanban_columns;

DROP POLICY IF EXISTS "kanban_tasks_select_policy" ON kanban_tasks;
DROP POLICY IF EXISTS "kanban_tasks_insert_policy" ON kanban_tasks;
DROP POLICY IF EXISTS "kanban_tasks_update_policy" ON kanban_tasks;
DROP POLICY IF EXISTS "kanban_tasks_delete_policy" ON kanban_tasks;

DROP POLICY IF EXISTS "task_comments_select_policy" ON task_comments;
DROP POLICY IF EXISTS "task_comments_insert_policy" ON task_comments;
DROP POLICY IF EXISTS "task_comments_update_policy" ON task_comments;
DROP POLICY IF EXISTS "task_comments_delete_policy" ON task_comments;

DROP POLICY IF EXISTS "task_attachments_select_policy" ON task_attachments;
DROP POLICY IF EXISTS "task_attachments_insert_policy" ON task_attachments;
DROP POLICY IF EXISTS "task_attachments_update_policy" ON task_attachments;
DROP POLICY IF EXISTS "task_attachments_delete_policy" ON task_attachments;

DROP POLICY IF EXISTS "checklist_items_select_policy" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_insert_policy" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_update_policy" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_delete_policy" ON checklist_items;

DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "activities_insert_policy" ON activities;
DROP POLICY IF EXISTS "activities_update_policy" ON activities;
DROP POLICY IF EXISTS "activities_delete_policy" ON activities;

DROP POLICY IF EXISTS "integrations_select_policy" ON integrations;
DROP POLICY IF EXISTS "integrations_insert_policy" ON integrations;
DROP POLICY IF EXISTS "integrations_update_policy" ON integrations;
DROP POLICY IF EXISTS "integrations_delete_policy" ON integrations;

-- Create new policies for authenticated users
-- For now, we'll allow all authenticated users to access all data
-- In production, you should implement more granular permissions

-- Users policies
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (auth.role() = 'authenticated');

-- Clients policies
CREATE POLICY "clients_select_policy" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "clients_insert_policy" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "clients_update_policy" ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "clients_delete_policy" ON clients FOR DELETE USING (auth.role() = 'authenticated');

-- Projects policies
CREATE POLICY "projects_select_policy" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "projects_insert_policy" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update_policy" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "projects_delete_policy" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- Contacts policies
CREATE POLICY "contacts_select_policy" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contacts_insert_policy" ON contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "contacts_update_policy" ON contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "contacts_delete_policy" ON contacts FOR DELETE USING (auth.role() = 'authenticated');

-- Addresses policies
CREATE POLICY "addresses_select_policy" ON addresses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "addresses_insert_policy" ON addresses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "addresses_update_policy" ON addresses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "addresses_delete_policy" ON addresses FOR DELETE USING (auth.role() = 'authenticated');

-- Client tags policies
CREATE POLICY "client_tags_select_policy" ON client_tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "client_tags_insert_policy" ON client_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "client_tags_update_policy" ON client_tags FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "client_tags_delete_policy" ON client_tags FOR DELETE USING (auth.role() = 'authenticated');

-- Client documents policies
CREATE POLICY "client_documents_select_policy" ON client_documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "client_documents_insert_policy" ON client_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "client_documents_update_policy" ON client_documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "client_documents_delete_policy" ON client_documents FOR DELETE USING (auth.role() = 'authenticated');

-- Project documents policies
CREATE POLICY "project_documents_select_policy" ON project_documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "project_documents_insert_policy" ON project_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "project_documents_update_policy" ON project_documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "project_documents_delete_policy" ON project_documents FOR DELETE USING (auth.role() = 'authenticated');

-- Kanban boards policies
CREATE POLICY "kanban_boards_select_policy" ON kanban_boards FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "kanban_boards_insert_policy" ON kanban_boards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "kanban_boards_update_policy" ON kanban_boards FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "kanban_boards_delete_policy" ON kanban_boards FOR DELETE USING (auth.role() = 'authenticated');

-- Kanban columns policies
CREATE POLICY "kanban_columns_select_policy" ON kanban_columns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "kanban_columns_insert_policy" ON kanban_columns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "kanban_columns_update_policy" ON kanban_columns FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "kanban_columns_delete_policy" ON kanban_columns FOR DELETE USING (auth.role() = 'authenticated');

-- Kanban tasks policies
CREATE POLICY "kanban_tasks_select_policy" ON kanban_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "kanban_tasks_insert_policy" ON kanban_tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "kanban_tasks_update_policy" ON kanban_tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "kanban_tasks_delete_policy" ON kanban_tasks FOR DELETE USING (auth.role() = 'authenticated');

-- Task comments policies
CREATE POLICY "task_comments_select_policy" ON task_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "task_comments_insert_policy" ON task_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "task_comments_update_policy" ON task_comments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "task_comments_delete_policy" ON task_comments FOR DELETE USING (auth.role() = 'authenticated');

-- Task attachments policies
CREATE POLICY "task_attachments_select_policy" ON task_attachments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "task_attachments_insert_policy" ON task_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "task_attachments_update_policy" ON task_attachments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "task_attachments_delete_policy" ON task_attachments FOR DELETE USING (auth.role() = 'authenticated');

-- Checklist items policies
CREATE POLICY "checklist_items_select_policy" ON checklist_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "checklist_items_insert_policy" ON checklist_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "checklist_items_update_policy" ON checklist_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "checklist_items_delete_policy" ON checklist_items FOR DELETE USING (auth.role() = 'authenticated');

-- Activities policies
CREATE POLICY "activities_select_policy" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "activities_insert_policy" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "activities_update_policy" ON activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "activities_delete_policy" ON activities FOR DELETE USING (auth.role() = 'authenticated');

-- Integrations policies
CREATE POLICY "integrations_select_policy" ON integrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "integrations_insert_policy" ON integrations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "integrations_update_policy" ON integrations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "integrations_delete_policy" ON integrations FOR DELETE USING (auth.role() = 'authenticated');

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'clients', 'projects', 'contacts', 'addresses', 'kanban_boards', 'kanban_columns', 'kanban_tasks')
ORDER BY tablename;

-- Test queries to make sure they work with RLS
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_clients FROM clients;
SELECT COUNT(*) as total_projects FROM projects;
SELECT COUNT(*) as total_contacts FROM contacts;
SELECT COUNT(*) as total_addresses FROM addresses;
SELECT COUNT(*) as total_kanban_boards FROM kanban_boards;
SELECT COUNT(*) as total_kanban_columns FROM kanban_columns;
SELECT COUNT(*) as total_kanban_tasks FROM kanban_tasks;
