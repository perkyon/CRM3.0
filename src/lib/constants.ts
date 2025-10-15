// Constants and enums for the CRM system
// No mock data - only configuration constants

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

// User roles
export const userRoles = {
  Admin: 'Администратор',
  Manager: 'Менеджер',
  Master: 'Мастер',
  Procurement: 'Закупки',
  Accountant: 'Бухгалтер'
};

// Client types
export const clientTypes = {
  'Физ. лицо': 'Физическое лицо',
  'ИП': 'Индивидуальный предприниматель',
  'ООО': 'Общество с ограниченной ответственностью'
};

// Client statuses
export const clientStatuses = {
  lead: 'Лид',
  new: 'Новый',
  in_work: 'В работе',
  lost: 'Потерян',
  client: 'Клиент'
};

// Priority levels
export const priorityLevels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный'
};

// Task statuses
export const taskStatuses = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Выполнено'
};

// Document types
export const documentTypes = {
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  xls: 'XLS',
  xlsx: 'XLSX',
  dwg: 'DWG',
  dxf: 'DXF',
  '3dm': '3DM',
  step: 'STEP',
  iges: 'IGES',
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  mp4: 'MP4',
  avi: 'AVI',
  mov: 'MOV',
  zip: 'ZIP',
  rar: 'RAR',
  txt: 'TXT',
  other: 'Другое'
};

// Document categories
export const documentCategories = {
  brief: 'Бриф',
  design: 'Дизайн',
  technical: 'Техническая документация',
  estimate: 'Смета',
  contract: 'Договор',
  photo: 'Фотографии',
  video: 'Видео',
  other: 'Другое'
};

// Tag colors
export const tagColors = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#6b7280'
};

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/users',
  CLIENTS: '/clients',
  PROJECTS: '/projects',
  KANBAN: '/kanban',
  DOCUMENTS: '/documents',
  ACTIVITIES: '/activities'
};

// Storage buckets
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  PROJECT_PHOTOS: 'project-photos'
};

// Validation rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+7\s\d{3}\s\d{3}-\d{2}-\d{2}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// UI constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1440
};

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Currency formatting
export const CURRENCY_CONFIG = {
  SYMBOL: '₽',
  LOCALE: 'ru-RU',
  DECIMAL_PLACES: 2
};

// Date formatting
export const DATE_CONFIG = {
  LOCALE: 'ru-RU',
  FORMAT: 'DD.MM.YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD.MM.YYYY HH:mm'
};
