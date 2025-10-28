-- Отключаем RLS на всех таблицах документов
-- WARNING: Для разработки! Не использовать в продакшене!

-- Отключаем RLS на client_documents
ALTER TABLE IF EXISTS client_documents DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на project_documents  
ALTER TABLE IF EXISTS project_documents DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на documents (если есть)
ALTER TABLE IF EXISTS documents DISABLE ROW LEVEL SECURITY;

-- Отключаем RLS на commercial_documents (если есть)
ALTER TABLE IF EXISTS commercial_documents DISABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%document%'
ORDER BY tablename;

