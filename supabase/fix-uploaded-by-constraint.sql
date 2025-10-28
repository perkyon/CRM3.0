-- Делаем uploaded_by опциональным и удаляем foreign key constraint
-- Для разработки - в продакшене лучше всегда знать кто загрузил

-- Удаляем foreign key constraint
ALTER TABLE client_documents 
DROP CONSTRAINT IF EXISTS client_documents_uploaded_by_fkey;

ALTER TABLE project_documents 
DROP CONSTRAINT IF EXISTS project_documents_uploaded_by_fkey;

-- Делаем поле nullable
ALTER TABLE client_documents 
ALTER COLUMN uploaded_by DROP NOT NULL;

ALTER TABLE project_documents 
ALTER COLUMN uploaded_by DROP NOT NULL;

-- Проверяем результат
SELECT 
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('client_documents', 'project_documents')
  AND column_name = 'uploaded_by';

SELECT 'Constraints removed!' as status;

