
import React from 'react';
import { Redirect } from 'expo-router';

// Simplified for UI development - always go to new UI
export default function Index() {
  return <Redirect href="/(new-ui)/home" />;
}
