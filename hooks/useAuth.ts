
import { useState, useEffect } from 'react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from '../types';

const SESSION_KEY = 'schmer_session_v1';

type AuthResult = {
  success: boolean;
  message?: string;
  autoLogin?: boolean;
};

const sanitizeUrl = (value?: string) => (value ? value.trim().replace(/\/$/, '') : undefined);
const sanitizeKey = (value?: string) => value?.trim();

const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const interpretAuthError = (error: unknown): string => {
  if (!error) return 'Unexpected authentication error.';

  if (typeof error === 'object') {
    const anyError = error as { status?: number; message?: string };
    if (anyError.status === 400) {
      return (anyError.message && anyError.message.toLowerCase().includes('invalid'))
        ? 'Incorrect email or password, or the email has not been confirmed yet.'
        : 'Request rejected. Double-check your credentials.';
    }
    if (anyError.status === 404) {
      return 'Supabase endpoint not found. Verify VITE_SUPABASE_URL is correct and accessible.';
    }
    if (anyError.status === 429) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    if (typeof anyError.message === 'string') {
      if (anyError.message.includes('Failed to fetch')) {
        return 'Could not reach Supabase. Check your internet connection or firewall settings.';
      }
      return anyError.message;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Could not reach Supabase. Check your internet connection or firewall settings.';
    }
    return error.message;
  }

  return String(error);
};

const mapSupabaseUser = (user: SupabaseUser): User => ({
  id: user.id,
  name: user.user_metadata?.full_name || user.email || 'User',
  email: user.email || '',
  avatar: user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/200/200`,
  role: (user.user_metadata?.role as UserRole) || UserRole.MEMBER
});

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem(SESSION_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const mapped = mapSupabaseUser(data.session.user);
        setCurrentUser(mapped);
        localStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
      }

      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setCurrentUser(mapped);
        localStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
      } else {
        setCurrentUser(null);
        localStorage.removeItem(SESSION_KEY);
      }
    });

    init();
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, message: interpretAuthError(error) };
      }

      const supabaseUser = data.user ?? data.session?.user;
      if (!supabaseUser) {
        return { success: false, message: 'Unable to login.' };
      }

      const mapped = mapSupabaseUser(supabaseUser);
      setCurrentUser(mapped);
      localStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
      return { success: true };
    } catch (err) {
      return { success: false, message: interpretAuthError(err) };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    hint: string
  ): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            password_hint: hint,
            role: UserRole.MEMBER
          }
        }
      });

      if (error) {
        return { success: false, message: interpretAuthError(error) };
      }

      if (data.session?.user) {
        const mapped = mapSupabaseUser(data.session.user);
        setCurrentUser(mapped);
        localStorage.setItem(SESSION_KEY, JSON.stringify(mapped));
        return { success: true, autoLogin: true };
      }

      return {
        success: true,
        autoLogin: false,
        message: 'Account created! Check your email to verify before signing in.'
      };
    } catch (err) {
      return { success: false, message: interpretAuthError(err) };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const getPasswordHint = async (_email: string) => {
    return 'Please contact support for recovery.';
  };

  return {
    currentUser,
    loading,
    login,
    register,
    logout,
    getPasswordHint
  };
};
