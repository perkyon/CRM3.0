-- ============================================
-- ✨ СОЗДАНИЕ НОВОГО ПОЛЬЗОВАТЕЛЯ
-- ============================================

BEGIN;

-- 1. Удаляем старые записи
DELETE FROM public.users WHERE email = 'fominsevil@gmail.com';

-- 2. Создаём нового пользователя с новым Auth ID
INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
VALUES (
  'fb122405-f30c-4cf2-801b-f0794e2e798b',
  'Илья',
  'fominsevil@gmail.com',
  '+7 (995) 202-54-04',
  'Admin',
  true,
  NOW(),
  NOW()
);

COMMIT;

-- 3. Проверка
SELECT id, name, email, role, active 
FROM public.users 
WHERE email = 'fominsevil@gmail.com';

-- 4. Проверка совпадения с Auth
SELECT 
    au.id::text as auth_id,
    pu.id as user_id,
    CASE WHEN au.id = pu.id::uuid THEN '✅ СОВПАДАЮТ' ELSE '❌ НЕ СОВПАДАЮТ' END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id::uuid
WHERE au.email = 'fominsevil@gmail.com';

-- ============================================
-- ✅ ГОТОВО!
-- ============================================
-- Теперь очисти кеш браузера и войди!

