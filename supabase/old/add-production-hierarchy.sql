-- Migration: Add production hierarchy (items and components)
-- Created: 2025-10-20
-- Description: Adds production_items table for hierarchical production management

-- Create production_items table for furniture items and components
CREATE TABLE IF NOT EXISTS production_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES production_items(id) ON DELETE CASCADE,
  
  -- Item type and identification
  type VARCHAR(50) NOT NULL CHECK (type IN ('furniture', 'component')),
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  
  -- Quantity and measurements
  quantity DECIMAL(10,2) DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'шт',
  
  -- Material information (JSONB for flexibility)
  material JSONB DEFAULT '{}',
  -- Example: {"sku": "STN-5143", "name": "Кварц", "color": "Белый"}
  
  -- Additional specifications
  specs JSONB DEFAULT '{}',
  -- Example: {"width": 2400, "height": 900, "thickness": 40}
  
  -- Progress tracking
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Ordering
  position INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add production_item_id to kanban_tasks to link tasks to production items
ALTER TABLE kanban_tasks 
ADD COLUMN IF NOT EXISTS production_item_id UUID REFERENCES production_items(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_production_items_project_id ON production_items(project_id);
CREATE INDEX IF NOT EXISTS idx_production_items_parent_id ON production_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_production_items_type ON production_items(type);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_production_item_id ON kanban_tasks(production_item_id);

-- Create trigger for updated_at (only if not exists)
DROP TRIGGER IF EXISTS update_production_items_updated_at ON production_items;
CREATE TRIGGER update_production_items_updated_at 
  BEFORE UPDATE ON production_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE production_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view production_items" ON production_items;
DROP POLICY IF EXISTS "Authenticated users can insert production_items" ON production_items;
DROP POLICY IF EXISTS "Authenticated users can update production_items" ON production_items;
DROP POLICY IF EXISTS "Authenticated users can delete production_items" ON production_items;

-- Create RLS policies
CREATE POLICY "Authenticated users can view production_items" 
  ON production_items FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert production_items" 
  ON production_items FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update production_items" 
  ON production_items FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete production_items" 
  ON production_items FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Add comment for documentation
COMMENT ON TABLE production_items IS 'Hierarchical production items (furniture and components) for projects';
COMMENT ON COLUMN production_items.type IS 'Type of item: furniture (top-level) or component (sub-item)';
COMMENT ON COLUMN production_items.material IS 'Material information as JSON (sku, name, color, etc.)';
COMMENT ON COLUMN production_items.specs IS 'Technical specifications as JSON (dimensions, weight, etc.)';
COMMENT ON COLUMN production_items.progress_percent IS 'Calculated progress based on completed tasks';

