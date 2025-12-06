
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default function EmailConfirmedScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/(home)/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[colors.background, colors.cardBackground]}
        style={styles.gradient}
      >
        <BlurView intensity={80} style={styles.glassCard}>
          <View style={styles.iconContainer}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={40}
              color="white"
            />
          </View>
          
          <Text style={styles.title}>Email Confirmed!</Text>
          <Text style={styles.message}>
            Your email has been successfully verified. You can now access all features of the app.
          </Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace('/(tabs)/(home)/')}
          >
            <Text style={styles.continueButtonText}>Continue to App</Text>
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>
    </View>
  );
}
