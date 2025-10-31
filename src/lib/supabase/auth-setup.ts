import { supabase, SUPABASE_CONFIG } from './config';

// Initialize authentication for development
export async function initializeAuth() {
  try {
    // ПРИНУДИТЕЛЬНО очищаем ВСЕ старые сессии и токены
    // Очищаем все что связано со старым проектом
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('xhclmypcklndxqzkhgfk') || 
        key.startsWith('sb-') || 
        key === 'auth_token' || 
        key === 'refresh_token' ||
        key.includes('supabase')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Очищаем сессию Supabase принудительно
    await supabase.auth.signOut();
    
    // Ждем немного чтобы очистка завершилась
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Проверяем что используется правильный URL (после очистки)
    const currentUrl = SUPABASE_CONFIG.url;
    if (!currentUrl || currentUrl.includes('xhclmypcklndxqzkhgfk')) {
      console.error('❌ ОШИБКА: Используется старый Supabase URL!', currentUrl);
      // Очищаем все еще раз
      await supabase.auth.signOut();
      // Очищаем весь localStorage на всякий случай
      localStorage.clear();
      return false;
    }
    
    // Check if we have a session (только проверка, без auto-login)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      // Если ошибка связана с URL - очищаем все
      if (error.message?.includes('xhclmypcklndxqzkhgfk') || error.message?.includes('Failed to fetch')) {
        await supabase.auth.signOut();
        localStorage.clear();
        return false;
      }
      // Другие ошибки - просто очищаем сессию
      await supabase.auth.signOut();
      return false;
    }

    // НЕ делаем auto-login - пользователь должен войти сам
    // Если есть валидная сессия - хорошо, если нет - показываем LoginPage
    if (session) {
      console.log('✅ Валидная сессия найдена');
      return true;
    }

    console.log('ℹ️ Сессия не найдена - пользователь должен войти');
    return false;
  } catch (error) {
    console.error('Error initializing auth:', error);
    // Очищаем при любой ошибке
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Игнорируем ошибки очистки
    }
    return false;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return !error && !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
}
