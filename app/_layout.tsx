
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/styles/commonStyles';
import React, { useEffect } from 'react';
import { soundService } from '@/src/services/SoundService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize sound service on app start
    const initializeSounds = async () => {
      console.log('App: Initializing sound service...');
      await soundService.initialize();
      console.log('App: Sound service ready - sounds will stream on-demand from Freesound CDN');
    };

    initializeSounds().catch((error) => {
      console.error('App: Error initializing sounds:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          <StatusBar style="auto" />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
