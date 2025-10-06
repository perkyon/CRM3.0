# 🔧 Окончательное исправление RLS политик

## 🚨 ПРОБЛЕМА:
У вас есть **множественные дублирующиеся RLS политики**, которые конфликтуют друг с другом и замедляют работу:

- `"Allow all for authenticated users"` 
- `"Authenticated users can view clients"`
- `"Users can view own profile"`

Это создает конфликты и ошибки 400/409!

## ✅ РЕШЕНИЕ:

### ШАГ 1: Откройте Supabase Dashboard
1. Перейдите в ваш Supabase проект
2. Откройте **SQL Editor**

### ШАГ 2: Выполните ОЧИСТКУ RLS политик
Скопируйте и выполните содержимое файла `supabase/clean-rls.sql`:

```sql
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
```

### ШАГ 3: Создайте пользователя в Auth
1. **Authentication** → **Users** → **"Add user"**
2. **Email:** `fominsevil@gmail.com`
3. **Password:** `admin123`
4. **Auto Confirm User:** ✅ (поставьте галочку)

### ШАГ 4: Проверьте результат
1. Обновите страницу CRM
2. Проверьте консоль браузера
3. Должны исчезнуть ошибки 400/409

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
- ✅ **Нет ошибок** 400/409
- ✅ **Нет конфликтов** RLS политик
- ✅ **Быстрая загрузка** клиентов
- ✅ **Можно создавать** клиентов и проекты
- ✅ **Оптимизированная производительность**

## 🔍 КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ:
1. **Удалены все дублирующиеся политики**
2. **Созданы оптимизированные политики** с `(select auth.role())`
3. **Убраны конфликты** между политиками
4. **Улучшена производительность** RLS

## 🆘 ЕСЛИ НЕ РАБОТАЕТ:
1. Проверьте, что SQL скрипт выполнился без ошибок
2. Убедитесь, что пользователь создан в Auth
3. Проверьте, что RLS политики созданы в **Database** → **Policies**
4. Сообщите о результатах

**Этот скрипт должен полностью решить проблему с RLS!** 🚀
