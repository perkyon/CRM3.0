-- Clean RLS policies and create optimized ones
-- This script removes all existing policies and creates clean, optimized ones

-- ==============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ==============================================

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;

-- Drop all policies on clients table
DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON clients;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON clients;

-- Drop all policies on projects table
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON projects;

-- Drop all policies on contacts table
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON contacts;

-- Drop all policies on addresses table
DROP POLICY IF EXISTS "Authenticated users can view addresses" ON addresses;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON addresses;

-- Drop all policies on other tables
DROP POLICY IF EXISTS "Authenticated users can view client_tags" ON client_tags;
DROP POLICY IF EXISTS "Authenticated users can view client_documents" ON client_documents;
DROP POLICY IF EXISTS "Authenticated users can view project_documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can view kanban_boards" ON kanban_boards;
DROP POLICY IF EXISTS "Authenticated users can view kanban_columns" ON kanban_columns;
DROP POLICY IF EXISTS "Authenticated users can view kanban_tasks" ON kanban_tasks;
DROP POLICY IF EXISTS "Authenticated users can view task_comments" ON task_comments;
DROP POLICY IF EXISTS "Authenticated users can view task_attachments" ON task_attachments;
DROP POLICY IF EXISTS "Authenticated users can view checklist_items" ON checklist_items;
DROP POLICY IF EXISTS "Authenticated users can view activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can view integrations" ON integrations;

-- ==============================================
-- STEP 2: CREATE OPTIMIZED POLICIES
-- ==============================================

-- Users table - optimized policies
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "users_insert_policy" ON users
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "users_delete_policy" ON users
  FOR DELETE USING ((select auth.role()) = 'authenticated');

-- Clients table - optimized policies
CREATE POLICY "clients_select_policy" ON clients
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "clients_insert_policy" ON clients
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "clients_update_policy" ON clients
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "clients_delete_policy" ON clients
  FOR DELETE USING ((select auth.role()) = 'authenticated');

-- Projects table - optimized policies
CREATE POLICY "projects_select_policy" ON projects
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "projects_insert_policy" ON projects
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "projects_update_policy" ON projects
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "projects_delete_policy" ON projects
  FOR DELETE USING ((select auth.role()) = 'authenticated');

-- Contacts table - optimized policies
CREATE POLICY "contacts_select_policy" ON contacts
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "contacts_insert_policy" ON contacts
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "contacts_update_policy" ON contacts
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "contacts_delete_policy" ON contacts
  FOR DELETE USING ((select auth.role()) = 'authenticated');

-- Addresses table - optimized policies
CREATE POLICY "addresses_select_policy" ON addresses
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "addresses_insert_policy" ON addresses
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "addresses_update_policy" ON addresses
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "addresses_delete_policy" ON addresses
  FOR DELETE USING ((select auth.role()) = 'authenticated');

-- Other tables - optimized policies
CREATE POLICY "client_tags_select_policy" ON client_tags
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "client_documents_select_policy" ON client_documents
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "project_documents_select_policy" ON project_documents
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "kanban_boards_select_policy" ON kanban_boards
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "kanban_columns_select_policy" ON kanban_columns
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "kanban_tasks_select_policy" ON kanban_tasks
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "task_comments_select_policy" ON task_comments
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "task_attachments_select_policy" ON task_attachments
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "checklist_items_select_policy" ON checklist_items
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "activities_select_policy" ON activities
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY "integrations_select_policy" ON integrations
  FOR SELECT USING ((select auth.role()) = 'authenticated');

-- ==============================================
-- STEP 3: CREATE TEST DATA
-- ==============================================

-- Create test user
INSERT INTO users (id, name, email, phone, role, active, avatar, created_at, updated_at) VALUES
(
  '9fc4d042-f598-487c-a383-cccfe0e219db',
  'Сыроежкин',
  'fominsevil@gmail.com',
  '+7 495 123-45-67',
  'Manager',
  true,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  avatar = EXCLUDED.avatar,
  updated_at = NOW();

-- Create test client
INSERT INTO clients (id, type, name, company, preferred_channel, source, status, owner_id, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Физ. лицо',
  'Тестовый клиент',
  'Тестовая компания',
  'Phone',
  'Сайт',
  'new',
  '9fc4d042-f598-487c-a383-cccfe0e219db',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  company = EXCLUDED.company,
  preferred_channel = EXCLUDED.preferred_channel,
  source = EXCLUDED.source,
  status = EXCLUDED.status,
  owner_id = EXCLUDED.owner_id,
  updated_at = NOW();

-- Create test contact
INSERT INTO contacts (id, client_id, name, role, phone, email, is_primary, created_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Иван Иванов',
  'Владелец',
  '+7 495 123-45-67',
  'ivan@test.com',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  is_primary = EXCLUDED.is_primary;

-- Create test project
INSERT INTO projects (id, client_id, title, site_address, manager_id, start_date, due_date, budget, priority, stage, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440001',
  'Тестовый проект',
  'Москва, ул. Тестовая, 1',
  '9fc4d042-f598-487c-a383-cccfe0e219db',
  NOW(),
  NOW() + INTERVAL '30 days',
  100000,
  'medium',
  'brief',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  site_address = EXCLUDED.site_address,
  manager_id = EXCLUDED.manager_id,
  start_date = EXCLUDED.start_date,
  due_date = EXCLUDED.due_date,
  budget = EXCLUDED.budget,
  priority = EXCLUDED.priority,
  stage = EXCLUDED.stage,
  updated_at = NOW();

-- ==============================================
-- STEP 4: VERIFY POLICIES
-- ==============================================

-- Show all policies to verify they're clean
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
