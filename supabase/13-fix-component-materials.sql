-- ============================================
-- ИСПРАВЛЕНИЕ production_component_materials
-- ============================================

-- Переименовываем material_name в name (для совместимости с кодом)
ALTER TABLE production_component_materials 
RENAME COLUMN material_name TO name;

-- Добавляем недостающие поля
ALTER TABLE production_component_materials
ADD COLUMN IF NOT EXISTS material_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);

-- Создаём таблицу production_component_stage_tracking
CREATE TABLE IF NOT EXISTS production_component_stage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES production_stages(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_component_stage_tracking_component_id 
  ON production_component_stage_tracking(component_id);
CREATE INDEX IF NOT EXISTS idx_component_stage_tracking_stage_id 
  ON production_component_stage_tracking(stage_id);

-- RLS
ALTER TABLE production_component_stage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_production_component_stage_tracking" 
  ON production_component_stage_tracking;
CREATE POLICY "anon_all_production_component_stage_tracking" 
  ON production_component_stage_tracking FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_component_stage_tracking;

-- Проверка
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'production_component_materials'
ORDER BY ordinal_position;

