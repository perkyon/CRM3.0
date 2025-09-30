// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  
  // Clients
  clients: {
    list: '/clients',
    create: '/clients',
    get: (id: string) => `/clients/${id}`,
    update: (id: string) => `/clients/${id}`,
    delete: (id: string) => `/clients/${id}`,
  },
  
  // Projects
  projects: {
    list: '/projects',
    create: '/projects',
    get: (id: string) => `/projects/${id}`,
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
  },
  
  // Documents
  documents: {
    list: '/documents',
    upload: '/documents/upload',
    get: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
    download: (id: string) => `/documents/${id}/download`,
  },
  
  // Production
  production: {
    boards: '/production/boards',
    board: (id: string) => `/production/boards/${id}`,
    tasks: '/production/tasks',
    task: (id: string) => `/production/tasks/${id}`,
  },
  
  // Users
  users: {
    list: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
  },
  
  // Dashboard
  dashboard: {
    kpis: '/dashboard/kpis',
    activities: '/dashboard/activities',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
