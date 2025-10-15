-- Simple RLS policies for development
-- These policies allow all authenticated users to access all data

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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view their own user data" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own user data" ON users;
DROP POLICY IF EXISTS "Allow managers and admins to view all users" ON users;
DROP POLICY IF EXISTS "Allow admins to insert users" ON users;
DROP POLICY IF EXISTS "Allow admins to update any user" ON users;
DROP POLICY IF EXISTS "Allow admins to delete users" ON users;

-- Create simple policies that allow all authenticated users to do everything
CREATE POLICY "Allow all authenticated users full access to users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to clients" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to addresses" ON addresses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to client_tags" ON client_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to client_documents" ON client_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to project_documents" ON project_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to kanban_boards" ON kanban_boards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to kanban_columns" ON kanban_columns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to kanban_tasks" ON kanban_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to task_comments" ON task_comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to task_attachments" ON task_attachments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to checklist_items" ON checklist_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to activities" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to integrations" ON integrations FOR ALL USING (auth.role() = 'authenticated');

-- Also allow anonymous access for development (optional)
CREATE POLICY "Allow anonymous access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to addresses" ON addresses FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to client_tags" ON client_tags FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to client_documents" ON client_documents FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to project_documents" ON project_documents FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to kanban_boards" ON kanban_boards FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to kanban_columns" ON kanban_columns FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to kanban_tasks" ON kanban_tasks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to task_comments" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to task_attachments" ON task_attachments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to checklist_items" ON checklist_items FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow anonymous access to integrations" ON integrations FOR SELECT USING (true);
