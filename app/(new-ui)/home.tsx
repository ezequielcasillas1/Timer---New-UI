import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import WeeklyProgressChart from '@/components/WeeklyProgressChart';
import StartSessionModal from '@/components/StartSessionModal';
import { SOUND_LIBRARY } from '@/src/services/SoundService';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

export default function NewUIHome() {
  const router = useRouter();
  const { state, dispatch, actions } = useAppContext();
  const { user } = useAuth();
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);
  const [meditationalGuideExpanded, setMeditationalGuideExpanded] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'year'>('week');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const favoriteSounds = (state?.favoriteSoundIds ?? [])
    .map((id) => SOUND_LIBRARY.find((s) => s.id === id))
    .filter(Boolean)
    .map((sound) => ({
      id: sound!.id,
      title: sound!.title,
      category: sound!.category,
    }));

  // Refresh analytics when screen comes into focus to fix streak sync
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      setIsSyncing(true);
      actions.refreshAnalytics()
        .then(() => {
          if (isMounted) {
            setLastSyncedAt(new Date());
          }
        })
        .catch((error) => {
          console.log('HomeScreen: Error refreshing analytics (non-critical):', error);
        })
        .finally(() => {
          if (isMounted) setIsSyncing(false);
        });

      return () => {
        isMounted = false;
      };
    }, [actions])
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.name || state.user.name || 'there';
    
    if (hour < 12) {
      return `Good morning, ${name}`;
    } else if (hour < 18) {
      return `Good afternoon, ${name}`;
    } else {
      return `Good evening, ${name}`;
    }
  };

  const handleStartSession = (config: {
    targetDuration: number;
    timeSlotDuration: number;
    slotEveryMinutes: number;
    speedMultiplier: number;
    soundLayers: {
      ticking: boolean;
      breathing: boolean;
      nature: boolean;
    };
  }) => {
    // Update session state with configuration
    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        targetDuration: config.targetDuration,
        timeSlotDuration: config.timeSlotDuration,
        slotEveryMinutes: config.slotEveryMinutes,
        speedSetting: config.speedMultiplier,
        timeSlotEnabled: config.timeSlotDuration > 0,
        speedMultiplierEnabled: config.speedMultiplier > 1,
      },
    });

    // Update sound layers
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        ticking: { ...state.sounds.ticking, enabled: config.soundLayers.ticking },
        breathing: { ...state.sounds.breathing, enabled: config.soundLayers.breathing },
        nature: { ...state.sounds.nature, enabled: config.soundLayers.nature },
      },
    });

    // Navigate to session page
    router.push('/(new-ui)/session');
  };

  const handleSelectFavoriteSound = (soundId: string) => {
    const soundDef = SOUND_LIBRARY.find((s) => s.id === soundId);
    if (!soundDef) return;

    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [soundDef.category]: {
          ...state.sounds[soundDef.category],
          selectedSound: soundDef.id,
          enabled: true,
        },
      },
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get weekly progress data (ensure it's an array of 7 values)
  const weeklyProgressData = state.progress?.weeklyProgress || [0, 0, 0, 0, 0, 0, 0];
  const totalSessions = state.progress?.totalSessions || 0;
  const totalTime = state.progress?.totalTime || 0;
  const currentStreak = state.progress?.currentStreak || 0;
  const weeklyTotal = weeklyProgressData.reduce((sum, day) => sum + day, 0);
  const weeklyTotalDisplay = Number.isInteger(weeklyTotal) ? weeklyTotal : weeklyTotal.toFixed(1);

  const rangeConfig = useMemo(() => {
    const chunkSum = (arr: number[], start: number, end: number) =>
      arr.slice(start, end).reduce((s, v) => s + v, 0);

    if (selectedRange === 'week') {
      return {
        data: weeklyProgressData,
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        title: 'Weekly Progress',
        footer: `${weeklyTotalDisplay} sessions this week`,
      };
    }

    if (selectedRange === 'month') {
      // Roll week into 4 smoother buckets (approx 2 days each)
      const monthData = [
        chunkSum(weeklyProgressData, 0, 2),
        chunkSum(weeklyProgressData, 2, 4),
        chunkSum(weeklyProgressData, 4, 6),
        chunkSum(weeklyProgressData, 6, 7),
      ].map((v) => Number(v.toFixed(1)));
      return {
        data: monthData,
        labels: ['W1', 'W2', 'W3', 'W4'],
        title: 'Monthly Progress',
        footer: `${monthData.reduce((s, v) => s + v, 0)} sessions this month`,
      };
    }

    const base = Math.max(1, weeklyTotal);
    const yearData = Array.from({ length: 12 }, (_, i) => {
      const slope = 0.05 * i;
      const variance = (i % 3) * 0.02;
      return Number((base * (0.6 + slope + variance)).toFixed(1));
    });

    return {
      data: yearData,
      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      title: 'Yearly Progress',
      footer: `${yearData.reduce((s, v) => s + v, 0)} sessions this year`,
    };
  }, [selectedRange, weeklyProgressData, weeklyTotal, weeklyTotalDisplay]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="arrow.left" size={24} color={newUIColors.text} />
            <Text style={styles.backText}>Go back to old UI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(new-ui)/profile')}>
            <IconSymbol name="person.circle" size={32} color={newUIColors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>How can I help you today?</Text>
          </View>

          {/* Weekly Progress Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.chartTitle}>{rangeConfig.title}</Text>
                <View style={styles.streakRow}>
                  <View style={styles.streakBadge}>
                    <IconSymbol name="flame.fill" size={16} color="#FF6B35" />
                    <Text style={styles.streakText}>{currentStreak} day streak</Text>
                  </View>
                  <View style={styles.syncRow}>
                    {isSyncing ? (
                      <ActivityIndicator size="small" color={newUIColors.primary} />
                    ) : (
                      <IconSymbol name="arrow.clockwise" size={14} color={newUIColors.textSecondary} />
                    )}
                    <Text style={styles.syncText}>
                      {isSyncing
                        ? 'Refreshing...'
                        : lastSyncedAt
                          ? `Synced ${Math.max(1, Math.round((Date.now() - lastSyncedAt.getTime()) / 1000))}s ago`
                          : 'Sync pending'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.rangePills}>
                {(['week', 'month', 'year'] as const).map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.rangePill,
                      selectedRange === range && styles.rangePillActive
                    ]}
                    onPress={() => setSelectedRange(range)}
                  >
                    <Text
                      style={[
                        styles.rangePillText,
                        selectedRange === range && styles.rangePillTextActive
                      ]}
                    >
                      {range === 'week' ? 'W' : range === 'month' ? 'M' : 'Y'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <WeeklyProgressChart 
              data={rangeConfig.data}
              labels={rangeConfig.labels}
              colors={{
                line: newUIColors.primary,
                point: newUIColors.primary,
                grid: newUIColors.textSecondary + '30',
                text: newUIColors.textSecondary,
              }}
            />
            <Text style={styles.chartFooter}>
              {rangeConfig.footer}
            </Text>
          </View>

          {/* Start Session Card */}
          <TouchableOpacity 
            style={styles.startSessionCard}
            onPress={() => setShowStartSessionModal(true)}
          >
            <View style={styles.startSessionContent}>
              <View style={styles.startSessionIcon}>
                <IconSymbol name="play.circle.fill" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.startSessionText}>
                <Text style={styles.startSessionTitle}>Start Session</Text>
                <Text style={styles.startSessionDescription}>
                  Configure and begin your focus session
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="rgba(255, 255, 255, 0.9)" />
            </View>
          </TouchableOpacity>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{totalSessions}</Text>
                <Text style={styles.progressStatLabel}>Total Sessions</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{formatTime(totalTime)}</Text>
                <Text style={styles.progressStatLabel}>Total Time</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{currentStreak}</Text>
                <Text style={styles.progressStatLabel}>Day Streak</Text>
              </View>
            </View>
          </View>

          {/* Prep for Today's Work Card */}
          <View style={styles.prepCard}>
            <View style={styles.prepCardHeader}>
              <IconSymbol name="list.bullet.clipboard" size={24} color={newUIColors.primary} />
              <Text style={styles.cardTitle}>Prep for Today's Work</Text>
            </View>
            <Text style={styles.prepCardText}>
              Note items like medications to take or fluid intake. This helps inform AI responses during your sessions.
            </Text>
            <TouchableOpacity style={styles.prepCardButton}>
              <Text style={styles.prepCardButtonText}>Add Notes</Text>
              <IconSymbol name="plus.circle" size={18} color={newUIColors.primary} />
            </TouchableOpacity>
          </View>

          {/* Meditational Guide Dropdown (Future Release) */}
          <View style={styles.meditationalGuideCard}>
            <TouchableOpacity
              style={styles.meditationalGuideHeader}
              onPress={() => setMeditationalGuideExpanded(!meditationalGuideExpanded)}
            >
              <View style={styles.meditationalGuideHeaderLeft}>
                <IconSymbol name="book.fill" size={20} color={newUIColors.primary} />
                <Text style={styles.cardTitle}>Meditational Guide</Text>
              </View>
              <IconSymbol 
                name={meditationalGuideExpanded ? "chevron.up" : "chevron.down"} 
                size={20} 
                color={newUIColors.textSecondary} 
              />
            </TouchableOpacity>
            {meditationalGuideExpanded && (
              <View style={styles.meditationalGuideContent}>
                <Text style={styles.meditationalGuidePlaceholder}>
                  This feature is coming soon. You'll be able to access guided meditation content and techniques here.
                </Text>
                <View style={styles.meditationalGuideOptions}>
                  <Text style={styles.meditationalGuideOption}>• Breathing Techniques</Text>
                  <Text style={styles.meditationalGuideOption}>• Focus Exercises</Text>
                  <Text style={styles.meditationalGuideOption}>• Mindfulness Practices</Text>
                </View>
              </View>
            )}
          </View>

          {/* Session Scheduler Link */}
          <TouchableOpacity 
            style={styles.schedulerCard}
            onPress={() => router.push('/(new-ui)/scheduler')}
          >
            <View style={styles.schedulerContent}>
              <IconSymbol name="calendar" size={24} color={newUIColors.primary} />
              <View style={styles.schedulerText}>
                <Text style={styles.schedulerTitle}>Session Scheduler</Text>
                <Text style={styles.schedulerDescription}>
                  Automate your sessions with scheduled start times
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={newUIColors.primary} />
            </View>
          </TouchableOpacity>

          {/* Navigation Cards */}
          <View style={styles.navigationSection}>
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push('/(new-ui)/analytics')}
            >
              <IconSymbol name="chart.bar.fill" size={28} color={newUIColors.primary} />
              <Text style={styles.navCardTitle}>Analytics</Text>
              <Text style={styles.navCardDescription}>View your progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push('/(new-ui)/sounds')}
            >
              <IconSymbol name="speaker.wave.3.fill" size={28} color={newUIColors.secondary} />
              <Text style={styles.navCardTitle}>Sounds</Text>
              <Text style={styles.navCardDescription}>Manage sound library</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="house.fill" size={24} color={newUIColors.primary} />
            <Text style={[styles.navLabel, { color: newUIColors.primary }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/session')}>
            <IconSymbol name="pause.fill" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Session</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/favorites')}
          >
            <IconSymbol name="heart.fill" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Start Session Modal */}
      <StartSessionModal
        visible={showStartSessionModal}
        onClose={() => setShowStartSessionModal(false)}
        onStart={handleStartSession}
        favorites={favoriteSounds}
        onSelectFavoriteSound={handleSelectFavoriteSound}
        initialConfig={{
          targetDuration: state.session?.targetDuration || 20,
          timeSlotDuration: state.session?.timeSlotDuration || 15,
          slotEveryMinutes: state.session?.slotEveryMinutes || 30,
          speedMultiplier: state.session?.speedSetting || 1,
          soundLayers: {
            ticking: state.sounds?.ticking?.enabled || false,
            breathing: state.sounds?.breathing?.enabled || false,
            nature: state.sounds?.nature?.enabled || false,
          },
        }}
      />
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 15,
    color: newUIColors.text,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  greetingSection: {
    marginBottom: 32,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: newUIColors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 17,
    color: newUIColors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  // Weekly Progress Chart Card
  chartCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 227, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: newUIColors.text,
    letterSpacing: -0.3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35' + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FF6B35' + '30',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: -0.1,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  syncText: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    fontWeight: '600',
  },
  rangePills: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  rangePill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
    backgroundColor: newUIColors.card,
  },
  rangePillActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  rangePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: newUIColors.textSecondary,
  },
  rangePillTextActive: {
    color: '#FFFFFF',
  },
  chartFooter: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  // Start Session Card
  startSessionCard: {
    backgroundColor: newUIColors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  startSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startSessionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startSessionText: {
    flex: 1,
  },
  startSessionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  startSessionDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  // Progress Card
  progressCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 227, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: newUIColors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: newUIColors.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  progressStatLabel: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  // Prep for Today's Work Card
  prepCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 227, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  prepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  prepCardText: {
    fontSize: 15,
    color: newUIColors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  prepCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: newUIColors.primary + '12',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: newUIColors.primary + '25',
  },
  prepCardButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: newUIColors.primary,
    letterSpacing: -0.1,
  },
  // Meditational Guide Card
  meditationalGuideCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 227, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  meditationalGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  meditationalGuideHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  meditationalGuideContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(126, 200, 227, 0.15)',
  },
  meditationalGuidePlaceholder: {
    fontSize: 15,
    color: newUIColors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  meditationalGuideOptions: {
    gap: 10,
  },
  meditationalGuideOption: {
    fontSize: 15,
    color: newUIColors.text,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  // Session Scheduler Card
  schedulerCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 227, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  schedulerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schedulerText: {
    flex: 1,
    marginLeft: 18,
  },
  schedulerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: newUIColors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  schedulerDescription: {
    fontSize: 15,
    color: newUIColors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  // Navigation Section
  navigationSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  navCard: {
    flex: 1,
    backgroundColor: newUIColors.card,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 227, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  navCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: newUIColors.text,
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  navCardDescription: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: newUIColors.card,
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(126, 200, 227, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});



