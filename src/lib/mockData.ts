import { User, BOMItem, InventoryItem, Estimate, Invoice, DashboardKPIs, Document, KanbanBoard, KanbanColumn, KanbanTask } from '../types';

// Generate UUID v4 (simple implementation)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Users - still using mock data until full auth integration
// Using proper UUIDs for Supabase compatibility
export const mockUsers: User[] = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Сыроежкин', email: 'syroejkin@workshop.ru', phone: '+7 495 123-45-67', role: 'Manager', active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Олег Смирнов', email: 'o.smirnov@workshop.ru', phone: '+7 495 234-56-78', role: 'Master', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Дмитрий Козлов', email: 'd.kozlov@workshop.ru', phone: '+7 495 345-67-89', role: 'Procurement', active: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Анна Волкова', email: 'a.volkova@workshop.ru', phone: '+7 495 456-78-90', role: 'Accountant', active: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
];

// Project stage names and order
export const projectStageNames = {
  brief: 'Бриф',
  design: 'Дизайн',
  approval: 'Согласование',
  production: 'Производство',
  assembly: 'Сборка',
  delivery: 'Доставка',
  completed: 'Завершен',
  cancelled: 'Отменен'
};

export const stageOrder = ['brief', 'design', 'approval', 'production', 'assembly', 'delivery', 'completed'];

// Production sub-stages for detailed production tracking
export const productionSubStages = {
  cutting: 'Раскрой',
  edging: 'Кромкование', 
  drilling: 'Сверление',
  assembly: 'Сборка',
  finishing: 'Отделка',
  quality_check: 'Контроль качества',
  packaging: 'Упаковка'
};

export const productionSubStageOrder = ['cutting', 'edging', 'drilling', 'assembly', 'finishing', 'quality_check', 'packaging'];

// BOM Items - for materials management (still using mock until MaterialService is created)
export const mockBOMItems: BOMItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
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
    id: '550e8400-e29b-41d4-a716-446655440011',
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

// Inventory - for warehouse management
export const mockInventory: InventoryItem[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'ЛДСП 16мм Белый',
    sku: 'LDSP-16-WHITE',
    category: 'Плитные материалы',
    unit: 'м²',
    qtyInStock: 50,
    qtyReserved: 12,
    qtyAvailable: 38,
    minStock: 10,
    maxStock: 100,
    price: 2500,
    supplier: 'ООО "МДФ-Центр"',
    location: 'Склад А-1-01',
    lastUpdated: '2024-01-20'
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Петли Blum Clip Top',
    sku: 'BLUM-CLIP-TOP',
    category: 'Фурнитура',
    unit: 'шт',
    qtyInStock: 200,
    qtyReserved: 20,
    qtyAvailable: 180,
    minStock: 50,
    maxStock: 500,
    price: 450,
    supplier: 'Blum Russia',
    location: 'Склад Б-2-05',
    lastUpdated: '2024-01-19'
  }
];

// Estimates - for project estimation
export const mockEstimates: Estimate[] = [
  {
    id: 'EST-001',
    projectId: 'PRJ-001',
    clientId: '1',
    number: 'СМ-2024-001',
    date: '2024-01-10',
    validUntil: '2024-02-10',
    status: 'approved',
    items: [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Кухонный гарнитур "Модерн"',
        description: 'Изготовление кухонного гарнитура по индивидуальному проекту',
        unit: 'комплект',
        quantity: 1,
        price: 180000,
        amount: 180000
      }
    ],
    subtotal: 180000,
    taxRate: 20,
    taxAmount: 36000,
    total: 216000,
    notes: 'Срок изготовления 14 рабочих дней'
  }
];

// Invoices - for billing
export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    projectId: 'PRJ-001',
    clientId: '1',
    estimateId: 'EST-001',
    number: 'СЧ-2024-001',
    date: '2024-01-15',
    dueDate: '2024-01-30',
    status: 'paid',
    items: [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Кухонный гарнитур "Модерн"',
        description: 'Изготовление кухонного гарнитура по индивидуальному проекту',
        unit: 'комплект',
        quantity: 1,
        price: 180000,
        amount: 180000
      }
    ],
    subtotal: 180000,
    taxRate: 20,
    taxAmount: 36000,
    total: 216000,
    paidAmount: 216000,
    paidDate: '2024-01-25'
  }
];

// Dashboard KPIs - now replaced by DashboardService, keeping for fallback
export const mockDashboardKPIs: DashboardKPIs = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalClients: 0,
  monthlyRevenue: 0,
  averageProjectValue: 0,
  projectsInProduction: 0,
  overdueProjects: 0,
};

// Documents - for file management
export const mockDocuments: Document[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Техническое задание.pdf',
    type: 'pdf',
    size: 1024000,
    uploadDate: '2024-01-10',
    uploadedBy: 'Иван Строев',
    projectId: 'PRJ-001',
    category: 'technical'
  }
];

// Kanban data - now replaced by KanbanService, keeping for reference
export const mockKanbanBoard: KanbanBoard = {
  id: 'board-1',
  projectId: 'PRJ-001',
  title: 'Производственная доска',
  description: 'Отслеживание производственных задач',
  columns: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

export const mockKanbanColumns: KanbanColumn[] = [];
export const mockKanbanTasks: KanbanTask[] = [];
