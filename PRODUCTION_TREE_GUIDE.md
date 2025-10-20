# 🌲 Руководство по дереву производства

## 📋 Обзор

Добавлена иерархическая структура для управления производством с деревом изделий, компонентов и операций.

## 🏗️ Архитектура

### База данных

```
projects (заказы)
  └── production_items (изделия и компоненты)
      ├── type: 'furniture' | 'component'
      ├── parent_id (для иерархии)
      ├── material (JSONB)
      ├── specs (JSONB)
      └── kanban_tasks (операции)
```

### Иерархия

```
Заказ #103 "Кофейня Тургенев"
  └── Барная стойка (изделие)
      ├── Столешница (камень) - компонент
      │   ├── Раскрой камня - задача ✅
      │   ├── Полировка кромок - задача 🔄
      │   └── Вырез под мойку - задача ⏸
      ├── Каркас (тумба ЛДСП) - компонент
      │   ├── Раскрой ЛДСП - задача ✅
      │   ├── Кромкование - задача 🔄
      │   └── Сверление - задача ⏸
      └── Фасады (шпон) - компонент
          └── ...
```

## 🚀 Установка

### 1. Применить миграцию

```bash
# Подключитесь к Supabase SQL Editor и выполните:
supabase/add-production-hierarchy.sql
```

Миграция создаст:
- Таблицу `production_items`
- Связь `kanban_tasks.production_item_id`
- Индексы и RLS политики

### 2. Загрузить тестовые данные (опционально)

```bash
# В Supabase SQL Editor выполните:
supabase/seed-production-data.sql
```

Создаст пример:
- Проект "Кофейня Тургенев"
- Барную стойку с 5 компонентами
- 15+ задач с разными статусами

## 📱 Использование

### Открыть дерево производства

1. Перейдите в раздел **Проекты**
2. Откройте любой проект
3. Выберите вкладку **"Дерево производства"**

### Навигация по дереву

- **Клик по стрелке** — развернуть/свернуть узел
- **Клик по изделию/компоненту** — показать детали
- **Клик по задаче** — открыть канбан с этой задачей
- **Чекбокс задачи** — отметить выполненной

### Фильтры

- **Поиск** — по названию или коду изделия
- **Статус** — Запланировано / В работе / Завершено / На паузе
- **Развернуть всё / Свернуть всё** — быстрая навигация

### Статистика

В шапке дерева показывается:
- Общее количество изделий
- Количество завершенных
- Средний % выполнения

## 🔧 API

### Сервис: ProductionItemService

```typescript
import { supabaseProductionItemService } from '@/lib/supabase/services/ProductionItemService';

// Получить дерево производства для проекта
const tree = await supabaseProductionItemService.getProjectProductionTree(projectId);

// Создать изделие
const item = await supabaseProductionItemService.createItem({
  projectId: 'uuid',
  type: 'furniture',
  name: 'Барная стойка',
  quantity: 1,
  unit: 'шт',
  status: 'planned',
  progressPercent: 0,
  position: 0
});

// Создать компонент (вложенный элемент)
const component = await supabaseProductionItemService.createItem({
  projectId: 'uuid',
  parentId: item.id, // ← привязка к родительскому изделию
  type: 'component',
  name: 'Столешница',
  quantity: 1.8,
  unit: 'м²',
  material: {
    sku: 'STN-5143',
    name: 'Кварц',
    color: 'Белый'
  },
  specs: {
    width: 2400,
    depth: 600,
    thickness: 40
  },
  status: 'in_progress',
  progressPercent: 60,
  position: 0
});

// Обновить изделие
await supabaseProductionItemService.updateItem(itemId, {
  progressPercent: 75,
  status: 'in_progress'
});

// Привязать задачу к компоненту
await supabaseProductionItemService.linkTaskToItem(taskId, componentId);

// Удалить изделие (каскадно удалит дочерние элементы)
await supabaseProductionItemService.deleteItem(itemId);
```

## 🎨 Компоненты

### ProductionTree

Основной компонент дерева с фильтрами и статистикой.

```tsx
<ProductionTree 
  projectId={projectId}
  onTaskClick={(task) => {
    // Обработка клика по задаче
  }}
  onItemClick={(item) => {
    // Обработка клика по изделию
  }}
/>
```

### ProductionTreeNode

Рекурсивный компонент узла дерева.

```tsx
<ProductionTreeNode
  item={item}
  level={0}
  isExpanded={true}
  onToggle={(id) => {...}}
  onTaskCheck={(taskId, checked) => {...}}
  onOpenTask={(task) => {...}}
  onOpenItem={(item) => {...}}
/>
```

## 📊 Типы данных

```typescript
interface ProductionItem {
  id: string;
  projectId: string;
  parentId?: string;
  type: 'furniture' | 'component';
  code?: string;
  name: string;
  quantity: number;
  unit: string;
  material?: ProductionMaterial;
  specs?: ProductionSpecs;
  progressPercent: number;
  position: number;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  children?: ProductionItem[];
  tasks?: KanbanTask[];
}

interface ProductionMaterial {
  sku?: string;
  name?: string;
  color?: string;
  supplier?: string;
  qty?: number;
  unit?: string;
}

interface ProductionSpecs {
  width?: number;
  height?: number;
  depth?: number;
  thickness?: number;
  weight?: number;
  [key: string]: any;
}
```

## 🎯 Roadmap

### Текущая версия (v1.0)
- ✅ Иерархическая структура изделий
- ✅ Связь с задачами канбана
- ✅ Фильтрация и поиск
- ✅ Отображение прогресса
- ✅ Материалы и спецификации

### Планируется (v1.1)
- ⏳ Drag & Drop для реорганизации дерева
- ⏳ Массовое создание изделий из шаблонов
- ⏳ Экспорт в Excel/PDF
- ⏳ История изменений
- ⏳ Комментарии к изделиям

### Планируется (v2.0)
- ⏳ Автоматический расчет прогресса по задачам
- ⏳ Зависимости между изделиями
- ⏳ Gantt диаграмма (timeline view)
- ⏳ Мобильное приложение мастера
- ⏳ QC чеклисты
- ⏳ Фото-отчёты по операциям

## 🐛 Troubleshooting

### Дерево не загружается

1. Проверьте, что миграция применена:
   ```sql
   SELECT * FROM production_items LIMIT 1;
   ```

2. Проверьте RLS политики:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'production_items';
   ```

3. Убедитесь, что у проекта есть изделия:
   ```sql
   SELECT * FROM production_items WHERE project_id = 'YOUR_PROJECT_ID';
   ```

### Задачи не отображаются

Проверьте связь:
```sql
SELECT t.*, pi.name 
FROM kanban_tasks t
LEFT JOIN production_items pi ON t.production_item_id = pi.id
WHERE t.board_id = 'YOUR_BOARD_ID';
```

### Прогресс не обновляется

Прогресс рассчитывается на основе выполненных задач. Убедитесь, что задачи привязаны к колонке со stage='done'.

## 📝 Примеры использования

### Создать изделие через UI

1. Откройте проект
2. Вкладка "Дерево производства"
3. Кнопка "Добавить изделие" (TODO: реализовать форму)

### Создать изделие через SQL

```sql
INSERT INTO production_items (
  project_id,
  type,
  code,
  name,
  quantity,
  unit,
  material,
  specs,
  status,
  progress_percent
) VALUES (
  'your-project-id',
  'furniture',
  'SHKF_001',
  'Шкаф-купе',
  1,
  'шт',
  '{}'::jsonb,
  '{"width": 2000, "height": 2400, "depth": 600}'::jsonb,
  'planned',
  0
);
```

### Добавить компонент к изделию

```sql
INSERT INTO production_items (
  project_id,
  parent_id,
  type,
  name,
  quantity,
  unit,
  material
) VALUES (
  'your-project-id',
  'parent-furniture-id',
  'component',
  'Дверь левая',
  1,
  'шт',
  '{"sku": "MDF-18", "name": "МДФ 18мм", "color": "Венге"}'::jsonb
);
```

## 💡 Best Practices

1. **Используйте коды** — добавляйте уникальные коды изделий для поиска
2. **Заполняйте материалы** — это поможет в закупках и учёте
3. **Указывайте спецификации** — габариты, вес, цвет и т.д.
4. **Привязывайте задачи** — все операции должны быть связаны с компонентами
5. **Обновляйте статусы** — не забывайте менять статус при начале/завершении работ

## 🎉 Готово!

Теперь у вас есть полноценное дерево производства с иерархией изделий, компонентов и операций!

---

**Создано:** 2025-10-20  
**Версия:** 1.0.0  
**Автор:** CRM 3.0 Development Team

