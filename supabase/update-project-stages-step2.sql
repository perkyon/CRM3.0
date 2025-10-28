-- STEP 2: Update existing project stages
-- Run this AFTER executing step 1 (update-project-stages-enum.sql)

-- Update existing 'design' values to 'preliminary_design' if any exist
UPDATE projects 
SET stage = 'preliminary_design' 
WHERE stage = 'design';

-- Update existing 'done' values to 'completed' if any exist
UPDATE projects 
SET stage = 'completed' 
WHERE stage = 'done';

-- Update existing 'procurement' values to 'tech_project' if any exist (optional)
UPDATE projects 
SET stage = 'tech_project' 
WHERE stage = 'procurement';

-- Update existing 'assembly' values to 'installation' if any exist (optional)
UPDATE projects 
SET stage = 'installation' 
WHERE stage = 'assembly';

SELECT 'Существующие проекты успешно обновлены!' as status;

-- Show projects with their updated stages
SELECT id, title, stage 
FROM projects 
ORDER BY created_at DESC 
LIMIT 10;

