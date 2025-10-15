import { supabase } from './config';

export async function createAuthUsers() {
  console.log('👥 Creating auth users in Supabase...');
  
  try {
    // Список пользователей для создания
    const users = [
      {
        email: 'syroejkin@workshop.ru',
        password: 'admin123',
        name: 'Сыроежкин',
        role: 'Admin'
      },
      {
        email: 'o.smirnov@workshop.ru',
        password: 'master123',
        name: 'Олег Смирнов',
        role: 'Master'
      },
      {
        email: 'd.kozlov@workshop.ru',
        password: 'procurement123',
        name: 'Дмитрий Козлов',
        role: 'Procurement'
      },
      {
        email: 'a.volkova@workshop.ru',
        password: 'accountant123',
        name: 'Анна Волкова',
        role: 'Accountant'
      }
    ];

    const results = [];

    for (const user of users) {
      try {
        console.log(`Creating user: ${user.email}`);
        
        // Создаем пользователя в Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Автоматически подтверждаем email
          user_metadata: {
            name: user.name,
            role: user.role
          }
        });

        if (error) {
          console.log(`⚠️ Error creating ${user.email}:`, error.message);
          results.push({ email: user.email, success: false, error: error.message });
        } else {
          console.log(`✅ Created user: ${user.email} (ID: ${data.user?.id})`);
          results.push({ email: user.email, success: true, id: data.user?.id });
        }
      } catch (err) {
        console.log(`❌ Failed to create ${user.email}:`, err);
        results.push({ email: user.email, success: false, error: err });
      }
    }

    console.log('📊 Results:', results);
    return results;

  } catch (error) {
    console.error('❌ Failed to create auth users:', error);
    return [];
  }
}

// Альтернативный метод - создание через signUp (работает без admin прав)
export async function createAuthUsersViaSignUp() {
  console.log('👥 Creating auth users via signUp...');
  
  try {
    const users = [
      {
        email: 'syroejkin@workshop.ru',
        password: 'admin123',
        name: 'Сыроежкин'
      },
      {
        email: 'o.smirnov@workshop.ru',
        password: 'master123',
        name: 'Олег Смирнов'
      },
      {
        email: 'd.kozlov@workshop.ru',
        password: 'procurement123',
        name: 'Дмитрий Козлов'
      },
      {
        email: 'a.volkova@workshop.ru',
        password: 'accountant123',
        name: 'Анна Волкова'
      }
    ];

    const results = [];

    for (const user of users) {
      try {
        console.log(`Signing up user: ${user.email}`);
        
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name
            }
          }
        });

        if (error) {
          console.log(`⚠️ Error signing up ${user.email}:`, error.message);
          results.push({ email: user.email, success: false, error: error.message });
        } else {
          console.log(`✅ Signed up user: ${user.email} (ID: ${data.user?.id})`);
          results.push({ email: user.email, success: true, id: data.user?.id });
        }
      } catch (err) {
        console.log(`❌ Failed to sign up ${user.email}:`, err);
        results.push({ email: user.email, success: false, error: err });
      }
    }

    console.log('📊 Results:', results);
    return results;

  } catch (error) {
    console.error('❌ Failed to create auth users via signUp:', error);
    return [];
  }
}

// Функция для синхронизации пользователей между auth.users и users таблицей
export async function syncUsersWithAuth() {
  console.log('🔄 Syncing users with auth...');
  
  try {
    // Получаем всех пользователей из auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('⚠️ Could not get auth users:', authError.message);
      return;
    }

    console.log(`Found ${authUsers.users.length} auth users`);

    // Получаем всех пользователей из нашей users таблицы
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.log('⚠️ Could not get db users:', dbError.message);
      return;
    }

    console.log(`Found ${dbUsers.length} db users`);

    // Синхронизируем данные
    for (const authUser of authUsers.users) {
      const dbUser = dbUsers.find(u => u.email === authUser.email);
      
      if (dbUser) {
        // Обновляем ID в нашей таблице
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            id: authUser.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', authUser.email);

        if (updateError) {
          console.log(`⚠️ Could not update user ${authUser.email}:`, updateError.message);
        } else {
          console.log(`✅ Synced user: ${authUser.email}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to sync users:', error);
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).createAuthUsers = createAuthUsers;
  (window as any).createAuthUsersViaSignUp = createAuthUsersViaSignUp;
  (window as any).syncUsersWithAuth = syncUsersWithAuth;
  console.log('👥 Auth user creators made available globally');
}
