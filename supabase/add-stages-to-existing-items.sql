-- Add default stages to all existing items that don't have stages yet

DO $$
DECLARE
  item_record RECORD;
BEGIN
  -- Loop through all items that don't have stages
  FOR item_record IN 
    SELECT DISTINCT pi.id 
    FROM production_items pi
    LEFT JOIN production_item_stages pis ON pi.id = pis.item_id
    WHERE pis.id IS NULL
  LOOP
    -- Insert standard stages for each item
    INSERT INTO production_item_stages (item_id, name, status, position, color)
    VALUES
      (item_record.id, 'cutting', 'pending', 0, 'bg-gray-300'),
      (item_record.id, 'edging', 'pending', 1, 'bg-gray-300'),
      (item_record.id, 'drilling', 'pending', 2, 'bg-gray-300'),
      (item_record.id, 'assembly', 'pending', 3, 'bg-gray-300'),
      (item_record.id, 'finishing', 'pending', 4, 'bg-gray-300'),
      (item_record.id, 'packaging', 'pending', 5, 'bg-gray-300');
  END LOOP;
  
  RAISE NOTICE 'Successfully added stages to existing items';
END $$;

-- Verify the results
SELECT 
  pi.name as item_name,
  COUNT(pis.id) as stages_count
FROM production_items pi
LEFT JOIN production_item_stages pis ON pi.id = pis.item_id
GROUP BY pi.id, pi.name
ORDER BY pi.name;


