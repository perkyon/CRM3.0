export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  permissions?: string[];
}

export type Role = 'Admin' | 'Manager' | 'Master' | 'Procurement' | 'Accountant';

export interface Client {
  id: string;
  type: 'Физ. лицо' | 'ИП' | 'ООО';
  name: string;
  company?: string;
  contacts: Contact[];
  addresses: {
    physical?: Address;
    billing?: Address;
  };
  preferredChannel: 'WhatsApp' | 'Telegram' | 'Email' | 'Phone';
  source: string;
  status: 'lead' | 'new' | 'in_work' | 'lost' | 'client';
  lastActivity: string;
  ownerId: string;
  projectsCount: number;
  arBalance: number;
  createdAt: string;
  updatedAt: string;
  tags: ClientTag[];
  documents: ClientDocument[];
  notes?: string;
  projects?: Project[];
}

export interface ClientTag {
  id: string;
  name: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';
  type: 'priority' | 'category' | 'custom';
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  originalName: string;
  type: DocumentType;
  category: ClientDocumentCategory;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
  version: number;
  description?: string;
}

export type ClientDocumentCategory =
  | 'contract' // Договоры
  | 'passport' // Паспортные данные
  | 'inn' // ИНН, ОГРН
  | 'invoice' // Счета
  | 'receipt' // Чеки, квитанции
  | 'photo' // Фотографии
  | 'other'; // Прочее

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  messengers?: {
    whatsapp?: string;
    telegram?: string;
  };
}

export interface Address {
  street: string;
  city: string;
  zipCode: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  siteAddress: string;
  managerId: string;
  foremanId: string;
  startDate: string;
  dueDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  stage: ProjectStage;
  productionSubStage?: ProductionSubStage; // Подэтап производства
  riskNotes?: string;
  briefComplete: boolean;
  createdAt: string;
  documents?: ClientDocument[];
}

export type ProjectStage = 
  | 'brief' 
  | 'design' 
  | 'tech_project'
  | 'procurement' 
  | 'production'
  | 'assembly' 
  | 'delivery' 
  | 'done';

export type ProductionSubStage = 
  | 'cutting' 
  | 'drilling' 
  | 'sanding' 
  | 'painting' 
  | 'qa';

export interface BOMItem {
  id: string;
  projectId: string;
  name: string;
  sku: string;
  unit: string;
  qtyPlan: number;
  qtyFact: number;
  materialType: string;
  color: string;
  supplierId: string;
  price: number;
  amount: number;
  status: 'to_order' | 'ordered' | 'received' | 'written_off';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  balance: number;
  minLevel: number;
  location: string;
}

export interface InventoryMovement {
  id: string;
  inventoryId: string;
  projectId?: string;
  type: 'in' | 'out' | 'writeoff';
  qty: number;
  batch: string;
  date: string;
}

export interface Estimate {
  id: string;
  projectId: string;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Invoice {
  id: string;
  estimateId?: string;
  projectId: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
}

export interface Activity {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  timestamp: string;
  meta: any;
}

export interface Integration {
  id: string;
  provider: string;
  status: 'connected' | 'error' | 'disconnected';
  tokens: any;
  scopes: string[];
  settings: any;
  lastSyncAt?: string;
}

export interface DashboardKPIs {
  ordersInProgress: number;
  shopLoadPercent: number;
  overdueTasks: number;
  monthlyRevenue: number;
  monthlyMargin: number;
  materialDeficit: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  stage: string;
  order: number;
  color?: string;
  isDefault: boolean;
}

export interface KanbanTask {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  checklist: ChecklistItem[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KanbanBoard {
  id: string;
  projectId: string;
  title: string;
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  originalName: string;
  type: DocumentType;
  category: DocumentCategory;
  size: number; // bytes
  uploadedBy: string;
  uploadedAt: string;
  url?: string; // URL для скачивания
  version: number;
  description?: string;
}

export type DocumentType = 
  | 'pdf'
  | 'doc' | 'docx'
  | 'xls' | 'xlsx'
  | 'dwg' | 'dxf'
  | '3dm' | 'step' | 'iges'
  | 'jpg' | 'jpeg' | 'png' | 'gif'
  | 'mp4' | 'avi' | 'mov'
  | 'zip' | 'rar'
  | 'txt'
  | 'other';

export type DocumentCategory =
  | 'brief' // Техническое задание
  | 'design' // Дизайн-проекты
  | 'technical' // Чертежи, 3D модели
  | 'estimate' // Сметы, расчеты
  | 'contract' // Договоры
  | 'photo' // Фотографии
  | 'video' // Видео
  | 'other'; // Прочее

// API Request/Response Types
export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
  active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  active?: boolean;
  avatar?: string;
}

export interface CreateClientRequest {
  type: Client['type'];
  name: string;
  company?: string;
  contacts: Omit<Contact, 'id'>[];
  addresses: Client['addresses'];
  preferredChannel: Client['preferredChannel'];
  source: string;
  status: Client['status'];
  ownerId: string;
  tags?: Omit<ClientTag, 'id'>[];
  notes?: string;
}

export interface UpdateClientRequest {
  type?: Client['type'];
  name?: string;
  company?: string;
  contacts?: Contact[];
  addresses?: Client['addresses'];
  preferredChannel?: Client['preferredChannel'];
  source?: string;
  status?: Client['status'];
  ownerId?: string;
  tags?: ClientTag[];
  notes?: string;
}

export interface CreateProjectRequest {
  clientId: string;
  title: string;
  siteAddress?: string;
  managerId: string;
  foremanId?: string;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  priority?: Project['priority'];
  stage?: Project['stage'];
  riskNotes?: string;
  briefComplete?: boolean;
  productionSubStage?: Project['productionSubStage'];
}

export interface UpdateProjectRequest {
  clientId?: string;
  title?: string;
  siteAddress?: string;
  managerId?: string;
  foremanId?: string;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  priority?: Project['priority'];
  stage?: Project['stage'];
  productionSubStage?: Project['productionSubStage'];
  riskNotes?: string;
  briefComplete?: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// File Upload Types
export interface FileUploadResponse {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Search and Filter Types
export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientSearchParams extends SearchParams {
  status?: string;
  type?: string;
  tags?: string[];
  ownerId?: string;
}

export interface ProjectSearchParams extends SearchParams {
  stage?: string;
  priority?: string;
  clientId?: string;
  managerId?: string;
  foremanId?: string;
}

export interface UserSearchParams extends SearchParams {
  role?: string;
  active?: boolean;
}

// Production Types
export type ComponentType = 
  | 'kitchen'      // Кухня
  | 'living_room'  // Гостинная
  | 'bedroom'      // Спальня
  | 'wardrobe'     // Гардеробная
  | 'bathroom'     // Ванная
  | 'children_room' // Детская
  | 'office'       // Офис
  | 'hallway'      // Прихожая
  | 'balcony'      // Балкон
  | 'other';       // Прочее

export type SubComponentType = 
  | 'sink'         // Раковина
  | 'kitchen_set'  // Гарнитур
  | 'cabinet'      // Шкаф
  | 'table'        // Стол
  | 'chair'        // Стул
  | 'bed'          // Кровать
  | 'wardrobe'     // Шкаф-купе
  | 'sofa'         // Диван
  | 'tv_stand'     // ТВ-тумба
  | 'shelf'        // Полка
  | 'mirror'       // Зеркало
  | 'bathroom_set' // Ванная комплект
  | 'other';       // Прочее

export type ProductionStageType = 
  | 'cnc_cutting'     // ЧПУ/раскрой
  | 'pre_assembly'    // Предсборка
  | 'sanding'         // Шлифовка
  | 'painting'        // Покраска
  | 'quality_control' // Контроль качества
  | 'packaging'       // Упаковка
  | 'delivery'        // Доставка
  | 'installation';   // Монтаж

export type ProductionTaskStatus = 
  | 'pending'      // Ожидает
  | 'in_progress'  // В работе
  | 'completed'    // Завершено
  | 'on_hold'      // Приостановлено
  | 'cancelled';   // Отменено

export interface ProjectComponent {
  id: string;
  projectId: string;
  componentType: ComponentType;
  name: string;
  description?: string;
  quantity: number;
  status: string;
  subComponents?: ProjectSubComponent[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSubComponent {
  id: string;
  componentId: string;
  subComponentType: SubComponentType;
  name: string;
  description?: string;
  quantity: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  material?: string;
  color?: string;
  status: string;
  productionStages?: ProductionStage[];
  materials?: SubComponentMaterial[];
  files?: SubComponentFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStage {
  id: string;
  subComponentId: string;
  stageType: ProductionStageType;
  name: string;
  description?: string;
  orderIndex: number;
  estimatedHours?: number;
  actualHours?: number;
  status: ProductionTaskStatus;
  assigneeId?: string;
  assignee?: User;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubComponentMaterial {
  id: string;
  subComponentId: string;
  materialName: string;
  materialType?: string;
  quantity: number;
  unit: string;
  costPerUnit?: number;
  totalCost?: number;
  supplier?: string;
  createdAt: string;
}

export interface SubComponentFile {
  id: string;
  subComponentId: string;
  name: string;
  originalName: string;
  type: DocumentType;
  category: DocumentCategory;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ComponentTemplate {
  id: string;
  componentType: ComponentType;
  name: string;
  description?: string;
  subComponents: Array<{
    type: SubComponentType;
    name: string;
    quantity: number;
  }>;
  productionStages: Array<{
    type: ProductionStageType;
    name: string;
    order: number;
    estimatedHours: number;
  }>;
  isDefault: boolean;
  createdAt: string;
}

// Production API Types
export interface CreateProjectComponentRequest {
  projectId: string;
  componentType: ComponentType;
  name: string;
  description?: string;
  quantity?: number;
}

export interface CreateProjectSubComponentRequest {
  componentId: string;
  subComponentType: SubComponentType;
  name: string;
  description?: string;
  quantity?: number;
  dimensions?: ProjectSubComponent['dimensions'];
  material?: string;
  color?: string;
}

export interface CreateProductionStageRequest {
  subComponentId: string;
  stageType: ProductionStageType;
  name: string;
  description?: string;
  orderIndex: number;
  estimatedHours?: number;
  assigneeId?: string;
}

export interface UpdateProductionStageRequest {
  name?: string;
  description?: string;
  estimatedHours?: number;
  actualHours?: number;
  status?: ProductionTaskStatus;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// Production Navigation Types
export interface ProductionNavigationState {
  currentStep: 'components' | 'subcomponents' | 'production';
  selectedComponentId?: string;
  selectedSubComponentId?: string;
  projectId: string;
}