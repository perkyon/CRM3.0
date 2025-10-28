-- Добавляем колонку description в таблицы документов

-- Добавляем в client_documents
ALTER TABLE client_documents 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Добавляем в project_documents
ALTER TABLE project_documents 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Проверяем результат
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('client_documents', 'project_documents')
  AND column_name = 'description';

