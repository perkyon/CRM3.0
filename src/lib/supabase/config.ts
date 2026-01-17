import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// ПРИНУДИТЕЛЬНО используем новый проект - игнорируем старые переменные
const ENV_URL = (import.meta as any).env?.VITE_SUPABASE_URL;
const ENV_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Если в переменных окружения старый проект - игнорируем их полностью
const isOldProject = ENV_URL?.includes('xhclmypcklndxqzkhgfk');

export const SUPABASE_CONFIG = {
  // Принудительно используем новый URL - игнорируем старые переменные
  url: isOldProject 
    ? 'https://ykdtitukhsvsvnbnskit.supabase.co' 
    : (ENV_URL || 'https://ykdtitukhsvsvnbnskit.supabase.co'),
  anonKey: isOldProject 
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHRpdHVraHN2c3ZuYm5za2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg3MjAsImV4cCI6MjA3NzI1NDcyMH0.tjCfpEG30rxaCuu22EmV3kKGxH45FDMTJNuPknpsl7w' 
    : (ENV_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHRpdHVraHN2c3ZuYm5za2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg3MjAsImV4cCI6MjA3NzI1NDcyMH0.tjCfpEG30rxaCuu22EmV3kKGxH45FDMTJNuPknpsl7w'),
} as const;

// Create Supabase client with authentication
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-ykdtitukhsvsvnbnskit-auth-token' // Явно указываем правильный ключ
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    db: {
      schema: 'public'
    }
  }
);

// Make Supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
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
  MESSENGER_INTEGRATIONS: 'messenger_integrations',
  MESSENGER_CONVERSATIONS: 'messenger_conversations',
  MESSENGER_MESSAGES: 'messenger_messages',
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
