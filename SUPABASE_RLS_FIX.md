# 🔧 Исправление RLS политик в Supabase

## 🚨 ПРОБЛЕМА:
Ошибка `due to access control checks` означает, что RLS (Row Level Security) политики блокируют доступ к данным.

## ✅ РЕШЕНИЕ:

### ШАГ 1: Откройте Supabase Dashboard
1. Перейдите в ваш Supabase проект
2. Откройте **SQL Editor**

### ШАГ 2: Выполните SQL скрипт
Скопируйте и выполните содержимое файла `supabase/fix-rls.sql`:

```sql
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

-- Create test data
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
```

### ШАГ 3: Создайте пользователя в Auth
1. Перейдите в **Authentication** → **Users**
2. Нажмите **"Add user"**
3. Заполните:
   - **Email:** `fominsevil@gmail.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (поставьте галочку)

### ШАГ 4: Проверьте результат
1. Обновите страницу CRM
2. Проверьте консоль браузера
3. Должны исчезнуть ошибки 409

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- ✅ Нет ошибок `access control checks`
- ✅ Клиенты загружаются быстро
- ✅ Можно создавать новых клиентов
- ✅ Можно создавать проекты

## 🆘 ЕСЛИ НЕ РАБОТАЕТ:
1. Проверьте, что SQL скрипт выполнился без ошибок
2. Убедитесь, что пользователь создан в Auth
3. Проверьте, что RLS политики созданы в **Database** → **Policies**
4. Сообщите о результатах
