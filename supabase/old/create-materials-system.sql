-- Система управления материалами для мебельного производства

-- 1️⃣ ENUM для типов материалов
DO $$ BEGIN
  CREATE TYPE material_type AS ENUM (
    'ldsp',      -- ЛДСП
    'mdf',       -- МДФ
    'plywood',   -- Фанера
    'solid',     -- Массив
    'veneer',    -- Шпон
    'edge',      -- Кромка
    'hardware',  -- Фурнитура
    'paint',     -- ЛКМ
    'other'      -- Прочее
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2️⃣ ENUM для единиц измерения
DO $$ BEGIN
  CREATE TYPE material_unit AS ENUM (
    'sheet',     -- Лист
    'sqm',       -- м2
    'lm',        -- п.м (погонный метр)
    'piece',     -- Штука
    'kg',        -- Кг
    'liter',     -- Литр
    'set'        -- Комплект
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3️⃣ ENUM для типов обработки
DO $$ BEGIN
  CREATE TYPE material_finish AS ENUM (
    'raw',       -- Без обработки
    'lacquer',   -- Лак
    'stain',     -- Инцес/морилка
    'oil',       -- Масло
    'wax',       -- Воск
    'paint',     -- Краска
    'laminate',  -- Ламинат
    'veneer'     -- Шпон
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4️⃣ ENUM для сортов (фанера)
DO $$ BEGIN
  CREATE TYPE material_grade AS ENUM (
    'grade_1_1',  -- Сорт 1/1
    'grade_2_2',  -- Сорт 2/2
    'grade_3_3',  -- Сорт 3/3
    'grade_4_4',  -- Сорт 4/4
    'grade_e',    -- Сорт E (элита)
    'grade_b_bb'  -- Сорт B/BB
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5️⃣ Таблица материалов компонента (связь с production_components)
CREATE TABLE IF NOT EXISTS production_component_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES production_components(id) ON DELETE CASCADE,
  
  -- Основная информация
  name VARCHAR(255) NOT NULL,                    -- Название материала
  material_type material_type NOT NULL,          -- Тип материала
  
  -- Размеры и количество
  thickness DECIMAL(10,2),                       -- Толщина (мм)
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,     -- Количество
  unit material_unit NOT NULL DEFAULT 'piece',   -- Единица измерения
  
  -- Характеристики (опционально)
  color VARCHAR(100),                            -- Цвет/декор (например, "U999 Черный")
  finish material_finish,                        -- Тип обработки
  wood_species VARCHAR(100),                     -- Порода дерева (для массива/шпона)
  grade material_grade,                          -- Сорт (для фанеры)
  
  -- Дополнительно
  brand VARCHAR(100),                            -- Производитель (Egger, Kronospan)
  article VARCHAR(100),                          -- Артикул
  notes TEXT,                                    -- Примечания
  
  -- Служебные поля
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_component_materials_component_id 
  ON production_component_materials(component_id);

CREATE INDEX IF NOT EXISTS idx_component_materials_type 
  ON production_component_materials(material_type);

-- 6️⃣ Справочник материалов (база знаний для автозаполнения)
CREATE TABLE IF NOT EXISTS materials_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  name VARCHAR(255) NOT NULL,
  material_type material_type NOT NULL,
  
  -- Характеристики
  brand VARCHAR(100),
  article VARCHAR(100),
  color VARCHAR(100),
  thickness DECIMAL(10,2),
  wood_species VARCHAR(100),
  grade material_grade,
  finish material_finish,
  
  -- Стоимость (опционально)
  price_per_unit DECIMAL(10,2),
  unit material_unit NOT NULL DEFAULT 'piece',
  
  -- Поставщик
  supplier VARCHAR(255),
  supplier_contact TEXT,
  
  -- Служебные поля
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для каталога
CREATE INDEX IF NOT EXISTS idx_materials_catalog_type 
  ON materials_catalog(material_type);

CREATE INDEX IF NOT EXISTS idx_materials_catalog_brand 
  ON materials_catalog(brand);

CREATE INDEX IF NOT EXISTS idx_materials_catalog_active 
  ON materials_catalog(is_active);

-- 7️⃣ Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_component_materials_updated_at
  BEFORE UPDATE ON production_component_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_materials_updated_at();

CREATE TRIGGER trigger_materials_catalog_updated_at
  BEFORE UPDATE ON materials_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_materials_updated_at();

-- 8️⃣ Добавить тестовые данные в каталог
INSERT INTO materials_catalog (name, material_type, brand, color, thickness, unit, price_per_unit, is_active)
VALUES
  -- ЛДСП
  ('ЛДСП Egger U999 Черный', 'ldsp', 'Egger', 'U999 Черный', 16, 'sheet', 2500, true),
  ('ЛДСП Egger W1000 Белый', 'ldsp', 'Egger', 'W1000 Белый', 16, 'sheet', 2400, true),
  ('ЛДСП Kronospan Дуб Крафт', 'ldsp', 'Kronospan', 'Дуб Крафт', 18, 'sheet', 2300, true),
  
  -- МДФ
  ('МДФ Kronospan 16мм', 'mdf', 'Kronospan', 'Натуральный', 16, 'sheet', 1800, true),
  ('МДФ эмаль белая', 'mdf', 'Kronospan', 'Белый', 18, 'sqm', 3500, true),
  
  -- Фанера
  ('Фанера березовая 1/1', 'plywood', 'Свеза', NULL, 12, 'sheet', 1500, true),
  ('Фанера березовая 2/2', 'plywood', 'Свеза', NULL, 12, 'sheet', 1200, true),
  ('Фанера березовая 4/4', 'plywood', 'Свеза', NULL, 9, 'sheet', 800, true),
  
  -- Массив
  ('Массив дуба', 'solid', NULL, 'Натуральный', 40, 'sqm', 15000, true),
  ('Массив ясеня', 'solid', NULL, 'Натуральный', 40, 'sqm', 12000, true),
  ('Массив сосны', 'solid', NULL, 'Натуральный', 20, 'sqm', 5000, true),
  
  -- Шпон
  ('Шпон дуба', 'veneer', NULL, 'Натуральный', 0.6, 'sqm', 3000, true),
  ('Шпон ореха', 'veneer', NULL, 'Натуральный', 0.6, 'sqm', 3500, true),
  
  -- Кромка
  ('Кромка ABS 2мм черная', 'edge', 'Rehau', 'Черный', 2, 'lm', 15, true),
  ('Кромка ABS 2мм белая', 'edge', 'Rehau', 'Белый', 2, 'lm', 15, true),
  ('Кромка ПВХ 0.4мм', 'edge', 'Rehau', 'В ассортименте', 0.4, 'lm', 5, true)
ON CONFLICT DO NOTHING;

-- Сообщение об успехе
SELECT '✅ Система материалов создана успешно!' as status;

-- Показать структуру
SELECT 
  'production_component_materials' as table_name,
  COUNT(*) as row_count
FROM production_component_materials
UNION ALL
SELECT 
  'materials_catalog' as table_name,
  COUNT(*) as row_count
FROM materials_catalog;

