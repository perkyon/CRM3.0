-- Полностью отключить RLS на всех таблицах для разработки
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

-- Удалить все политики RLS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can view addresses" ON addresses;
DROP POLICY IF EXISTS "Authenticated users can view client_tags" ON client_tags;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
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

-- Обновить кэш схемы
NOTIFY pgrst, 'reload schema';
