# 📦 Система управления материалами

## Что реализовано

### 1. База данных

**Таблицы:**
- `production_component_materials` - материалы для каждого компонента
- `materials_catalog` - справочник материалов (база знаний)

**ENUM типы:**
- `material_type` - тип материала (ЛДСП, МДФ, Фанера, Массив, Шпон, Кромка, и т.д.)
- `material_unit` - единицы измерения (Лист, м², п.м, Шт, и т.д.)
- `material_finish` - тип обработки (Лак, Инцес, Масло, и т.д.)
- `material_grade` - сорт для фанеры (1/1, 2/2, 4/4, и т.д.)

---

## 2. UI Компонент

### `AddMaterialDialog` - умная форма добавления материала

**Особенности:**
- ✅ Динамические поля в зависимости от типа материала
- ✅ Автоматический выбор единиц измерения
- ✅ Поддержка всех характеристик мебельных материалов

**Поля формы:**

| Поле | Типы материалов | Обязательное |
|------|----------------|--------------|
| Название | Все | ✅ |
| Тип материала | Все | ✅ |
| Толщина (мм) | Все | ❌ |
| Количество | Все | ✅ |
| Единица измерения | Все | ✅ |
| Производитель | Все | ❌ |
| Цвет/Декор | ЛДСП, МДФ, Кромка | ❌ |
| Порода дерева | Массив, Шпон | ❌ |
| Обработка | Массив, Шпон, Фанера | ❌ |
| Сорт | Фанера | ❌ |
| Артикул | Все | ❌ |
| Примечания | Все | ❌ |

---

## 3. Примеры использования

### Пример 1: ЛДСП
```typescript
{
  name: "ЛДСП Egger U999",
  materialType: "ldsp",
  brand: "Egger",
  thickness: 16,
  color: "U999 Черный",
  quantity: 2,
  unit: "sheet"
}
```

### Пример 2: Фанера
```typescript
{
  name: "Фанера березовая",
  materialType: "plywood",
  brand: "Свеза",
  thickness: 12,
  grade: "grade_2_2",  // Сорт 2/2
  finish: "raw",       // Без обработки
  quantity: 5,
  unit: "sheet"
}
```

### Пример 3: Массив дуба
```typescript
{
  name: "Массив дуба",
  materialType: "solid",
  woodSpecies: "Дуб",
  thickness: 40,
  finish: "oil",       // Масло
  quantity: 2.5,
  unit: "sqm"
}
```

### Пример 4: Кромка
```typescript
{
  name: "Кромка ABS",
  materialType: "edge",
  brand: "Rehau",
  thickness: 2,
  color: "Черный",
  quantity: 15,
  unit: "lm"           // погонные метры
}
```

---

## 4. Интеграция с бэкендом

### Шаг 1: Выполни SQL скрипт

```bash
supabase/create-materials-system.sql
```

Это создаст:
- Все необходимые таблицы
- ENUM типы
- Индексы
- Триггеры
- 16 тестовых материалов в каталоге

### Шаг 2: Добавь сервисные методы

Добавь в `ProductionManagementService.ts`:

```typescript
// Добавить материал к компоненту
async addComponentMaterial(componentId: string, materialData: MaterialFormData) {
  const { data, error } = await supabase
    .from('production_component_materials')
    .insert({
      component_id: componentId,
      name: materialData.name,
      material_type: materialData.materialType,
      thickness: materialData.thickness,
      quantity: materialData.quantity,
      unit: materialData.unit,
      color: materialData.color,
      finish: materialData.finish,
      wood_species: materialData.woodSpecies,
      grade: materialData.grade,
      brand: materialData.brand,
      article: materialData.article,
      notes: materialData.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Получить материалы компонента
async getComponentMaterials(componentId: string) {
  const { data, error } = await supabase
    .from('production_component_materials')
    .select('*')
    .eq('component_id', componentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Удалить материал
async deleteComponentMaterial(materialId: string) {
  const { error } = await supabase
    .from('production_component_materials')
    .delete()
    .eq('id', materialId);

  if (error) throw error;
}

// Поиск в каталоге материалов (для автозаполнения)
async searchMaterialsCatalog(query: string, type?: MaterialType) {
  let q = supabase
    .from('materials_catalog')
    .select('*')
    .eq('is_active', true)
    .ilike('name', `%${query}%`)
    .limit(10);

  if (type) {
    q = q.eq('material_type', type);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data;
}
```

### Шаг 3: Интеграция в `ItemDetailsPanel.tsx`

В обработчик кнопки "Добавить материал":

```typescript
const handleAddMaterial = async (materialData: MaterialFormData) => {
  if (!currentComponent) return;
  
  try {
    await productionManagementService.addComponentMaterial(
      currentComponent.id,
      materialData
    );
    
    // Перезагрузить данные компонента
    await loadComponentDetails(currentComponent.id);
    
    toast.success('Материал добавлен');
  } catch (error) {
    console.error('Failed to add material:', error);
    toast.error('Ошибка добавления материала');
  }
};
```

---

## 5. Roadmap (будущие улучшения)

### В приоритете:
- [ ] Редактирование материалов
- [ ] Автозаполнение из каталога
- [ ] Расчет стоимости материалов
- [ ] Экспорт списка материалов для закупки
- [ ] История изменений материалов

### Дополнительно:
- [ ] Учет остатков на складе
- [ ] Интеграция с поставщиками
- [ ] Автоматический расчет потребности
- [ ] Массовое добавление материалов
- [ ] Импорт из Excel

---

## 6. Структура данных

### `production_component_materials`

```sql
CREATE TABLE production_component_materials (
  id UUID PRIMARY KEY,
  component_id UUID NOT NULL,     -- ID компонента
  
  -- Основное
  name VARCHAR(255) NOT NULL,     -- Название
  material_type material_type,    -- Тип (ldsp, mdf, plywood...)
  
  -- Размеры
  thickness DECIMAL(10,2),        -- Толщина в мм
  quantity DECIMAL(10,2),         -- Количество
  unit material_unit,             -- Единица (sheet, sqm, lm...)
  
  -- Характеристики
  color VARCHAR(100),             -- Цвет (для ЛДСП/МДФ)
  finish material_finish,         -- Обработка (для массива/шпона)
  wood_species VARCHAR(100),      -- Порода (для массива/шпона)
  grade material_grade,           -- Сорт (для фанеры)
  
  -- Доп. инфо
  brand VARCHAR(100),             -- Производитель
  article VARCHAR(100),           -- Артикул
  notes TEXT,                     -- Примечания
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 7. FAQ

**Q: Почему так много полей?**
A: Разные типы материалов требуют разных характеристик. Форма динамически показывает только нужные поля.

**Q: Можно ли добавить свой тип материала?**
A: Да, используй тип "other" (Прочее) или добавь новый тип в enum через SQL.

**Q: Как работает каталог материалов?**
A: Это справочник с часто используемыми материалами для быстрого добавления (функция автозаполнения).

**Q: Нужно ли заполнять все поля?**
A: Нет, обязательны только: название, тип, количество. Остальное опционально.

---

## 8. Типы материалов

| Тип | Код | Типичные единицы | Специфичные поля |
|-----|-----|------------------|------------------|
| ЛДСП | `ldsp` | Лист, м² | Цвет, Толщина |
| МДФ | `mdf` | Лист, м² | Цвет, Толщина |
| Фанера | `plywood` | Лист, м² | Сорт, Толщина |
| Массив | `solid` | м², п.м | Порода, Обработка |
| Шпон | `veneer` | м² | Порода, Обработка |
| Кромка | `edge` | п.м | Цвет, Толщина |
| Фурнитура | `hardware` | Шт, Комплект | - |
| ЛКМ | `paint` | Л, Кг | - |

---

**Готово! Система материалов полностью настроена и готова к использованию.** 🎉

