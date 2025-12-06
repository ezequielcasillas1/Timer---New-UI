
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles, fonts } from '@/styles/commonStyles';
import { clockService, ClockData, ClockStyle } from '@/src/services/ClockService';
import { useAppContext } from '@/src/context/AppContext';
import { DigitalClockView } from './clock-styles/DigitalClockView';
import { AnalogClockView } from './clock-styles/AnalogClockView';
import { EightBitClockView } from './clock-styles/EightBitClockView';
import { CircularProgressClockView } from './clock-styles/CircularProgressClockView';

interface ClockDisplayProps {
  onSessionComplete?: () => void;
  isFullscreen?: boolean;
}

export default function ClockDisplay({ onSessionComplete, isFullscreen = false }: ClockDisplayProps) {
  const { state } = useAppContext();
  const [clockData, setClockData] = useState<ClockData>(clockService.getCurrentData());
  const clockStyle = state.session.clockStyle;

  useEffect(() => {
    const unsubscribe = clockService.subscribe((data: ClockData) => {
      setClockData(data);
    });

    // Get initial data
    setClockData(clockService.getCurrentData());

    return unsubscribe;
  }, [onSessionComplete]);

  const formatTime = (date: Date): string => {
    return clockService.formatTime(date, '12h');
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeAdvantageText = (): string => {
    if (clockData.mode === 'locked') return 'Real Time Mode';
    
    const totalAdvancement = clockData.timeSlotAdvancement;
    const speedAdvantage = clockData.sessionElapsedTime * (clockData.speedMultiplier - 1);
    const totalAdvantage = totalAdvancement + (speedAdvantage / 60); // Convert to minutes
    
    if (totalAdvantage > 0) {
      const hours = Math.floor(totalAdvantage / 60);
      const minutes = Math.floor(totalAdvantage % 60);
      if (hours > 0) {
        return `+${hours}h ${minutes}m ahead`;
      }
      return `+${minutes}m ahead`;
    }
    return 'Real Time';
  };

  const getSpeedMultiplierAdvantage = (): string => {
    const speedAdvantageSeconds = clockData.sessionElapsedTime * (clockData.speedMultiplier - 1);
    const minutes = Math.floor(speedAdvantageSeconds / 60);
    const seconds = Math.floor(speedAdvantageSeconds % 60);
    
    if (minutes > 0) {
      return `+${minutes}m ${seconds}s`;
    }
    return `+${seconds}s`;
  };

  const getNextSlotText = (): string => {
    if (!clockData.nextSlotTime || !clockData.isRunning) return '';
    
    const now = new Date();
    const timeUntilSlot = (clockData.nextSlotTime.getTime() - now.getTime()) / 1000;
    
    if (timeUntilSlot <= 0) return 'Applying slot advancement...';
    
    const minutes = Math.floor(timeUntilSlot / 60);
    const seconds = Math.floor(timeUntilSlot % 60);
    
    return `Next +${clockData.timeSlotDuration}m in ${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render the appropriate clock style component
  // NOTE: Custom clock styles DISABLED for now - coming in future update
  const renderClockStyle = () => {
    // FORCE SIMPLE DIGITAL DISPLAY - Custom clocks not ready yet
    return <DigitalClockView time={clockData.displayTime} variant="modern" isFullscreen={isFullscreen} />;
    
    /* FUTURE UPDATE: Uncomment when custom clocks are ready
    switch (clockStyle) {
      case 'analog-classic':
        return <AnalogClockView time={clockData.displayTime} variant="classic" />;
      case 'analog-minimalist':
        return <AnalogClockView time={clockData.displayTime} variant="minimalist" />;
      case 'digital-modern':
        return <DigitalClockView time={clockData.displayTime} variant="modern" />;
      case 'digital-lcd':
        return <DigitalClockView time={clockData.displayTime} variant="lcd" />;
      case '8bit-retro':
        return <EightBitClockView time={clockData.displayTime} />;
      case 'circular-progress':
        return <CircularProgressClockView time={clockData.displayTime} />;
      case 'flip-clock':
        return <DigitalClockView time={clockData.displayTime} variant="modern" />;
      case 'binary':
        return <DigitalClockView time={clockData.displayTime} variant="modern" />;
      default:
        return <DigitalClockView time={clockData.displayTime} variant="modern" />;
    }
    */
  };

  return (
    <View style={styles.container}>
      {/* Main Clock Display - Render Selected Style */}
      {renderClockStyle()}

      {/* Hide additional info in fullscreen mode */}
      {isFullscreen && <View />}
      {!isFullscreen && (
      <>
      {/* Mode & Advantage Info */}
      <View style={styles.infoContainer}>
        {clockData.speedMultiplier > 1 ? (
          <View style={[styles.modeContainer, styles.speedModeActive]}>
            <Text style={styles.modeText}>⚡ {clockData.speedMultiplier}x SPEED ⚡</Text>
          </View>
        ) : (
          <View style={styles.modeContainer}>
            <Text style={styles.modeText}>
              {clockData.mode === 'speed' ? '1x Normal Speed' : 'Locked Mode'}
            </Text>
          </View>
        )}
        <Text style={styles.advantageText}>{getTimeAdvantageText()}</Text>
      </View>

      {/* Session Info */}
      {clockData.isRunning && (
        <View style={styles.sessionInfoContainer}>
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoLabel}>Real Duration</Text>
            <Text style={styles.sessionInfoValue}>
              {formatDuration(clockData.sessionElapsedTime)}
            </Text>
          </View>
          
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoLabel}>Speed Gain</Text>
            <Text style={[styles.sessionInfoValue, styles.speedGainText]}>
              {getSpeedMultiplierAdvantage()}
            </Text>
          </View>
          
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoLabel}>Slot Gain</Text>
            <Text style={[styles.sessionInfoValue, styles.slotGainText]}>
              +{clockData.timeSlotAdvancement}m
            </Text>
          </View>
        </View>
      )}

      {/* Next Slot Info */}
      {clockData.isRunning && (
        <View style={styles.nextSlotContainer}>
          <Text style={styles.nextSlotText}>{getNextSlotText()}</Text>
          <Text style={styles.slotConfigText}>
            Slot: +{clockData.timeSlotDuration}m every {clockData.slotEveryMinutes}m
          </Text>
        </View>
      )}

      {/* Real Time Comparison */}
      <View style={styles.timeComparisonContainer}>
        <View style={styles.timeComparisonItem}>
          <Text style={styles.timeComparisonLabel}>Real Time</Text>
          <Text style={styles.timeComparisonValue}>
            {formatTime(clockData.realTime)}
          </Text>
        </View>
        <View style={styles.timeComparisonItem}>
          <Text style={styles.timeComparisonLabel}>Display Time</Text>
          <Text style={styles.timeComparisonValue}>
            {formatTime(clockData.displayTime)}
          </Text>
        </View>
      </View>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  modeContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
  },
  speedModeActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  advantageText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.secondary,
    marginTop: 8,
  },
  sessionInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 8,
  },
  sessionInfoCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
  },
  sessionInfoLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    fontFamily: fonts.ui,
    marginBottom: 4,
  },
  sessionInfoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    fontFamily: fonts.mono,
  },
  speedGainText: {
    color: colors.secondary,
  },
  slotGainText: {
    color: colors.primary,
  },
  nextSlotContainer: {
    width: '100%',
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  nextSlotText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotConfigText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeComparisonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  timeComparisonItem: {
    alignItems: 'center',
  },
  timeComparisonLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeComparisonValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    fontFamily: fonts.mono,
  },
});
