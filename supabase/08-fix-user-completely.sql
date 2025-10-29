-- ============================================
-- 🔧 ПОЛНОЕ ИСПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
-- ============================================

BEGIN;

-- 1. Получаем ID из auth
DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'fominsevil@gmail.com';
  
  RAISE NOTICE 'Auth user ID: %', auth_user_id;
  
  -- 2. Удаляем ВСЕ записи с этим email
  DELETE FROM public.users WHERE email = 'fominsevil@gmail.com';
  
  -- 3. Создаём новую запись с Auth ID
  INSERT INTO public.users (id, name, email, phone, role, active, created_at, updated_at)
  VALUES (
    auth_user_id::text,
    'Илья',
    'fominsevil@gmail.com',
    '+7 (995) 202-54-04',
    'Admin',
    true,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'User created with ID: %', auth_user_id;
END $$;

COMMIT;

-- 4. Проверка
SELECT 
    'Auth ID: ' || au.id::text as info,
    'User ID: ' || pu.id as user_info,
    CASE WHEN au.id::text = pu.id THEN '✅ MATCH' ELSE '❌ NO MATCH' END as status
FROM auth.users au
JOIN public.users pu ON au.id::text = pu.id
WHERE au.email = 'fominsevil@gmail.com';

-- 5. Показываем пользователя
SELECT id, name, email, role, active FROM public.users WHERE email = 'fominsevil@gmail.com';

