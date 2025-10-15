import { supabase, TABLES } from './config';
import { supabaseKanbanService } from './services/KanbanService';
import { seedDataService } from './seed-data';

export async function testKanbanIntegration() {
  console.log('🧪 Testing Kanban integration...');
  
  try {
    // Test 1: Check if we have seed data
    console.log('1️⃣ Checking seed data...');
    const existing = await seedDataService.checkExistingData();
    console.log('📊 Current data:', existing);
    
    if (existing.users === 0) {
      console.log('🌱 No seed data found, creating...');
      await seedDataService.seedAll();
    }

    // Test 2: Test kanban service
    console.log('2️⃣ Testing kanban service...');
    const boards = await supabaseKanbanService.getBoards();
    console.log(`✅ Found ${boards.length} kanban boards`);

    // Test 3: Test board creation
    console.log('3️⃣ Testing board creation...');
    const testBoard = await supabaseKanbanService.createBoard({
      projectId: '550e8400-e29b-41d4-a716-446655440300',
      title: 'Test Board',
      description: 'Test board for integration testing'
    });
    console.log('✅ Board created:', testBoard.id);

    // Test 4: Test column creation
    console.log('4️⃣ Testing column creation...');
    const testColumn = await supabaseKanbanService.createColumn({
      boardId: testBoard.id,
      title: 'Test Column',
      stage: 'todo',
      position: 0
    });
    console.log('✅ Column created:', testColumn.id);

    // Test 5: Test task creation
    console.log('5️⃣ Testing task creation...');
    const testTask = await supabaseKanbanService.createTask({
      columnId: testColumn.id,
      title: 'Test Task',
      description: 'Test task for integration testing',
      priority: 'medium',
      assigneeId: '9fc4d042-f598-487c-a383-cccfe0e219db'
    });
    console.log('✅ Task created:', testTask.id);

    // Test 6: Test task update
    console.log('6️⃣ Testing task update...');
    const updatedTask = await supabaseKanbanService.updateTask(testTask.id, {
      title: 'Updated Test Task',
      description: 'Updated description'
    });
    console.log('✅ Task updated:', updatedTask.id);

    // Test 7: Test task move
    console.log('7️⃣ Testing task move...');
    const movedTask = await supabaseKanbanService.moveTask(testTask.id, testColumn.id, 0);
    console.log('✅ Task moved:', movedTask.id);

    // Test 8: Test board retrieval
    console.log('8️⃣ Testing board retrieval...');
    const retrievedBoard = await supabaseKanbanService.getBoard(testBoard.id);
    console.log('✅ Board retrieved:', retrievedBoard.title);

    // Test 9: Test board update
    console.log('9️⃣ Testing board update...');
    const updatedBoard = await supabaseKanbanService.updateBoard(testBoard.id, {
      title: 'Updated Test Board',
      description: 'Updated description'
    });
    console.log('✅ Board updated:', updatedBoard.title);

    // Test 10: Test board deletion
    console.log('🔟 Testing board deletion...');
    await supabaseKanbanService.deleteBoard(testBoard.id);
    console.log('✅ Board deleted');

    console.log('🎉 All kanban integration tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Kanban integration test failed:', error);
    return false;
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testKanbanIntegration = testKanbanIntegration;
  console.log('🧪 Kanban integration tester made available globally as window.testKanbanIntegration');
}
