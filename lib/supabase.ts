import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (Constants.expoConfig?.extra as { supabaseUrl?: string })?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  (Constants.expoConfig?.extra as { supabaseAnonKey?: string })?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Please check app.config.js and .env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
