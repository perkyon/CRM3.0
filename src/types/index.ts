export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  avatar?: string;
  defaultOrganizationId?: string; // Добавлено для SaaS
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
  organizationId?: string; // Добавлено для SaaS
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

export type ProjectDocumentCategory =
  | 'brief' // Техническое задание
  | 'design' // Дизайн-проекты
  | 'technical' // Чертежи, 3D модели
  | 'estimate' // Сметы, расчеты
  | 'contract' // Договоры
  | 'photo' // Фотографии
  | 'video' // Видео
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
  code?: string; // Короткий читаемый ID (PRJ-001, PRJ-002, etc.)
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
  organizationId?: string; // Добавлено для SaaS
  createdAt: string;
  documents?: ClientDocument[];
}

export type ProjectStage = 
  | 'brief' 
  | 'preliminary_design'
  | 'client_approval'
  | 'tech_project'
  | 'tech_approval'
  | 'production'
  | 'quality_check'
  | 'packaging'
  | 'delivery'
  | 'installation'
  | 'completed'
  | 'cancelled'
  // Legacy values for backward compatibility
  | 'design' 
  | 'procurement'
  | 'assembly'
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

// Production hierarchy types
export interface ProductionItem {
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
  // Computed fields
  children?: ProductionItem[];
  tasks?: KanbanTask[];
}

export interface ProductionMaterial {
  sku?: string;
  name?: string;
  color?: string;
  supplier?: string;
  qty?: number;
  unit?: string;
}

export interface ProductionSpecs {
  width?: number;
  height?: number;
  depth?: number;
  thickness?: number;
  weight?: number;
  [key: string]: any; // Allow custom specs
}

export interface ProductionTreeNode extends ProductionItem {
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
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
  organizationId?: string; // ID организации (автоматически устанавливается если не указан)
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
  organizationId?: string; // ID организации (автоматически устанавливается если не указан)
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
  organizationId?: string; // Фильтр по организации
}

export interface ProjectSearchParams extends SearchParams {
  stage?: string;
  priority?: string;
  clientId?: string;
  managerId?: string;
  foremanId?: string;
  organizationId?: string; // Фильтр по организации
}

export interface UserSearchParams extends SearchParams {
  role?: string;
  active?: boolean;
}

// ============================================
// SaaS Types - Мультитенантность
// ============================================

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete' 
  | 'incomplete_expired';

export type OrganizationStatus = 'active' | 'suspended' | 'deleted';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  status: OrganizationStatus;
  settings: Record<string, any>;
  maxUsers: number;
  maxProjects: number;
  maxStorageGb: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  organization?: Organization;
}

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  organization?: Organization;
}
