import { supabase, TABLES } from './config';

export async function testRLS() {
  console.log('🔒 Testing RLS policies...');
  
  try {
    // Test 1: Check if RLS is enabled
    console.log('1️⃣ Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['users', 'clients', 'projects', 'kanban_boards']);
    
    if (rlsError) {
      console.log('⚠️ Could not check RLS status:', rlsError.message);
    } else {
      console.log('📊 RLS Status:', rlsStatus);
    }

    // Test 2: Test unauthenticated access (should fail)
    console.log('2️⃣ Testing unauthenticated access...');
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('✅ Unauthenticated access properly blocked:', error.message);
      } else {
        console.log('⚠️ Unauthenticated access allowed - RLS might be disabled');
      }
    } catch (err) {
      console.log('✅ Unauthenticated access properly blocked:', err);
    }

    // Test 3: Test authenticated access (should work)
    console.log('3️⃣ Testing authenticated access...');
    try {
      // Try to get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.log('⚠️ No authenticated user:', authError.message);
      } else if (user) {
        console.log('✅ User authenticated:', user.email);
        
        // Test data access
        const { data: users, error: usersError } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .limit(1);
        
        if (usersError) {
          console.log('❌ Authenticated access failed:', usersError.message);
        } else {
          console.log('✅ Authenticated access works, found', users?.length || 0, 'users');
        }
      } else {
        console.log('⚠️ No user found - need to authenticate');
      }
    } catch (err) {
      console.log('❌ Authentication test failed:', err);
    }

    // Test 4: Test specific table access
    console.log('4️⃣ Testing table access...');
    const tables = [TABLES.USERS, TABLES.CLIENTS, TABLES.PROJECTS, TABLES.KANBAN_BOARDS];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact' });
        
        if (error) {
          console.log(`❌ ${table}:`, error.message);
        } else {
          console.log(`✅ ${table}:`, data?.length || 0, 'records');
        }
      } catch (err) {
        console.log(`❌ ${table}:`, err);
      }
    }

    console.log('🔒 RLS testing completed');
    return true;

  } catch (error) {
    console.error('❌ RLS test failed:', error);
    return false;
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testRLS = testRLS;
  console.log('🔒 RLS tester made available globally as window.testRLS');
}
