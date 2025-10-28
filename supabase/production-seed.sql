-- Seed production data
-- This script populates the production tables with test data

DO $$ 
DECLARE
  v_project_id UUID;
  v_zone_living_id UUID;
  v_zone_kitchen_id UUID;
  v_zone_bedroom_id UUID;
  v_zone_kids_id UUID;
  v_item_wardrobe_id UUID;
  v_item_tv_stand_id UUID;
  v_item_kitchen_lower_id UUID;
  v_comp_id UUID;
BEGIN
  -- Get or create a test project
  SELECT id INTO v_project_id FROM projects WHERE title LIKE '%Светлана%' LIMIT 1;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (
      title, 
      client_id,
      stage, 
      priority, 
      budget,
      due_date,
      created_at
    ) VALUES (
      'Дом Светлана Гаражная',
      (SELECT id FROM clients LIMIT 1), -- Get first client
      'production',
      'high',
      2500000,
      NOW() + INTERVAL '30 days',
      NOW()
    ) RETURNING id INTO v_project_id;
    
    RAISE NOTICE 'Created test project with ID: %', v_project_id;
  END IF;

  -- Create zones
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES 
    (v_project_id, 'Гостиная', 3, 75, 'bg-blue-100', 0)
  RETURNING id INTO v_zone_living_id;
  
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES 
    (v_project_id, 'Кухня', 2, 60, 'bg-green-100', 1)
  RETURNING id INTO v_zone_kitchen_id;
  
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES 
    (v_project_id, 'Спальня', 2, 45, 'bg-purple-100', 2)
  RETURNING id INTO v_zone_bedroom_id;
  
  INSERT INTO production_zones (project_id, name, items_count, progress, color, position)
  VALUES 
    (v_project_id, 'Детская', 1, 25, 'bg-yellow-100', 3)
  RETURNING id INTO v_zone_kids_id;

  -- Create items for Living Room
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_living_id, 'ШК-001', 'Шкаф-купе 3-створчатый', 1, 80, 'Сборка', 0)
  RETURNING id INTO v_item_wardrobe_id;
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_living_id, 'ТВ-001', 'ТВ-тумба подвесная', 1, 95, 'Упаковка', 1)
  RETURNING id INTO v_item_tv_stand_id;
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_living_id, 'СТ-001', 'Стеллаж открытый', 1, 60, 'Сверловка', 2);

  -- Create items for Kitchen
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_kitchen_id, 'КУХ-НИЗ-001', 'Кухня нижние модули', 5, 70, 'Сборка', 0)
  RETURNING id INTO v_item_kitchen_lower_id;
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_kitchen_id, 'КУХ-ВЕРХ-001', 'Кухня верхние модули', 4, 55, 'Кромление', 1);

  -- Create items for Bedroom
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_bedroom_id, 'КРВ-001', 'Кровать с подъемным механизмом', 1, 50, 'Кромление', 0);
  
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_bedroom_id, 'ШК-002', 'Шкаф распашной 2-створчатый', 1, 40, 'Раскрой', 1);

  -- Create item for Kids Room
  INSERT INTO production_items (project_id, zone_id, code, name, quantity, progress, current_stage, position)
  VALUES 
    (v_project_id, v_zone_kids_id, 'ДЕТ-001', 'Стол письменный с тумбой', 1, 25, 'В очереди', 0);

  -- Create components for Wardrobe
  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_wardrobe_id, 'Корпус', 'ЛДСП 18мм Белый', 1, 'шт', 90, 0)
  RETURNING id INTO v_comp_id;
  
  -- Stages for Wardrobe Corpus
  INSERT INTO production_stages (component_id, name, status, position, color)
  VALUES 
    (v_comp_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_comp_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_comp_id, 'Сверловка', 'completed', 2, 'bg-green-500'),
    (v_comp_id, 'Сборка', 'in_progress', 3, 'bg-blue-500'),
    (v_comp_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_wardrobe_id, 'Фасады', 'Зеркало + ЛДСП', 3, 'шт', 70, 1)
  RETURNING id INTO v_comp_id;
  
  -- Stages for Wardrobe Facades
  INSERT INTO production_stages (component_id, name, status, position, color)
  VALUES 
    (v_comp_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_comp_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_comp_id, 'Сверловка', 'in_progress', 2, 'bg-blue-500'),
    (v_comp_id, 'Сборка', 'pending', 3, 'bg-gray-300'),
    (v_comp_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_wardrobe_id, 'Раздвижная система', 'Система Aristo', 1, 'компл', 100, 2);

  -- Item stages for Wardrobe
  INSERT INTO production_item_stages (item_id, name, status, position, color)
  VALUES 
    (v_item_wardrobe_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_item_wardrobe_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_item_wardrobe_id, 'Сверловка', 'completed', 2, 'bg-green-500'),
    (v_item_wardrobe_id, 'Сборка', 'in_progress', 3, 'bg-blue-500'),
    (v_item_wardrobe_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  -- Create components for TV Stand
  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_tv_stand_id, 'Корпус', 'ЛДСП 18мм Дуб', 1, 'шт', 100, 0);

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_tv_stand_id, 'Фасады', 'МДФ крашеный RAL 9003', 2, 'шт', 100, 1);

  -- Item stages for TV Stand
  INSERT INTO production_item_stages (item_id, name, status, position, color)
  VALUES 
    (v_item_tv_stand_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_item_tv_stand_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_item_tv_stand_id, 'Сверловка', 'completed', 2, 'bg-green-500'),
    (v_item_tv_stand_id, 'Сборка', 'completed', 3, 'bg-green-500'),
    (v_item_tv_stand_id, 'Упаковка', 'in_progress', 4, 'bg-blue-500');

  -- Create components for Kitchen Lower
  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_kitchen_lower_id, 'Корпуса тумб', 'ЛДСП 18мм Серый', 5, 'шт', 80, 0);

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_kitchen_lower_id, 'Фасады', 'МДФ эмаль Слоновая кость', 10, 'шт', 60, 1);

  INSERT INTO production_components (item_id, name, material, quantity, unit, progress, position)
  VALUES 
    (v_item_kitchen_lower_id, 'Столешница', 'Кварц 3см', 3.2, 'м', 50, 2);

  -- Item stages for Kitchen Lower
  INSERT INTO production_item_stages (item_id, name, status, position, color)
  VALUES 
    (v_item_kitchen_lower_id, 'Раскрой', 'completed', 0, 'bg-green-500'),
    (v_item_kitchen_lower_id, 'Кромление', 'completed', 1, 'bg-green-500'),
    (v_item_kitchen_lower_id, 'Сверловка', 'in_progress', 2, 'bg-blue-500'),
    (v_item_kitchen_lower_id, 'Сборка', 'pending', 3, 'bg-gray-300'),
    (v_item_kitchen_lower_id, 'Упаковка', 'pending', 4, 'bg-gray-300');

  RAISE NOTICE 'Successfully seeded production data!';
  RAISE NOTICE 'Project ID: %', v_project_id;
  RAISE NOTICE 'Created 4 zones, 8 items, and multiple components with stages';
  
END $$;



