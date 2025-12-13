import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

interface SoundPreset {
  id: string;
  name: string;
  ticking: { enabled: boolean; selectedSound: string };
  breathing: { enabled: boolean; selectedSound: string };
  nature: { enabled: boolean; selectedSound: string };
  isFavorite: boolean;
}

interface SoundPresetCardProps {
  preset: SoundPreset;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onDelete?: () => void;
  colors?: {
    card?: string;
    text?: string;
    primary?: string;
  };
}

// 3-Tiered Curl System Component
const ThreeTieredCurl = ({ 
  ticking, 
  breathing, 
  nature,
  size = 60 
}: { 
  ticking: boolean; 
  breathing: boolean; 
  nature: boolean;
  size?: number;
}) => {
  const enabledCount = [ticking, breathing, nature].filter(Boolean).length;
  const curlWidth = size;
  const curlHeight = size * 0.6;
  const spacing = size * 0.15;

  // Calculate positions for the 3 tiers (curled effect)
  const getTierPosition = (index: number) => {
    const baseY = curlHeight / 2;
    const offset = index * spacing;
    const rotation = index * 8; // Slight rotation for curl effect
    return {
      y: baseY + offset,
      rotation,
      opacity: 1 - (index * 0.15),
    };
  };

  const tiers = [
    { enabled: ticking, color: '#7EC8E3', label: 'T' },
    { enabled: breathing, color: '#B8E0D2', label: 'B' },
    { enabled: nature, color: '#A8D8EA', label: 'N' },
  ];

  return (
    <View style={[styles.curlContainer, { width: curlWidth, height: curlHeight }]}>
      {tiers.map((tier, index) => {
        if (!tier.enabled) return null;
        const position = getTierPosition(index);
        return (
          <View
            key={index}
            style={[
              styles.curlTier,
              {
                backgroundColor: tier.color,
                width: curlWidth - (index * 8),
                height: curlHeight / 3,
                top: position.y - (curlHeight / 6),
                opacity: position.opacity,
                transform: [{ rotate: `${position.rotation}deg` }],
              },
            ]}
          >
            <Text style={styles.curlTierLabel}>{tier.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default function SoundPresetCard({
  preset,
  onPress,
  onFavoriteToggle,
  onDelete,
  colors = {},
}: SoundPresetCardProps) {
  const cardColor = colors.card || newUIColors.card;
  const textColor = colors.text || newUIColors.text;
  const primaryColor = colors.primary || newUIColors.primary;

  const enabledSounds = [
    preset.ticking.enabled && 'Ticking',
    preset.breathing.enabled && 'Breathing',
    preset.nature.enabled && 'Nature',
  ].filter(Boolean);

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {/* 3-Tiered Curl System */}
        <View style={styles.curlWrapper}>
          <ThreeTieredCurl
            ticking={preset.ticking.enabled}
            breathing={preset.breathing.enabled}
            nature={preset.nature.enabled}
            size={60}
          />
        </View>

        {/* Preset Info */}
        <View style={styles.presetInfo}>
          <Text style={[styles.presetName, { color: textColor }]} numberOfLines={1}>
            {preset.name}
          </Text>
          <Text style={[styles.presetSounds, { color: textColor + '80' }]} numberOfLines={1}>
            {enabledSounds.length} sound{enabledSounds.length !== 1 ? 's' : ''} • {enabledSounds.join(', ')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons - Outside the main TouchableOpacity */}
      <View style={styles.actionButtonsContainer}>
        {/* Heart Icon for Favorites - Left */}
        {onFavoriteToggle && (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={(e) => {
              e.stopPropagation();
              console.log('HEART BUTTON PRESSED', preset.id);
              onFavoriteToggle();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={preset.isFavorite ? "heart.fill" : "heart"}
              size={24}
              color={preset.isFavorite ? "#FF6B6B" : textColor + '60'}
            />
          </TouchableOpacity>
        )}

        {/* Delete Icon - Right */}
        {onDelete ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.5}
          >
            <IconSymbol
              name="trash"
              size={22}
              color={textColor + '80'}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    zIndex: 10,
    flexShrink: 0,
  },
  curlWrapper: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curlContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  curlTier: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  curlTierLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  presetInfo: {
    flex: 1,
    minWidth: 0, // Allow flex child to shrink below content size
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetSounds: {
    fontSize: 12,
    flexShrink: 1,
  },
  heartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    zIndex: 10,
  },
});

