
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/environment';
import type { Database } from './types';

if (__DEV__) {
  console.log('Supabase Client: Initializing with config:', {
    url: env.supabaseUrl,
    hasAnonKey: !!env.supabaseAnonKey,
    keyPrefix: env.supabaseAnonKey?.substring(0, 20) + '...'
  });
}

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'flow-focus-app',
      },
    },
  }
);

if (__DEV__) {
  console.log('Supabase Client: Initialized successfully');
}
