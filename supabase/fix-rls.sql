-- Fix RLS policies for development
-- This script creates basic RLS policies that allow authenticated users to access data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON clients;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON projects;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON addresses;

-- Create simple policies that allow all authenticated users
CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON addresses
  FOR ALL USING (auth.role() = 'authenticated');

-- Create a test user in the users table
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

-- Create a test client
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

-- Create a test contact for the client
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

-- Create a test project
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
