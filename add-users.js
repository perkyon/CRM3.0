#!/usr/bin/env node

/**
 * Скрипт для добавления пользователей в систему
 * Использует Supabase Admin API для создания пользователей в auth.users
 * и создает записи в public.users
 * 
 * Использование:
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node add-users.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ykdtitukhsvsvnbnskit.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Ошибка: SUPABASE_SERVICE_ROLE_KEY не установлен!');
  console.error('Использование: SUPABASE_SERVICE_ROLE_KEY=your_key node add-users.js');
  process.exit(1);
}

// Создаем клиент с Admin правами (Service Role Key)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Пользователи для добавления
const users = [
  {
    name: 'Кельш Юрий',
    email: 'kelsh-97@mail.ru',
    phone: '89885090021',
    password: '11081997Kelsh',
    role: 'Admin'
  },
  {
    name: 'Першин Виталий',
    email: 'vv.pershin023@yandex.ru',
    phone: '+7 (918) 412-87-19',
    password: '0808',
    role: 'Admin'
  },
  {
    name: 'Яценко Дмитрий',
    email: 'dmitrii.yatsenko@yandex.ru',
    phone: '89385232358',
    password: '2346',
    role: 'Admin'
  },
  {
    name: 'Смирнов Олег',
    email: 'alegofrend2000@buro.gsgn',
    phone: null,
    password: '3536',
    role: 'Admin'
  },
  {
    name: 'Фоминцев Илья',
    email: 'fominsevil@gmail.com',
    phone: '+79952025404',
    password: '3536',
    role: 'Admin'
  }
];

async function addUsers() {
  console.log('🚀 Начинаем добавление пользователей...\n');

  for (const userData of users) {
    try {
      console.log(`📝 Обрабатываем: ${userData.name} (${userData.email})`);

      // Проверяем, существует ли пользователь в auth.users
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserByEmail(userData.email);
      
      let authUserId;
      
      if (existingAuthUser?.user) {
        console.log(`   ⚠️  Пользователь уже существует в auth.users, используем существующий ID`);
        authUserId = existingAuthUser.user.id;
        
        // Обновляем пароль, если нужно
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          password: userData.password
        });
        console.log(`   ✅ Пароль обновлен`);
      } else {
        // Создаем нового пользователя в auth.users
        const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Автоподтверждение email
        });

        if (authError) {
          console.error(`   ❌ Ошибка создания пользователя в auth: ${authError.message}`);
          continue;
        }

        authUserId = newUser.user.id;
        console.log(`   ✅ Пользователь создан в auth.users (ID: ${authUserId})`);
      }

      // Проверяем, существует ли профиль в public.users
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .single();

      if (existingProfile) {
        // Обновляем существующий профиль
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUserId);

        if (updateError) {
          console.error(`   ❌ Ошибка обновления профиля: ${updateError.message}`);
        } else {
          console.log(`   ✅ Профиль обновлен в public.users`);
        }
      } else {
        // Создаем новый профиль
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUserId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`   ❌ Ошибка создания профиля: ${insertError.message}`);
        } else {
          console.log(`   ✅ Профиль создан в public.users`);
        }
      }

      console.log(`   ✅ ${userData.name} готов!\n`);
    } catch (error) {
      console.error(`   ❌ Ошибка при обработке ${userData.name}:`, error.message);
      console.log('');
    }
  }

  console.log('🎉 Готово! Все пользователи добавлены.');
  console.log('\n📋 Итоговый список пользователей:');
  
  const { data: allUsers } = await supabaseAdmin
    .from('users')
    .select('name, email, role, active')
    .order('name');

  if (allUsers) {
    allUsers.forEach(user => {
      console.log(`   • ${user.name} (${user.email}) - ${user.role} ${user.active ? '✅' : '❌'}`);
    });
  }
}

// Запускаем
addUsers().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

