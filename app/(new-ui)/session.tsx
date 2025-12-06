import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import { clockService } from '@/src/services/ClockService';

const newUIColors = {
  background: '#E8F4F8',
  card: '#FFFFFF',
  primary: '#7EC8E3',
  secondary: '#B8E0D2',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  accent: '#A8D8EA',
};

const { width, height } = Dimensions.get('window');

export default function NewSessionScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const [displayTime, setDisplayTime] = useState('10:50:24 PM');
  const [realTime, setRealTime] = useState('10:50:24 PM');
  const [speedGain, setSpeedGain] = useState('+10s');
  const [slotGain, setSlotGain] = useState('+0m');

  useEffect(() => {
    const interval = setInterval(() => {
      const clockData = clockService.getCurrentData();
      setIsRunning(clockData.isRunning);
      setDisplayTime(clockData.displayTime);
      setRealTime(clockData.realTime);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleStartStop = () => {
    if (isRunning) {
      clockService.stop();
    } else {
      clockService.start();
    }
    setIsRunning(!isRunning);
  };

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
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Focus Session</Text>
          
          <TouchableOpacity onPress={() => router.push('/(new-ui)/sounds')}>
            <IconSymbol name="speaker.wave.3" size={24} color={newUIColors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Session Info Card */}
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>Mindful Focus</Text>
            <Text style={styles.sessionDescription}>
              Sit comfortably. You can close your eyes or leave them slightly open. 
              Take a slow breath... through the nose. Feel the air filling your lungs. 
              Hold your breath for a moment... and exhale slowly through your mouth.
            </Text>
          </View>

          {/* Clock Display */}
          <View style={styles.clockSection}>
            <View style={styles.clockContainer}>
              <Text style={styles.clockTime}>{displayTime}</Text>
              
              {/* Speed Indicator */}
              <View style={styles.speedBadge}>
                <Text style={styles.speedText}>1x Normal Speed</Text>
              </View>
              
              <Text style={styles.timeMode}>Real Time</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Real Duration</Text>
              <Text style={styles.statValue}>0m 5s</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Speed Gain</Text>
              <Text style={[styles.statValue, { color: newUIColors.secondary }]}>{speedGain}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Slot Gain</Text>
              <Text style={[styles.statValue, { color: newUIColors.accent }]}>{slotGain}</Text>
            </View>
          </View>

          {/* Next Slot Info */}
          <View style={styles.nextSlotCard}>
            <Text style={styles.nextSlotText}>Next +15m in 29:54</Text>
            <Text style={styles.nextSlotSubtext}>Slot: +15m every 30m</Text>
          </View>

          {/* Real vs Display Time */}
          <View style={styles.timeComparisonCard}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Real Time</Text>
              <Text style={styles.timeColumnValue}>{realTime}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeColumn}>
              <Text style={styles.timeColumnLabel}>Display Time</Text>
              <Text style={styles.timeColumnValue}>{displayTime}</Text>
            </View>
          </View>

          {/* Active Features */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Active Features:</Text>
            <Text style={styles.featuresText}>• Time Slot: +15m every 30m</Text>
          </View>

          {/* Active Sounds */}
          <View style={styles.soundsCard}>
            <Text style={styles.soundsTitle}>Active Sounds</Text>
            <View style={styles.soundsList}>
              {['Ticking', 'Breathing', 'Nature'].map((sound, index) => (
                <View key={index} style={styles.soundChip}>
                  <Text style={styles.soundChipText}>{sound}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Waveform Visualization */}
          <View style={styles.waveformCard}>
            <View style={styles.waveformContainer}>
              {Array.from({ length: 40 }).map((_, index) => {
                const height = Math.random() * 40 + 10;
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.waveformBar, 
                      { 
                        height, 
                        backgroundColor: index < 20 ? newUIColors.primary : newUIColors.progressLight 
                      }
                    ]} 
                  />
                );
              })}
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <IconSymbol name="backward.fill" size={28} color={newUIColors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playButton, isRunning && styles.playButtonActive]}
              onPress={handleStartStop}
            >
              <IconSymbol 
                name={isRunning ? "pause.fill" : "play.fill"} 
                size={40} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <IconSymbol name="forward.fill" size={28} color={newUIColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/home')}>
            <IconSymbol name="house" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="pause.fill" size={24} color={newUIColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/analytics')}>
            <IconSymbol name="chart.bar" size={24} color={newUIColors.textSecondary} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: newUIColors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sessionCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  sessionDescription: {
    fontSize: 15,
    color: newUIColors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  clockSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  clockContainer: {
    alignItems: 'center',
  },
  clockTime: {
    fontSize: 64,
    fontWeight: '700',
    color: newUIColors.text,
    letterSpacing: -2,
    marginBottom: 16,
  },
  speedBadge: {
    backgroundColor: newUIColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeMode: {
    fontSize: 16,
    color: newUIColors.secondary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
  statLabel: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
  },
  nextSlotCard: {
    backgroundColor: newUIColors.secondary + '30',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: newUIColors.secondary,
  },
  nextSlotText: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  nextSlotSubtext: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    textAlign: 'center',
  },
  timeComparisonCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
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
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    backgroundColor: newUIColors.textSecondary + '30',
    marginHorizontal: 16,
  },
  timeColumnLabel: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 8,
  },
  timeColumnValue: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
  },
  featuresCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 15,
    color: newUIColors.textSecondary,
    lineHeight: 22,
  },
  soundsCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  soundsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 12,
  },
  soundsList: {
    flexDirection: 'row',
    gap: 12,
  },
  soundChip: {
    backgroundColor: newUIColors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  soundChipText: {
    fontSize: 14,
    color: newUIColors.primary,
    fontWeight: '600',
  },
  waveformCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
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
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: newUIColors.card,
    justifyContent: 'center',
    alignItems: 'center',
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
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: newUIColors.text,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  playButtonActive: {
    backgroundColor: newUIColors.primary,
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



