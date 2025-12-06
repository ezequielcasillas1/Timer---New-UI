
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import React from 'react';

// New UI colors
const newUIColors = {
  background: '#E8F4F8', // Soft light blue
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: newUIColors.background },
            }}
          />
          <StatusBar style="dark" />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
