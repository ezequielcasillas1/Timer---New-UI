
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/app/integrations/supabase/client';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuestMode: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const GUEST_MODE_KEY = '@adhd_timer_guest_mode';

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider: Initializing auth context...');
    
    // Check for guest mode first
    const checkGuestMode = async () => {
      try {
        const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
        if (guestMode === 'true') {
          console.log('AuthProvider: Guest mode detected');
          setIsGuestMode(true);
          setLoading(false);
          return true;
        }
      } catch (error) {
        console.error('AuthProvider: Error checking guest mode:', error);
      }
      return false;
    };

    checkGuestMode().then((isGuest) => {
      if (isGuest) return; // Skip Supabase auth check if in guest mode

      // Get initial session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        console.log('AuthProvider: Initial session check:', { session, error });
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((error) => {
        console.error('AuthProvider: Exception getting initial session:', error);
        setLoading(false);
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', { event: _event, session, user: session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signInAsGuest = async () => {
    try {
      console.log('AuthContext: Signing in as guest...');
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      setIsGuestMode(true);
      console.log('AuthContext: Guest mode activated');
    } catch (error) {
      console.error('AuthContext: Error setting guest mode:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting sign out process...');
      
      // Clear guest mode or Supabase session
      if (isGuestMode) {
        await AsyncStorage.removeItem(GUEST_MODE_KEY);
        setIsGuestMode(false);
        console.log('AuthContext: Guest mode cleared');
      } else {
        // Check if there's an active session before attempting signOut
        try {
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.log('AuthContext: Error checking session, assuming no session:', sessionError.message);
          } else if (currentSession) {
            console.log('AuthContext: Active session found, signing out from Supabase...');
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.log('AuthContext: Error during signOut (non-fatal):', error.message);
              // Don't throw - still want to clear local state
            } else {
              console.log('AuthContext: Supabase sign out successful');
            }
          } else {
            console.log('AuthContext: No active session found (already signed out on another device)');
          }
        } catch (sessionCheckError) {
          console.log('AuthContext: Exception checking session, continuing with local cleanup:', sessionCheckError);
          // Continue to clear local state anyway
        }
      }
      
      // Always clear local state, even if no session or signOut failed
      setSession(null);
      setUser(null);
      
      // Navigate to sign-in page
      console.log('AuthContext: Navigating to sign-in page...');
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      // Use console.log instead of console.error to prevent red error screen
      console.log('AuthContext: Exception during sign out (handled):', error?.message || error);
      // Still clear local state and navigate even if there was an error
      setSession(null);
      setUser(null);
      router.replace('/(auth)/sign-in');
    }
  };

  const value = {
    session,
    user,
    loading,
    isGuestMode,
    signOut,
    signInAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
