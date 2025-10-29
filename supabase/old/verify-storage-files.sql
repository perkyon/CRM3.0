-- Проверяем ФИЗИЧЕСКОЕ наличие файлов в Storage

-- 1. Все файлы в Storage
SELECT 
    name as file_path,
    bucket_id,
    metadata->>'mimetype' as mime_type,
    metadata->>'size' as size_bytes,
    created_at
FROM storage.objects
WHERE bucket_id = 'client-documents'
ORDER BY created_at DESC;

-- 2. Сравниваем Storage и БД
SELECT 
    cd.name as db_name,
    cd.url as db_url,
    cd.type,
    o.name as storage_file,
    o.metadata->>'mimetype' as storage_mimetype,
    CASE 
        WHEN o.name IS NULL THEN '❌ Файл НЕ НАЙДЕН в Storage'
        ELSE '✅ Файл есть в Storage'
    END as file_status
FROM client_documents cd
LEFT JOIN storage.objects o ON (
    o.bucket_id = 'client-documents' 
    AND cd.url LIKE '%' || o.name
)
ORDER BY cd.created_at DESC;

-- 3. Проверяем bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE name = 'client-documents';

