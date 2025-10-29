-- 🔍 Диагностика настройки базы данных

-- 1️⃣ Проверка пользователей
SELECT '=== 1. ПОЛЬЗОВАТЕЛИ ===' as info;
SELECT 
  id, 
  name, 
  email, 
  role, 
  active,
  created_at
FROM users 
ORDER BY role, name;

SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- 2️⃣ Проверка этапов проекта (enum)
SELECT '=== 2. ЭТАПЫ ПРОЕКТА (ENUM) ===' as info;
SELECT 
  enumlabel as stage_value,
  enumsortorder as sort_order
FROM pg_enum 
WHERE enumtypid = 'project_stage'::regtype 
ORDER BY enumsortorder;

-- 3️⃣ Проверка RLS (Row Level Security)
SELECT '=== 3. RLS СТАТУС ===' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'clients', 'projects', 'production_zones', 'production_items', 'production_components')
ORDER BY tablename;

-- 4️⃣ Проверка клиентов
SELECT '=== 4. КЛИЕНТЫ ===' as info;
SELECT 
  id,
  name,
  type,
  preferred_channel,
  created_at
FROM clients
ORDER BY created_at DESC
LIMIT 5;

-- 5️⃣ Проверка проектов
SELECT '=== 5. ПРОЕКТЫ ===' as info;
SELECT 
  id,
  title,
  stage,
  client_id,
  manager_id,
  created_at
FROM projects
ORDER BY created_at DESC
LIMIT 5;

-- 6️⃣ Проверка структуры таблицы projects
SELECT '=== 6. СТРУКТУРА ТАБЛИЦЫ PROJECTS ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'projects'
ORDER BY ordinal_position;

-- 7️⃣ Проверка внешних ключей
SELECT '=== 7. ВНЕШНИЕ КЛЮЧИ PROJECTS ===' as info;
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='projects';

SELECT '✅ Диагностика завершена!' as status;

