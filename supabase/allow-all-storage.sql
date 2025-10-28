-- Разрешаем все операции с storage для разработки
-- WARNING: Для разработки! Не использовать в продакшене!

-- Удаляем существующие политики для client-documents
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload client-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read client-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete client-documents" ON storage.objects;

-- Создаем универсальные политики для всех операций
CREATE POLICY "Allow all operations on client-documents"
ON storage.objects FOR ALL
USING (bucket_id = 'client-documents')
WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Allow all operations on project-documents"
ON storage.objects FOR ALL
USING (bucket_id = 'project-documents')
WITH CHECK (bucket_id = 'project-documents');

-- Проверяем политики
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

