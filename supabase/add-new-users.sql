-- ============================================
-- 👥 ДОБАВЛЕНИЕ НОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================
-- 
-- ⚠️ ВАЖНО: Перед выполнением этого скрипта нужно создать пользователей
-- в Supabase Authentication → Users → Add user
-- 
-- Для каждого пользователя:
-- 1. Создай в Authentication → Users:
--    - Email: из списка ниже
--    - Password: из списка ниже
--    - Auto Confirm User: ✅ ВКЛ
-- 2. Скопируй User UID (выглядит как uuid)
-- 3. Замени USER_UID в соответствующем INSERT на скопированный UUID
-- 4. Выполни этот скрипт
--
-- ============================================

BEGIN;

-- 1. Кельш Юрий - Начальник цеха
-- Email: kelsh-97@mail.ru
-- Пароль: 11081997Kelsh
-- Телефон: 89885090021
-- ⚠️ Замени USER_UID_1 на реальный UUID из auth.users
INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
VALUES (
  'USER_UID_1', -- ⚠️ ЗАМЕНИ НА UUID из auth.users для kelsh-97@mail.ru
  'Кельш Юрий',
  'kelsh-97@mail.ru',
  '89885090021',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 2. Першин Виталий - Админ/Владелец компании
-- Email: vv.pershin023@yandex.ru
-- Пароль: 0808
-- Телефон: +7 (918) 412-87-19
INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
VALUES (
  'USER_UID_2', -- ⚠️ ЗАМЕНИ НА UUID из auth.users для vv.pershin023@yandex.ru
  'Першин Виталий',
  'vv.pershin023@yandex.ru',
  '+7 (918) 412-87-19',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 3. Яценко Дмитрий - Исполнитель
-- Email: dmitrii.yatsenko@yandex.ru
-- Пароль: 2346
-- Телефон: 89385232358
INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
VALUES (
  'USER_UID_3', -- ⚠️ ЗАМЕНИ НА UUID из auth.users для dmitrii.yatsenko@yandex.ru
  'Яценко Дмитрий',
  'dmitrii.yatsenko@yandex.ru',
  '89385232358',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 4. Смирнов Олег - Исполнитель
-- Email: alegofrend2000@buro.gsgn
-- Пароль: 3536
-- Телефон: NULL
INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
VALUES (
  'USER_UID_4', -- ⚠️ ЗАМЕНИ НА UUID из auth.users для alegofrend2000@buro.gsgn
  'Смирнов Олег',
  'alegofrend2000@buro.gsgn',
  NULL,
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- 5. Фоминцев Илья - Администратор
-- Email: fominsevil@gmail.com
-- Пароль: 3536
-- Телефон: +79952025404
INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
VALUES (
  'USER_UID_5', -- ⚠️ ЗАМЕНИ НА UUID из auth.users для fominsevil@gmail.com
  'Фоминцев Илья',
  'fominsevil@gmail.com',
  '+79952025404',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

COMMIT;

-- ============================================
-- ✅ ПРОВЕРКА
-- ============================================

-- Проверка всех пользователей
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.role,
  u.active,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Связан с auth'
    ELSE '❌ НЕТ в auth.users'
  END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id::uuid = au.id
WHERE u.email IN (
  'kelsh-97@mail.ru',
  'vv.pershin023@yandex.ru',
  'dmitrii.yatsenko@yandex.ru',
  'alegofrend2000@buro.gsgn',
  'fominsevil@gmail.com'
)
ORDER BY u.name;

-- ============================================
-- 📋 ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ
-- ============================================
-- 
-- 1. Открой Supabase Dashboard → Authentication → Users
-- 2. Для каждого пользователя из списка выше:
--    a. Нажми "Add user" → "Create new user"
--    b. Введи Email и Password из списка
--    c. Включи "Auto Confirm User"
--    d. Нажми "Create user"
--    e. Скопируй User UID (uuid)
-- 3. Замени USER_UID_1, USER_UID_2, ... в SQL скрипте на реальные UUID
-- 4. Выполни этот скрипт в SQL Editor
-- 5. Проверь результат запросом выше
--
-- ============================================

