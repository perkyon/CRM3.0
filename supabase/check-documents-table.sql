-- Проверяем структуру таблицы client_documents
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_documents'
ORDER BY ordinal_position;

-- Проверяем RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'client_documents';

-- Проверяем политики RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'client_documents'
ORDER BY policyname;

-- Пробуем вставить тестовую запись
INSERT INTO client_documents (
  client_id,
  name,
  original_name,
  type,
  category,
  size,
  url,
  uploaded_by,
  created_at
) VALUES (
  '8159d707-3a26-4dc4-a3b3-47503a342ece',
  'test.pdf',
  'test.pdf',
  'pdf',
  'other',
  1024,
  'https://test.com/test.pdf',
  '550e8400-e29b-41d4-a716-446655440000',
  NOW()
) RETURNING *;

