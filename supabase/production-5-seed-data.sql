-- Этап 5: Заполнение базовыми данными
-- Применять после всех предыдущих этапов

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
   {"type": "cnc_cutting", "name": "ЧПУ/раскрой", "order": 1, "estimated_hours": 4},
   {"type": "pre_assembly", "name": "Предсборка", "order": 2, "estimated_hours": 3},
   {"type": "sanding", "name": "Шлифовка", "order": 3, "estimated_hours": 2},
   {"type": "painting", "name": "Покраска", "order": 4, "estimated_hours": 3},
   {"type": "quality_control", "name": "Контроль качества", "order": 5, "estimated_hours": 1},
   {"type": "packaging", "name": "Упаковка", "order": 6, "estimated_hours": 1},
   {"type": "delivery", "name": "Доставка", "order": 7, "estimated_hours": 2},
   {"type": "installation", "name": "Монтаж", "order": 8, "estimated_hours": 6}
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
   {"type": "cnc_cutting", "name": "ЧПУ/раскрой", "order": 1, "estimated_hours": 3},
   {"type": "pre_assembly", "name": "Предсборка", "order": 2, "estimated_hours": 2},
   {"type": "sanding", "name": "Шлифовка", "order": 3, "estimated_hours": 2},
   {"type": "painting", "name": "Покраска", "order": 4, "estimated_hours": 2.5},
   {"type": "quality_control", "name": "Контроль качества", "order": 5, "estimated_hours": 1},
   {"type": "packaging", "name": "Упаковка", "order": 6, "estimated_hours": 0.5},
   {"type": "delivery", "name": "Доставка", "order": 7, "estimated_hours": 2},
   {"type": "installation", "name": "Монтаж", "order": 8, "estimated_hours": 4}
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
   {"type": "cnc_cutting", "name": "ЧПУ/раскрой", "order": 1, "estimated_hours": 5},
   {"type": "pre_assembly", "name": "Предсборка", "order": 2, "estimated_hours": 4},
   {"type": "sanding", "name": "Шлифовка", "order": 3, "estimated_hours": 3},
   {"type": "painting", "name": "Покраска", "order": 4, "estimated_hours": 4},
   {"type": "quality_control", "name": "Контроль качества", "order": 5, "estimated_hours": 1.5},
   {"type": "packaging", "name": "Упаковка", "order": 6, "estimated_hours": 1},
   {"type": "delivery", "name": "Доставка", "order": 7, "estimated_hours": 3},
   {"type": "installation", "name": "Монтаж", "order": 8, "estimated_hours": 8}
 ]',
 true),

('wardrobe', 'Стандартная гардеробная', 'Базовая комплектация гардеробной',
 '[
   {"type": "wardrobe", "name": "Шкаф-купе", "quantity": 1},
   {"type": "shelf", "name": "Полки", "quantity": 4},
   {"type": "cabinet", "name": "Тумба", "quantity": 1}
 ]',
 '[
   {"type": "cnc_cutting", "name": "ЧПУ/раскрой", "order": 1, "estimated_hours": 6},
   {"type": "pre_assembly", "name": "Предсборка", "order": 2, "estimated_hours": 5},
   {"type": "sanding", "name": "Шлифовка", "order": 3, "estimated_hours": 4},
   {"type": "painting", "name": "Покраска", "order": 4, "estimated_hours": 5},
   {"type": "quality_control", "name": "Контроль качества", "order": 5, "estimated_hours": 2},
   {"type": "packaging", "name": "Упаковка", "order": 6, "estimated_hours": 1.5},
   {"type": "delivery", "name": "Доставка", "order": 7, "estimated_hours": 3},
   {"type": "installation", "name": "Монтаж", "order": 8, "estimated_hours": 10}
 ]',
 true),

('bathroom', 'Стандартная ванная', 'Базовая комплектация ванной',
 '[
   {"type": "bathroom_set", "name": "Ванная комплект", "quantity": 1},
   {"type": "cabinet", "name": "Тумба под раковину", "quantity": 1},
   {"type": "shelf", "name": "Полки", "quantity": 2}
 ]',
 '[
   {"type": "cnc_cutting", "name": "ЧПУ/раскрой", "order": 1, "estimated_hours": 3},
   {"type": "pre_assembly", "name": "Предсборка", "order": 2, "estimated_hours": 2},
   {"type": "sanding", "name": "Шлифовка", "order": 3, "estimated_hours": 2},
   {"type": "painting", "name": "Покраска", "order": 4, "estimated_hours": 3},
   {"type": "quality_control", "name": "Контроль качества", "order": 5, "estimated_hours": 1},
   {"type": "packaging", "name": "Упаковка", "order": 6, "estimated_hours": 0.5},
   {"type": "delivery", "name": "Доставка", "order": 7, "estimated_hours": 2},
   {"type": "installation", "name": "Монтаж", "order": 8, "estimated_hours": 5}
 ]',
 true);
