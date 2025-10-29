-- Add production_items table for manufacturing tracking
-- This table stores the hierarchy of production items (furniture, components, parts)

CREATE TABLE IF NOT EXISTS production_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES production_items(id) ON DELETE CASCADE, -- For hierarchical structure
  type VARCHAR(50) NOT NULL, -- 'furniture', 'component', 'part'
  code VARCHAR(100), -- SKU or internal code
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'шт', -- 'шт', 'м', 'м²', 'м³', 'кг', etc.
  material JSONB DEFAULT '{}', -- Material details: SKU, name, color, supplier
  specs JSONB DEFAULT '{}', -- Technical specs: dimensions, weight, etc.
  status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'in_progress', 'done', 'on_hold'
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  notes TEXT,
  position INTEGER DEFAULT 0, -- Order in the list
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add production_item_id to kanban_tasks to link tasks with production items
ALTER TABLE kanban_tasks 
ADD COLUMN IF NOT EXISTS production_item_id UUID REFERENCES production_items(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_production_items_project_id ON production_items(project_id);
CREATE INDEX IF NOT EXISTS idx_production_items_parent_id ON production_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_production_items_status ON production_items(status);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_production_item_id ON kanban_tasks(production_item_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_production_items_updated_at ON production_items;
CREATE TRIGGER update_production_items_updated_at
BEFORE UPDATE ON production_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE production_items IS 'Stores production items hierarchy: furniture -> components -> parts';
COMMENT ON COLUMN production_items.parent_id IS 'Parent item ID for hierarchical structure (NULL for top-level items)';
COMMENT ON COLUMN production_items.type IS 'Item type: furniture (готовое изделие), component (узел), part (деталь)';
COMMENT ON COLUMN production_items.material IS 'Material details in JSON format: {sku, name, color, supplier}';
COMMENT ON COLUMN production_items.specs IS 'Technical specifications in JSON format: {width, height, depth, thickness, etc}';

