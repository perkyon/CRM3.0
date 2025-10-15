import { supabase } from './config';
import { supabaseUserService } from './services/UserService';

export async function testAuth() {
  console.log('🔐 Testing authentication...');
  
  try {
    // Test 1: Check current auth state
    console.log('1️⃣ Checking current auth state...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️ No user authenticated');
    }

    // Test 2: Test sign up (create test user)
    console.log('2️⃣ Testing user sign up...');
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (signUpError) {
        console.log('⚠️ Sign up error:', signUpError.message);
      } else {
        console.log('✅ User signed up:', signUpData.user?.email);
      }
    } catch (err) {
      console.log('⚠️ Sign up failed:', err);
    }

    // Test 3: Test sign in
    console.log('3️⃣ Testing user sign in...');
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        console.log('⚠️ Sign in error:', signInError.message);
      } else {
        console.log('✅ User signed in:', signInData.user?.email);
        console.log('📊 Session:', signInData.session ? 'Active' : 'None');
      }
    } catch (err) {
      console.log('⚠️ Sign in failed:', err);
    }

    // Test 4: Test user data retrieval
    console.log('4️⃣ Testing user data retrieval...');
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Try to get user from our users table
        try {
          const userData = await supabaseUserService.getUser(currentUser.id);
          console.log('✅ User data retrieved:', userData.name);
        } catch (userError) {
          console.log('⚠️ User data not found in users table:', userError);
        }
      }
    } catch (err) {
      console.log('⚠️ User data retrieval failed:', err);
    }

    // Test 5: Test sign out
    console.log('5️⃣ Testing user sign out...');
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.log('⚠️ Sign out error:', signOutError.message);
      } else {
        console.log('✅ User signed out successfully');
      }
    } catch (err) {
      console.log('⚠️ Sign out failed:', err);
    }

    // Test 6: Test session refresh
    console.log('6️⃣ Testing session refresh...');
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log('⚠️ Session refresh error:', refreshError.message);
      } else {
        console.log('✅ Session refreshed:', refreshData.session ? 'Active' : 'None');
      }
    } catch (err) {
      console.log('⚠️ Session refresh failed:', err);
    }

    console.log('🔐 Authentication testing completed');
    return true;

  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuth;
  console.log('🔐 Auth tester made available globally as window.testAuth');
}
