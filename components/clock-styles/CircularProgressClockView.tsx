import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface CircularProgressClockViewProps {
  time: Date;
}

export function CircularProgressClockView({ time }: CircularProgressClockViewProps) {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate progress percentages
  const secondsProgress = (seconds / 60) * 100;
  const minutesProgress = (minutes / 60) * 100;
  const hoursProgress = ((hours % 12) / 12) * 100;

  const formatTime = (date: Date): string => {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const displayHours = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    
    return `${displayHours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        {/* Hours Ring (Outer) */}
        <View style={styles.ring}>
          <View style={[
            styles.ringFill,
            styles.hoursRing,
            { 
              borderTopWidth: 12,
              borderRightWidth: hoursProgress > 25 ? 12 : 0,
              borderBottomWidth: hoursProgress > 50 ? 12 : 0,
              borderLeftWidth: hoursProgress > 75 ? 12 : 0,
            }
          ]} />
          <View style={styles.ringBackground}>
            {/* Minutes Ring (Middle) */}
            <View style={[styles.ring, styles.minutesRingContainer]}>
              <View style={[
                styles.ringFill,
                styles.minutesRing,
                {
                  borderTopWidth: 10,
                  borderRightWidth: minutesProgress > 25 ? 10 : 0,
                  borderBottomWidth: minutesProgress > 50 ? 10 : 0,
                  borderLeftWidth: minutesProgress > 75 ? 10 : 0,
                }
              ]} />
              <View style={[styles.ringBackground, styles.minutesBackground]}>
                {/* Seconds Ring (Inner) */}
                <View style={[styles.ring, styles.secondsRingContainer]}>
                  <View style={[
                    styles.ringFill,
                    styles.secondsRing,
                    {
                      borderTopWidth: 8,
                      borderRightWidth: secondsProgress > 25 ? 8 : 0,
                      borderBottomWidth: secondsProgress > 50 ? 8 : 0,
                      borderLeftWidth: secondsProgress > 75 ? 8 : 0,
                    }
                  ]} />
                  <View style={[styles.ringBackground, styles.centerCircle]}>
                    {/* Center Time Display */}
                    <Text style={styles.timeText}>{formatTime(time)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <View style={styles.label}>
          <View style={[styles.labelDot, { backgroundColor: '#ff6b6b' }]} />
          <Text style={styles.labelText}>Hours</Text>
        </View>
        <View style={styles.label}>
          <View style={[styles.labelDot, { backgroundColor: '#4ecdc4' }]} />
          <Text style={styles.labelText}>Minutes</Text>
        </View>
        <View style={styles.label}>
          <View style={[styles.labelDot, { backgroundColor: '#ffe66d' }]} />
          <Text style={styles.labelText}>Seconds</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  circleContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  hoursRing: {
    borderColor: '#ff6b6b',
    transform: [{ rotate: '-90deg' }],
  },
  minutesRingContainer: {
    width: '80%',
    height: '80%',
  },
  minutesRing: {
    borderColor: '#4ecdc4',
    transform: [{ rotate: '-90deg' }],
  },
  secondsRingContainer: {
    width: '80%',
    height: '80%',
  },
  secondsRing: {
    borderColor: '#ffe66d',
    transform: [{ rotate: '-90deg' }],
  },
  ringBackground: {
    width: '85%',
    height: '85%',
    borderRadius: 1000,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesBackground: {
    width: '85%',
    height: '85%',
  },
  centerCircle: {
    width: '85%',
    height: '85%',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: 'inset 0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 1,
  },
  labelsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

