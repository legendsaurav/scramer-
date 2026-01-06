import { createClient } from '@supabase/supabase-js';

export const sanitizeUrl = (value?: string) => (value ? value.trim().replace(/\/$/, '') : undefined);
export const sanitizeKey = (value?: string) => value?.trim();

const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

const defaultSiteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
export const siteUrl = sanitizeUrl(import.meta.env.VITE_SITE_URL as string | undefined) || defaultSiteUrl;
// Redirect URL for Supabase auth emails: default to siteUrl
export const authEmailRedirectTo = `${siteUrl}/`;

export const CONFIG_ERROR_MESSAGE =
  'Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables (Vercel → Settings → Environment Variables) and redeploy.';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabase;
