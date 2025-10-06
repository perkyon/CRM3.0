-- Seed data for development
-- This script creates test users and data for development

-- Insert test users into the users table
INSERT INTO users (id, name, email, phone, role, active, avatar, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Сыроежкин',
  'syroejkin@workshop.ru',
  '+7 495 123-45-67',
  'Manager',
  true,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Олег Смирнов',
  'o.smirnov@workshop.ru',
  '+7 495 234-56-78',
  'Master',
  true,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Дмитрий Козлов',
  'd.kozlov@workshop.ru',
  '+7 495 345-67-89',
  'Procurement',
  true,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Анна Волкова',
  'a.volkova@workshop.ru',
  '+7 495 456-78-90',
  'Accountant',
  true,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
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
INSERT INTO clients (id, type, name, company, preferred_channel, source, status, owner_id, projects_count, ar_balance, notes, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440100',
  'ООО',
  'Тестовая компания',
  'ООО "Тестовая компания"',
  'Email',
  'Сайт',
  'new',
  '550e8400-e29b-41d4-a716-446655440001',
  0,
  0,
  'Тестовый клиент для разработки',
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
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Create a test contact for the client
INSERT INTO contacts (id, client_id, name, role, phone, email, is_primary, created_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440200',
  '550e8400-e29b-41d4-a716-446655440100',
  'Иван Тестов',
  'Директор',
  '+7 495 999-99-99',
  'test@testcompany.ru',
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
INSERT INTO projects (id, client_id, title, site_address, manager_id, foreman_id, start_date, due_date, budget, priority, stage, production_sub_stage, risk_notes, brief_complete, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440300',
  '550e8400-e29b-41d4-a716-446655440100',
  'Тестовый проект',
  'Москва, ул. Тестовая, д. 1',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '2024-01-01',
  '2024-06-01',
  500000,
  'medium',
  'brief',
  null,
  'Тестовый проект для разработки',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  site_address = EXCLUDED.site_address,
  manager_id = EXCLUDED.manager_id,
  foreman_id = EXCLUDED.foreman_id,
  start_date = EXCLUDED.start_date,
  due_date = EXCLUDED.due_date,
  budget = EXCLUDED.budget,
  priority = EXCLUDED.priority,
  stage = EXCLUDED.stage,
  risk_notes = EXCLUDED.risk_notes,
  brief_complete = EXCLUDED.brief_complete,
  updated_at = NOW();

-- Create a test kanban board for the project
INSERT INTO kanban_boards (id, project_id, title, description, created_at, updated_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440400',
  '550e8400-e29b-41d4-a716-446655440300',
  'Тестовая доска',
  'Тестовая канбан доска для разработки',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Create default columns for the kanban board
INSERT INTO kanban_columns (id, board_id, title, stage, position, created_at) VALUES
(
  '550e8400-e29b-41d4-a716-446655440500',
  '550e8400-e29b-41d4-a716-446655440400',
  'К выполнению',
  'todo',
  0,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440501',
  '550e8400-e29b-41d4-a716-446655440400',
  'В работе',
  'in_progress',
  1,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440502',
  '550e8400-e29b-41d4-a716-446655440400',
  'На проверке',
  'review',
  2,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440503',
  '550e8400-e29b-41d4-a716-446655440400',
  'Завершено',
  'done',
  3,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  stage = EXCLUDED.stage,
  position = EXCLUDED.position;
