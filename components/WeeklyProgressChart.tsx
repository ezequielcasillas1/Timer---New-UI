import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/constants/Theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 112;
const CHART_HEIGHT = 160;
const PADDING = 20;

interface WeeklyProgressChartProps {
  data: number[];
  labels?: string[];
  colors?: {
    line?: string;
    point?: string;
    grid?: string;
    text?: string;
  };
}

export default function WeeklyProgressChart({ 
  data, 
  labels,
  colors = {
    line: theme.primary,
    point: theme.primary,
    grid: theme.border || theme.textSecondary + '30',
    text: theme.textSecondary,
  }
}: WeeklyProgressChartProps) {
  const safeData = data.length ? data : [0];
  const chartLabels = labels && labels.length === safeData.length
    ? labels
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].slice(0, safeData.length);

  const { segments, points, gridLineYPositions } = useMemo(() => {
    const maxValue = Math.max(...safeData, 1);
    const minValue = Math.min(...safeData);
    const range = maxValue - minValue || 1;

    const pts = safeData.map((value, index) => {
      const x = (index * (CHART_WIDTH - PADDING * 2)) / Math.max(safeData.length - 1, 1) + PADDING;
      const y = CHART_HEIGHT - PADDING - ((value - minValue) / range) * (CHART_HEIGHT - PADDING * 2);
      return { x, y, value };
    });

    // Build line segments to render with View (no SVG dependency)
    const segs = pts.slice(1).map((pt, idx) => {
      const prev = pts[idx];
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return {
        x: prev.x,
        y: prev.y,
        length,
        angle,
      };
    });

    const gridLines = 4;
    const gridY = Array.from({ length: gridLines }, (_, i) => {
      return PADDING + (i * (CHART_HEIGHT - PADDING * 2)) / (gridLines - 1);
    });

    return { segments: segs, points: pts, gridLineYPositions: gridY };
  }, [safeData]);

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        {gridLineYPositions.map((y, index) => (
          <View
            key={`grid-${index}`}
            style={[
              styles.gridLine,
              {
                top: y,
                left: PADDING,
                right: PADDING,
                borderColor: colors.grid,
              },
            ]}
          />
        ))}

        {segments.map((segment, index) => (
          <View
            key={`seg-${index}`}
            style={[
              styles.segment,
              {
                width: segment.length,
                left: segment.x,
                top: segment.y,
                backgroundColor: colors.line,
                transform: [
                  { translateY: -1 },
                  { rotate: `${segment.angle}deg` },
                ],
              },
            ]}
          />
        ))}

        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={[
              styles.point,
              {
                left: point.x - 4.5,
                top: point.y - 4.5,
                backgroundColor: colors.point,
                borderColor: '#FFFFFF',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.labelsContainer}>
        {chartLabels.map((day, index) => {
          const isActive = safeData[index] > 0;
          return (
            <View key={`${day}-${index}`} style={styles.labelWrapper}>
              <Text
                style={[
                  styles.label,
                  { 
                    color: isActive ? colors.text : colors.text + '60',
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CHART_WIDTH,
    alignSelf: 'center',
    marginVertical: 14,
  },
  chart: {
    marginBottom: 12,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    borderTopWidth: 1,
    opacity: 0.35,
  },
  segment: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
  },
  point: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CHART_WIDTH - PADDING * 2,
    paddingHorizontal: PADDING,
    marginTop: 6,
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});


