import React from 'react';
import { Stack } from 'expo-router';

export default function NewUILayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="session" />
      <Stack.Screen name="sounds" />
    </Stack>
  );
}



