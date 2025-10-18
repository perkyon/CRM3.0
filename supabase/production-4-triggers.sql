-- Этап 4: Создание триггеров для updated_at
-- Применять после production-2-tables.sql

-- Триггеры для обновления updated_at
CREATE TRIGGER update_project_components_updated_at 
  BEFORE UPDATE ON project_components 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_subcomponents_updated_at 
  BEFORE UPDATE ON project_subcomponents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_stages_updated_at 
  BEFORE UPDATE ON production_stages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
