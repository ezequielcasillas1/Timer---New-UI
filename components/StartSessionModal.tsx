import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (config: {
    targetDuration: number;
    timeSlotDuration: number;
    slotEveryMinutes: number;
    speedMultiplier: number;
    soundLayers: {
      ticking: boolean;
      breathing: boolean;
      nature: boolean;
    };
  }) => void;
  initialConfig?: {
    targetDuration: number;
    timeSlotDuration: number;
    slotEveryMinutes: number;
    speedMultiplier: number;
    soundLayers: {
      ticking: boolean;
      breathing: boolean;
      nature: boolean;
    };
  };
  favorites?: Array<{
    id: string;
    title: string;
    category: 'ticking' | 'breathing' | 'nature';
  }>;
  onSelectFavoriteSound?: (soundId: string) => void;
}

export default function StartSessionModal({
  visible,
  onClose,
  onStart,
  initialConfig,
  favorites = [],
  onSelectFavoriteSound,
}: StartSessionModalProps) {
  const durationOptions = [10, 20, 30, 45, 60];
  const [timeSlotDuration, setTimeSlotDuration] = useState(initialConfig?.timeSlotDuration || 15);
  const [slotEveryMinutes, setSlotEveryMinutes] = useState(initialConfig?.slotEveryMinutes || 30);
  const [speedMultiplier, setSpeedMultiplier] = useState(initialConfig?.speedMultiplier || 1.0);
  const [targetDuration, setTargetDuration] = useState(initialConfig?.targetDuration || 20);
  const [soundLayers, setSoundLayers] = useState(
    initialConfig?.soundLayers || {
      ticking: false,
      breathing: false,
      nature: false,
    }
  );

  const timeSlotOptions = [15, 30, 50, 60];
  const slotEveryOptions = [15, 30, 45, 60];
  const speedOptions = [0.8, 1, 1.2, 1.5, 2, 4, 8];

  const handleStart = () => {
    onStart({
      targetDuration,
      timeSlotDuration,
      slotEveryMinutes,
      speedMultiplier,
      soundLayers,
    });
    onClose();
  };

  const toggleSoundLayer = (layer: 'ticking' | 'breathing' | 'nature') => {
    setSoundLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configure Session</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={newUIColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Session Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Duration</Text>
              <Text style={styles.sectionDescription}>
                How long the session should run (max 60 minutes)
              </Text>
              <View style={styles.optionsRow}>
                {durationOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      targetDuration === option && styles.optionButtonActive,
                    ]}
                    onPress={() => setTargetDuration(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        targetDuration === option && styles.optionTextActive,
                      ]}
                    >
                      {option}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Slot Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Slot Duration</Text>
              <Text style={styles.sectionDescription}>
                How many minutes to advance time with each slot (max 1 hour)
              </Text>
              <View style={styles.optionsRow}>
                {timeSlotOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      timeSlotDuration === option && styles.optionButtonActive,
                    ]}
                    onPress={() => setTimeSlotDuration(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        timeSlotDuration === option && styles.optionTextActive,
                      ]}
                    >
                      {option}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Slot Every */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Apply Slot Every</Text>
              <Text style={styles.sectionDescription}>
                How often to apply the time slot advancement
              </Text>
              <View style={styles.optionsRow}>
                {slotEveryOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      slotEveryMinutes === option && styles.optionButtonActive,
                    ]}
                    onPress={() => setSlotEveryMinutes(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        slotEveryMinutes === option && styles.optionTextActive,
                      ]}
                    >
                      {option}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Speed Multiplier */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Speed Multiplier</Text>
              <Text style={styles.sectionDescription}>
                How fast time should advance (higher = faster)
              </Text>
              <View style={styles.optionsRow}>
                {speedOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      speedMultiplier === option && styles.optionButtonActive,
                    ]}
                    onPress={() => setSpeedMultiplier(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        speedMultiplier === option && styles.optionTextActive,
                      ]}
                    >
                      {option}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sound Layers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sound Layers</Text>
              <Text style={styles.sectionDescription}>
                Select which sound layers to activate during the session
              </Text>
              <View style={styles.soundLayersContainer}>
                {(['ticking', 'breathing', 'nature'] as const).map((layer) => (
                  <TouchableOpacity
                    key={layer}
                    style={[
                      styles.soundLayerButton,
                      soundLayers[layer] && styles.soundLayerButtonActive,
                    ]}
                    onPress={() => toggleSoundLayer(layer)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        soundLayers[layer] && styles.checkboxActive,
                      ]}
                    >
                      {soundLayers[layer] && (
                        <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.soundLayerText,
                        soundLayers[layer] && styles.soundLayerTextActive,
                      ]}
                    >
                      {layer.charAt(0).toUpperCase() + layer.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Favorites Row */}
            {favorites.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Favorites Row</Text>
                <Text style={styles.sectionDescription}>
                  Tap to quick-apply a saved sound to its category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.favoritesRow}
                >
                  {favorites.map((fav) => (
                    <TouchableOpacity
                      key={fav.id}
                      style={styles.favoriteChip}
                      onPress={() => onSelectFavoriteSound?.(fav.id)}
                    >
                      <Text style={styles.favoriteEmoji}>
                        {fav.category === 'ticking'
                          ? '⏰'
                          : fav.category === 'breathing'
                          ? '🌬️'
                          : '🌿'}
                      </Text>
                      <Text style={styles.favoriteName} numberOfLines={1}>
                        {fav.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: newUIColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: newUIColors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  optionButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  soundLayersContainer: {
    gap: 12,
  },
  soundLayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  soundLayerButtonActive: {
    backgroundColor: newUIColors.primary + '20',
    borderColor: newUIColors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: newUIColors.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  soundLayerText: {
    fontSize: 16,
    fontWeight: '500',
    color: newUIColors.text,
  },
  soundLayerTextActive: {
    color: newUIColors.primary,
    fontWeight: '600',
  },
  favoritesRow: {
    gap: 10,
    paddingVertical: 8,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
    marginRight: 8,
  },
  favoriteEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  favoriteName: {
    fontSize: 14,
    color: newUIColors.text,
    maxWidth: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  startButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.text,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

