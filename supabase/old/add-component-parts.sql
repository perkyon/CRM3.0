-- Add component parts/details table
-- Stores specifications of parts within a component (e.g., Sides, Shelves, etc.)

CREATE TABLE IF NOT EXISTS production_component_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  width DECIMAL(10, 2), -- ширина в мм
  height DECIMAL(10, 2), -- высота в мм
  depth DECIMAL(10, 2), -- глубина в мм
  material VARCHAR(255), -- материал (если отличается от основного)
  notes TEXT, -- примечания
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_component_parts_component_id ON production_component_parts(component_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_component_parts_updated_at ON production_component_parts;
CREATE TRIGGER update_component_parts_updated_at
BEFORE UPDATE ON production_component_parts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE production_component_parts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view production_component_parts" ON production_component_parts;
DROP POLICY IF EXISTS "Authenticated users can insert production_component_parts" ON production_component_parts;
DROP POLICY IF EXISTS "Authenticated users can update production_component_parts" ON production_component_parts;
DROP POLICY IF EXISTS "Authenticated users can delete production_component_parts" ON production_component_parts;

CREATE POLICY "Authenticated users can view production_component_parts"
  ON production_component_parts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production_component_parts"
  ON production_component_parts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update production_component_parts"
  ON production_component_parts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete production_component_parts"
  ON production_component_parts FOR DELETE
  TO authenticated
  USING (true);

COMMENT ON TABLE production_component_parts IS 'Parts/details within a component (e.g., Sides, Shelves, Back panel)';
COMMENT ON COLUMN production_component_parts.width IS 'Width in millimeters';
COMMENT ON COLUMN production_component_parts.height IS 'Height in millimeters';
COMMENT ON COLUMN production_component_parts.depth IS 'Depth/thickness in millimeters';


