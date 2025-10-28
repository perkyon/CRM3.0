-- Add custom_label and notes fields to production_stages table

-- Add custom_label column (for custom stage names)
ALTER TABLE production_stages
ADD COLUMN IF NOT EXISTS custom_label TEXT;

-- Add notes column (for additional stage information)
ALTER TABLE production_stages  
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comment the columns
COMMENT ON COLUMN production_stages.custom_label IS 'Custom label for non-standard stages';
COMMENT ON COLUMN production_stages.notes IS 'Additional notes or instructions for the stage';

SELECT 'Поля custom_label и notes добавлены в production_stages!' as status;

