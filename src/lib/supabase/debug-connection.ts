import { supabase } from './config';

export async function debugSupabaseConnection() {
  console.log('🔍 Debugging Supabase connection...');
  
  try {
    // Test 1: Check auth status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('✅ Auth status:', session ? 'Authenticated' : 'Not authenticated');
    if (authError) console.error('❌ Auth error:', authError);
    
    // Test 2: Check if user exists in users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);
    
    console.log('✅ Users table access:', usersError ? 'Failed' : 'Success');
    if (usersError) console.error('❌ Users error:', usersError);
    if (users) console.log('👥 Found users:', users.length);
    
    // Test 3: Check if clients table exists
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .limit(5);
    
    console.log('✅ Clients table access:', clientsError ? 'Failed' : 'Success');
    if (clientsError) console.error('❌ Clients error:', clientsError);
    if (clients) console.log('👥 Found clients:', clients.length);
    
    // Test 4: Check if projects table exists
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(5);
    
    console.log('✅ Projects table access:', projectsError ? 'Failed' : 'Success');
    if (projectsError) console.error('❌ Projects error:', projectsError);
    if (projects) console.log('👥 Found projects:', projects.length);
    
    return {
      auth: !authError,
      users: !usersError,
      clients: !clientsError,
      projects: !projectsError
    };
    
  } catch (error) {
    console.error('❌ Debug connection failed:', error);
    return {
      auth: false,
      users: false,
      clients: false,
      projects: false
    };
  }
}
