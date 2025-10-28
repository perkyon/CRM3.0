-- Обновляем metadata для всех изображений в storage
-- Это добавит правильный Content-Type для существующих файлов

-- PNG файлы
UPDATE storage.objects
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{mimetype}',
    '"image/png"'
)
WHERE bucket_id = 'client-documents'
  AND name LIKE '%.png'
  AND (metadata IS NULL OR metadata->>'mimetype' IS NULL);

-- JPG файлы
UPDATE storage.objects
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{mimetype}',
    '"image/jpeg"'
)
WHERE bucket_id = 'client-documents'
  AND (name LIKE '%.jpg' OR name LIKE '%.jpeg')
  AND (metadata IS NULL OR metadata->>'mimetype' IS NULL);

-- GIF файлы
UPDATE storage.objects
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{mimetype}',
    '"image/gif"'
)
WHERE bucket_id = 'client-documents'
  AND name LIKE '%.gif'
  AND (metadata IS NULL OR metadata->>'mimetype' IS NULL);

-- PDF файлы
UPDATE storage.objects
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{mimetype}',
    '"application/pdf"'
)
WHERE bucket_id = 'client-documents'
  AND name LIKE '%.pdf'
  AND (metadata IS NULL OR metadata->>'mimetype' IS NULL);

-- Проверяем результат
SELECT 
    bucket_id,
    name,
    metadata->>'mimetype' as content_type,
    created_at
FROM storage.objects
WHERE bucket_id = 'client-documents'
ORDER BY created_at DESC
LIMIT 20;

