-- ============================================
-- ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ ПОЛЕЙ В PRODUCTION_STAGES
-- ============================================

-- Добавляем поля в production_stages
ALTER TABLE production_stages 
ADD COLUMN IF NOT EXISTS custom_label VARCHAR(255),
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Добавляем индекс для assignee_id
CREATE INDEX IF NOT EXISTS idx_production_stages_assignee_id 
  ON production_stages(assignee_id);

-- Добавляем те же поля в production_item_stages
ALTER TABLE production_item_stages 
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10, 2);

-- Добавляем индекс для assignee_id
CREATE INDEX IF NOT EXISTS idx_production_item_stages_assignee_id 
  ON production_item_stages(assignee_id);

-- Проверяем production_stages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'production_stages'
ORDER BY ordinal_position;

