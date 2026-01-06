
import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured, CONFIG_ERROR_MESSAGE } from '../lib/supabase';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // If not configured, stop loading and leave auth state empty
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    // Alias password_hint to passwordHint
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar, role, passwordHint:password_hint')
      .eq('id', userId)
      .single();

    if (data) {
      setCurrentUser(data as unknown as User);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: CONFIG_ERROR_MESSAGE };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, message: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Network error. Check your Supabase configuration.' };
    }
  };

  const register = async (name: string, email: string, password: string, hint: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: CONFIG_ERROR_MESSAGE };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) return { success: false, message: error.message };

      if (data.user) {
        // Create initial profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          role: UserRole.MEMBER,
          password_hint: hint,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundType=gradient&radius=50`
        });

        if (profileError) return { success: false, message: profileError.message };
      }

      return { success: true };
    } catch (e) {
      return { success: false, message: 'Network error. Check your Supabase configuration.' };
    }
  };

  const updateAvatar = async (newAvatar: string) => {
    if (!currentUser) return;
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar: newAvatar })
      .eq('id', currentUser.id);

    if (!error) {
      setCurrentUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const getPasswordHint = async (email: string): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('password_hint')
        .eq('email', email)
        .single();
      return data?.password_hint || null;
    } catch {
      return null;
    }
  };

  return {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateAvatar,
    getPasswordHint
  };
};
