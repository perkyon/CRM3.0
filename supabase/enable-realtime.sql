-- ============================================
-- ENABLE REALTIME FOR TABLES
-- ============================================

-- Добавить таблицы в публикацию Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_items;
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_boards;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE materials;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE material_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Проверить, что таблицы добавлены
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

