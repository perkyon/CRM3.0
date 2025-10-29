-- Add assignee and deadline fields to production stages

ALTER TABLE production_stages 
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5, 2);

-- Also add to item stages
ALTER TABLE production_item_stages
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5, 2);

-- Create index for assignee lookups
CREATE INDEX IF NOT EXISTS idx_production_stages_assignee_id ON production_stages(assignee_id);
CREATE INDEX IF NOT EXISTS idx_production_item_stages_assignee_id ON production_item_stages(assignee_id);

COMMENT ON COLUMN production_stages.assignee_id IS 'User assigned to this stage';
COMMENT ON COLUMN production_stages.due_date IS 'Deadline for this stage';
COMMENT ON COLUMN production_stages.started_at IS 'When the stage was started';
COMMENT ON COLUMN production_stages.completed_at IS 'When the stage was completed';
COMMENT ON COLUMN production_stages.estimated_hours IS 'Estimated time to complete (hours)';
COMMENT ON COLUMN production_stages.actual_hours IS 'Actual time spent (hours)';


