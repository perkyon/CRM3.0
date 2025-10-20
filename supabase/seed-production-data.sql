-- Seed data for production items (mock data for testing)
-- This file creates sample production items for a test project

-- First, let's assume we have a project with ID (replace with actual project ID from your DB)
-- For demo purposes, we'll use a placeholder. Replace 'PROJECT_ID_HERE' with actual UUID

DO $$ 
DECLARE
  test_project_id UUID;
  board_id UUID;
  col_queue_id UUID;
  col_progress_id UUID;
  col_done_id UUID;
  
  item_bar_counter_id UUID;
  comp_countertop_id UUID;
  comp_frame_id UUID;
  comp_facades_id UUID;
  comp_led_id UUID;
BEGIN
  -- Get a test project (or create one if needed)
  SELECT id INTO test_project_id FROM projects LIMIT 1;
  
  IF test_project_id IS NULL THEN
    -- Create a test project if none exists
    INSERT INTO projects (
      title, 
      stage, 
      priority, 
      budget,
      due_date,
      created_at
    ) VALUES (
      'Заказ #103 — Кофейня «Тургенев»',
      'production',
      'high',
      850000,
      NOW() + INTERVAL '14 days',
      NOW()
    ) RETURNING id INTO test_project_id;
    
    RAISE NOTICE 'Created test project with ID: %', test_project_id;
  ELSE
    RAISE NOTICE 'Using existing project with ID: %', test_project_id;
  END IF;
  
  -- Create kanban board for this project if it doesn't exist
  SELECT id INTO board_id FROM kanban_boards WHERE project_id = test_project_id LIMIT 1;
  
  IF board_id IS NULL THEN
    INSERT INTO kanban_boards (project_id, title, created_at)
    VALUES (test_project_id, 'Производство проекта #103', NOW())
    RETURNING id INTO board_id;
    
    -- Create columns
    INSERT INTO kanban_columns (board_id, title, stage, position, created_at)
    VALUES 
      (board_id, 'В очереди', 'queue', 0, NOW())
    RETURNING id INTO col_queue_id;
    
    INSERT INTO kanban_columns (board_id, title, stage, position, created_at)
    VALUES 
      (board_id, 'В работе', 'in_progress', 1, NOW())
    RETURNING id INTO col_progress_id;
    
    INSERT INTO kanban_columns (board_id, title, stage, position, created_at)
    VALUES 
      (board_id, 'Завершено', 'done', 2, NOW())
    RETURNING id INTO col_done_id;
    
    RAISE NOTICE 'Created kanban board and columns';
  ELSE
    -- Get existing column IDs
    SELECT id INTO col_queue_id FROM kanban_columns WHERE board_id = board_id AND stage = 'queue' LIMIT 1;
    SELECT id INTO col_progress_id FROM kanban_columns WHERE board_id = board_id AND stage = 'in_progress' LIMIT 1;
    SELECT id INTO col_done_id FROM kanban_columns WHERE board_id = board_id AND stage = 'done' LIMIT 1;
  END IF;

  -- Create production items hierarchy
  
  -- 1. Main item: Bar Counter
  INSERT INTO production_items (
    project_id,
    type,
    code,
    name,
    quantity,
    unit,
    status,
    progress_percent,
    position,
    created_at
  ) VALUES (
    test_project_id,
    'furniture',
    'BAR_001',
    'Барная стойка',
    1,
    'шт',
    'in_progress',
    45,
    0,
    NOW()
  ) RETURNING id INTO item_bar_counter_id;
  
  RAISE NOTICE 'Created furniture item: Барная стойка (ID: %)', item_bar_counter_id;
  
  -- 2. Component: Countertop (Stone)
  INSERT INTO production_items (
    project_id,
    parent_id,
    type,
    code,
    name,
    quantity,
    unit,
    material,
    specs,
    status,
    progress_percent,
    position,
    created_at
  ) VALUES (
    test_project_id,
    item_bar_counter_id,
    'component',
    'STONE_TOP_001',
    'Столешница (камень)',
    1.8,
    'м²',
    '{"sku": "STN-5143", "name": "Кварц", "color": "Белый", "supplier": "Caesarstone"}'::jsonb,
    '{"width": 2400, "depth": 600, "thickness": 40}'::jsonb,
    'in_progress',
    60,
    0,
    NOW()
  ) RETURNING id INTO comp_countertop_id;
  
  RAISE NOTICE 'Created component: Столешница (ID: %)', comp_countertop_id;
  
  -- Tasks for countertop
  INSERT INTO kanban_tasks (
    board_id,
    column_id,
    production_item_id,
    title,
    description,
    status,
    priority,
    position,
    created_at
  ) VALUES 
    (board_id, col_done_id, comp_countertop_id, 'Раскрой камня', 'Вырезать по размерам 2400x600x40мм', 'done', 'high', 0, NOW() - INTERVAL '2 days'),
    (board_id, col_progress_id, comp_countertop_id, 'Полировка кромок', 'Полировка всех видимых кромок', 'in_progress', 'high', 1, NOW() - INTERVAL '1 day'),
    (board_id, col_queue_id, comp_countertop_id, 'Вырез под мойку', 'Вырез отверстия 500x400мм', 'todo', 'medium', 2, NOW());
  
  -- 3. Component: Frame (Cabinet)
  INSERT INTO production_items (
    project_id,
    parent_id,
    type,
    code,
    name,
    quantity,
    unit,
    material,
    specs,
    status,
    progress_percent,
    position,
    created_at
  ) VALUES (
    test_project_id,
    item_bar_counter_id,
    'component',
    'FRAME_001',
    'Каркас (тумба ЛДСП)',
    1,
    'шт',
    '{"sku": "LDSP-18-W", "name": "ЛДСП 18мм", "color": "Белый глянец"}'::jsonb,
    '{"width": 2400, "height": 900, "depth": 600}'::jsonb,
    'in_progress',
    30,
    1,
    NOW()
  ) RETURNING id INTO comp_frame_id;
  
  -- Tasks for frame
  INSERT INTO kanban_tasks (
    board_id,
    column_id,
    production_item_id,
    title,
    description,
    status,
    priority,
    position,
    created_at
  ) VALUES 
    (board_id, col_done_id, comp_frame_id, 'Раскрой ЛДСП', 'Распилить детали по карте раскроя', 'done', 'medium', 0, NOW() - INTERVAL '3 days'),
    (board_id, col_progress_id, comp_frame_id, 'Кромкование', 'Приклеить кромку 2мм на видимые торцы', 'in_progress', 'medium', 1, NOW()),
    (board_id, col_queue_id, comp_frame_id, 'Сверление', 'Присадка под полкодержатели и петли', 'todo', 'medium', 2, NOW()),
    (board_id, col_queue_id, comp_frame_id, 'Сборка каркаса', 'Собрать тумбу с применением конфирматов', 'todo', 'medium', 3, NOW());
  
  -- 4. Component: Facades (Veneer)
  INSERT INTO production_items (
    project_id,
    parent_id,
    type,
    code,
    name,
    quantity,
    unit,
    material,
    specs,
    status,
    progress_percent,
    position,
    created_at
  ) VALUES (
    test_project_id,
    item_bar_counter_id,
    'component',
    'FACADE_001',
    'Фасады (шпон дуба)',
    4,
    'шт',
    '{"sku": "OAK-VNR", "name": "Шпон дуба натуральный"}'::jsonb,
    '{"width": 400, "height": 700, "thickness": 19}'::jsonb,
    'planned',
    0,
    2,
    NOW()
  ) RETURNING id INTO comp_facades_id;
  
  -- Tasks for facades
  INSERT INTO kanban_tasks (
    board_id,
    column_id,
    production_item_id,
    title,
    description,
    status,
    priority,
    position,
    created_at
  ) VALUES 
    (board_id, col_queue_id, comp_facades_id, 'Изготовление фасадов', 'МДФ + шпонирование дуба', 'todo', 'low', 0, NOW()),
    (board_id, col_queue_id, comp_facades_id, 'Покраска', 'Лак матовый 2 слоя', 'todo', 'low', 1, NOW()),
    (board_id, col_queue_id, comp_facades_id, 'Установка петель', 'Врезать петли на фасады', 'todo', 'low', 2, NOW());
  
  -- 5. Component: LED Lighting
  INSERT INTO production_items (
    project_id,
    parent_id,
    type,
    code,
    name,
    quantity,
    unit,
    material,
    specs,
    status,
    progress_percent,
    position,
    created_at
  ) VALUES (
    test_project_id,
    item_bar_counter_id,
    'component',
    'LED_001',
    'Подсветка LED',
    2.4,
    'м',
    '{"sku": "LED-2835-WW", "name": "Лента LED 2835 теплый белый", "voltage": "12V"}'::jsonb,
    '{"power": 14.4, "cri": 90, "color_temp": 3000}'::jsonb,
    'planned',
    0,
    3,
    NOW()
  ) RETURNING id INTO comp_led_id;
  
  -- Tasks for LED
  INSERT INTO kanban_tasks (
    board_id,
    column_id,
    production_item_id,
    title,
    description,
    status,
    priority,
    position,
    created_at
  ) VALUES 
    (board_id, col_queue_id, comp_led_id, 'Монтаж ленты', 'Приклеить ленту в алюминиевый профиль', 'todo', 'low', 0, NOW()),
    (board_id, col_queue_id, comp_led_id, 'Подключение', 'Подключить к блоку питания 12V', 'todo', 'low', 1, NOW());

  RAISE NOTICE 'Successfully created production hierarchy with % items and tasks', 5;
  RAISE NOTICE 'Project ID: %', test_project_id;
  RAISE NOTICE 'Board ID: %', board_id;
  
END $$;

