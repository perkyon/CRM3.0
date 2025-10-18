-- Production Components Schema
-- Добавляем новые типы для производства

-- Типы компонентов (кухня, гостинная, спальня и т.д.)
CREATE TYPE component_type AS ENUM (
  'kitchen',      -- Кухня
  'living_room',  -- Гостинная
  'bedroom',      -- Спальня
  'wardrobe',     -- Гардеробная
  'bathroom',     -- Ванная
  'children_room', -- Детская
  'office',       -- Офис
  'hallway',      -- Прихожая
  'balcony',      -- Балкон
  'other'         -- Прочее
);

-- Типы подкомпонентов (раковина, гарнитур, стол и т.д.)
CREATE TYPE subcomponent_type AS ENUM (
  'sink',         -- Раковина
  'kitchen_set',  -- Гарнитур
  'cabinet',      -- Шкаф
  'table',        -- Стол
  'chair',        -- Стул
  'bed',          -- Кровать
  'wardrobe',     -- Шкаф-купе
  'sofa',         -- Диван
  'tv_stand',     -- ТВ-тумба
  'shelf',        -- Полка
  'mirror',       -- Зеркало
  'bathroom_set', -- Ванная комплект
  'other'         -- Прочее
);

-- Типы этапов производства
CREATE TYPE production_stage_type AS ENUM (
  'cnc_cutting',  -- Вырез на ЧПУ
  'sanding',      -- Шлифовка
  'painting',     -- Покраска
  'assembly',     -- Сборка
  'quality_control', -- Контроль качества
  'packaging',    -- Упаковка
  'delivery'      -- Доставка
);

-- Статусы задач производства
CREATE TYPE production_task_status AS ENUM (
  'pending',      -- Ожидает
  'in_progress',  -- В работе
  'completed',    -- Завершено
  'on_hold',      -- Приостановлено
  'cancelled'     -- Отменено
);

-- Таблица компонентов проекта
CREATE TABLE project_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  component_type component_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица подкомпонентов
CREATE TABLE project_subcomponents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES project_components(id) ON DELETE CASCADE,
  subcomponent_type subcomponent_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  dimensions JSONB, -- {width, height, depth}
  material VARCHAR(255),
  color VARCHAR(100),
  status VARCHAR(50) DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица этапов производства для подкомпонентов
CREATE TABLE production_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcomponent_id UUID REFERENCES project_subcomponents(id) ON DELETE CASCADE,
  stage_type production_stage_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  status production_task_status DEFAULT 'pending',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица шаблонов компонентов (для быстрого создания)
CREATE TABLE component_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_type component_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subcomponents JSONB NOT NULL, -- Массив подкомпонентов с их типами
  production_stages JSONB NOT NULL, -- Массив этапов производства
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица материалов для подкомпонентов
CREATE TABLE subcomponent_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcomponent_id UUID REFERENCES project_subcomponents(id) ON DELETE CASCADE,
  material_name VARCHAR(255) NOT NULL,
  material_type VARCHAR(100), -- ДСП, МДФ, массив, фанера и т.д.
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- м², м³, шт, кг
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  supplier VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица файлов и чертежей для подкомпонентов
CREATE TABLE subcomponent_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcomponent_id UUID REFERENCES project_subcomponents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  type document_type NOT NULL,
  category document_category NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для производительности
CREATE INDEX idx_project_components_project_id ON project_components(project_id);
CREATE INDEX idx_project_components_type ON project_components(component_type);
CREATE INDEX idx_project_subcomponents_component_id ON project_subcomponents(component_id);
CREATE INDEX idx_project_subcomponents_type ON project_subcomponents(subcomponent_type);
CREATE INDEX idx_production_stages_subcomponent_id ON production_stages(subcomponent_id);
CREATE INDEX idx_production_stages_assignee_id ON production_stages(assignee_id);
CREATE INDEX idx_production_stages_status ON production_stages(status);
CREATE INDEX idx_component_templates_type ON component_templates(component_type);
CREATE INDEX idx_subcomponent_materials_subcomponent_id ON subcomponent_materials(subcomponent_id);
CREATE INDEX idx_subcomponent_files_subcomponent_id ON subcomponent_files(subcomponent_id);

-- Создаем триггеры для updated_at
CREATE TRIGGER update_project_components_updated_at 
  BEFORE UPDATE ON project_components 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_subcomponents_updated_at 
  BEFORE UPDATE ON project_subcomponents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_stages_updated_at 
  BEFORE UPDATE ON production_stages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем RLS
ALTER TABLE project_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_subcomponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcomponent_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcomponent_files ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS
CREATE POLICY "Authenticated users can view project_components" ON project_components FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view project_subcomponents" ON project_subcomponents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view production_stages" ON production_stages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view component_templates" ON component_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view subcomponent_materials" ON subcomponent_materials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view subcomponent_files" ON subcomponent_files FOR ALL USING (auth.role() = 'authenticated');

-- Вставляем базовые шаблоны компонентов
INSERT INTO component_templates (component_type, name, description, subcomponents, production_stages, is_default) VALUES
('kitchen', 'Стандартная кухня', 'Базовая комплектация кухни', 
 '[
   {"type": "kitchen_set", "name": "Гарнитур", "quantity": 1},
   {"type": "sink", "name": "Раковина", "quantity": 1},
   {"type": "cabinet", "name": "Навесные шкафы", "quantity": 3},
   {"type": "table", "name": "Обеденный стол", "quantity": 1}
 ]',
 '[
   {"type": "cnc_cutting", "name": "Вырез на ЧПУ", "order": 1, "estimated_hours": 4},
   {"type": "sanding", "name": "Шлифовка", "order": 2, "estimated_hours": 2},
   {"type": "painting", "name": "Покраска", "order": 3, "estimated_hours": 3},
   {"type": "assembly", "name": "Сборка", "order": 4, "estimated_hours": 6}
 ]',
 true),

('living_room', 'Стандартная гостинная', 'Базовая комплектация гостинной',
 '[
   {"type": "tv_stand", "name": "ТВ-тумба", "quantity": 1},
   {"type": "sofa", "name": "Диван", "quantity": 1},
   {"type": "shelf", "name": "Полки", "quantity": 2},
   {"type": "table", "name": "Журнальный столик", "quantity": 1}
 ]',
 '[
   {"type": "cnc_cutting", "name": "Вырез на ЧПУ", "order": 1, "estimated_hours": 3},
   {"type": "sanding", "name": "Шлифовка", "order": 2, "estimated_hours": 2},
   {"type": "painting", "name": "Покраска", "order": 3, "estimated_hours": 2.5},
   {"type": "assembly", "name": "Сборка", "order": 4, "estimated_hours": 4}
 ]',
 true),

('bedroom', 'Стандартная спальня', 'Базовая комплектация спальни',
 '[
   {"type": "bed", "name": "Кровать", "quantity": 1},
   {"type": "wardrobe", "name": "Шкаф-купе", "quantity": 1},
   {"type": "table", "name": "Туалетный столик", "quantity": 1},
   {"type": "shelf", "name": "Полки", "quantity": 2}
 ]',
 '[
   {"type": "cnc_cutting", "name": "Вырез на ЧПУ", "order": 1, "estimated_hours": 5},
   {"type": "sanding", "name": "Шлифовка", "order": 2, "estimated_hours": 3},
   {"type": "painting", "name": "Покраска", "order": 3, "estimated_hours": 4},
   {"type": "assembly", "name": "Сборка", "order": 4, "estimated_hours": 8}
 ]',
 true);
