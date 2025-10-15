import { supabase, TABLES } from './config';
import { handleApiError } from '../error/ErrorHandler';

export class SeedDataService {
  // Check if data already exists
  async checkExistingData(): Promise<{ users: number; clients: number; projects: number }> {
    try {
      const [usersResult, clientsResult, projectsResult] = await Promise.all([
        supabase.from(TABLES.USERS).select('id', { count: 'exact' }),
        supabase.from(TABLES.CLIENTS).select('id', { count: 'exact' }),
        supabase.from(TABLES.PROJECTS).select('id', { count: 'exact' })
      ]);

      return {
        users: usersResult.count || 0,
        clients: clientsResult.count || 0,
        projects: projectsResult.count || 0
      };
    } catch (error) {
      console.error('Error checking existing data:', error);
      return { users: 0, clients: 0, projects: 0 };
    }
  }

  // Insert seed users
  async insertUsers(): Promise<void> {
    const users = [
      {
        id: '9fc4d042-f598-487c-a383-cccfe0e219db',
        name: 'Сыроежкин',
        email: 'fominsevil@gmail.com',
        phone: '+7 495 123-45-67',
        role: 'Manager',
        active: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        permissions: ['read', 'write', 'admin']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Олег Смирнов',
        email: 'o.smirnov@workshop.ru',
        phone: '+7 495 234-56-78',
        role: 'Master',
        active: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        permissions: ['read', 'write']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Дмитрий Козлов',
        email: 'd.kozlov@workshop.ru',
        phone: '+7 495 345-67-89',
        role: 'Procurement',
        active: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        permissions: ['read', 'write']
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Анна Волкова',
        email: 'a.volkova@workshop.ru',
        phone: '+7 495 456-78-90',
        role: 'Accountant',
        active: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        permissions: ['read', 'write']
      }
    ];

    const { error } = await supabase
      .from(TABLES.USERS)
      .upsert(users, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertUsers');
    }

    console.log('✅ Users seeded successfully');
  }

  // Insert seed clients
  async insertClients(): Promise<void> {
    const clients = [
      {
        id: '550e8400-e29b-41d4-a716-446655440100',
        type: 'ООО',
        name: 'Тестовая компания',
        company: 'ООО "Тестовая компания"',
        preferred_channel: 'Email',
        source: 'Сайт',
        status: 'new',
        owner_id: '9fc4d042-f598-487c-a383-cccfe0e219db',
        projects_count: 0,
        ar_balance: 0,
        notes: 'Тестовый клиент для разработки'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        type: 'Физ. лицо',
        name: 'Иван Петров',
        company: null,
        preferred_channel: 'WhatsApp',
        source: 'Рекомендация',
        status: 'client',
        owner_id: '9fc4d042-f598-487c-a383-cccfe0e219db',
        projects_count: 1,
        ar_balance: 0,
        notes: 'Постоянный клиент'
      }
    ];

    const { error } = await supabase
      .from(TABLES.CLIENTS)
      .upsert(clients, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertClients');
    }

    console.log('✅ Clients seeded successfully');
  }

  // Insert seed contacts
  async insertContacts(): Promise<void> {
    const contacts = [
      {
        id: '550e8400-e29b-41d4-a716-446655440200',
        client_id: '550e8400-e29b-41d4-a716-446655440100',
        name: 'Иван Тестов',
        role: 'Директор',
        phone: '+7 495 999-99-99',
        email: 'test@testcompany.ru',
        is_primary: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440201',
        client_id: '550e8400-e29b-41d4-a716-446655440101',
        name: 'Иван Петров',
        role: 'Заказчик',
        phone: '+7 495 888-88-88',
        email: 'petrov@example.com',
        is_primary: true
      }
    ];

    const { error } = await supabase
      .from(TABLES.CONTACTS)
      .upsert(contacts, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertContacts');
    }

    console.log('✅ Contacts seeded successfully');
  }

  // Insert seed projects
  async insertProjects(): Promise<void> {
    const projects = [
      {
        id: '550e8400-e29b-41d4-a716-446655440300',
        client_id: '550e8400-e29b-41d4-a716-446655440100',
        title: 'Тестовый проект',
        site_address: 'Москва, ул. Тестовая, д. 1',
        manager_id: '9fc4d042-f598-487c-a383-cccfe0e219db',
        foreman_id: '550e8400-e29b-41d4-a716-446655440002',
        start_date: '2024-01-01',
        due_date: '2024-06-01',
        budget: 500000,
        priority: 'medium',
        stage: 'brief',
        production_sub_stage: null,
        risk_notes: 'Тестовый проект для разработки',
        brief_complete: false
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440301',
        client_id: '550e8400-e29b-41d4-a716-446655440101',
        title: 'Кухонный гарнитур "Модерн"',
        site_address: 'Москва, ул. Ленина, д. 10',
        manager_id: '9fc4d042-f598-487c-a383-cccfe0e219db',
        foreman_id: '550e8400-e29b-41d4-a716-446655440002',
        start_date: '2024-02-01',
        due_date: '2024-04-01',
        budget: 300000,
        priority: 'high',
        stage: 'production',
        production_sub_stage: 'cutting',
        risk_notes: 'Срочный заказ',
        brief_complete: true
      }
    ];

    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .upsert(projects, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertProjects');
    }

    console.log('✅ Projects seeded successfully');
  }

  // Insert seed kanban boards
  async insertKanbanBoards(): Promise<void> {
    const boards = [
      {
        id: '550e8400-e29b-41d4-a716-446655440400',
        project_id: '550e8400-e29b-41d4-a716-446655440300',
        title: 'Тестовая доска',
        description: 'Доска для тестового проекта'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440401',
        project_id: '550e8400-e29b-41d4-a716-446655440301',
        title: 'Производство кухни',
        description: 'Доска для производства кухонного гарнитура'
      }
    ];

    const { error } = await supabase
      .from(TABLES.KANBAN_BOARDS)
      .upsert(boards, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertKanbanBoards');
    }

    console.log('✅ Kanban boards seeded successfully');
  }

  // Insert seed kanban columns
  async insertKanbanColumns(): Promise<void> {
    const columns = [
      // Columns for first board
      {
        id: '550e8400-e29b-41d4-a716-446655440500',
        board_id: '550e8400-e29b-41d4-a716-446655440400',
        title: 'К выполнению',
        stage: 'todo',
        position: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440501',
        board_id: '550e8400-e29b-41d4-a716-446655440400',
        title: 'В работе',
        stage: 'in_progress',
        position: 1
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440502',
        board_id: '550e8400-e29b-41d4-a716-446655440400',
        title: 'На проверке',
        stage: 'review',
        position: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440503',
        board_id: '550e8400-e29b-41d4-a716-446655440400',
        title: 'Завершено',
        stage: 'done',
        position: 3
      },
      // Columns for second board
      {
        id: '550e8400-e29b-41d4-a716-446655440504',
        board_id: '550e8400-e29b-41d4-a716-446655440401',
        title: 'Раскрой',
        stage: 'cutting',
        position: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440505',
        board_id: '550e8400-e29b-41d4-a716-446655440401',
        title: 'Сборка',
        stage: 'assembly',
        position: 1
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440506',
        board_id: '550e8400-e29b-41d4-a716-446655440401',
        title: 'Отделка',
        stage: 'finishing',
        position: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440507',
        board_id: '550e8400-e29b-41d4-a716-446655440401',
        title: 'Готово',
        stage: 'done',
        position: 3
      }
    ];

    const { error } = await supabase
      .from(TABLES.KANBAN_COLUMNS)
      .upsert(columns, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertKanbanColumns');
    }

    console.log('✅ Kanban columns seeded successfully');
  }

  // Insert seed kanban tasks
  async insertKanbanTasks(): Promise<void> {
    const tasks = [
      {
        id: '550e8400-e29b-41d4-a716-446655440600',
        column_id: '550e8400-e29b-41d4-a716-446655440500',
        title: 'Создать техническое задание',
        description: 'Подготовить детальное ТЗ для проекта',
        priority: 'high',
        assignee_id: '9fc4d042-f598-487c-a383-cccfe0e219db',
        due_date: '2024-01-15',
        position: 0,
        checklist: [
          { id: '1', text: 'Изучить требования клиента', completed: true },
          { id: '2', text: 'Создать чертежи', completed: false },
          { id: '3', text: 'Рассчитать материалы', completed: false }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440601',
        column_id: '550e8400-e29b-41d4-a716-446655440504',
        title: 'Раскрой ЛДСП',
        description: 'Раскроить ЛДСП 16мм белый для кухни',
        priority: 'urgent',
        assignee_id: '550e8400-e29b-41d4-a716-446655440002',
        due_date: '2024-02-05',
        position: 0,
        checklist: [
          { id: '1', text: 'Проверить размеры', completed: true },
          { id: '2', text: 'Настроить станок', completed: true },
          { id: '3', text: 'Выполнить раскрой', completed: false }
        ]
      }
    ];

    const { error } = await supabase
      .from(TABLES.KANBAN_TASKS)
      .upsert(tasks, { onConflict: 'id' });

    if (error) {
      throw handleApiError(error, 'SeedDataService.insertKanbanTasks');
    }

    console.log('✅ Kanban tasks seeded successfully');
  }

  // Run all seed operations
  async seedAll(): Promise<void> {
    try {
      console.log('🌱 Starting seed data insertion...');
      
      // Check existing data
      const existing = await this.checkExistingData();
      console.log('📊 Existing data:', existing);

      // Insert data in order (respecting foreign key constraints)
      await this.insertUsers();
      await this.insertClients();
      await this.insertContacts();
      await this.insertProjects();
      await this.insertKanbanBoards();
      await this.insertKanbanColumns();
      await this.insertKanbanTasks();

      console.log('🎉 All seed data inserted successfully!');
      
      // Verify data
      const final = await this.checkExistingData();
      console.log('📊 Final data count:', final);
      
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    try {
      console.log('🗑️ Clearing all data...');
      
      // Delete in reverse order (respecting foreign key constraints)
      await supabase.from(TABLES.KANBAN_TASKS).delete().neq('id', '');
      await supabase.from(TABLES.KANBAN_COLUMNS).delete().neq('id', '');
      await supabase.from(TABLES.KANBAN_BOARDS).delete().neq('id', '');
      await supabase.from(TABLES.PROJECTS).delete().neq('id', '');
      await supabase.from(TABLES.CONTACTS).delete().neq('id', '');
      await supabase.from(TABLES.CLIENTS).delete().neq('id', '');
      await supabase.from(TABLES.USERS).delete().neq('id', '');
      
      console.log('✅ All data cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

export const seedDataService = new SeedDataService();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).seedData = seedDataService;
  console.log('🌱 Seed data service made available globally as window.seedData');
}
