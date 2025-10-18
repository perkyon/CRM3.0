-- Этап 3: Создание индексов для производительности
-- Применять после production-2-tables.sql

-- Индексы для project_components
CREATE INDEX idx_project_components_project_id ON project_components(project_id);
CREATE INDEX idx_project_components_type ON project_components(component_type);
CREATE INDEX idx_project_components_status ON project_components(status);

-- Индексы для project_subcomponents
CREATE INDEX idx_project_subcomponents_component_id ON project_subcomponents(component_id);
CREATE INDEX idx_project_subcomponents_type ON project_subcomponents(subcomponent_type);
CREATE INDEX idx_project_subcomponents_status ON project_subcomponents(status);

-- Индексы для production_stages
CREATE INDEX idx_production_stages_subcomponent_id ON production_stages(subcomponent_id);
CREATE INDEX idx_production_stages_assignee_id ON production_stages(assignee_id);
CREATE INDEX idx_production_stages_status ON production_stages(status);
CREATE INDEX idx_production_stages_type ON production_stages(stage_type);
CREATE INDEX idx_production_stages_order ON production_stages(order_index);

-- Индексы для component_templates
CREATE INDEX idx_component_templates_type ON component_templates(component_type);
CREATE INDEX idx_component_templates_default ON component_templates(is_default);

-- Индексы для subcomponent_materials
CREATE INDEX idx_subcomponent_materials_subcomponent_id ON subcomponent_materials(subcomponent_id);
CREATE INDEX idx_subcomponent_materials_type ON subcomponent_materials(material_type);

-- Индексы для subcomponent_files
CREATE INDEX idx_subcomponent_files_subcomponent_id ON subcomponent_files(subcomponent_id);
CREATE INDEX idx_subcomponent_files_type ON subcomponent_files(type);
CREATE INDEX idx_subcomponent_files_category ON subcomponent_files(category);
