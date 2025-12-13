import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

const theme = {
  background: '#E6F3FF',
  card: 'rgba(255,255,255,0.92)',
  text: colors.text,
  subtle: colors.textSecondary,
  primary: colors.primary,
  border: '#D2E8FF',
};

const plans = [
  {
    id: 'free',
    title: 'Free Starter',
    price: 'Free forever',
    badge: 'App is free to use',
    features: [
      'Core focus timers',
      'Daily streak tracking',
      'Offline-ready sessions',
      'Custom presets & widgets',
      'AI features not included',
    ],
  },
  {
    id: 'weekly',
    title: 'AI Guides — Weekly',
    price: '$2.99 / week',
    badge: 'AI enhancing guides',
    features: [
      'AI Guide',
      'AI Intake',
      'AI Response',
      'AI Journey Mode',
      'Custom presets & widgets',
    ],
  },
  {
    id: 'monthly',
    title: 'AI Guides — Monthly',
    price: '$9.99 / month',
    badge: 'Most popular',
    features: [
      'AI Guide',
      'AI Intake',
      'AI Response',
      'AI Journey Mode',
      'Custom presets & widgets',
    ],
  },
  {
    id: 'annual',
    title: 'AI Guides — Yearly',
    price: '$39.99 / year',
    badge: 'Best value',
    features: [
      'AI Guide',
      'AI Intake',
      'AI Response',
      'AI Journey Mode',
      'Custom presets & widgets',
    ],
  },
];

export default function MembershipScreen() {
  const router = useRouter();

  const handleSelect = (id: string) => {
    if (id === 'free') {
      router.replace('/(new-ui)/home');
      return;
    }

    Alert.alert(
      'AI Guides',
      'Purchases are not wired here yet. Continue to the app and we’ll add the AI enhancing guides checkout next.',
      [
        {
          text: 'Continue to app',
          onPress: () => router.replace('/(new-ui)/home'),
        },
        { text: 'OK' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <BlurView intensity={80} style={styles.heroCard}>
          <Text style={styles.kicker}>Welcome</Text>
          <Text style={styles.title}>Choose your membership</Text>
          <Text style={styles.subtitle}>
            The app is free. Only AI Guide, AI Intake, AI Response, and AI Journey Mode are paid. Custom presets and widgets are included free. Pick a plan or skip for now—you can always change later.
          </Text>
        </BlurView>

        {plans.map((plan) => (
          <BlurView key={plan.id} intensity={60} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planBadge}>{plan.badge}</Text>
              </View>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>

            <View style={styles.divider} />

            {plan.features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <IconSymbol name="checkmark.circle.fill" size={18} color={theme.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleSelect(plan.id)}
            >
              <Text style={styles.primaryButtonText}>
                {plan.id === 'free' ? 'Continue Free' : 'Select Plan'}
              </Text>
            </TouchableOpacity>
          </BlurView>
        ))}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(new-ui)/home')}
        >
          <Text style={styles.secondaryButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  kicker: {
    color: theme.subtle,
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.subtle,
    fontSize: 16,
    lineHeight: 22,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '700',
  },
  planBadge: {
    color: theme.subtle,
    fontSize: 14,
    marginTop: 4,
  },
  planPrice: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    color: theme.text,
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: theme.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0A3D62',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
});




