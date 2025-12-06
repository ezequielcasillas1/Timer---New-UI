
import Constants from 'expo-constants';

interface Environment {
  supabaseUrl: string;
  supabaseAnonKey: string;
  googleWebClientId: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvironment = (): Environment => {
  const isDevelopment = __DEV__;
  const isProduction = !__DEV__;

  // Get environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;
  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || Constants.expoConfig?.extra?.googleWebClientId;

  // Use actual Supabase credentials for this project
  const actualSupabaseUrl = supabaseUrl || 'https://brwhhkmjyadcaasqggtd.supabase.co';
  const actualSupabaseAnonKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyd2hoa21qeWFkY2Fhc3FnZ3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDc3MTksImV4cCI6MjA3NTQ4MzcxOX0.lxygT-dYwguqyuHmSW2S2wUcAJf-uY25opKRs9yNXWY';

  if (__DEV__) {
    console.log('Environment configuration:', {
      supabaseUrl: actualSupabaseUrl,
      hasAnonKey: !!actualSupabaseAnonKey,
      isDevelopment,
      isProduction
    });
  }

  return {
    supabaseUrl: actualSupabaseUrl,
    supabaseAnonKey: actualSupabaseAnonKey,
    googleWebClientId: googleWebClientId || '',
    isDevelopment,
    isProduction,
  };
};

export const env = getEnvironment();
