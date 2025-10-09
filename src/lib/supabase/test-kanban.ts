import { supabase, TABLES } from './config';

export async function testKanbanConnection() {
  console.log('🔧 Testing Kanban connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Kanban connection failed:', error);
      return false;
    }
    
    console.log('✅ Kanban connection successful');
    console.log('📊 Found boards:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Kanban connection error:', error);
    return false;
  }
}

export async function createTestKanbanBoard(projectId: string) {
  console.log('🔧 Creating test kanban board...');
  
  try {
    const { data, error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .insert({
        project_id: projectId,
        title: `Test Board for Project ${projectId}`,
        description: 'Test board created automatically',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to create test board:', error);
      return null;
    }
    
    console.log('✅ Test board created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating test board:', error);
    return null;
  }
}
