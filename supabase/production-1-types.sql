-- Этап 1: Создание типов для производства
-- Применять первым

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
  'cnc_cutting',     -- ЧПУ/раскрой
  'pre_assembly',    -- Предсборка
  'sanding',         -- Шлифовка
  'painting',        -- Покраска
  'quality_control', -- Контроль качества
  'packaging',       -- Упаковка
  'delivery',        -- Доставка
  'installation'     -- Монтаж
);

-- Статусы задач производства
CREATE TYPE production_task_status AS ENUM (
  'pending',      -- Ожидает
  'in_progress',  -- В работе
  'completed',    -- Завершено
  'on_hold',      -- Приостановлено
  'cancelled'     -- Отменено
);
