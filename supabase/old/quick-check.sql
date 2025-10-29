-- ⚡ Быстрая проверка готовности системы

-- Проверка 1: Есть ли пользователи с ролью Manager?
DO $$
DECLARE
  manager_count INT;
BEGIN
  SELECT COUNT(*) INTO manager_count FROM users WHERE role = 'Manager';
  IF manager_count = 0 THEN
    RAISE NOTICE '❌ НЕТ МЕНЕДЖЕРОВ! Выполни add-test-users.sql';
  ELSE
    RAISE NOTICE '✅ Менеджеров: %', manager_count;
  END IF;
END $$;

-- Проверка 2: Есть ли клиенты?
DO $$
DECLARE
  client_count INT;
BEGIN
  SELECT COUNT(*) INTO client_count FROM clients;
  IF client_count = 0 THEN
    RAISE NOTICE '⚠️  НЕТ КЛИЕНТОВ! Создай хотя бы одного клиента';
  ELSE
    RAISE NOTICE '✅ Клиентов: %', client_count;
  END IF;
END $$;

-- Проверка 3: RLS отключен?
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT rowsecurity INTO rls_enabled FROM pg_tables 
  WHERE schemaname = 'public' AND tablename = 'projects';
  
  IF rls_enabled THEN
    RAISE NOTICE '❌ RLS ВКЛЮЧЕН! Выполни disable-all-rls.sql';
  ELSE
    RAISE NOTICE '✅ RLS отключен';
  END IF;
END $$;

-- Проверка 4: Enum содержит новые значения?
DO $$
DECLARE
  has_preliminary_design BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'preliminary_design' 
    AND enumtypid = 'project_stage'::regtype
  ) INTO has_preliminary_design;
  
  IF NOT has_preliminary_design THEN
    RAISE NOTICE '❌ ENUM НЕ ОБНОВЛЕН! Выполни update-project-stages-enum.sql';
  ELSE
    RAISE NOTICE '✅ Enum обновлен';
  END IF;
END $$;

-- Проверка 5: Есть ли клиенты?
DO $$
DECLARE
  client_count INT;
BEGIN
  SELECT COUNT(*) INTO client_count FROM clients;
  
  IF client_count = 0 THEN
    RAISE NOTICE '❌ НЕТ КЛИЕНТОВ! Выполни add-test-clients.sql';
  ELSE
    RAISE NOTICE '✅ Клиентов: %', client_count;
  END IF;
END $$;

SELECT '🎯 Проверка завершена!' as status;

