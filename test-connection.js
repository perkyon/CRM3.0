import { createClient } from '@supabase/supabase-js';

// Новые ключи (уже вставлены!)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ykdtitukhsvsvnbnskit.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHRpdHVraHN2c3ZuYm5za2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg3MjAsImV4cCI6MjA3NzI1NDcyMH0.tjCfpEG30rxaCuu22EmV3kKGxH45FDMTJNuPknpsl7w';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('\n🔄 Проверка подключения к новой БД...\n');
console.log(`URL: ${SUPABASE_URL}\n`);

async function test() {
  let errors = [];
  
  // Проверка users
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      errors.push(`❌ Users: ${error.message}`);
    } else {
      console.log(`✅ Users: ${data?.length || 0} записей`);
    }
  } catch (e) {
    errors.push(`❌ Users: ${e.message}`);
  }
  
  // Проверка clients
  try {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      errors.push(`❌ Clients: ${error.message}`);
    } else {
      console.log(`✅ Clients: ${data?.length || 0} записей`);
    }
  } catch (e) {
    errors.push(`❌ Clients: ${e.message}`);
  }
  
  // Проверка projects
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      errors.push(`❌ Projects: ${error.message}`);
    } else {
      console.log(`✅ Projects: ${data?.length || 0} записей`);
    }
  } catch (e) {
    errors.push(`❌ Projects: ${e.message}`);
  }
  
  // Проверка storage
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`⚠️  Storage: ${error.message} (это OK)`);
    } else {
      console.log(`✅ Storage: ${data?.length || 0} buckets`);
    }
  } catch (e) {
    console.log(`⚠️  Storage: ${e.message} (это OK)`);
  }
  
  // Результат
  console.log('\n' + '═'.repeat(50));
  
  if (errors.length === 0) {
    console.log('\n🎉 ВСЁ ОТЛИЧНО! Подключение работает!\n');
    console.log('✅ Можете работать с приложением');
    console.log('🌐 Откройте: http://localhost:3000\n');
  } else {
    console.log('\n⚠️  Найдены проблемы:\n');
    errors.forEach(err => console.log(err));
    console.log('\n📖 См. инструкцию: NEW_DATABASE_SETUP.md\n');
  }
  
  console.log('═'.repeat(50) + '\n');
}

test().catch(err => {
  console.error('\n❌ Ошибка:', err.message);
  console.log('\n📝 Проверьте .env.local - правильные ли ключи?\n');
});

