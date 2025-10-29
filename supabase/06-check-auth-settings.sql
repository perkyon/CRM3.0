-- ============================================
-- 🔍 ПРОВЕРКА НАСТРОЕК AUTH
-- ============================================

-- 1. Проверяем созданного пользователя
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Подтвержден'
        ELSE '❌ НЕ подтвержден'
    END as status
FROM auth.users
WHERE email = 'fominsevil@gmail.com';

-- 2. Проверяем связь с таблицей users
SELECT 
    u.id,
    u.email as auth_email,
    uu.name,
    uu.role
FROM auth.users u
LEFT JOIN public.users uu ON u.id::text = uu.id
WHERE u.email = 'fominsevil@gmail.com';

-- ============================================
-- 📝 ЧТО ДЕЛАТЬ:
-- ============================================
-- 
-- Если email_confirmed_at = NULL:
--   1. Перейди в Authentication → Users
--   2. Найди пользователя fominsevil@gmail.com
--   3. Нажми на email
--   4. Нажми "Confirm email" в правом углу
--
-- Если пользователя нет в public.users:
--   Запусти скрипт из предыдущего сообщения
--
-- ============================================

