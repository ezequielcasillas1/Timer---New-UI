import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface EightBitClockViewProps {
  time: Date;
}

export function EightBitClockView({ time }: EightBitClockViewProps) {
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    return {
      hours: displayHours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      ampm,
    };
  };

  const { hours, minutes, seconds, ampm } = formatTime(time);

  // Render a pixelated digit
  const renderPixelDigit = (digit: string, index: number) => {
    return (
      <View key={index} style={styles.pixelDigitContainer}>
        <Text style={styles.pixelDigit}>{digit}</Text>
        <View style={styles.pixelOverlay} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Retro Border Frame */}
      <View style={styles.retroFrame}>
        {/* Corner Pixels */}
        <View style={[styles.cornerPixel, styles.topLeft]} />
        <View style={[styles.cornerPixel, styles.topRight]} />
        <View style={[styles.cornerPixel, styles.bottomLeft]} />
        <View style={[styles.cornerPixel, styles.bottomRight]} />

        {/* Clock Display */}
        <View style={styles.displayContainer}>
          <View style={styles.timeRow}>
            {/* Hours */}
            <View style={styles.digitGroup}>
              {hours.split('').map((d, i) => renderPixelDigit(d, i))}
            </View>

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorDot} />
              <View style={styles.separatorDot} />
            </View>

            {/* Minutes */}
            <View style={styles.digitGroup}>
              {minutes.split('').map((d, i) => renderPixelDigit(d, i + 2))}
            </View>

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorDot} />
              <View style={styles.separatorDot} />
            </View>

            {/* Seconds */}
            <View style={styles.digitGroup}>
              {seconds.split('').map((d, i) => renderPixelDigit(d, i + 4))}
            </View>
          </View>

          {/* AM/PM Badge */}
          <View style={styles.ampmBadge}>
            <Text style={styles.ampmText}>{ampm}</Text>
          </View>
        </View>

        {/* Pixel Sparkles */}
        <View style={[styles.sparkle, { top: 10, left: 10 }]} />
        <View style={[styles.sparkle, { top: 10, right: 10 }]} />
        <View style={[styles.sparkle, { bottom: 10, left: 10 }]} />
        <View style={[styles.sparkle, { bottom: 10, right: 10 }]} />
      </View>

      {/* Retro Label */}
      <View style={styles.retroLabel}>
        <Text style={styles.retroLabelText}>◆ RETRO MODE ◆</Text>
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
  retroFrame: {
    backgroundColor: '#1a1a2e',
    borderWidth: 6,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
    boxShadow: '0px 0px 20px rgba(255, 107, 107, 0.5), inset 0px 0px 20px rgba(255, 107, 107, 0.2)',
    elevation: 8,
  },
  cornerPixel: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#4ecdc4',
    boxShadow: '0px 0px 8px #4ecdc4',
  },
  topLeft: {
    top: -6,
    left: -6,
  },
  topRight: {
    top: -6,
    right: -6,
  },
  bottomLeft: {
    bottom: -6,
    left: -6,
  },
  bottomRight: {
    bottom: -6,
    right: -6,
  },
  displayContainer: {
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  pixelDigitContainer: {
    position: 'relative',
  },
  pixelDigit: {
    fontSize: 56,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#4ecdc4',
    textShadowColor: '#4ecdc4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 0,
  },
  pixelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    borderRadius: 4,
  },
  separator: {
    flexDirection: 'column',
    gap: 8,
    marginHorizontal: 4,
  },
  separatorDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
    boxShadow: '0px 0px 6px #ff6b6b',
  },
  ampmBadge: {
    marginTop: 16,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4ecdc4',
    boxShadow: '0px 0px 10px rgba(255, 107, 107, 0.5)',
  },
  ampmText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a2e',
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#ffe66d',
    borderRadius: 1,
    boxShadow: '0px 0px 8px #ffe66d',
  },
  retroLabel: {
    marginTop: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    borderStyle: 'dashed',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retroLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b6b',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textShadowColor: '#ff6b6b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

