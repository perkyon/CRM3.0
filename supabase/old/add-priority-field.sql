-- Add priority field to production_items
ALTER TABLE production_items 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add category field to production_items
ALTER TABLE production_items 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

COMMENT ON COLUMN production_items.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN production_items.category IS 'Item category (e.g., Шкаф-купе, Кухня, Стол)';



