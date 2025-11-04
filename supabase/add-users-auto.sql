-- ============================================
-- 👥 ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЕЙ (АВТОМАТИЧЕСКИЙ)
-- ============================================
-- 
-- Этот скрипт автоматически создаст профили для пользователей,
-- которые уже созданы в Authentication → Users
-- 
-- ⚠️ ВАЖНО: Сначала создай пользователей в Authentication → Users
-- 
-- Для каждого пользователя:
-- 1. Открой Authentication → Users → Add user
-- 2. Заполни Email и Password (из списка ниже)
-- 3. Включи "Auto Confirm User"
-- 4. Нажми "Create user"
-- 5. После создания всех пользователей выполни этот скрипт
--
-- ============================================

BEGIN;

-- Функция для автоматического создания/обновления профиля пользователя
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- 1. Кельш Юрий
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'kelsh-97@mail.ru';
  
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
    VALUES (
      auth_user_id,
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
    
    RAISE NOTICE '✅ Кельш Юрий: профиль создан/обновлен (ID: %)', auth_user_id;
  ELSE
    RAISE WARNING '⚠️  Кельш Юрий: пользователь не найден в auth.users. Создай его в Authentication → Users';
  END IF;

  -- 2. Першин Виталий
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'vv.pershin023@yandex.ru';
  
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
    VALUES (
      auth_user_id,
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
    
    RAISE NOTICE '✅ Першин Виталий: профиль создан/обновлен (ID: %)', auth_user_id;
  ELSE
    RAISE WARNING '⚠️  Першин Виталий: пользователь не найден в auth.users. Создай его в Authentication → Users';
  END IF;

  -- 3. Яценко Дмитрий
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'dmitrii.yatsenko@yandex.ru';
  
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
    VALUES (
      auth_user_id,
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
    
    RAISE NOTICE '✅ Яценко Дмитрий: профиль создан/обновлен (ID: %)', auth_user_id;
  ELSE
    RAISE WARNING '⚠️  Яценко Дмитрий: пользователь не найден в auth.users. Создай его в Authentication → Users';
  END IF;

  -- 4. Смирнов Олег
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'alegofrend2000@buro.gsgn';
  
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
    VALUES (
      auth_user_id,
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
    
    RAISE NOTICE '✅ Смирнов Олег: профиль создан/обновлен (ID: %)', auth_user_id;
  ELSE
    RAISE WARNING '⚠️  Смирнов Олег: пользователь не найден в auth.users. Создай его в Authentication → Users';
  END IF;

  -- 5. Фоминцев Илья
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'fominsevil@gmail.com';
  
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
    VALUES (
      auth_user_id,
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
    
    RAISE NOTICE '✅ Фоминцев Илья: профиль создан/обновлен (ID: %)', auth_user_id;
  ELSE
    RAISE WARNING '⚠️  Фоминцев Илья: пользователь не найден в auth.users. Создай его в Authentication → Users';
  END IF;

END $$;

COMMIT;

-- ============================================
-- ✅ ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

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
-- 
-- 2. Для каждого пользователя нажми "Add user" → "Create new user":
--    - Email: kelsh-97@mail.ru
--    - Password: 11081997Kelsh
--    - ✅ Auto Confirm User: ВКЛ
--    - Нажми "Create user"
-- 
--    Повтори для остальных:
--    - vv.pershin023@yandex.ru / 0808
--    - dmitrii.yatsenko@yandex.ru / 2346
--    - alegofrend2000@buro.gsgn / 3536
--    - fominsevil@gmail.com / 3536
-- 
-- 3. После создания всех пользователей выполни этот скрипт в SQL Editor
-- 
-- 4. Скрипт автоматически найдет UUID из auth.users и создаст профили
-- 
-- ============================================

