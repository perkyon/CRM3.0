-- ============================================
-- 🔍 ПРОВЕРКА СВЯЗИ AUTH <-> USERS
-- ============================================

-- 1. Проверяем Auth пользователя
SELECT 
    id as auth_id,
    email,
    email_confirmed_at
FROM auth.users
WHERE email = 'fominsevil@gmail.com';

-- 2. Проверяем Users таблицу
SELECT 
    id as user_id,
    name,
    email,
    role
FROM public.users
WHERE email = 'fominsevil@gmail.com';

-- 3. Проверяем совпадают ли ID
SELECT 
    au.id::text as auth_id,
    pu.id as user_id,
    CASE 
        WHEN au.id = pu.id::uuid THEN '✅ ID совпадают'
        ELSE '❌ ID НЕ совпадают'
    END as status,
    au.email as auth_email,
    pu.email as user_email,
    pu.name,
    pu.role
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.id::uuid
WHERE au.email = 'fominsevil@gmail.com' 
   OR pu.email = 'fominsevil@gmail.com';

-- ============================================
-- 📝 ЧТО ДОЛЖНО БЫТЬ:
-- ============================================
-- ID должны совпадать!
-- Если НЕ совпадают - запусти UPDATE из предыдущих сообщений

