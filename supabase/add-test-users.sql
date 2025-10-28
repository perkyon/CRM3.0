-- Add test users if they don't exist

-- Insert test Manager if not exists
INSERT INTO users (id, name, email, phone, role, active, avatar, created_at)
SELECT 
  gen_random_uuid(),
  'Иван Сыроежкин',
  'manager@example.com',
  '+7 (999) 123-45-67',
  'Manager',
  true,
  NULL,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manager@example.com'
);

-- Insert test Master if not exists
INSERT INTO users (id, name, email, phone, role, active, avatar, created_at)
SELECT 
  gen_random_uuid(),
  'Петр Мастеров',
  'master@example.com',
  '+7 (999) 765-43-21',
  'Master',
  true,
  NULL,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'master@example.com'
);

-- Add more test users
INSERT INTO users (id, name, email, phone, role, active, avatar, created_at)
VALUES
  (gen_random_uuid(), 'Алексей Иванов', 'manager1@example.com', '+7 (999) 111-11-11', 'Manager', true, NULL, now()),
  (gen_random_uuid(), 'Мария Петрова', 'manager2@example.com', '+7 (999) 222-22-22', 'Manager', true, NULL, now()),
  (gen_random_uuid(), 'Сергей Сидоров', 'master1@example.com', '+7 (999) 333-33-33', 'Master', true, NULL, now()),
  (gen_random_uuid(), 'Ольга Смирнова', 'admin@example.com', '+7 (999) 444-44-44', 'Admin', true, NULL, now())
ON CONFLICT (email) DO NOTHING;

SELECT 'Тестовые пользователи добавлены!' as status;

-- Show all users
SELECT id, name, email, role, active, created_at FROM users ORDER BY role, name;

