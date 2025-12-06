import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/styles/commonStyles';

interface DigitalClockViewProps {
  time: Date;
  variant?: 'modern' | 'lcd';
  isFullscreen?: boolean;
}

export function DigitalClockView({ time, variant = 'modern', isFullscreen = false }: DigitalClockViewProps) {
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  };

  const isModern = variant === 'modern';

  return (
    <View style={styles.container}>
      <View style={styles.timeWrapper}>
        <Text 
          style={[
            styles.timeText,
            isModern ? styles.modernTime : styles.lcdTime,
            isFullscreen && styles.fullscreenTime
          ]}
          allowFontScaling={false}
        >
          {formatTime(time)}
        </Text>
      </View>
      {variant === 'lcd' && (
        <View style={styles.lcdGlow} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    position: 'relative',
    width: '100%',
  },
  timeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: fonts.clock,
    includeFontPadding: false,
  },
  modernTime: {
    color: colors.text,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  lcdTime: {
    color: '#00ff88',
    fontWeight: '700',
    textShadowColor: '#00ff88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 6,
  },
  lcdGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#00ff88',
    opacity: 0.05,
    borderRadius: 12,
  },
  fullscreenTime: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

