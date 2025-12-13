import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/src/context/AuthContext';
import { useSoundStateRefresh } from '@/src/hooks/useSoundStateRefresh';
import { theme } from '@/constants/Theme';

const newUIColors = theme;

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  // Refresh sound state on page load
  useSoundStateRefresh();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <Text style={styles.headerTitle}>Settings</Text>

          <View style={styles.placeholderIcon} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(new-ui)/sounds')}
            >
              <View style={styles.actionButtonContent}>
                <IconSymbol
                  name="speaker.wave.3.fill"
                  color={newUIColors.text}
                  size={24}
                />
                <Text style={styles.actionButtonText}>Sound Settings</Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={newUIColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Coming Soon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            
            <View style={[styles.actionButton, styles.disabledButton]}>
              <View style={styles.actionButtonContent}>
                <IconSymbol
                  name="calendar.badge.clock"
                  color={newUIColors.textSecondary}
                  size={24}
                />
                <Text style={[styles.actionButtonText, styles.disabledText]}>
                  Session Scheduler
                </Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </View>
            
            <View style={[styles.actionButton, styles.disabledButton]}>
              <View style={styles.actionButtonContent}>
                <IconSymbol
                  name="moon.fill"
                  color={newUIColors.textSecondary}
                  size={24}
                />
                <Text style={[styles.actionButtonText, styles.disabledText]}>
                  Dark Mode
                </Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <IconSymbol name="arrow.right.square.fill" color="#FFFFFF" size={20} />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newUIColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: newUIColors.text,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: newUIColors.text,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: newUIColors.textSecondary,
  },
  comingSoonBadge: {
    backgroundColor: newUIColors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: newUIColors.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

