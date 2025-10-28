-- Проверка существующих пользователей

-- Показать всех пользователей
SELECT 
  id, 
  name, 
  email, 
  role, 
  position, 
  status,
  created_at
FROM users 
ORDER BY role, name;

-- Посчитать пользователей по ролям
SELECT 
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role;

-- Проверка: есть ли RLS на таблице users
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'users';

