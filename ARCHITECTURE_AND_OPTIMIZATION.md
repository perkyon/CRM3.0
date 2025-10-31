# 🏗️ Архитектура и оптимизация Buro CRM

## 📊 Тип архитектуры

### Текущая архитектура: **Монолитная (Monolithic) с элементами модульности**

**Почему монолитная:**
- Один фронтенд-приложение (React SPA)
- Один backend (Supabase как единый BaaS)
- Все функции в одном репозитории
- Единый процесс деплоя

**Элементы модульности:**
- Разделение на сервисные слои (`ClientService`, `ProjectService`, `KanbanService`)
- Использование Zustand stores для изоляции состояния
- Custom hooks для инкапсуляции логики
- Компонентная архитектура React

### Преимущества текущей архитектуры:
✅ Простота разработки и деплоя  
✅ Низкий порог входа для новых разработчиков  
✅ Легкое тестирование всей системы  
✅ Быстрая разработка новых фич  
✅ Минимальная сложность инфраструктуры  
✅ Один деплой = обновление всего  

### Недостатки (когда стоит переходить на микросервисы):
❌ При росте команды - конфликты в одном репозитории  
❌ Масштабирование - нужно масштабировать весь монолит  
❌ Технологические ограничения - все на одном стеке  
❌ Отказоустойчивость - падение одной части = падение всего  

---

## 🚀 Оптимизация производительности

### 1. ✅ Уже реализовано:

#### Database оптимизация
- **Батч-запросы** вместо N+1 запросов:
  ```typescript
  // Было: N запросов для каждого клиента
  clients.map(client => fetchContacts(client.id))
  
  // Стало: 1 запрос для всех
  fetchAllContacts(clientIds)
  ```

#### Frontend оптимизация
- **Code Splitting** - ленивая загрузка компонентов:
  ```typescript
  const Dashboard = lazy(() => import('./pages/Dashboard'));
  ```
- **React Query (TanStack Query)** - автоматическое кэширование:
  ```typescript
  const { data } = useQuery({
    queryKey: ['clients'],
    staleTime: 5 * 60 * 1000, // 5 минут кэш
  });
  ```
- **Zustand с persist** - кэширование в localStorage
- **Vite** - быстрая сборка и HMR
- **Debounce** для поиска
- **Virtual scrolling** для больших списков (можно добавить)

#### Network оптимизация
- **Pagination** - загрузка данных порциями
- **Select только нужные поля** в Supabase запросах
- **Индексы** в базе данных для быстрого поиска

---

### 2. 🎯 Рекомендуемые оптимизации:

#### A. Database уровень:

**1. Индексы на часто используемые поля:**
```sql
-- Для быстрого поиска клиентов
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Для фильтрации проектов
CREATE INDEX idx_projects_stage ON projects(stage);
CREATE INDEX idx_projects_client_id ON projects(client_id);

-- Для канбан задач
CREATE INDEX idx_kanban_tasks_column_id ON kanban_tasks(column_id);
CREATE INDEX idx_kanban_tasks_status ON kanban_tasks(status);
```

**2. Материализованные представления для дашборда:**
```sql
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT CASE WHEN p.stage = 'production' THEN p.id END) as active_projects
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id;

-- Обновлять каждые 5 минут через cron
REFRESH MATERIALIZED VIEW dashboard_stats;
```

**3. Партиционирование больших таблиц:**
```sql
-- Если tasks станет > 1M записей
CREATE TABLE kanban_tasks_2024 PARTITION OF kanban_tasks
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**4. Connection pooling:**
- Supabase автоматически использует PgBouncer
- Можно настроить настройки пула для production

#### B. Frontend уровень:

**1. React.memo для тяжелых компонентов:**
```typescript
export const ClientCard = React.memo(({ client }: Props) => {
  // Компонент будет ре-рендериться только при изменении props
}, (prevProps, nextProps) => {
  return prevProps.client.id === nextProps.client.id;
});
```

**2. useMemo и useCallback:**
```typescript
const filteredClients = useMemo(() => {
  return clients.filter(c => c.name.includes(search));
}, [clients, search]);

const handleClick = useCallback((id: string) => {
  navigate(`/clients/${id}`);
}, [navigate]);
```

**3. Virtual scrolling для больших списков:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: clients.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

**4. Service Worker для офлайн кэширования:**
```typescript
// Уже есть useServiceWorker hook
// Можно расширить стратегию кэширования:
// - Cache First для статики
// - Network First для API запросов
// - Stale While Revalidate для данных
```

**5. Image optimization:**
```typescript
// Использовать Supabase Image Transform API:
const optimizedUrl = `${imageUrl}?width=400&height=300&quality=80`;
```

**6. Bundle size оптимизация:**
```bash
npm run analyze  # Анализ размера бандла
# Убрать неиспользуемые библиотеки
# Использовать tree-shaking
```

#### C. API уровень:

**1. GraphQL вместо REST (опционально):**
```typescript
// Supabase поддерживает GraphQL через PostgREST
// Позволяет запрашивать только нужные данные
query {
  clients {
    id
    name
    projects {
      id
      title
    }
  }
}
```

**2. Batch requests:**
```typescript
// Уже реализовано для contacts/addresses
// Можно расширить на другие сущности
```

**3. Request deduplication:**
```typescript
// React Query автоматически дедуплицирует запросы
// Если два компонента запрашивают одни данные - будет один запрос
```

**4. Prefetching:**
```typescript
// Предзагрузка данных на hover
const prefetchClient = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id),
  });
};
```

#### D. Real-time оптимизация:

**1. Selective subscriptions:**
```typescript
// Подписываться только на нужные изменения
supabase
  .channel('clients')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'clients', filter: `id=eq.${clientId}` },
    handleUpdate
  )
  .subscribe();
```

**2. Debounce для real-time обновлений:**
```typescript
const debouncedUpdate = useMemo(
  () => debounce((data) => {
    updateState(data);
  }, 300),
  []
);
```

---

### 3. 📈 Метрики производительности:

**Текущие метрики (целевые):**
- ✅ First Contentful Paint (FCP): < 1.5s
- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ Time to Interactive (TTI): < 3.5s
- ✅ Cumulative Layout Shift (CLS): < 0.1
- ✅ Total Blocking Time (TBT): < 200ms

**Измерение:**
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Vercel Analytics (уже подключен)
# Автоматически отслеживает Web Vitals
```

---

## 📈 Бизнес-метрики и расчеты

### Расчет нагрузки цеха (Shop Load)

**Формула:**
```
Нагрузка цеха (%) = 100 - Средний прогресс производства
```

**Алгоритм расчета:**

1. **Находим проекты в стадии производства:**
   ```sql
   SELECT id FROM projects WHERE stage = 'production'
   ```

2. **Получаем все изделия (production_items) для этих проектов:**
   ```sql
   SELECT progress_percent 
   FROM production_items 
   WHERE project_id IN (список_id_проектов)
   ```

3. **Вычисляем средний прогресс:**
   ```typescript
   const totalProgress = items.reduce((sum, item) => 
     sum + (item.progress_percent || 0), 0
   );
   const averageProgress = totalProgress / items.length;
   ```

4. **Рассчитываем нагрузку:**
   ```typescript
   const shopLoadPercent = Math.round(100 - averageProgress);
   // Ограничиваем диапазон от 0 до 100%
   return Math.max(0, Math.min(100, shopLoadPercent));
   ```

**Интерпретация:**
- **0%** - цех полностью свободен (все изделия завершены)
- **50%** - цех загружен наполовину (средний прогресс = 50%)
- **100%** - цех максимально загружен (все изделия только начаты)

**Пример:**
```
Проект 1: 3 изделия с прогрессом [20%, 50%, 80%] → средний = 50%
Проект 2: 2 изделия с прогрессом [10%, 30%] → средний = 20%

Общий средний прогресс = (50% + 20%) / 2 = 35%
Нагрузка цеха = 100% - 35% = 65%
```

**Реализация:** `src/lib/supabase/services/DashboardService.ts::getShopLoad()`

---

## 🔄 Когда переходить на микросервисы?

### Сигналы для миграции:

**1. Команда > 10 разработчиков:**
- Конфликты в одном репозитории
- Сложность координации изменений

**2. Разные требования к масштабированию:**
- Канбан-доска = высокая нагрузка на чтение
- Отчеты = тяжелые вычисления
- Документы = большой трафик storage

**3. Разные технологические стеки:**
- Python для ML/аналитики
- Go для высоконагруженных API
- Node.js для real-time

**4. Независимые деплои:**
- Нужно обновлять канбан без деплоя всего

### Варианты миграции:

**Гибридный подход (рекомендуется):**
```
┌─────────────────────────────────────┐
│   Frontend (React SPA)              │
│   Остается монолитным              │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐   ┌─────▼─────┐
│ Supabase│   │ Microservices│
│  Core  │   │  (Optional)  │
│  API   │   │              │
└────────┘   └──────────────┘
```

**Разделение по доменам:**
```
1. Client Service (клиенты, контакты)
2. Project Service (проекты, этапы)
3. Kanban Service (задачи, колонки)
4. Production Service (зоны, изделия)
5. Document Service (файлы, storage)
6. Analytics Service (отчеты, метрики)
```

**Технологии для микросервисов:**
- **API Gateway**: Kong, AWS API Gateway
- **Service Mesh**: Istio, Linkerd
- **Message Queue**: RabbitMQ, Kafka
- **Service Discovery**: Consul, Eureka
- **Orchestration**: Kubernetes, Docker Swarm

---

## 🎯 План оптимизации (приоритеты)

### Этап 1: Быстрые победы (1-2 недели)
- [x] Батч-запросы для клиентов
- [ ] Добавить индексы в БД
- [ ] React.memo для тяжелых компонентов
- [ ] Оптимизировать bundle size
- [ ] Настроить image optimization

### Этап 2: Средний приоритет (1 месяц)
- [ ] Материализованные представления для дашборда
- [ ] Virtual scrolling для больших списков
- [ ] Расширить Service Worker кэширование
- [ ] Prefetching на hover
- [ ] Request deduplication

### Этап 3: Долгосрочные улучшения (3-6 месяцев)
- [ ] Рассмотреть GraphQL
- [ ] Партиционирование больших таблиц
- [ ] CDN для статики
- [ ] Мониторинг производительности (APM)
- [ ] Load testing и оптимизация узких мест

---

## 📚 Рекомендации по текущей архитектуре

### ✅ Что работает хорошо:
1. **Монолитная архитектура** - идеальна для текущего размера проекта
2. **Service layer** - хорошее разделение ответственности
3. **Zustand** - легковесный и быстрый state manager
4. **Supabase** - отличный выбор для быстрого старта

### 🔄 Что можно улучшить:
1. **Добавить больше индексов** в БД
2. **Использовать React.memo** там, где это имеет смысл
3. **Внедрить виртуальный скроллинг** для списков > 100 элементов
4. **Оптимизировать изображения** через Supabase transform
5. **Расширить кэширование** через Service Worker

### 🚫 Что НЕ нужно делать сейчас:
1. ❌ Переходить на микросервисы (преждевременно)
2. ❌ Добавлять GraphQL (пока REST достаточно)
3. ❌ Разделять монолит (проект не достиг нужного размера)
4. ❌ Усложнять инфраструктуру без необходимости

---

## 📊 Итоговая оценка архитектуры

**Текущее состояние:** ⭐⭐⭐⭐ (4/5)
- Хорошо структурированный монолит
- Модульная организация кода
- Готов к масштабированию до ~1000 пользователей

**После оптимизаций:** ⭐⭐⭐⭐⭐ (5/5)
- Оптимизированные запросы
- Быстрая загрузка
- Готов к масштабированию до ~10000 пользователей

**Для микросервисов:** Рекомендуется при достижении:
- > 10 разработчиков
- > 10000 активных пользователей
- Потребность в независимых деплоях
- Разные технологические стеки

---

## 🔗 Полезные ссылки

- [Supabase Performance Best Practices](https://supabase.com/docs/guides/database/performance)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Optimization Guide](https://vitejs.dev/guide/performance.html)

