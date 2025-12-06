import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface AnalogClockViewProps {
  time: Date;
  variant?: 'classic' | 'minimalist';
}

export function AnalogClockView({ time, variant = 'classic' }: AnalogClockViewProps) {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate angles for clock hands
  const secondAngle = (seconds * 6) - 90; // 6 degrees per second, -90 to start at 12
  const minuteAngle = (minutes * 6 + seconds * 0.1) - 90; // 6 degrees per minute + smooth transition
  const hourAngle = (hours * 30 + minutes * 0.5) - 90; // 30 degrees per hour + smooth transition

  const isClassic = variant === 'classic';
  const clockSize = 200;
  const centerX = clockSize / 2;
  const centerY = clockSize / 2;

  // Hand lengths
  const hourHandLength = clockSize * 0.25;
  const minuteHandLength = clockSize * 0.35;
  const secondHandLength = clockSize * 0.4;

  // Calculate hand positions
  const getHandPosition = (angle: number, length: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + length * Math.cos(rad),
      y: centerY + length * Math.sin(rad),
    };
  };

  const hourPos = getHandPosition(hourAngle, hourHandLength);
  const minutePos = getHandPosition(minuteAngle, minuteHandLength);
  const secondPos = getHandPosition(secondAngle, secondHandLength);

  // Render hour markers
  const renderMarkers = () => {
    const markers = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) - 90;
      const rad = (angle * Math.PI) / 180;
      const outerRadius = clockSize * 0.42;
      const innerRadius = isClassic ? clockSize * 0.38 : clockSize * 0.4;
      
      const x1 = centerX + innerRadius * Math.cos(rad);
      const y1 = centerY + innerRadius * Math.sin(rad);
      const x2 = centerX + outerRadius * Math.cos(rad);
      const y2 = centerY + outerRadius * Math.sin(rad);

      markers.push(
        <View
          key={i}
          style={[
            styles.marker,
            {
              position: 'absolute',
              left: x1,
              top: y1,
              width: x2 - x1,
              height: Math.max(y2 - y1, 2),
              transform: [{ rotate: `${angle + 90}deg` }],
            },
            isClassic ? styles.classicMarker : styles.minimalistMarker,
            (i % 3 === 0) && isClassic && styles.boldMarker,
          ]}
        />
      );
    }
    return markers;
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.clockFace,
        { width: clockSize, height: clockSize },
        isClassic ? styles.classicFace : styles.minimalistFace,
      ]}>
        {/* Hour Markers */}
        {renderMarkers()}

        {/* Center Circle */}
        <View style={[
          styles.centerDot,
          { width: 12, height: 12, borderRadius: 6 },
        ]} />

        {/* Hour Hand */}
        <View
          style={[
            styles.hand,
            styles.hourHand,
            {
              width: hourHandLength,
              left: centerX,
              top: centerY - 2,
              transform: [
                { translateX: -2 },
                { rotate: `${hourAngle + 90}deg` }
              ],
            },
            isClassic ? styles.classicHand : styles.minimalistHand,
          ]}
        />

        {/* Minute Hand */}
        <View
          style={[
            styles.hand,
            styles.minuteHand,
            {
              width: minuteHandLength,
              left: centerX,
              top: centerY - 1.5,
              transform: [
                { translateX: -1.5 },
                { rotate: `${minuteAngle + 90}deg` }
              ],
            },
            isClassic ? styles.classicHand : styles.minimalistHand,
          ]}
        />

        {/* Second Hand */}
        {isClassic && (
          <View
            style={[
              styles.hand,
              styles.secondHand,
              {
                width: secondHandLength,
                left: centerX,
                top: centerY - 0.5,
                transform: [
                  { translateX: -0.5 },
                  { rotate: `${secondAngle + 90}deg` }
                ],
              },
            ]}
          />
        )}
      </View>

      {/* Digital Time Display (optional for classic) */}
      <Text style={styles.digitalTime}>
        {time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  clockFace: {
    borderRadius: 1000,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classicFace: {
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 6,
  },
  minimalistFace: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  marker: {
    backgroundColor: colors.text,
  },
  classicMarker: {
    backgroundColor: colors.text,
    opacity: 0.8,
  },
  minimalistMarker: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  boldMarker: {
    opacity: 1,
    backgroundColor: colors.metallicGold,
  },
  hand: {
    position: 'absolute',
    transformOrigin: 'left center',
  },
  hourHand: {
    height: 4,
  },
  minuteHand: {
    height: 3,
  },
  secondHand: {
    height: 1,
    backgroundColor: colors.accent,
  },
  classicHand: {
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  minimalistHand: {
    backgroundColor: colors.text,
    borderRadius: 1,
    opacity: 0.9,
  },
  centerDot: {
    position: 'absolute',
    backgroundColor: colors.metallicGold,
    zIndex: 10,
  },
  digitalTime: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});

