import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { useSoundStateRefresh } from '@/src/hooks/useSoundStateRefresh';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useAppContext();
  const { user, signOut, isGuestMode } = useAuth();

  // Refresh sound state on page load
  useSoundStateRefresh();

  const formatTime = (minutes: number): string => {
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAverageSessionLength = (): number => {
    if (!state?.history || state.history.length === 0) return 0;
    const totalTime = state.history.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalTime / state.history.length / 60);
  };

  const getBestStreak = (): number => {
    return Math.max(state?.progress?.currentStreak || 0, state?.analytics?.bestStreak || 0);
  };

  const getThisWeekTotal = (): number => {
    if (!state?.history || state.history.length === 0) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekSessions = state.history.filter(session =>
      new Date(session.date) >= oneWeekAgo
    );
    
    return Math.round(thisWeekSessions.reduce((sum, session) => sum + session.duration, 0) / 60);
  };

  const handleSignOut = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
              } catch (error: any) {
                if (!error?.message?.includes('Auth session missing')) {
                  Alert.alert('Sign Out', 'Sign out completed. If you experience any issues, please restart the app.');
                }
              }
            },
          },
        ]
      );
      return;
    }
    
    try {
      await signOut();
    } catch (error: any) {
      if (!error?.message?.includes('Auth session missing')) {
        if (Platform.OS === 'web') {
          window.alert('Sign out completed. If you experience any issues, please restart the app.');
        } else {
          Alert.alert('Sign Out', 'Sign out completed. If you experience any issues, please restart the app.');
        }
      }
    }
  };

  const getUserInitials = (): string => {
    if (isGuestMode) return 'GU';
    const name = user?.user_metadata?.name || state?.user?.name || 'User';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!state) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: newUIColors.text, fontSize: 16 }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with Settings Icon */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity
            onPress={() => {
              router.push('/(new-ui)/settings');
            }}
            style={styles.settingsButton}
          >
            <IconSymbol name="gearshape.fill" size={24} color={newUIColors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
            </View>
            <Text style={styles.userName}>
              {isGuestMode
                ? 'Guest User'
                : user?.user_metadata?.name || state.user?.name || 'Focus User'}
            </Text>
            <Text style={styles.userEmail}>
              {isGuestMode
                ? 'guest@example.com'
                : user?.email || state.user?.email || 'user@example.com'}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <IconSymbol name="clock.fill" color={newUIColors.primary} size={24} />
                </View>
                <Text style={styles.statValue}>{state.progress?.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <IconSymbol name="timer" color={newUIColors.secondary} size={24} />
                </View>
                <Text style={styles.statValue}>{formatTime(state.progress?.totalTime || 0)}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <IconSymbol name="flame.fill" color="#FF6B35" size={24} />
                </View>
                <Text style={styles.statValue}>{state.progress?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
            </View>
          </View>

          {/* Detailed Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Detailed Statistics</Text>

            <View style={styles.detailedStat}>
              <View style={styles.detailedStatIcon}>
                <IconSymbol name="chart.line.uptrend.xyaxis" color={newUIColors.primary} size={20} />
              </View>
              <View style={styles.detailedStatContent}>
                <Text style={styles.detailedStatLabel}>Average Session Length</Text>
                <Text style={styles.detailedStatValue}>{formatTime(getAverageSessionLength())}</Text>
              </View>
            </View>

            <View style={styles.detailedStat}>
              <View style={styles.detailedStatIcon}>
                <IconSymbol name="trophy.fill" color={newUIColors.secondary} size={20} />
              </View>
              <View style={styles.detailedStatContent}>
                <Text style={styles.detailedStatLabel}>Best Streak</Text>
                <Text style={styles.detailedStatValue}>{getBestStreak()} days</Text>
              </View>
            </View>

            <View style={styles.detailedStat}>
              <View style={styles.detailedStatIcon}>
                <IconSymbol name="calendar.badge.clock" color={newUIColors.accent} size={20} />
              </View>
              <View style={styles.detailedStatContent}>
                <Text style={styles.detailedStatLabel}>This Week Total</Text>
                <Text style={styles.detailedStatValue}>{formatTime(getThisWeekTotal())}</Text>
              </View>
            </View>

            <View style={styles.detailedStat}>
              <View style={styles.detailedStatIcon}>
                <IconSymbol name="star.fill" color={newUIColors.primary} size={20} />
              </View>
              <View style={styles.detailedStatContent}>
                <Text style={styles.detailedStatLabel}>Average Mood</Text>
                <Text style={styles.detailedStatValue}>
                  {state.analytics?.averageMood
                    ? `${state.analytics.averageMood.toFixed(1)}/5`
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Recent Activity</Text>

            {state.history && state.history.length > 0 ? (
              <View style={styles.recentActivity}>
                {state.history
                  .slice(-3)
                  .reverse()
                  .map((session, index) => (
                    <View
                      key={`session-${session.id || index}`}
                      style={styles.activityItem}
                    >
                      <View style={styles.activityIcon}>
                        <IconSymbol
                          name="play.circle.fill"
                          color={newUIColors.primary}
                          size={16}
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>
                          Focus Session - {formatTime(Math.round(session.duration / 60))}
                        </Text>
                        <Text style={styles.activityTime}>
                          {new Date(session.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.activityRating}>
                        <Text style={styles.activityRatingText}>
                          {session.efficiency ? `${session.efficiency}/100` : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="clock.badge.questionmark"
                  color={newUIColors.textSecondary}
                  size={32}
                />
                <Text style={styles.emptyStateText}>No sessions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start your first focus session to see activity here
                </Text>
              </View>
            )}
          </View>

          {/* Account Actions */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Account</Text>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <IconSymbol name="arrow.right.square" color={newUIColors.text} size={20} />
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
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: newUIColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: newUIColors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: newUIColors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: newUIColors.textSecondary,
  },
  statsCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: newUIColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: newUIColors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    textAlign: 'center',
  },
  detailedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailedStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: newUIColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  detailedStatContent: {
    flex: 1,
  },
  detailedStatLabel: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 2,
  },
  detailedStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  recentActivity: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: newUIColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: newUIColors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: newUIColors.textSecondary,
  },
  activityRating: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: newUIColors.primary + '20',
    borderRadius: 12,
  },
  activityRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: newUIColors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: newUIColors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

