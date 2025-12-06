
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  signInButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  glassCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 40,
    width: '100%',
  },
});

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'timer',
      text: 'Time manipulation for enhanced focus',
    },
    {
      icon: 'waveform',
      text: 'Ambient sounds to boost concentration',
    },
    {
      icon: 'chart.bar.fill',
      text: 'Track your progress and streaks',
    },
    {
      icon: 'brain.head.profile',
      text: 'ADHD-friendly design and features',
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[colors.background, colors.cardBackground]}
        style={styles.gradient}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/final_quest_240x240.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.appName}>Focus Flow</Text>
          <Text style={styles.tagline}>
            Master your focus with time manipulation and ambient sounds
          </Text>
        </View>

        <BlurView intensity={80} style={styles.glassCard}>
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    name={feature.icon as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </BlurView>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.signUpButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.signInButtonText}>I Already Have an Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
