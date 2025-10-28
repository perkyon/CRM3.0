# 📦 Карточка компонента - Руководство

## 🎯 Что реализовано

Система кастомных карточек компонентов для мебельного производства с тремя основными разделами:

1. **Материалы** - управление материалами и спецификациями
2. **Технический проект** - документы и чертежи
3. **Этапы производства** - гибкое управление этапами с шаблонами

## 📁 Структура файлов

```
src/
├── components/
│   ├── production/
│   │   └── ComponentDetailCard.tsx    # Главный компонент карточки
│   └── pages/
│       └── ComponentDetail.tsx        # Страница для просмотра компонента
├── lib/
│   └── constants/
│       └── materialTemplates.ts       # Шаблоны этапов по типам материалов

supabase/
└── add-component-details-tables.sql   # SQL миграция для БД
```

## 🔧 Установка

### 1. Примените SQL миграцию

Откройте **Supabase SQL Editor** и выполните:

```sql
-- Файл: supabase/add-component-details-tables.sql
```

Это создаст таблицы:
- `component_materials` - материалы компонента
- `component_documents` - документы компонента
- Добавит поля `material_type`, `title`, `assignee`, `note`

### 2. Используйте компонент

```tsx
import { ComponentDetailCard } from '../production/ComponentDetailCard';

function MyComponent() {
  const component = {
    id: '1',
    name: 'Корпус',
    material: 'ЛДСП 18мм',
    // ... остальные поля
  };

  return (
    <ComponentDetailCard
      component={component}
      onUpdate={() => console.log('Updated')}
      onDelete={() => console.log('Deleted')}
    />
  );
}
```

## 🎨 Типы материалов и шаблоны

### ЛДСП
- Раскрой / присадка / ЧПУ
- Кромкование
- Предсборка
- Упаковка
- Доставка / Монтаж
**❗ БЕЗ шлифовки**

### МДФ-Эмаль
- Раскрой / присадка / ЧПУ
- Предсборка
- Шлифовка
- Покраска
- Отконтроль QA
- Упаковка
- Доставка / Монтаж

### Шпон
- Раскрой / присадка / ЧПУ
- Кромкование
- Предсборка
- Шлифовка
- Поклейка шпона
- Шлифовка финиш
- Покрытие / лак
- Отконтроль QA
- Упаковка
- Доставка / Монтаж

### Кастомный
- Пользовательский этап 1 (пустой шаблон)

## ⚙️ Функциональность

### Материалы
- ➕ Добавление материала (название, спецификация, количество)
- ✏️ Редактирование
- 🗑️ Удаление

### Документы
- ➕ Добавление документа (название, URL)
- 🗑️ Удаление
- 🔗 Внешние и внутренние ссылки

### Этапы производства
- ➕ Добавление этапа
- ✏️ Редактирование названия и заметок
- 🔄 Изменение статуса (todo/doing/qa/done)
- ⬆️⬇️ Изменение порядка
- 🗑️ Удаление
- 📊 Автоматический подсчет прогресса

### Смена типа материала
При смене типа материала предлагается:
- **Заменить** - удалить текущие этапы и применить шаблон
- **Объединить** - добавить недостающие этапы из шаблона

## 📊 Подсчет прогресса

```typescript
progress = (завершенных этапов / всего этапов) * 100
```

Этап считается завершенным, если его статус = `done`.

## 🔐 Права доступа (будущее)

- **Менеджер** - полные права
- **Производство** - только смена статусов и заметки
- **Просмотр** - read-only

## 🎨 UI/UX особенности

- **Минималистичный дизайн** в стиле Tailwind
- **Цветовая кодировка статусов**:
  - 🟢 Завершено (зеленый)
  - 🔵 В работе (синий)
  - 🟡 На проверке (желтый)
  - ⚪ К выполнению (серый)
- **Прогресс-бар** в шапке карточки
- **Inline редактирование** для быстрых изменений

## 🚀 Интеграция в существующую систему

### Вариант 1: Модальное окно

```tsx
import { Dialog, DialogContent } from '../ui/dialog';
import { ComponentDetailCard } from '../production/ComponentDetailCard';

function ItemPanel() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  
  return (
    <>
      {/* Список компонентов */}
      <div onClick={() => setSelectedComponent(component)}>
        {component.name}
      </div>
      
      {/* Модальное окно */}
      <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
        <DialogContent className="max-w-4xl">
          {selectedComponent && (
            <ComponentDetailCard
              component={selectedComponent}
              onUpdate={loadData}
              onDelete={() => { deleteComponent(); setSelectedComponent(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Вариант 2: Отдельная страница

```tsx
// В routes.tsx добавить:
{
  path: '/production/component/:componentId',
  element: <ComponentDetail />
}

// Переход:
navigate(`/production/component/${component.id}`);
```

## 📝 TODO (будущие улучшения)

- [ ] Интеграция с реальным API
- [ ] Drag & drop для изменения порядка этапов
- [ ] Назначение исполнителей на этапы
- [ ] История изменений
- [ ] Комментарии и обсуждения
- [ ] Прикрепление файлов напрямую
- [ ] Уведомления об изменениях
- [ ] Экспорт в PDF

## 🧪 Тестирование

Откройте страницу:
```
http://localhost:3000/component/test-1
```

Или используйте компонент напрямую в вашем коде.

## 💡 Примеры использования

### Создание компонента с шаблоном

```typescript
import { getStagesForMaterial } from '../../lib/constants/materialTemplates';

const newComponent = {
  name: 'Фасад',
  materialType: 'MDF_EMAL',
  stages: getStagesForMaterial('MDF_EMAL')
};
```

### Подсчет прогресса изделия

```typescript
import { calculateProgress } from '../../lib/constants/materialTemplates';

const itemProgress = components.reduce((sum, comp) => {
  return sum + calculateProgress(comp.stages);
}, 0) / components.length;
```

## 🐛 Известные проблемы

1. **Моковые данные** - сейчас данные не сохраняются в БД (нужна интеграция с API)
2. **RLS политики** - не созданы для новых таблиц (временно отключены)

## 📞 Поддержка

При возникновении вопросов обращайтесь к документации или создайте issue.

---

**Версия:** 1.0.0  
**Дата:** 27.10.2025

