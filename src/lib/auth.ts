import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error as Error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error as Error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    const errorMessage = (error as any)?.message || '';
    
    // If session doesn't exist, treat as successful logout
    if (errorMessage.includes('session_not_found') || errorMessage.includes('Session from session_id claim in JWT does not exist')) {
      return { error: null };
    }
    
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;

    // Get additional user data from our users table
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, role')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email || '',
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      role: userData?.role || 'admin'
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: error as Error };
  }
};