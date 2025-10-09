import { supabase, TABLES } from './config';

// Debug function to test kanban functionality
export async function debugKanban() {
  console.log('🔧 Starting Kanban debug...');
  
  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return false;
    }
    console.log('✅ Connection successful');
    
    // Test 2: Check if tables exist
    console.log('📊 Checking table structure...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['kanban_boards', 'kanban_columns', 'kanban_tasks']);
    
    if (tablesError) {
      console.error('❌ Table check failed:', tablesError);
    } else {
      console.log('✅ Tables found:', tables?.map(t => t.table_name));
    }
    
    // Test 3: Try to create a test board
    console.log('🔧 Creating test board...');
    const testProjectId = 'test-project-' + Date.now();
    const { data: board, error: boardError } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .insert({
        project_id: testProjectId,
        title: 'Test Board',
        description: 'Debug test board',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (boardError) {
      console.error('❌ Board creation failed:', boardError);
      return false;
    }
    
    console.log('✅ Test board created:', board);
    
    // Test 4: Try to create test columns
    console.log('🔧 Creating test columns...');
    const testColumns = [
      { title: 'To Do', position: 0, color: '#6b7280' },
      { title: 'In Progress', position: 1, color: '#3b82f6' },
      { title: 'Done', position: 2, color: '#10b981' },
    ];
    
    const { data: columns, error: columnsError } = await supabase
      .from(TABLES.KANBAN_COLUMNS)
      .insert(
        testColumns.map(col => ({
          board_id: board.id,
          title: col.title,
          position: col.position,
          color: col.color,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      )
      .select();
    
    if (columnsError) {
      console.error('❌ Columns creation failed:', columnsError);
    } else {
      console.log('✅ Test columns created:', columns);
    }
    
    // Test 5: Try to create a test task
    console.log('🔧 Creating test task...');
    const { data: task, error: taskError } = await supabase
      .from(TABLES.KANBAN_TASKS)
      .insert({
        column_id: columns?.[0]?.id || 'test-column',
        title: 'Test Task',
        description: 'Debug test task',
        priority: 'medium',
        position: 0,
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (taskError) {
      console.error('❌ Task creation failed:', taskError);
    } else {
      console.log('✅ Test task created:', task);
    }
    
    console.log('🎉 Kanban debug completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Debug failed with error:', error);
    return false;
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).debugKanban = debugKanban;
  console.log('🔧 debugKanban() function available globally');
}
