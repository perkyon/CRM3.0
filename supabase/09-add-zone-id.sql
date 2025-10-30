-- ============================================
-- ДОБАВЛЕНИЕ zone_id В PRODUCTION_ITEMS
-- ============================================

-- Добавляем поле zone_id
ALTER TABLE production_items 
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES production_zones(id) ON DELETE SET NULL;

-- Добавляем индекс
CREATE INDEX IF NOT EXISTS idx_production_items_zone_id ON production_items(zone_id);

-- Проверка
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'production_items'
  AND column_name IN ('zone_id', 'current_stage', 'parent_id', 'type', 'status')
ORDER BY column_name;

