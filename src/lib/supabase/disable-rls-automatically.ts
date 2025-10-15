import { supabase } from './config';

export async function disableRLS() {
  console.log('🔓 Disabling RLS for development...');
  
  try {
    // Execute the disable RLS SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Disable RLS on all tables
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
        ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
        ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
        ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
        ALTER TABLE client_tags DISABLE ROW LEVEL SECURITY;
        ALTER TABLE client_documents DISABLE ROW LEVEL SECURITY;
        ALTER TABLE project_documents DISABLE ROW LEVEL SECURITY;
        ALTER TABLE kanban_boards DISABLE ROW LEVEL SECURITY;
        ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
        ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;
        ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
        ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
        ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;
        ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
        ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;
      `
    });

    if (error) {
      console.log('⚠️ Could not disable RLS via RPC:', error.message);
      console.log('ℹ️ Please run the disable-rls.sql script manually in Supabase SQL Editor');
    } else {
      console.log('✅ RLS disabled successfully');
    }

    // Test if we can access data now
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact' });

    if (usersError) {
      console.log('❌ Still cannot access users:', usersError.message);
    } else {
      console.log('✅ Can access users:', users?.length || 0, 'records');
    }

  } catch (error) {
    console.error('❌ Failed to disable RLS:', error);
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).disableRLS = disableRLS;
  console.log('🔓 RLS disabler made available globally as window.disableRLS');
}
