import { Client, Project, User, BOMItem, InventoryItem, Estimate, Invoice, DashboardKPIs, Document, KanbanBoard, KanbanColumn, KanbanTask, ClientTag, ClientDocument } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Алексей Петров', email: 'a.petrov@workshop.ru', phone: '+7 495 123-45-67', role: 'Manager', active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '2', name: 'Мария Сидорова', email: 'm.sidorova@workshop.ru', phone: '+7 495 234-56-78', role: 'Master', active: true, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' },
  { id: '3', name: 'Дмитрий Козлов', email: 'd.kozlov@workshop.ru', phone: '+7 495 345-67-89', role: 'Procurement', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '4', name: 'Анна Волкова', email: 'a.volkova@workshop.ru', phone: '+7 495 456-78-90', role: 'Accountant', active: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
];

export const mockClients: Client[] = [
  {
    id: '1',
    type: 'ООО',
    name: 'ООО "Строй Комфорт"',
    company: 'ООО "Строй Комфорт"',
    contacts: [
      { 
        id: '1', 
        name: 'Иван Строев', 
        role: 'Генеральный директор', 
        phone: '+7 495 111-22-33', 
        email: 'i.stroev@sk.ru', 
        isPrimary: true,
        messengers: {
          whatsapp: '+7 495 111-22-33',
          telegram: '@ivan_stroev'
        }
      },
    ],
    addresses: {
      physical: { street: 'ул. Московская, д. 15, офис 201', city: 'Москва', zipCode: '123456' },
      billing: { street: 'ул. Московская, д. 15, офис 201', city: 'Москва', zipCode: '123456' },
    },
    preferredChannel: 'WhatsApp',
    source: 'Реклама в интернете',
    status: 'client',
    lastActivity: '2024-01-15',
    ownerId: '1',
    projectsCount: 2,
    arBalance: 150000,
    createdAt: '2023-12-01',
    tags: [
      { id: '1', name: 'VIP клиент', color: 'purple', type: 'priority' },
      { id: '2', name: 'Крупный заказ', color: 'green', type: 'category' }
    ],
    documents: [
      {
        id: '1',
        clientId: '1',
        name: 'Договор №001-2024',
        originalName: 'contract_stroy_comfort.pdf',
        type: 'pdf',
        category: 'contract',
        size: 245760,
        uploadedBy: '1',
        uploadedAt: '2023-12-01',
        version: 1,
        description: 'Договор на изготовление мебели'
      },
      {
        id: '2',
        clientId: '1',
        name: 'Счет №125',
        originalName: 'invoice_125.pdf',
        type: 'pdf',
        category: 'invoice',
        size: 102400,
        uploadedBy: '1',
        uploadedAt: '2024-01-10',
        version: 1
      }
    ],
    notes: 'Постоянный клиент, работаем с 2023 года. Предпочитает современные стили, качественную фурнитуру.'
  },
  {
    id: '2',
    type: 'Физ. лицо',
    name: 'Светлана Николаевна Кузнецова',
    contacts: [
      { 
        id: '2', 
        name: 'Светлана Кузнецова', 
        role: 'Владелец', 
        phone: '+7 916 555-44-33', 
        email: 's.kuznetsova@mail.ru', 
        isPrimary: true,
        messengers: {
          whatsapp: '+7 916 555-44-33'
        }
      },
    ],
    addresses: {
      physical: { street: 'пр. Ленина, д. 45, кв. 23', city: 'Москва', zipCode: '101000' },
    },
    preferredChannel: 'Phone',
    source: 'Рекомендация',
    status: 'in_work',
    lastActivity: '2024-01-20',
    ownerId: '1',
    projectsCount: 1,
    arBalance: 0,
    createdAt: '2024-01-05',
    tags: [
      { id: '3', name: 'Дизайн студия', color: 'blue', type: 'category' }
    ],
    documents: [
      {
        id: '3',
        clientId: '2',
        name: 'Паспортные данные',
        originalName: 'passport_scan.jpg',
        type: 'jpg',
        category: 'passport',
        size: 1536000,
        uploadedBy: '1',
        uploadedAt: '2024-01-05',
        version: 1
      }
    ],
    notes: 'Дизайнер интерьеров, работает с клиентами премиум-сегмента. Требует высокое качество исполнения.'
  },
  {
    id: '3',
    type: 'ИП',
    name: 'ИП Морозов Андрей Сергеевич',
    contacts: [
      { 
        id: '3', 
        name: 'Андрей Морозов', 
        role: 'Индивидуальный предприниматель', 
        phone: '+7 903 222-33-44', 
        email: 'a.morozov@biz.ru', 
        isPrimary: true,
        messengers: {
          telegram: '@morozov_as'
        }
      },
    ],
    addresses: {
      physical: { street: 'ул. Садовая, д. 78, офис 15', city: 'Москва', zipCode: '105000' },
    },
    preferredChannel: 'Telegram',
    source: 'Холодный звонок',
    status: 'lead',
    lastActivity: '2024-01-10',
    ownerId: '1',
    projectsCount: 0,
    arBalance: 0,
    createdAt: '2024-01-10',
    tags: [
      { id: '4', name: 'Срочный заказ', color: 'red', type: 'priority' }
    ],
    documents: [],
    notes: 'Потенциальный клиент, ищет мебель для офиса. Требует быстрые сроки изготовления.'
  },
  {
    id: '4',
    type: 'ООО',
    name: 'ООО "Модерн Интерьер"',
    company: 'ООО "Модерн Интерьер"',
    contacts: [
      { 
        id: '4', 
        name: 'Елена Васильева', 
        role: 'Коммерческий директор', 
        phone: '+7 495 777-88-99', 
        email: 'e.vasileva@modern.ru', 
        isPrimary: true,
        messengers: {
          whatsapp: '+7 495 777-88-99',
          telegram: 'elena_vasileva'
        }
      },
    ],
    addresses: {
      physical: { street: 'Кутузовский проспект, д. 12, стр. 1', city: 'Москва', zipCode: '121000' },
      billing: { street: 'Кутузовский проспект, д. 12, стр. 1', city: 'Москва', zipCode: '121000' },
    },
    preferredChannel: 'WhatsApp',
    source: 'Партнеры',
    status: 'client',
    lastActivity: '2024-01-25',
    ownerId: '1',
    projectsCount: 3,
    arBalance: 0,
    createdAt: '2023-11-15',
    tags: [
      { id: '5', name: 'Дизайн студия', color: 'blue', type: 'category' },
      { id: '6', name: 'Партнер', color: 'green', type: 'custom' }
    ],
    documents: [
      {
        id: '4',
        clientId: '4',
        name: 'Договор о партнерстве',
        originalName: 'partnership_agreement.pdf',
        type: 'pdf',
        category: 'contract',
        size: 567890,
        uploadedBy: '1',
        uploadedAt: '2023-11-15',
        version: 2,
        description: 'Соглашение о долгосрочном сотрудничестве'
      }
    ],
    notes: 'Дизайн-студия, постоянный партнер. Приводят клиентов премиум-сегмента. Работают с необычными проектами.'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'PRJ-001',
    clientId: '1',
    title: 'Кухня "Модерн"',
    siteAddress: 'ул. Московская, 15',
    managerId: '1',
    foremanId: '2',
    startDate: '2024-01-15',
    dueDate: '2024-02-15',
    budget: 350000,
    priority: 'high',
    stage: 'production',
    briefComplete: true,
    createdAt: '2024-01-10',
    productionSubStage: 'sanding', // Добавляем подэтап производства
    documents: [
      {
        id: '5',
        clientId: '1',
        name: 'Проект кухни - чертежи',
        originalName: 'kitchen_project_drawings.pdf',
        type: 'pdf',
        category: 'other',
        size: 1024000,
        uploadedBy: '1',
        uploadedAt: '2024-01-10',
        version: 1,
        description: 'Рабочие чертежи кухни'
      },
      {
        id: '6',
        clientId: '1',
        name: 'Смета проекта',
        originalName: 'kitchen_estimate.xlsx',
        type: 'xlsx',
        category: 'invoice',
        size: 45678,
        uploadedBy: '1',
        uploadedAt: '2024-01-12',
        version: 2,
        description: 'Детальная смета по материалам и работам'
      }
    ]
  },
  {
    id: 'PRJ-002',
    clientId: '1',
    title: 'Шкаф-купе в спальню',
    siteAddress: 'ул. Московская, 15',
    managerId: '1',
    foremanId: '2',
    startDate: '2024-01-20',
    dueDate: '2024-03-01',
    budget: 180000,
    priority: 'medium',
    stage: 'assembly',
    briefComplete: true,
    createdAt: '2024-01-15',
    documents: [
      {
        id: '7',
        clientId: '1',
        name: 'Дизайн-проект шкафа',
        originalName: 'wardrobe_design.pdf',
        type: 'pdf',
        category: 'other',
        size: 789123,
        uploadedBy: '1',
        uploadedAt: '2024-01-15',
        version: 1
      }
    ]
  },
  {
    id: 'PRJ-003',
    clientId: '2',
    title: 'Детская мебель',
    siteAddress: 'пр. Ленина, 45, кв. 23',
    managerId: '1',
    foremanId: '2',
    startDate: '2024-02-01',
    dueDate: '2024-03-15',
    budget: 220000,
    priority: 'medium',
    stage: 'tech_project',
    briefComplete: false,
    createdAt: '2024-01-25',
    documents: []
  },
];

export const mockBOMItems: BOMItem[] = [
  {
    id: '1',
    projectId: 'PRJ-001',
    name: 'ЛДСП 16мм Белый',
    sku: 'LDSP-16-WHITE',
    unit: 'м²',
    qtyPlan: 12,
    qtyFact: 12,
    materialType: 'ЛДСП',
    color: 'Белый',
    supplierId: 'SUP-001',
    price: 2500,
    amount: 30000,
    status: 'received',
  },
  {
    id: '2',
    projectId: 'PRJ-001',
    name: 'Петли Blum',
    sku: 'BLUM-HINGE-001',
    unit: 'шт',
    qtyPlan: 20,
    qtyFact: 15,
    materialType: 'Фурнитура',
    color: 'Хром',
    supplierId: 'SUP-002',
    price: 450,
    amount: 9000,
    status: 'to_order',
  },
];

export const mockInventory: InventoryItem[] = [
  { id: '1', sku: 'LDSP-16-WHITE', name: 'ЛДСП 16мм Белый', unit: 'м²', balance: 45, minLevel: 20, location: 'Склад А' },
  { id: '2', sku: 'MDF-18-OAK', name: 'МДФ 18мм Дуб', unit: 'м²', balance: 12, minLevel: 15, location: 'Склад А' },
  { id: '3', sku: 'BLUM-HINGE-001', name: 'Петли Blum', unit: 'шт', balance: 85, minLevel: 50, location: 'Склад Б' },
];

export const mockEstimates: Estimate[] = [
  { id: '1', projectId: 'PRJ-001', total: 350000, status: 'approved', createdAt: '2024-01-12' },
  { id: '2', projectId: 'PRJ-002', total: 180000, status: 'sent', createdAt: '2024-01-18' },
];

export const mockInvoices: Invoice[] = [
  { id: '1', estimateId: '1', projectId: 'PRJ-001', total: 350000, status: 'paid', dueDate: '2024-02-01', createdAt: '2024-01-15' },
  { id: '2', projectId: 'PRJ-002', total: 90000, status: 'sent', dueDate: '2024-02-15', createdAt: '2024-01-20' },
];

export const mockDashboardKPIs: DashboardKPIs = {
  ordersInProgress: 8,
  shopLoadPercent: 85,
  overdueTasks: 3,
  monthlyRevenue: 2150000,
  monthlyMargin: 580000,
  materialDeficit: 5,
};

export const projectStageNames: Record<string, string> = {
  brief: 'Бриф',
  design: 'Дизайн',
  tech_project: 'Технический проект',
  procurement: 'Закупка',
  production: 'Производство',
  assembly: 'Сборка',
  delivery: 'Доставка',
  done: 'Сдача',
};

export const stageOrder: string[] = [
  'brief', 'design', 'tech_project', 'procurement', 'production', 'assembly', 'delivery', 'done'
];

// Подэтапы производства
export const productionSubStages: Record<string, string> = {
  cutting: 'Раскрой',
  drilling: 'Присадка',
  sanding: 'Шлифовка',
  painting: 'Покраска',
  qa: 'Контроль качества',
};

export const productionSubStageOrder: string[] = [
  'cutting', 'drilling', 'sanding', 'painting', 'qa'
];

export const rolePermissions: Record<string, string[]> = {
  Admin: ['*'],
  Manager: ['clients', 'projects', 'estimates', 'finance_view'],
  Master: ['projects', 'production', 'bom', 'inventory_view'],
  Procurement: ['bom', 'inventory', 'suppliers'],
  Accountant: ['finance', 'invoices', 'payments'],
};

export const mockDocuments: Document[] = [
  {
    id: 'DOC-001',
    projectId: 'PRJ-001',
    name: 'Техническое задание кухня Модерн',
    originalName: 'brief_kitchen_modern.pdf',
    type: 'pdf',
    category: 'brief',
    size: 2456789,
    uploadedBy: '1',
    uploadedAt: '2024-01-12T10:30:00Z',
    version: 1,
    description: 'Подробное техническое задание с размерами и требованиями',
  },
  {
    id: 'DOC-002',
    projectId: 'PRJ-001',
    name: '3D модель кухни',
    originalName: 'kitchen_3d_model.3dm',
    type: '3dm',
    category: 'design',
    size: 15678234,
    uploadedBy: '2',
    uploadedAt: '2024-01-18T14:20:00Z',
    version: 2,
    description: 'Трехмерная модель кухни в Rhino',
  },
  {
    id: 'DOC-003',
    projectId: 'PRJ-001',
    name: 'Чертежи деталей',
    originalName: 'kitchen_drawings.dwg',
    type: 'dwg',
    category: 'technical',
    size: 5234567,
    uploadedBy: '2',
    uploadedAt: '2024-01-20T09:15:00Z',
    version: 1,
    description: 'Рабочие чертежи всех деталей кухни',
  },
  {
    id: 'DOC-004',
    projectId: 'PRJ-001',
    name: 'Смета на материалы',
    originalName: 'materials_estimate.xlsx',
    type: 'xlsx',
    category: 'estimate',
    size: 1234567,
    uploadedBy: '3',
    uploadedAt: '2024-01-22T16:45:00Z',
    version: 3,
    description: 'Подробная смета с ценами поставщиков',
  },
  {
    id: 'DOC-005',
    projectId: 'PRJ-001',
    name: 'Фото готового проекта',
    originalName: 'kitchen_photos.zip',
    type: 'zip',
    category: 'photo',
    size: 45678901,
    uploadedBy: '1',
    uploadedAt: '2024-02-10T12:00:00Z',
    version: 1,
    description: 'Архив с фотографиями готовой кухни',
  },
  {
    id: 'DOC-006',
    projectId: 'PRJ-002',
    name: 'Договор на шкаф-купе',
    originalName: 'contract_wardrobe.pdf',
    type: 'pdf',
    category: 'contract',
    size: 987654,
    uploadedBy: '1',
    uploadedAt: '2024-01-25T11:30:00Z',
    version: 1,
    description: 'Подписанный договор с клиентом',
  },
  {
    id: 'DOC-007',
    projectId: 'PRJ-003',
    name: 'Видео сборки детской мебели',
    originalName: 'assembly_video.mp4',
    type: 'mp4',
    category: 'video',
    size: 123456789,
    uploadedBy: '2',
    uploadedAt: '2024-02-05T15:20:00Z',
    version: 1,
    description: 'Видеоинструкция по сборке детской мебели',
  },
];

export const documentCategoryNames: Record<string, string> = {
  brief: 'Техническое задание',
  design: 'Дизайн-проекты',
  technical: 'Чертежи и 3D',
  estimate: 'Сметы и расчеты',
  contract: 'Договоры',
  photo: 'Фотографии',
  video: 'Видео',
  other: 'Прочее',
};

// Шаблон колонок для канбан-доски
export const defaultKanbanColumns: Omit<KanbanColumn, 'id'>[] = [
  { title: 'Закупка', stage: 'procurement', order: 0, color: '#f59e0b', isDefault: true },
  { title: 'Раскрой', stage: 'cutting', order: 1, color: '#8b5cf6', isDefault: true },
  { title: 'Шлифовка', stage: 'sanding', order: 2, color: '#06b6d4', isDefault: true },
  { title: 'Покраска', stage: 'painting', order: 3, color: '#10b981', isDefault: true },
  { title: 'Упаковка', stage: 'packaging', order: 4, color: '#f97316', isDefault: true },
];

export const mockKanbanBoards: KanbanBoard[] = [
  {
    id: 'BOARD-PRJ-001',
    projectId: 'PRJ-001',
    title: 'Производство кухни "Модерн"',
    columns: [
      { id: 'COL-001', title: 'Закупка', stage: 'procurement', order: 0, color: '#f59e0b', isDefault: true },
      { id: 'COL-002', title: 'Раскрой', stage: 'cutting', order: 1, color: '#8b5cf6', isDefault: true },
      { id: 'COL-003', title: 'Шлифовка', stage: 'sanding', order: 2, color: '#06b6d4', isDefault: true },
      { id: 'COL-004', title: 'Покраска', stage: 'painting', order: 3, color: '#10b981', isDefault: true },
      { id: 'COL-005', title: 'Контроль качества', stage: 'qa', order: 4, color: '#ef4444', isDefault: false },
      { id: 'COL-006', title: 'Упаковка', stage: 'packaging', order: 5, color: '#f97316', isDefault: true },
    ],
    tasks: [
      {
        id: 'TASK-001',
        projectId: 'PRJ-001',
        columnId: 'COL-003',
        title: 'Шлифовка корпусных деталей',
        description: 'Обработать все корпусные детали кухни, особое внимание к видимым торцам',
        assigneeId: '2',
        dueDate: '2024-01-25T18:00:00Z',
        priority: 'high',
        tags: ['корпус', 'срочно'],
        checklist: [
          { id: 'CHK-001', text: 'Шлифовка боковых стенок', completed: true },
          { id: 'CHK-002', text: 'Шлифовка полок', completed: true },
          { id: 'CHK-003', text: 'Обработка торцов', completed: false },
          { id: 'CHK-004', text: 'Финальная шлифовка', completed: false },
        ],
        attachments: [],
        comments: [
          {
            id: 'COM-001',
            text: 'Нужно уделить особое внимание торцам, клиент очень требователен',
            authorId: '1',
            createdAt: '2024-01-20T10:30:00Z'
          }
        ],
        createdAt: '2024-01-18T09:00:00Z',
        updatedAt: '2024-01-22T14:30:00Z',
        order: 0,
      },
      {
        id: 'TASK-002',
        projectId: 'PRJ-001',
        columnId: 'COL-004',
        title: 'Покраска фасадов',
        description: 'Покраска фасадов кухни в белый цвет по каталогу RAL 9010',
        assigneeId: '2',
        dueDate: '2024-01-28T17:00:00Z',
        priority: 'medium',
        tags: ['фасады', 'покраска'],
        checklist: [
          { id: 'CHK-005', text: 'Подготовка поверхности', completed: true },
          { id: 'CHK-006', text: 'Грунтовка', completed: true },
          { id: 'CHK-007', text: 'Первый слой краски', completed: false },
          { id: 'CHK-008', text: 'Второй слой краски', completed: false },
          { id: 'CHK-009', text: 'Финальная полировка', completed: false },
        ],
        attachments: [],
        comments: [],
        createdAt: '2024-01-19T11:00:00Z',
        updatedAt: '2024-01-23T16:15:00Z',
        order: 0,
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-23T16:15:00Z',
  },
  {
    id: 'BOARD-PRJ-002',
    projectId: 'PRJ-002',
    title: 'Производство шкафа-купе',
    columns: [
      { id: 'COL-007', title: 'Закупка', stage: 'procurement', order: 0, color: '#f59e0b', isDefault: true },
      { id: 'COL-008', title: 'Раскрой', stage: 'cutting', order: 1, color: '#8b5cf6', isDefault: true },
      { id: 'COL-009', title: 'Сверление', stage: 'drilling', order: 2, color: '#3b82f6', isDefault: false },
      { id: 'COL-010', title: 'Сборка', stage: 'assembly', order: 3, color: '#10b981', isDefault: false },
      { id: 'COL-011', title: 'Упаковка', stage: 'packaging', order: 4, color: '#f97316', isDefault: true },
    ],
    tasks: [
      {
        id: 'TASK-003',
        projectId: 'PRJ-002',
        columnId: 'COL-008',
        title: 'Раскрой ЛДСП для корпуса',
        description: 'Раскрой деталей корпуса шкафа из ЛДСП 18мм',
        assigneeId: '2',
        dueDate: '2024-01-26T16:00:00Z',
        priority: 'high',
        tags: ['ЛДСП', 'корпус'],
        checklist: [
          { id: 'CHK-010', text: 'Проверить размеры деталей', completed: true },
          { id: 'CHK-011', text: 'Раскрой боковых стенок', completed: false },
          { id: 'CHK-012', text: 'Раскрой полок', completed: false },
          { id: 'CHK-013', text: 'Раскрой задней стенки', completed: false },
        ],
        attachments: [],
        comments: [],
        createdAt: '2024-01-20T08:30:00Z',
        updatedAt: '2024-01-24T12:45:00Z',
        order: 0,
      },
    ],
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-24T12:45:00Z',
  },
];