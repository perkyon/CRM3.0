import { supabase } from './config';

// Initialize authentication for development
export async function initializeAuth() {
  try {
    // Очищаем старые сессии/токены с неправильными URL
    const oldKeys = ['sb-xhclmypcklndxqzkhgfk-auth-token', 'sb-xhclmypcklndxqzkhgfk-auth-token-code-verifier'];
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Очищаем все токены Supabase которые могут быть от старого проекта
    Object.keys(localStorage).forEach(key => {
      if (key.includes('xhclmypcklndxqzkhgfk') || (key.startsWith('sb-') && key.includes('auth-token'))) {
        localStorage.removeItem(key);
      }
    });
    
    // Check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      // Если ошибка, очищаем сессию
      await supabase.auth.signOut();
      // Пробуем заново
      return await initializeAuth();
    }

    // If no session, try to sign in with a default user
    if (!session) {
      console.log('No session found, attempting to sign in with default user...');
      
      // Try to sign in with a default user (for development)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'fominsevil@gmail.com',
        password: 'admin123',
      });

      if (signInError) {
        console.error('Failed to sign in with default user:', signInError);
        // Очищаем все что могло остаться
        await supabase.auth.signOut();
        return false;
      }

      console.log('Signed in with default user successfully');
      return true;
    }

    console.log('Already authenticated');
    return true;
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
