-- Этап 2: Создание основных таблиц
-- Применять после production-1-types.sql

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
