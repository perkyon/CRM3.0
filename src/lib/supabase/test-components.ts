import { supabase, TABLES } from './config';
import { seedDataService } from './seed-data';
import { supabaseUserService } from './services/UserService';
import { supabaseClientService } from './services/ClientService';
import { supabaseProjectService } from './services/ProjectService';
import { supabaseKanbanService } from './services/KanbanService';

export async function testAllComponents() {
  console.log('🧪 Testing all components after migration...');
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic Supabase connection...');
    const { data, error } = await supabase.from(TABLES.USERS).select('count', { count: 'exact' });
    if (error) throw error;
    console.log('✅ Basic connection works');

    // Test 2: Seed data
    console.log('2️⃣ Testing seed data...');
    const existing = await seedDataService.checkExistingData();
    console.log('📊 Current data:', existing);
    
    if (existing.users === 0) {
      console.log('🌱 No users found, running seed data...');
      await seedDataService.seedAll();
    } else {
      console.log('✅ Seed data already exists');
    }

    // Test 3: User service
    console.log('3️⃣ Testing User service...');
    const users = await supabaseUserService.getUsers();
    console.log(`✅ User service works, found ${users.length} users`);

    // Test 4: Client service
    console.log('4️⃣ Testing Client service...');
    const clients = await supabaseClientService.getClients();
    console.log(`✅ Client service works, found ${clients.length} clients`);

    // Test 5: Project service
    console.log('5️⃣ Testing Project service...');
    const projects = await supabaseProjectService.getProjects();
    console.log(`✅ Project service works, found ${projects.length} projects`);

    // Test 6: Kanban service
    console.log('6️⃣ Testing Kanban service...');
    const boards = await supabaseKanbanService.getBoards();
    console.log(`✅ Kanban service works, found ${boards.length} boards`);

    console.log('🎉 All components tested successfully!');
    return true;

  } catch (error) {
    console.error('❌ Component test failed:', error);
    return false;
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testAllComponents = testAllComponents;
  console.log('🧪 Component tester made available globally as window.testAllComponents');
}
