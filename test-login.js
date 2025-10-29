import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ykdtitukhsvsvnbnskit.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHRpdHVraHN2c3ZuYm5za2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg3MjAsImV4cCI6MjA3NzI1NDcyMH0.tjCfpEG30rxaCuu22EmV3kKGxH45FDMTJNuPknpsl7w';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('\n🧪 Тестируем вход в систему...\n');

async function testLogin() {
  try {
    // 1. Пытаемся войти
    console.log('1️⃣ Вход через Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'fominsevil@gmail.com',
      password: 'admin123',
    });

    if (authError) {
      console.error('❌ Ошибка входа:', authError.message);
      return;
    }

    console.log('✅ Вход успешен!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // 2. Пытаемся получить данные пользователя из таблицы
    console.log('\n2️⃣ Получаем данные из таблицы users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('❌ Ошибка получения данных:', userError.message);
      console.error('   Code:', userError.code);
      console.error('   Details:', userError.details);
      
      // Пробуем без .single()
      console.log('\n3️⃣ Пробуем без .single()...');
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id);
      
      if (allError) {
        console.error('❌ Всё равно ошибка:', allError.message);
      } else {
        console.log('✅ Найдено записей:', allUsers?.length || 0);
        if (allUsers && allUsers.length > 0) {
          console.log('   Пользователь:', allUsers[0]);
        }
      }
      return;
    }

    console.log('✅ Данные получены!');
    console.log('   Name:', userData.name);
    console.log('   Role:', userData.role);
    
    console.log('\n🎉 ВСЁ РАБОТАЕТ!\n');

  } catch (error) {
    console.error('\n💥 Критическая ошибка:', error.message);
  }
}

testLogin();

