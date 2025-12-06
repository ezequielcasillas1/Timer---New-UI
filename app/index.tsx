
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { session, loading, isGuestMode } = useAuth();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (session || isGuestMode) {
    return <Redirect href="/(new-ui)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
