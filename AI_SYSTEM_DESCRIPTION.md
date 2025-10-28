# Полное описание CRM системы для мебельной мастерской

## 📋 Общая информация

**Название:** Furniture Workshop CRM Pro  
**Назначение:** Полноценная CRM система для управления мебельной мастерской с полным циклом от клиента до производства  
**Технологический стек:** React 18 + TypeScript + Supabase (PostgreSQL) + Tailwind CSS

---

## 🏗️ Архитектура системы

### Frontend Stack
- **React 18.3.1** - UI библиотека с хуками
- **TypeScript 5.9.2** - строгая типизация
- **Vite 6.3.5** - сборщик и dev сервер (очень быстрый)
- **Tailwind CSS** - utility-first CSS фреймворк
- **Radix UI** - продвинутые accessible компоненты
- **React Router 7.9.3** - клиентская маршрутизация
- **Zustand 5.0.8** - легковесный state manager с persist
- **TanStack Query 5.90.2** - data fetching и кэширование
- **React Hook Form 7.55.0** - управление формами
- **Recharts 2.15.2** - графики и визуализация
- **Lucide React** - иконки
- **Sonner** - тосты/уведомления

### Backend & Infrastructure
- **Supabase** - PostgreSQL база данных + Authentication + Real-time subscriptions + Storage
- **Vercel** - хостинг и деплой с автоматическими CI/CD
- **Service Worker** - PWA и офлайн кэширование

### Development Tools
- **Vitest** - unit тестирование
- **Sentry** - мониторинг ошибок (настроен но временно отключен)
- **Vercel Analytics** - аналитика производительности

---

## 📁 Структура проекта (детально)

```
src/
├── components/                 # React компоненты
│   ├── ui/                    # Базовые UI компоненты (53 файла)
│   │   ├── button.tsx         # Кнопка с вариантами
│   │   ├── card.tsx           # Карточка контента
│   │   ├── dialog.tsx         # Модальные окна
│   │   ├── select.tsx         # Селекторы
│   │   ├── table.tsx          # Таблицы
│   │   ├── badge.tsx          # Бейджи/метки
│   │   ├── progress.tsx       # Progress bar
│   │   ├── status-badge.tsx   # Статусные бейджи
│   │   ├── empty-state.tsx    # Пустые состояния
│   │   └── ... (50+ компонентов)
│   │
│   ├── layout/                # Компоненты макета
│   │   ├── AppLayout.tsx      # Основной layout приложения
│   │   └── AppSidebar.tsx     # Боковая навигация
│   │
│   ├── auth/                  # Авторизация
│   │   └── LoginPage.tsx      # Страница входа
│   │
│   ├── pages/                 # Страницы приложения
│   │   ├── Dashboard.tsx      # Главная панель с KPI
│   │   ├── Clients.tsx        # Управление клиентами
│   │   ├── Projects.tsx       # Управление проектами
│   │   ├── ProjectOverview.tsx # Детальный обзор проекта
│   │   ├── ProductionManager.tsx # Управление производством
│   │   └── RolesAndPermissions.tsx # Роли и права
│   │
│   ├── clients/               # Компоненты клиентов
│   │   ├── ClientDetailDialog.tsx # Детали клиента
│   │   ├── EditClientDialog.tsx   # Редактирование
│   │   └── NewClientDialog.tsx    # Создание клиента
│   │
│   ├── projects/              # Компоненты проектов (5 файлов)
│   │   ├── NewProjectDialog.tsx
│   │   ├── EditProjectDialog.tsx
│   │   └── ... (управление проектами)
│   │
│   ├── production/            # Компоненты производства (12 файлов)
│   │   ├── EnhancedProductionKanban.tsx # Канбан производства
│   │   ├── ModernKanbanColumn.tsx       # Колонки канбана
│   │   ├── ModernTaskDetail.tsx         # Детали задачи
│   │   ├── ItemDetailsPanel.tsx         # Панель деталей изделия
│   │   ├── ItemDialog.tsx               # Диалог изделия
│   │   ├── ZoneDialog.tsx               # Диалог зоны
│   │   ├── DeleteItemDialog.tsx         # Удаление изделия
│   │   ├── DeleteZoneDialog.tsx         # Удаление зоны
│   │   └── ... (производственные компоненты)
│   │
│   ├── documents/             # Управление документами
│   │   └── DocumentManager.tsx
│   │
│   ├── materials/             # Управление материалами
│   │   └── MaterialsManager.tsx
│   │
│   ├── commercial/            # Коммерческие документы
│   │   └── CommercialDocuments.tsx
│   │
│   ├── error/                 # Обработка ошибок
│   │   └── ErrorBoundary.tsx
│   │
│   └── monitoring/            # Мониторинг
│       ├── PerformanceTracker.tsx
│       └── PWAMonitor.tsx
│
├── lib/                       # Утилиты и сервисы
│   ├── api/                   # API клиенты (8 файлов)
│   │   ├── config.ts          # Конфигурация API
│   │   ├── clients.ts         # API клиентов
│   │   ├── projects.ts        # API проектов
│   │   └── ...
│   │
│   ├── supabase/              # Supabase интеграция (13 файлов)
│   │   ├── config.ts          # Конфигурация Supabase
│   │   ├── realtime.ts        # Real-time subscriptions
│   │   └── services/
│   │       ├── ClientService.ts          # Сервис клиентов
│   │       ├── ProjectService.ts         # Сервис проектов
│   │       ├── KanbanService.ts          # Сервис канбана
│   │       ├── ProductionManagementService.ts # Производство
│   │       ├── DashboardService.ts       # Дашборд
│   │       └── ...
│   │
│   ├── stores/                # Zustand stores (6 файлов)
│   │   ├── authStore.ts       # Аутентификация
│   │   ├── projectStore.ts    # Проекты
│   │   ├── clientStore.ts     # Клиенты
│   │   └── ...
│   │
│   ├── hooks/                 # Custom React hooks (10 файлов)
│   │   ├── useProjects.ts
│   │   ├── useClients.ts
│   │   ├── useUsers.ts
│   │   ├── useAnalytics.ts
│   │   └── ...
│   │
│   ├── error/                 # Обработка ошибок
│   │   └── ErrorHandler.ts
│   │
│   ├── utils/                 # Утилиты
│   │   └── idGenerator.ts     # Генерация ID
│   │
│   ├── constants.ts           # Константы приложения
│   ├── toast.ts              # Тосты/уведомления
│   └── utils.ts              # Общие утилиты
│
├── contexts/                  # React контексты
│   ├── AuthContext.tsx        # Контекст авторизации
│   └── ProjectContextNew.tsx  # Контекст проектов
│
├── types/                     # TypeScript типы
│   └── index.ts              # Все типы системы (500+ строк)
│
├── styles/                    # Стили
│   └── globals.css           # Глобальные стили
│
├── router/                    # Маршрутизация
│   ├── AppRouter.tsx
│   └── routes.tsx
│
└── test/                      # Тесты
    ├── setup.ts
    └── utils.tsx

supabase/                      # SQL схемы и миграции
├── schema.sql                 # Основная схема БД
├── production-schema.sql      # Схема производства
├── production-full-setup.sql  # Полная настройка производства
├── production-seed.sql        # Тестовые данные производства
├── seed-data.sql             # Тестовые данные
└── ... (другие SQL файлы)
```

---

## 🗄️ Структура базы данных (PostgreSQL via Supabase)

### Основные таблицы

#### 1. **users** - Пользователи системы
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- phone (VARCHAR)
- role (ENUM: 'Admin', 'Manager', 'Master', 'Procurement', 'Accountant')
- active (BOOLEAN)
- avatar (TEXT)
- permissions (TEXT[])
- created_at, updated_at, last_login_at
```

#### 2. **clients** - Клиенты
```sql
- id (UUID, PK)
- type (ENUM: 'Физ. лицо', 'ИП', 'ООО')
- name (VARCHAR)
- company (VARCHAR, nullable)
- preferred_channel (ENUM: 'WhatsApp', 'Telegram', 'Email', 'Phone')
- source (VARCHAR)
- status (ENUM: 'lead', 'new', 'in_work', 'lost', 'client')
- last_activity (TIMESTAMP)
- owner_id (UUID, FK → users)
- projects_count (INTEGER)
- ar_balance (DECIMAL) # Дебиторская задолженность
- notes (TEXT)
- created_at, updated_at
```

#### 3. **contacts** - Контакты клиентов
```sql
- id (UUID, PK)
- client_id (UUID, FK → clients)
- name (VARCHAR)
- role (VARCHAR)
- phone, email (VARCHAR)
- is_primary (BOOLEAN)
- messengers (JSONB) # WhatsApp, Telegram
- created_at
```

#### 4. **addresses** - Адреса
```sql
- id (UUID, PK)
- client_id (UUID, FK → clients)
- type (ENUM: 'physical', 'billing')
- street, city, zip_code (VARCHAR)
- created_at
```

#### 5. **client_tags** - Теги клиентов
```sql
- id (UUID, PK)
- client_id (UUID, FK → clients)
- name (VARCHAR)
- color (ENUM: 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray')
- type (ENUM: 'priority', 'category', 'custom')
- created_at
```

#### 6. **projects** - Проекты
```sql
- id (UUID, PK) # Readable ID вида PRJ-001
- client_id (UUID, FK → clients)
- title (VARCHAR)
- site_address (TEXT)
- manager_id (UUID, FK → users)
- foreman_id (UUID, FK → users)
- start_date, due_date (DATE)
- budget (DECIMAL)
- priority (ENUM: 'low', 'medium', 'high', 'urgent')
- stage (ENUM: 'brief', 'design', 'tech_project', 'procurement', 
         'production', 'assembly', 'delivery', 'done')
- production_sub_stage (ENUM: 'cutting', 'drilling', 'sanding', 
                        'painting', 'qa')
- risk_notes (TEXT)
- brief_complete (BOOLEAN)
- created_at, updated_at
```

#### 7. **client_documents** - Документы клиентов
```sql
- id (UUID, PK)
- client_id (UUID, FK → clients)
- name, original_name (VARCHAR)
- type (ENUM: 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'dwg', 'dxf', 
       '3dm', 'step', 'iges', 'jpg', 'jpeg', 'png', 'gif', 
       'mp4', 'avi', 'mov', 'zip', 'rar', 'txt', 'other')
- category (ENUM: 'contract', 'passport', 'inn', 'invoice', 
            'receipt', 'photo', 'other')
- size (BIGINT)
- url (TEXT)
- uploaded_by (UUID, FK → users)
- created_at
```

#### 8. **project_documents** - Документы проектов
```sql
- Аналогично client_documents, но с project_id
- category (ENUM: 'brief', 'design', 'technical', 'estimate', 
            'contract', 'photo', 'video', 'other')
```

### Производственная система

#### 9. **production_zones** - Зоны производства (помещения)
```sql
- id (UUID, PK)
- project_id (UUID, FK → projects)
- name (VARCHAR) # Например: "Гостиная", "Кухня", "Спальня"
- items_count (INTEGER) # Количество изделий
- progress (INTEGER 0-100) # Прогресс зоны
- color (VARCHAR) # Цвет для UI
- position (INTEGER) # Порядок отображения
- created_at, updated_at
```

#### 10. **production_items** - Изделия
```sql
- id (UUID, PK)
- project_id (UUID, FK → projects)
- zone_id (UUID, FK → production_zones)
- code (VARCHAR) # Код изделия, например "GD-001"
- name (VARCHAR) # Название, например "Шкаф-купе"
- quantity (INTEGER) # Количество
- progress (INTEGER 0-100) # Прогресс изготовления
- current_stage (VARCHAR) # Текущий этап
- position (INTEGER)
- created_at, updated_at
```

#### 11. **production_components** - Компоненты изделий
```sql
- id (UUID, PK)
- item_id (UUID, FK → production_items)
- name (VARCHAR) # Например: "Корпус", "Фасады", "Столешница"
- material (VARCHAR) # Материал
- quantity (DECIMAL) # Количество
- unit (VARCHAR) # Единица измерения (шт, м², пог.м)
- progress (INTEGER 0-100)
- position (INTEGER)
- created_at, updated_at
```

#### 12. **production_stages** - Этапы изготовления компонентов
```sql
- id (UUID, PK)
- component_id (UUID, FK → production_components)
- name (VARCHAR) # Например: "Раскрой", "Кромление", "Присадка"
- status (ENUM: 'pending', 'in_progress', 'completed')
- position (INTEGER)
- color (VARCHAR)
- created_at, updated_at
```

#### 13. **production_item_stages** - Общие этапы изделия
```sql
- id (UUID, PK)
- item_id (UUID, FK → production_items)
- name (VARCHAR)
- status (ENUM: 'pending', 'in_progress', 'completed')
- position (INTEGER)
- color (VARCHAR)
- created_at, updated_at
```

### Kanban система

#### 14. **kanban_boards** - Канбан доски
```sql
- id (UUID, PK)
- project_id (UUID, FK → projects)
- title (VARCHAR)
- created_at, updated_at
```

#### 15. **kanban_columns** - Колонки канбана
```sql
- id (UUID, PK)
- board_id (UUID, FK → kanban_boards)
- title (VARCHAR) # "К выполнению", "В работе", "На проверке", "Завершено"
- stage (VARCHAR)
- position (INTEGER)
- created_at
```

#### 16. **kanban_tasks** - Задачи канбана
```sql
- id (UUID, PK)
- board_id (UUID, FK → kanban_boards)
- column_id (UUID, FK → kanban_columns)
- title (VARCHAR)
- description (TEXT)
- status (ENUM: 'todo', 'in_progress', 'review', 'done')
- priority (ENUM: 'low', 'medium', 'high', 'urgent')
- assignee_id (UUID, FK → users)
- due_date (TIMESTAMP)
- tags (TEXT[])
- position (INTEGER)
- created_at, updated_at
```

#### 17. **task_comments** - Комментарии к задачам
```sql
- id (UUID, PK)
- task_id (UUID, FK → kanban_tasks)
- author_id (UUID, FK → users)
- content (TEXT)
- created_at
```

#### 18. **task_attachments** - Вложения задач
```sql
- id (UUID, PK)
- task_id (UUID, FK → kanban_tasks)
- name, original_name (VARCHAR)
- type, size, url
- uploaded_by (UUID, FK → users)
- created_at
```

#### 19. **checklist_items** - Чек-листы задач
```sql
- id (UUID, PK)
- task_id (UUID, FK → kanban_tasks)
- text (TEXT)
- completed (BOOLEAN)
- position (INTEGER)
- created_at
```

### Системные таблицы

#### 20. **activities** - Лог активности (аудит)
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- entity_type (VARCHAR) # 'project', 'client', 'task'
- entity_id (UUID)
- action (VARCHAR) # 'created', 'updated', 'deleted'
- description (TEXT)
- metadata (JSONB)
- created_at
```

#### 21. **integrations** - Интеграции
```sql
- id (UUID, PK)
- provider (VARCHAR) # 'google', 'telegram', etc
- status (VARCHAR) # 'connected', 'error', 'disconnected'
- tokens (JSONB)
- scopes (TEXT[])
- settings (JSONB)
- last_sync_at (TIMESTAMP)
- created_at, updated_at
```

### Storage Buckets (Supabase Storage)
```
- avatars (public) # Аватары пользователей
- client-documents (public) # Документы клиентов
- project-documents (public) # Документы проектов
- task-attachments (public) # Вложения задач
```

### Индексы (для производительности)
```sql
- clients: owner_id, status, created_at
- projects: client_id, manager_id, stage
- production_zones: project_id
- production_items: project_id, zone_id
- production_components: item_id
- production_stages: component_id
- kanban_tasks: board_id, column_id, assignee_id
- activities: entity_type + entity_id, user_id
```

### Row Level Security (RLS)
- Включен на всех таблицах
- Authenticated пользователи имеют полный доступ к бизнес-данным
- Пользователи видят только свой профиль

---

## 🎯 Основной функционал системы

### 1. Авторизация и пользователи
- Вход через email/password (Supabase Auth)
- 5 ролей: Admin, Manager, Master, Procurement, Accountant
- Система прав доступа (permissions в массиве)
- Отслеживание последнего входа

### 2. Dashboard (Главная панель)
**Компонент:** `src/components/pages/Dashboard.tsx`

**KPI метрики:**
- Проекты в работе (ordersInProgress)
- Загрузка цеха в % (shopLoadPercent)
- Просроченные задачи (overdueТasks)
- Выручка за месяц (monthlyRevenue)
- Маржа за месяц (monthlyMargin)
- Дефицит материалов (materialDeficit)

**Виджеты:**
- Активные проекты (с приоритетом и дедлайнами)
- Недавняя активность (project_created, project_updated, client_created)
- Алерты о просроченных проектах
- Quick actions: создать проект, открыть склад

**Real-time обновления:**
- Подписка на изменения проектов и клиентов через Supabase Realtime
- Автоматическое обновление данных без перезагрузки

### 3. Управление клиентами
**Компонент:** `src/components/pages/Clients.tsx`

**Функции:**
- Список клиентов с поиском и фильтрацией
- Типы клиентов: Физ. лицо, ИП, ООО
- Статусы: lead → new → in_work → client/lost
- Множественные контакты на клиента
- Предпочитаемый канал связи (WhatsApp, Telegram, Email, Phone)
- Теги с цветами (priority, category, custom)
- Адреса: физический и юридический
- История активности
- Прикрепление документов (договоры, паспорта, ИНН, счета, фото)
- Баланс дебиторской задолженности
- Связь с проектами клиента

**Диалоги:**
- `NewClientDialog.tsx` - создание клиента
- `EditClientDialog.tsx` - редактирование
- `ClientDetailDialog.tsx` - просмотр с историей

### 4. Управление проектами
**Компонент:** `src/components/pages/Projects.tsx`

**Этапы проекта (stage):**
1. **brief** - Бриф (техническое задание)
2. **design** - Дизайн-проект
3. **tech_project** - Технический проект
4. **procurement** - Закупка материалов
5. **production** - Производство
6. **assembly** - Сборка
7. **delivery** - Доставка
8. **done** - Завершен

**Подэтапы производства (production_sub_stage):**
- cutting - Раскрой
- drilling - Присадка
- sanding - Шлифовка
- painting - Покраска
- qa - Контроль качества

**Поля проекта:**
- ID в читаемом формате (PRJ-001, PRJ-002)
- Название проекта
- Клиент (связь)
- Адрес объекта
- Менеджер проекта
- Прораб
- Даты: старт и дедлайн
- Бюджет (decimal)
- Приоритет: low, medium, high, urgent
- Риски (текстовое поле)
- Статус брифа (completed/not)

**Функции:**
- Канбан-доска по этапам
- Переход между этапами (workflow)
- Отслеживание просрочек
- Прикрепление документов (чертежи, 3D модели, сметы, фото, видео)
- Связь с производственной системой

### 5. Производственная система
**Компонент:** `src/components/pages/ProductionManager.tsx`

**Иерархия (4 уровня):**

```
Проект (Project)
  └─ Зона (Zone) - "Гостиная", "Кухня"
      └─ Изделие (Item) - "Шкаф-купе", "Стол"
          └─ Компонент (Component) - "Корпус", "Фасады"
              └─ Этапы (Stages) - "Раскрой", "Кромление", "Присадка"
```

**Зоны (production_zones):**
- Группировка изделий по помещениям/зонам
- Подсчет количества изделий
- Общий прогресс зоны в %
- Цветовая маркировка
- Управление: создание, переименование, удаление

**Изделия (production_items):**
- Уникальный код (например: GD-001, KT-002)
- Название изделия
- Количество
- Текущий этап производства
- Прогресс изготовления (0-100%)
- Привязка к зоне и проекту

**Компоненты (production_components):**
- Части изделия (корпус, фасады, столешница)
- Материал (ДСП, МДФ, массив)
- Количество и единицы измерения (шт, м², пог.м)
- Прогресс изготовления

**Этапы (production_stages):**
- Производственные операции:
  - Раскрой (cutting)
  - Кромление (edging)
  - Присадка (drilling)
  - Шлифовка (sanding)
  - Покраска (painting)
  - Сборка (assembly)
  - Контроль качества (QA)
- Статусы: pending → in_progress → completed
- Цветовые индикаторы

**Сервис:** `ProductionManagementService.ts`
- Методы для работы со всей иерархией
- CRUD операции для зон, изделий, компонентов, этапов
- Обновление прогресса и статусов
- Получение полной производственной информации проекта

**UI компоненты производства:**
- `EnhancedProductionKanban.tsx` - канбан производства
- `ItemDialog.tsx` - диалог создания/редактирования изделия
- `ZoneDialog.tsx` - диалог зоны
- `ItemDetailsPanel.tsx` - панель деталей изделия
- `DeleteItemDialog.tsx`, `DeleteZoneDialog.tsx` - подтверждение удаления

### 6. Канбан-система задач
**Компонент:** `src/components/production/EnhancedProductionKanban.tsx`

**Структура:**
- Доска (Board) - одна на проект
- Колонки (Columns) - этапы выполнения
- Задачи (Tasks) - конкретные задания

**Дефолтные колонки:**
1. К выполнению (todo)
2. В работе (in_progress)
3. На проверке (review)
4. Завершено (done)

**Функции задач:**
- Название и описание
- Приоритет (low, medium, high, urgent)
- Исполнитель (assignee)
- Дедлайн (due_date)
- Теги (массив)
- Чек-лист (checklist items)
- Комментарии (comments)
- Вложения (attachments)
- Drag & Drop между колонками
- История изменений

**Фильтрация:**
- Поиск по названию/описанию
- Фильтр по исполнителю
- Фильтр по приоритету
- Фильтр по тегам
- Очистка всех фильтров

**Компоненты:**
- `ModernKanbanColumn.tsx` - колонка с задачами
- `ModernTaskDetail.tsx` - детальная панель задачи (Sheet)
- `AddColumnCard.tsx` - добавление новой колонки

**Real-time:**
- Автоматическая синхронизация изменений между пользователями
- Подписка на обновления досок, колонок, задач

### 7. Документы и файлы

**Типы документов:**
- PDF, DOC, DOCX
- XLS, XLSX
- DWG, DXF (чертежи)
- 3DM, STEP, IGES (3D модели)
- JPG, PNG, GIF (изображения)
- MP4, AVI, MOV (видео)
- ZIP, RAR (архивы)

**Категории (для клиентов):**
- contract - Договоры
- passport - Паспортные данные
- inn - ИНН, ОГРН
- invoice - Счета
- receipt - Чеки, квитанции
- photo - Фотографии
- other - Прочее

**Категории (для проектов):**
- brief - Техническое задание
- design - Дизайн-проекты
- technical - Чертежи, 3D модели
- estimate - Сметы, расчеты
- contract - Договоры
- photo, video - Медиа
- other - Прочее

**Хранилище:** Supabase Storage (S3-совместимое)
- Публичные buckets с RLS
- Версионирование документов
- Метаданные (размер, загрузчик, дата)

### 8. Роли и права
**Компонент:** `src/components/pages/RolesAndPermissions.tsx`

**Роли:**
1. **Admin** - полный доступ
2. **Manager** - управление проектами и клиентами
3. **Master** - производство и задачи
4. **Procurement** - закупки и материалы
5. **Accountant** - финансы и документы

**Права (permissions):**
- Хранятся как массив строк
- Проверяются на уровне UI и API
- Примеры: 'clients.create', 'projects.delete', 'production.manage'

### 9. Real-time система
**Сервис:** `src/lib/supabase/realtime.ts`

**Подписки на изменения:**
- Projects: INSERT, UPDATE, DELETE
- Clients: INSERT, UPDATE, DELETE
- Kanban tasks: все изменения
- Production items: обновления статусов

**Механизм:**
- Supabase Realtime (WebSocket)
- Автоматическое обновление Zustand store
- Обновление UI без перезагрузки
- Отписка при размонтировании компонента

---

## 💾 State Management (Zustand Stores)

### 1. authStore.ts
```typescript
State:
- user: User | null
- isAuthenticated: boolean
- isLoading: boolean
- error: string | null

Actions:
- login(email, password)
- logout()
- updateUser(data)
- clearError()
```

### 2. projectStore.ts
```typescript
State:
- projects: Project[]
- selectedProject: Project | null
- isLoading: boolean
- error: string | null
- pagination: { page, limit, total, totalPages }
- filters: ProjectSearchParams

Actions:
- fetchProjects(params?)
- fetchProject(id)
- createProject(data)
- updateProject(id, data)
- deleteProject(id)
- updateProjectStage(id, stage)
- updateProductionSubStage(id, subStage)
- setSelectedProject(project)
- setFilters(filters)
- subscribeToRealtime()
- unsubscribeFromRealtime()
```

### 3. clientStore.ts
```typescript
State:
- clients: Client[]
- selectedClient: Client | null
- isLoading: boolean
- error: string | null
- pagination: {...}
- filters: ClientSearchParams

Actions:
- fetchClients(params?)
- fetchClient(id)
- createClient(data)
- updateClient(id, data)
- deleteClient(id)
- setSelectedClient(client)
```

**Persist:** 
- Используется middleware `persist` из Zustand
- Сохранение в localStorage
- Partialize для выбора полей

---

## 🔌 API Services (Supabase)

### ClientService.ts
```typescript
Methods:
- getClients(params: SearchParams): Promise<PaginatedResponse<Client>>
- getClient(id: string): Promise<Client>
- createClient(data: CreateClientRequest): Promise<Client>
- updateClient(id: string, data: UpdateClientRequest): Promise<Client>
- deleteClient(id: string): Promise<void>
- getClientProjects(clientId: string): Promise<Project[]>
- getClientDocuments(clientId: string): Promise<ClientDocument[]>
- uploadDocument(clientId, file, category): Promise<Document>
```

### ProjectService.ts
```typescript
Methods:
- getProjects(params): Promise<PaginatedResponse<Project>>
- getProject(id): Promise<Project>
- createProject(data): Promise<Project>
- updateProject(id, data): Promise<Project>
- deleteProject(id): Promise<void>
- updateProjectStage(id, stage, productionSubStage?): Promise<Project>
- getProjectDocuments(id): Promise<Document[]>
```

### KanbanService.ts
```typescript
Methods:
- getProjectBoards(projectId): Promise<KanbanBoard[]>
- getBoard(boardId): Promise<KanbanBoard>
- createBoard(data): Promise<KanbanBoard>
- updateBoard(id, data): Promise<KanbanBoard>
- deleteBoard(id): Promise<void>
- createColumn(data): Promise<KanbanColumn>
- updateColumn(id, data): Promise<KanbanColumn>
- deleteColumn(id): Promise<void>
- getTasks(boardId): Promise<KanbanTask[]>
- createTask(data): Promise<KanbanTask>
- updateTask(id, data): Promise<KanbanTask>
- deleteTask(id): Promise<void>
- moveTask(taskId, columnId, position): Promise<void>
```

### ProductionManagementService.ts
```typescript
Methods:
- getProjectZones(projectId): Promise<ProductionZone[]>
- getZoneItems(zoneId): Promise<ProductionItem[]>
- getProjectItems(projectId): Promise<ProductionItem[]>
- getItemDetails(itemId): Promise<ProductionItem | null>
- getProjectProductionData(projectId): Promise<ProductionProject>
- createZone(projectId, name, color?): Promise<ProductionZone>
- updateZoneName(zoneId, name): Promise<void>
- deleteZone(zoneId): Promise<void>
- createItem(projectId, zoneId, code, name, qty): Promise<ProductionItem>
- updateItem(itemId, code, name, qty, stage?): Promise<void>
- deleteItem(itemId): Promise<void>
- updateItemProgress(itemId, progress): Promise<void>
- getItemComponents(itemId): Promise<ProductionComponent[]>
- createComponent(itemId, name, icon?): Promise<ProductionComponent>
- updateComponentProgress(componentId, progress): Promise<void>
- deleteComponent(componentId): Promise<void>
- updateStageStatus(stageId, status, table): Promise<void>
```

### DashboardService.ts
```typescript
Methods:
- getDashboardStats(): Promise<DashboardStats>
- getKPIs(): Promise<DashboardKPIs>
- getUpcomingDeadlines(): Promise<UpcomingDeadline[]>
- getRecentActivities(): Promise<Activity[]>
```

---

## 🎨 UI/UX особенности

### Design System
- **Radix UI** - доступные, customizable компоненты
- **Tailwind CSS** - utility-first стилизация
- **CSS Variables** - темизация (готовность к dark mode)
- **Responsive** - адаптив для mobile, tablet, desktop

### Цветовая схема
```css
--primary: hsl(222.2, 47.4%, 11.2%)
--secondary: hsl(210, 40%, 96.1%)
--muted: hsl(210, 40%, 96.1%)
--accent: hsl(210, 40%, 96.1%)
--destructive: hsl(0, 84.2%, 60.2%)
--success: hsl(142, 71%, 45%)
--warning: hsl(38, 92%, 50%)
```

### Статусные бейджи
- **Brief:** серый
- **Design:** синий
- **Production:** оранжевый
- **Done:** зеленый
- **Urgent:** красный

### Компоненты UI (53 файла)
Все базируются на Radix UI + Tailwind:
- Buttons (6 вариантов)
- Cards
- Dialogs/Modals
- Sheets (боковые панели)
- Selects/Combobox
- Tables (с сортировкой, пагинацией)
- Forms (react-hook-form интеграция)
- Tabs
- Accordion
- Progress bars
- Badges
- Tooltips
- Popovers
- Dropdown menus
- Context menus
- Alert dialogs
- Toast notifications (Sonner)
- Date pickers (react-day-picker)
- Charts (Recharts)

### Empty States
- `EmptyKanbanState` - пустая канбан доска
- `ErrorState` - ошибки
- `LoadingState` - загрузка
- Кастомные empty states для страниц

### Анимации
- Framer Motion (не используется, только CSS transitions)
- Tailwind animate-spin, animate-pulse
- Плавные переходы на hover/focus

---

## 🚀 Производительность и оптимизации

### Code Splitting
**vite.config.ts manualChunks:**
```javascript
'react-vendor': ['react', 'react-dom', 'react-router-dom']
'radix-vendor': [...all radix-ui packages]
'ui-vendor': ['lucide-react', 'clsx']
'chart-vendor': ['recharts']
'form-vendor': ['react-hook-form']
```

### Build Optimizations
- **Minification:** Terser с drop_console
- **Tree-shaking:** автоматический через Vite
- **Gzip & Brotli:** на уровне Vercel
- **Bundle Analyzer:** `rollup-plugin-visualizer`

### Runtime Optimizations
- React.memo на тяжелых компонентах
- Zustand с persist и partialize
- TanStack Query для кэширования API запросов
- Debounce на поисковых полях
- Виртуализация списков (при необходимости)

### PWA Features
- **Service Worker** - `public/sw.js`
- **Manifest** - `public/manifest.json`
- **Offline caching** - статика и API responses
- **Install prompt** - установка как приложение
- **Background sync** - отложенные запросы

### Monitoring
- **Sentry** - error tracking (настроен но отключен)
- **Vercel Analytics** - Core Web Vitals
- **Custom analytics** - `useAnalytics` hook
- **Performance Tracker** - `PerformanceTracker.tsx`

---

## 🔐 Безопасность

### Authentication
- Supabase Auth (JWT tokens)
- Email/Password flow
- Session management
- Refresh tokens
- Auto logout при истечении

### Authorization
- Row Level Security (RLS) в Supabase
- Role-based access control (RBAC)
- Permissions массив в users
- Проверки на уровне UI и API

### Data Protection
- HTTPS only (enforced by Vercel)
- Encrypted connections к Supabase
- Защита от XSS (React escaping)
- CSRF protection (Supabase built-in)
- SQL injection protection (Supabase queries)

### File Upload Security
- Размер файлов ограничен
- Валидация типов файлов
- Storage RLS policies
- Scan на вирусы (на уровне Supabase)

---

## 📝 TypeScript типы (все в types/index.ts)

### Основные интерфейсы
```typescript
User, Role, Client, ClientTag, ClientDocument, Contact, Address
Project, ProjectStage, ProductionSubStage, Priority
BOMItem, InventoryItem, InventoryMovement
Estimate, Invoice, Payment
KanbanBoard, KanbanColumn, KanbanTask, ChecklistItem
TaskAttachment, TaskComment
ProductionItem, ProductionMaterial, ProductionSpecs
ProductionTreeNode, ProductionZone, ProductionComponent
ProductionStage, ProductionItemStage
Document, DocumentType, DocumentCategory
Activity, Integration
DashboardKPIs
```

### Request/Response типы
```typescript
CreateUserRequest, UpdateUserRequest
CreateClientRequest, UpdateClientRequest
CreateProjectRequest, UpdateProjectRequest
LoginRequest, LoginResponse
RefreshTokenRequest, RefreshTokenResponse
FileUploadResponse
SearchParams, ClientSearchParams, ProjectSearchParams
PaginatedResponse<T>
```

---

## 🧪 Тестирование

### Setup
**Vitest** - быстрый test runner (совместим с Jest)
**Testing Library** - React компонент тестирование
**JSDOM** - DOM environment для тестов

### Файлы:
```
test/setup.ts - настройка окружения
test/utils.tsx - тестовые утилиты (render с providers)
components/pages/Projects.test.tsx - пример теста
```

### Команды:
```bash
npm run test          # watch mode
npm run test:ui       # UI для тестов
npm run test:run      # single run
npm run test:coverage # coverage report
```

---

## 🔄 Git workflow

### Branches
- `main` - production
- `develop` - development (обычно)
- Feature branches

### Текущий статус (из git status):
```
Modified:
- src/components/pages/Dashboard.tsx
- src/components/pages/ProductionManager.tsx

Untracked (новые файлы):
- src/components/production/DeleteItemDialog.tsx
- src/components/production/DeleteZoneDialog.tsx
- src/components/production/ItemDetailsPanel.tsx
- src/components/production/ItemDialog.tsx
- src/components/production/ZoneDialog.tsx
- src/lib/supabase/services/ProductionManagementService.ts
- supabase/add-priority-field.sql
- supabase/production-cleanup.sql
- supabase/production-full-setup.sql
- supabase/production-schema.sql
- supabase/production-seed.sql
- supabase/update-components-schema.sql
```

---

## 🚢 Deployment (Vercel)

### Configuration
**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables (на Vercel)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
VITE_ENABLE_ANALYTICS
SENTRY_AUTH_TOKEN (если включен)
```

### Build Process
1. `npm install`
2. `npm run build` (vite build)
3. Deploy to Vercel CDN
4. Automatic HTTPS
5. Edge network distribution

### CI/CD
- Auto deploy on push to main
- Preview deployments for PRs
- Rollback capability
- Build logs и analytics

---

## 📊 Особенности архитектуры

### Паттерны
1. **Component composition** - мелкие переиспользуемые компоненты
2. **Custom hooks** - инкапсуляция логики (useProjects, useClients, useAnalytics)
3. **Service layer** - отдельные сервисы для API (ClientService, ProjectService)
4. **Store pattern** - Zustand для глобального state
5. **Context API** - для провайдеров (Auth, Project)
6. **Error boundaries** - обработка ошибок React
7. **Loading states** - скелетоны и спиннеры

### Принципы
- **DRY** - переиспользование кода
- **SOLID** - разделение ответственности
- **Composition over inheritance**
- **Controlled components** - формы через react-hook-form
- **Declarative UI** - React way
- **Type safety** - строгий TypeScript

### Структура файлов
- Один компонент = один файл
- PascalCase для компонентов
- camelCase для утилит/хуков
- Группировка по фичам
- Индексные экспорты для удобства

---

## 🌟 Ключевые особенности системы

### 1. Производственная иерархия (уникальная фича)
4-уровневая система:
```
Project → Zone → Item → Component → Stages
```
Позволяет детально отслеживать производство от помещения до конкретной операции.

### 2. Dual Kanban
- Канбан для проектов (по этапам)
- Канбан для задач (внутри проектов)
- Drag & Drop перемещение
- Real-time синхронизация

### 3. Прогресс-трекинг
- Автоматический подсчет прогресса по иерархии
- Компонент → Изделие → Зона → Проект
- Визуализация через Progress bars
- Цветовые индикаторы статусов

### 4. Гибкая документация
- Множество типов файлов
- Категоризация документов
- Привязка к клиентам и проектам
- Версионирование
- Быстрый поиск

### 5. Real-time коллаборация
- WebSocket подключение (Supabase)
- Мгновенные обновления для всех пользователей
- Подписки на конкретные сущности
- Оптимистичные обновления UI

### 6. Адаптивный дизайн
- Mobile-first подход
- Responsive breakpoints
- Touch-friendly для планшетов
- PWA для установки на устройства

### 7. Производительность
- Code splitting по роутам
- Lazy loading компонентов
- Оптимизированные бандлы
- Кэширование через TanStack Query
- Service Worker для offline

---

## 📚 Документация и гайды

В проекте есть дополнительные MD файлы:
```
README.md                    - основная документация
PRODUCTION_SETUP.md          - настройка производственной системы
PRODUCTION_TREE_GUIDE.md     - гайд по производственному дереву
PRODUCTION_TREE_SUMMARY.md   - краткая сводка
PROJECT_KANBAN_GUIDE.md      - гайд по канбану
cursor_user_rules.md         - правила для Cursor AI
src/guidelines/Guidelines.md - гайдлайны разработки
src/Attributions.md          - атрибуции
```

---

## 🎓 Обучение и онбординг

### Для разработчиков:
1. Изучить структуру папок
2. Понять типы в `types/index.ts`
3. Ознакомиться с Zustand stores
4. Изучить Supabase services
5. Посмотреть на компоненты pages как примеры
6. Прочитать Guidelines.md

### Для пользователей:
1. Dashboard - обзор системы
2. Clients - работа с клиентами
3. Projects - создание и управление проектами
4. Production Kanban - отслеживание производства
5. Production Manager - детальное управление изделиями

---

## 🐛 Известные ограничения и TODO

### Текущие ограничения:
- Нет полноценной системы прав (RLS есть, но permissions не используются)
- Финансы и склад в разработке (пустые страницы)
- Sentry отключен (требуется настройка проекта)
- Нет push-уведомлений (хотя PWA готов)
- Нет экспорта данных (PDF, Excel)

### Возможные улучшения:
- Добавить Gantt диаграмму для проектов
- Календарь с задачами и дедлайнами
- Чат/мессенджер между пользователями
- Интеграции (Google Drive, Telegram Bot)
- Мобильное приложение (React Native)
- Отчеты и аналитика (BI dashboard)
- Система уведомлений (email, push, in-app)
- Автоматизация workflow (триггеры, webhooks)

---

## 🔗 Зависимости и версии

### Критически важные:
```json
"react": "^18.3.1"
"react-dom": "^18.3.1"
"typescript": "^5.9.2"
"vite": "6.3.5"
"@supabase/supabase-js": "^2.58.0"
"zustand": "^5.0.8"
"react-router-dom": "^7.9.3"
```

### UI библиотеки:
```json
"@radix-ui/*": "^1.x" (16 пакетов)
"lucide-react": "^0.487.0"
"tailwind-merge": "*"
"class-variance-authority": "^0.7.1"
```

### Утилиты:
```json
"date-fns": "*"
"axios": "^1.12.2"
"clsx": "*"
"sonner": "^2.0.3"
```

---

## 🎯 Концепции и философия

### Почему эта архитектура?
1. **Supabase** - быстрый старт, real-time из коробки, PostgreSQL
2. **Zustand** - проще Redux, меньше boilerplate
3. **Radix UI** - accessibility, headless components, кастомизация
4. **Vite** - скорость сборки, HMR, современный DX
5. **TypeScript** - безопасность типов, лучший DX
6. **Tailwind** - быстрая разработка, консистентность, small bundle

### Целевая аудитория:
- Малые и средние мебельные мастерские (5-50 человек)
- Менеджеры проектов
- Мастера производства
- Снабженцы
- Бухгалтера

### Бизнес-ценность:
- Централизованная база клиентов
- Прозрачность производственного процесса
- Контроль сроков и бюджетов
- Снижение ошибок и потерь материалов
- История всех операций
- Удобная коллаборация команды

---

## 💡 Рекомендации для репликации

### Что нужно для создания копии:

1. **Базовая настройка:**
   - Node.js 20+
   - npm или yarn
   - Git
   - Аккаунт на Supabase
   - Аккаунт на Vercel (опционально)

2. **Создать Supabase проект:**
   - Выполнить `supabase/schema.sql`
   - Выполнить `supabase/production-schema.sql`
   - Настроить RLS policies
   - Создать Storage buckets
   - Получить URL и ANON_KEY

3. **Клонировать структуру проекта:**
   ```bash
   npm create vite@latest my-crm -- --template react-ts
   npm install (все зависимости из package.json)
   ```

4. **Скопировать все файлы:**
   - src/* - все компоненты и логика
   - supabase/* - SQL схемы
   - public/* - статичные файлы
   - Конфиги: vite.config.ts, tailwind.config.js, tsconfig.json

5. **Настроить .env:**
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

6. **Запустить:**
   ```bash
   npm install
   npm run dev
   ```

### Что важно понимать:

1. **Supabase - ядро системы:**
   - База данных (PostgreSQL)
   - Аутентификация
   - Real-time
   - Storage
   - Все на одной платформе

2. **Zustand stores = глобальное состояние:**
   - authStore - текущий пользователь
   - projectStore - проекты
   - clientStore - клиенты
   - Persist в localStorage

3. **Services = API слой:**
   - ClientService, ProjectService, KanbanService
   - Все запросы к Supabase идут через них
   - Обработка ошибок через ErrorHandler

4. **Real-time = WebSocket:**
   - realtimeService.ts управляет подписками
   - Автообновление UI при изменениях
   - Коллаборация между пользователями

5. **Типы = контракт:**
   - types/index.ts - единственный источник истины
   - Все компоненты и сервисы используют эти типы
   - TypeScript гарантирует согласованность

### Порядок разработки (если начинать с нуля):

1. **База и Auth:**
   - Настроить Supabase
   - Создать таблицу users
   - Реализовать авторизацию

2. **Клиенты:**
   - Таблицы: clients, contacts, addresses
   - ClientService
   - Страница Clients
   - CRUD операции

3. **Проекты:**
   - Таблица projects
   - ProjectService
   - Страница Projects
   - Связь с клиентами

4. **Dashboard:**
   - DashboardService
   - KPI метрики
   - Виджеты активности

5. **Kanban:**
   - Таблицы: kanban_boards, kanban_columns, kanban_tasks
   - KanbanService
   - Drag & Drop UI
   - Real-time подписки

6. **Производство:**
   - Таблицы: production_zones, production_items, production_components, production_stages
   - ProductionManagementService
   - Production Manager UI
   - Иерархическое дерево

7. **Документы:**
   - Storage buckets
   - Загрузка файлов
   - Просмотр и управление

8. **Доп. фичи:**
   - Роли и права
   - Уведомления
   - Аналитика
   - Отчеты

---

## 🚀 Заключение

Это полнофункциональная CRM система для мебельного производства с акцентом на:
- **Прозрачность процессов** (от клиента до готового изделия)
- **Real-time коллаборацию** (команда работает синхронно)
- **Детальный контроль производства** (4-уровневая иерархия)
- **Современный стек** (React + TypeScript + Supabase)
- **Хорошую производительность** (code splitting, caching, PWA)
- **Масштабируемость** (модульная архитектура, сервисный слой)

Система готова к production использованию, но есть области для улучшения (финансы, склад, отчеты).

**Общая сложность:** средне-высокая (около 10000+ строк кода)
**Время разработки (оценка):** 2-3 месяца для одного разработчика
**Технический уровень:** senior/middle+

---

*Документ создан автоматически на основе анализа кода проекта CRM3.0*  
*Дата: October 23, 2025*

