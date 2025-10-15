import { supabase } from './config';
import { supabaseProjectService } from './services/ProjectService';
import { supabaseKanbanService } from './services/KanbanService';

export async function testProjectKanbanCreation() {
  console.log('🧪 Testing project kanban board creation...');
  
  try {
    // 1. Create a test project
    console.log('📝 Creating test project...');
    const testProject = await supabaseProjectService.createProject({
      title: 'Тестовый проект для канбан-доски',
      clientId: '550e8400-e29b-41d4-a716-446655440100', // Use existing client
      siteAddress: 'Тестовый адрес',
      managerId: '9fc4d042-f598-487c-a383-cccfe0e219db', // Admin user
      budget: 100000,
      priority: 'medium',
      stage: 'brief',
      briefComplete: false,
    });
    
    console.log('✅ Project created:', testProject);
    
    // 2. Check if kanban board was created automatically
    console.log('🔍 Checking for kanban board...');
    const boards = await supabaseKanbanService.getProjectBoards(testProject.id);
    console.log('📊 Found boards:', boards);
    
    if (boards.length > 0) {
      const board = boards[0];
      console.log('✅ Kanban board created automatically:', board.title);
      
      // 3. Check if columns were created
      const columns = await supabaseKanbanService.getBoardColumns(board.id);
      console.log('📋 Board columns:', columns);
      
      if (columns.length >= 4) {
        console.log('✅ Default columns created successfully');
        console.log('📋 Columns:', columns.map(c => c.title));
      } else {
        console.warn('⚠️ Expected 4 columns, got:', columns.length);
      }
    } else {
      console.error('❌ No kanban board found for project');
    }
    
    return {
      success: true,
      project: testProject,
      boards: boards
    };
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testGlobalKanbanBoard() {
  console.log('🌐 Testing global kanban board...');
  
  try {
    // Check if we can access the global board (no projectId)
    const globalBoards = await supabaseKanbanService.getBoards();
    console.log('📊 Global boards:', globalBoards);
    
    if (globalBoards.length > 0) {
      console.log('✅ Global kanban board accessible');
    } else {
      console.log('ℹ️ No global boards found (this is expected for project-specific boards)');
    }
    
    return {
      success: true,
      boards: globalBoards
    };
    
  } catch (error: any) {
    console.error('❌ Global board test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testProjectKanbanCreation = testProjectKanbanCreation;
  (window as any).testGlobalKanbanBoard = testGlobalKanbanBoard;
  console.log('🔧 Project kanban test functions made available globally');
}
