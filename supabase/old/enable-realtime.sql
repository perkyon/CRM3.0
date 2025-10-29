-- Enable Realtime for production tables
-- Run this in Supabase SQL Editor to enable real-time updates

-- Enable realtime for production_zones
ALTER PUBLICATION supabase_realtime ADD TABLE production_zones;

-- Enable realtime for production_items
ALTER PUBLICATION supabase_realtime ADD TABLE production_items;

-- Enable realtime for production_components
ALTER PUBLICATION supabase_realtime ADD TABLE production_components;

-- Enable realtime for production_stages
ALTER PUBLICATION supabase_realtime ADD TABLE production_stages;

-- Enable realtime for production_component_materials
ALTER PUBLICATION supabase_realtime ADD TABLE production_component_materials;

SELECT 'Real-time enabled for production tables!' as status;

-- Check which tables have realtime enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

