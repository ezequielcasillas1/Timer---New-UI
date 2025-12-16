import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppContext } from '@/src/context/AppContext';
import { useSoundStateRefresh } from '@/src/hooks/useSoundStateRefresh';

import { theme } from '@/constants/Theme';

const newUIColors = {
  ...theme,
  progressLight: '#D4ECF5', // Additional color for analytics
};

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 40; // 20px padding on each side from scrollContent
const MAX_CIRCLE_SIZE = 240; // Maximum circle size in pixels
const CIRCLE_SIZE = Math.min(width * 0.4, width - HORIZONTAL_PADDING - 20, MAX_CIRCLE_SIZE);
const STROKE_WIDTH = 10;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AnalyticsScreen() {
  const router = useRouter();
  const { state } = useAppContext();
  const [progress, setProgress] = useState(0);

  // Refresh sound state on page load
  useSoundStateRefresh();
  
  // Calculate real progress from state
  const totalSessions = state.progress.totalSessions || 0;
  const goalSessions = 20; // Weekly goal
  const progressPercentage = Math.min((totalSessions / goalSessions) * 100, 100);
  
  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => {
      setProgress(progressPercentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progress) / 100;

  const stats = [
    {
      icon: 'timer',
      label: 'Total time',
      value: `${Math.floor(state.progress.totalTime || 0)} min`,
      color: newUIColors.primary,
    },
    {
      icon: 'calendar',
      label: 'Consistency streak',
      value: `${state.progress.currentStreak || 0} days`,
      color: newUIColors.secondary,
    },
    {
      icon: 'moon.fill',
      label: 'Mood balance',
      value: '8.9',
      color: newUIColors.accent,
    },
    {
      icon: 'chart.line.uptrend.xyaxis',
      label: 'Avg per month',
      value: '4 per month',
      color: '#9ED9CC',
    },
  ];

  const recentMoments = [
    { date: 'Today', activity: 'Calm Focus', duration: '20 min', emoji: '🌊' },
    { date: 'Yesterday', activity: 'Focus Session', duration: '15 min', emoji: '⏰' },
    { date: '2 days ago', activity: 'Breathe & Begin', duration: '25 min', emoji: '🍃' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          
          <Text style={styles.headerTitle}>Analytics</Text>
          
          <TouchableOpacity>
            <IconSymbol name="gearshape" size={24} color={newUIColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* Circular Progress */}
          <View style={styles.progressSection}>
              <View style={styles.circleContainer}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
                <G rotation="-90" origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}>
                  {/* Background Circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={newUIColors.progressLight}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    stroke={newUIColors.primary}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              
              {/* Center Content */}
              <View style={styles.centerContent}>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                <Text style={styles.progressLabel}>Total progress</Text>
              </View>
            </View>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={newUIColors.primary} />
                  <Text style={styles.statValue}>Meditation days</Text>
                  <Text style={styles.statLabel}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="xmark.circle.fill" size={20} color="#FF6B6B" />
                  <Text style={styles.statValue}>Missed days</Text>
                  <Text style={styles.statLabel}>{100 - Math.round(progress)}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Moments of Growth Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Moments of Growth</Text>
              <TouchableOpacity>
                <IconSymbol name="chevron.right" size={20} color={newUIColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsCardsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                  <IconSymbol name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statCardValue}>{stat.value}</Text>
                <Text style={styles.statCardLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentMoments.map((moment, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: newUIColors.primary + '20' }]}>
                  <Text style={styles.activityEmoji}>{moment.emoji}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{moment.activity}</Text>
                  <Text style={styles.activityDate}>{moment.date}</Text>
                </View>
                <Text style={styles.activityDuration}>{moment.duration}</Text>
              </View>
            ))}
          </View>

          {/* Bottom Message */}
          <View style={styles.bottomMessage}>
            <Text style={styles.bottomMessageText}>
              An easy way to take care of yourself. Short meditations for any moment of the day.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/home')}>
            <IconSymbol name="house.fill" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/session')}>
            <IconSymbol name="pause.fill" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/favorites')}>
            <IconSymbol name="heart.fill" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newUIColors.background,
    width: '100%',
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    width: '100%',
    alignItems: 'stretch',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 10,
    width: '100%',
    alignSelf: 'stretch',
  },
  circleContainer: {
    position: 'relative',
    marginBottom: 24,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 40,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 16,
    color: newUIColors.textSecondary,
    fontWeight: '500',
  },
  statsGrid: {
    width: '100%',
    paddingHorizontal: 0,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  statValue: {
    fontSize: 14,
    color: newUIColors.text,
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 18,
    color: newUIColors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: newUIColors.text,
  },
  statsCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  statCard: {
    width: '48%',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
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
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: newUIColors.textSecondary,
  },
  activityDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
  },
  bottomMessage: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bottomMessageText: {
    fontSize: 15,
    color: newUIColors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: newUIColors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



