import { supabase, TABLES } from './config';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('📡 Supabase URL:', supabase.supabaseUrl);
    console.log('🔑 Anon Key:', supabase.supabaseKey ? 'Set' : 'Not set');
    
    // Test 2: Try to fetch users table
    console.log('👥 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from(TABLES.USERS)
      .select('id, name')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible:', users?.length || 0, 'users found');
    }
    
    // Test 3: Try to fetch clients table
    console.log('🏢 Testing clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from(TABLES.CLIENTS)
      .select('id, name')
      .limit(1);
    
    if (clientsError) {
      console.error('❌ Clients table error:', clientsError);
    } else {
      console.log('✅ Clients table accessible:', clients?.length || 0, 'clients found');
    }
    
    // Test 4: Try to fetch projects table
    console.log('📋 Testing projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from(TABLES.PROJECTS)
      .select('id, title')
      .limit(1);
    
    if (projectsError) {
      console.error('❌ Projects table error:', projectsError);
    } else {
      console.log('✅ Projects table accessible:', projects?.length || 0, 'projects found');
    }
    
    return {
      success: !usersError && !clientsError && !projectsError,
      errors: {
        users: usersError,
        clients: clientsError,
        projects: projectsError
      }
    };
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return {
      success: false,
      error: error
    };
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testSupabaseConnection();
}
