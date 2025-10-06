import { supabase } from './config';

// Initialize authentication for development
export async function initializeAuth() {
  try {
    // Check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return false;
    }

    // If no session, try to sign in with a default user
    if (!session) {
      console.log('No session found, attempting to sign in with default user...');
      
      // Try to sign in with a default user (for development)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@workshop.ru',
        password: 'admin123',
      });

      if (signInError) {
        console.error('Failed to sign in with default user:', signInError);
        
        // If user doesn't exist, try to create one
        console.log('Attempting to create default user...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@workshop.ru',
          password: 'admin123',
        });

        if (signUpError) {
          console.error('Failed to create default user:', signUpError);
          return false;
        }

        console.log('Default user created successfully');
        return true;
      }

      console.log('Signed in with default user successfully');
      return true;
    }

    console.log('Already authenticated');
    return true;
  } catch (error) {
    console.error('Error initializing auth:', error);
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
