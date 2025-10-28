-- Проверка документов в БД

-- 1. Проверяем структуру таблицы client_documents
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'client_documents'
ORDER BY ordinal_position;

-- 2. Показываем все документы клиентов
SELECT 
    id,
    client_id,
    name,
    original_name,
    type,
    category,
    size,
    LEFT(url, 50) as url_preview,
    description,
    uploaded_by,
    created_at
FROM client_documents
ORDER BY created_at DESC
LIMIT 20;

-- 3. Подсчитываем документы по клиентам
SELECT 
    c.id as client_id,
    c.name as client_name,
    COUNT(cd.id) as documents_count
FROM clients c
LEFT JOIN client_documents cd ON c.id = cd.client_id
GROUP BY c.id, c.name
ORDER BY documents_count DESC;

-- 4. Проверяем storage buckets
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
WHERE name IN ('client-documents', 'project-documents');

-- 5. Проверяем файлы в storage
SELECT 
    name as file_path,
    bucket_id,
    owner,
    created_at,
    updated_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'client-documents'
ORDER BY created_at DESC
LIMIT 10;

