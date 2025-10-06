import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
} as const;

// Create Supabase client
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        // Temporary: bypass authentication for development
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
    },
  }
);

// Make Supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('🔧 Supabase client made available globally for debugging');
}

// Database table names
export const TABLES = {
  USERS: 'users',
  CLIENTS: 'clients',
  PROJECTS: 'projects',
  CONTACTS: 'contacts',
  ADDRESSES: 'addresses',
  CLIENT_TAGS: 'client_tags',
  CLIENT_DOCUMENTS: 'client_documents',
  PROJECT_DOCUMENTS: 'project_documents',
  KANBAN_BOARDS: 'kanban_boards',
  KANBAN_COLUMNS: 'kanban_columns',
  KANBAN_TASKS: 'kanban_tasks',
  TASK_COMMENTS: 'task_comments',
  TASK_ATTACHMENTS: 'task_attachments',
  CHECKLIST_ITEMS: 'checklist_items',
  ACTIVITIES: 'activities',
  INTEGRATIONS: 'integrations',
} as const;

// RLS (Row Level Security) policies
export const RLS_POLICIES = {
  // Users can only see their own data
  USERS_SELECT: 'users_select_policy',
  USERS_UPDATE: 'users_update_policy',
  
  // Clients are visible to all authenticated users
  CLIENTS_SELECT: 'clients_select_policy',
  CLIENTS_INSERT: 'clients_insert_policy',
  CLIENTS_UPDATE: 'clients_update_policy',
  CLIENTS_DELETE: 'clients_delete_policy',
  
  // Projects follow similar pattern
  PROJECTS_SELECT: 'projects_select_policy',
  PROJECTS_INSERT: 'projects_insert_policy',
  PROJECTS_UPDATE: 'projects_update_policy',
  PROJECTS_DELETE: 'projects_delete_policy',
  
  // Production boards and tasks
  KANBAN_SELECT: 'kanban_select_policy',
  KANBAN_INSERT: 'kanban_insert_policy',
  KANBAN_UPDATE: 'kanban_update_policy',
  KANBAN_DELETE: 'kanban_delete_policy',
} as const;
