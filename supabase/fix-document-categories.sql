-- Добавляем все необходимые категории документов
DO $$ 
BEGIN
  -- Добавляем contract если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'contract' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'contract';
  END IF;
  
  -- Добавляем passport если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'passport' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'passport';
  END IF;
  
  -- Добавляем inn если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'inn' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'inn';
  END IF;
  
  -- Добавляем invoice если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'invoice' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'invoice';
  END IF;
  
  -- Добавляем receipt если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'receipt' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'receipt';
  END IF;
  
  -- Добавляем photo если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'photo' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'photo';
  END IF;
  
  -- Добавляем other если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'other' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'other';
  END IF;
  
  -- Добавляем technical_project если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'technical_project' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'technical_project';
  END IF;
  
  -- Добавляем commercial если его нет
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'commercial' AND enumtypid = 'document_category'::regtype) THEN
    ALTER TYPE document_category ADD VALUE 'commercial';
  END IF;
END $$;

-- Проверяем результат
SELECT 
  enumlabel AS category
FROM pg_enum
WHERE enumtypid = 'document_category'::regtype
ORDER BY enumsortorder;

