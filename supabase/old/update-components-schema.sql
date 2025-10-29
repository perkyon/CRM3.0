-- Update production_components table to match new requirements

-- Add missing fields to production_components
ALTER TABLE production_components 
ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT '📦',
ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add table for component parts/details
CREATE TABLE IF NOT EXISTS production_component_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'шт',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table for component materials
CREATE TABLE IF NOT EXISTS production_component_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(100),
  thickness VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table for component images
CREATE TABLE IF NOT EXISTS production_component_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table for component stage tracking
CREATE TABLE IF NOT EXISTS production_component_stage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_component_parts_component_id ON production_component_parts(component_id);
CREATE INDEX IF NOT EXISTS idx_component_materials_component_id ON production_component_materials(component_id);
CREATE INDEX IF NOT EXISTS idx_component_images_component_id ON production_component_images(component_id);
CREATE INDEX IF NOT EXISTS idx_component_stage_tracking_component_id ON production_component_stage_tracking(component_id);

-- Enable RLS
ALTER TABLE production_component_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_component_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_component_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_component_stage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users for now)
CREATE POLICY "Allow all for authenticated users" ON production_component_parts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON production_component_materials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON production_component_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON production_component_stage_tracking
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMENT ON TABLE production_component_parts IS 'Individual parts/details within a component';
COMMENT ON TABLE production_component_materials IS 'Materials used in a component';
COMMENT ON TABLE production_component_images IS 'Images/photos from technical project';
COMMENT ON TABLE production_component_stage_tracking IS 'Track which production stages are completed for each component';



