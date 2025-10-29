-- ============================================
-- 📦 НАСТРОЙКА STORAGE ДЛЯ ЗАГРУЗКИ ФАЙЛОВ
-- ============================================
-- Запустите после создания storage buckets в UI

-- 1. Убедимся что buckets PUBLIC
UPDATE storage.buckets
SET public = true,
    allowed_mime_types = NULL  -- разрешить все типы файлов
WHERE id IN ('client-documents', 'project-documents');

-- 2. Создаём политики для загрузки файлов (anon доступ)

-- Удаляем старые если есть
DROP POLICY IF EXISTS "anon_read_files" ON storage.objects;
DROP POLICY IF EXISTS "anon_upload_files" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_files" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_files" ON storage.objects;

-- Чтение файлов
CREATE POLICY "anon_read_files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id IN ('client-documents', 'project-documents'));

-- Загрузка файлов
CREATE POLICY "anon_upload_files"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id IN ('client-documents', 'project-documents'));

-- Обновление файлов
CREATE POLICY "anon_update_files"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id IN ('client-documents', 'project-documents'));

-- Удаление файлов
CREATE POLICY "anon_delete_files"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id IN ('client-documents', 'project-documents'));

-- 3. Проверка
SELECT 
    id,
    name,
    public,
    file_size_limit / 1048576 as size_mb,
    CASE WHEN allowed_mime_types IS NULL THEN 'Все типы' ELSE 'Ограничено' END as mime_types
FROM storage.buckets
WHERE id IN ('client-documents', 'project-documents');

-- 4. Проверка политик
SELECT 
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- ✅ ГОТОВО!
-- ============================================
-- Storage настроен и готов к загрузке файлов

