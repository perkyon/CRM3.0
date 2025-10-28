-- Отключаем RLS для storage buckets
-- WARNING: Для разработки! Не использовать в продакшене!

-- Обновляем bucket для документов клиентов
UPDATE storage.buckets 
SET public = true 
WHERE id = 'client-documents';

-- Обновляем bucket для документов проектов
UPDATE storage.buckets 
SET public = true 
WHERE id = 'project-documents';

-- Удаляем все политики RLS для client-documents bucket
DELETE FROM storage.policies 
WHERE bucket_id = 'client-documents';

-- Удаляем все политики RLS для project-documents bucket
DELETE FROM storage.policies 
WHERE bucket_id = 'project-documents';

-- Создаем универсальные политики для полного доступа
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES 
  ('client-documents', 'Allow all operations', 'true'),
  ('project-documents', 'Allow all operations', 'true')
ON CONFLICT DO NOTHING;

-- Проверяем результат
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('client-documents', 'project-documents');

