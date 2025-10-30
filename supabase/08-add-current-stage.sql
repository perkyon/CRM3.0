-- ============================================
-- ДОБАВЛЕНИЕ current_stage В PRODUCTION_ITEMS
-- ============================================

-- Добавляем поле current_stage
ALTER TABLE production_items 
ADD COLUMN IF NOT EXISTS current_stage VARCHAR(100);

-- Устанавливаем значение по умолчанию для существующих записей
UPDATE production_items 
SET current_stage = 'not_started'
WHERE current_stage IS NULL;

-- Проверка
SELECT 
    id, 
    name, 
    status, 
    current_stage,
    progress_percent
FROM production_items
LIMIT 5;

