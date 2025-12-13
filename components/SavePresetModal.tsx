import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { SOUND_LIBRARY, SoundDefinition } from '@/src/services/SoundService';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

interface SelectedSounds {
  ticking: { enabled: boolean; selectedSound: string; volume: number };
  breathing: { enabled: boolean; selectedSound: string; volume: number };
  nature: { enabled: boolean; selectedSound: string; volume: number };
}

interface SavePresetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, sounds: SelectedSounds, presetId?: string) => void;
  initialSounds?: SelectedSounds;
  editingPreset?: { id: string; name: string; sounds: SelectedSounds };
}

// Get emoji for sound category
const getCategoryEmoji = (category: string) => {
  const emojiMap: { [key: string]: string } = {
    'ticking': '⏰',
    'breathing': '🌬️',
    'nature': '🌿',
  };
  return emojiMap[category] || '🎵';
};

// Get color for sound category
const getCategoryColor = (category: string, index: number = 0) => {
  const colors = {
    'ticking': ['#7EC8E3', '#6BADC7', '#5A98B3'],
    'breathing': ['#B8E0D2', '#A3D4C6', '#8EC8BA'],
    'nature': ['#A8D8EA', '#93C9DD', '#7EBAD0', '#9ED9CC', '#8FAADC', '#C5E1F5', '#FFB347', '#87CEEB'],
  };
  const categoryColors = colors[category as keyof typeof colors] || colors.nature;
  return categoryColors[index % categoryColors.length];
};

export default function SavePresetModal({
  visible,
  onClose,
  onSave,
  initialSounds,
  editingPreset,
}: SavePresetModalProps) {
  const isEditMode = !!editingPreset;
  const [presetName, setPresetName] = useState('');
  const [step, setStep] = useState<'name' | 'sounds'>('name');
  const [selectedSounds, setSelectedSounds] = useState<SelectedSounds>(
    initialSounds || {
      ticking: { enabled: false, selectedSound: '', volume: 0.8 },
      breathing: { enabled: false, selectedSound: '', volume: 0.7 },
      nature: { enabled: false, selectedSound: '', volume: 0.6 },
    }
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      if (editingPreset) {
        setPresetName(editingPreset.name);
        setSelectedSounds(editingPreset.sounds);
        setStep('sounds'); // Start at sounds step for editing
      } else {
        setPresetName('');
        setSelectedSounds(
          initialSounds || {
            ticking: { enabled: false, selectedSound: '', volume: 0.8 },
            breathing: { enabled: false, selectedSound: '', volume: 0.7 },
            nature: { enabled: false, selectedSound: '', volume: 0.6 },
          }
        );
        setStep('name');
      }
      setExpandedCategory(null);
    }
  }, [visible, initialSounds, editingPreset]);

  const handleNameNext = () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a name for your preset');
      return;
    }
    setStep('sounds');
  };

  const handleSoundToggle = (category: 'ticking' | 'breathing' | 'nature') => {
    setSelectedSounds(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !prev[category].enabled,
      },
    }));
  };

  const handleSelectSound = (category: 'ticking' | 'breathing' | 'nature', soundId: string) => {
    setSelectedSounds(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        selectedSound: soundId,
        enabled: true,
      },
    }));
    setExpandedCategory(null);
  };

  const handleSave = () => {
    // Ensure at least one sound is selected
    const hasAnySound = selectedSounds.ticking.enabled || 
                       selectedSounds.breathing.enabled || 
                       selectedSounds.nature.enabled;
    
    if (!hasAnySound) {
      Alert.alert('Error', 'Please select at least one sound for your preset');
      return;
    }

    onSave(presetName.trim(), selectedSounds, editingPreset?.id);
    setPresetName('');
    setStep('name');
    setSelectedSounds({
      ticking: { enabled: false, selectedSound: '', volume: 0.8 },
      breathing: { enabled: false, selectedSound: '', volume: 0.7 },
      nature: { enabled: false, selectedSound: '', volume: 0.6 },
    });
    setExpandedCategory(null);
    onClose();
  };

  const handleClose = () => {
    setPresetName('');
    setStep('name');
    setSelectedSounds({
      ticking: { enabled: false, selectedSound: '', volume: 0.8 },
      breathing: { enabled: false, selectedSound: '', volume: 0.7 },
      nature: { enabled: false, selectedSound: '', volume: 0.6 },
    });
    setExpandedCategory(null);
    onClose();
  };

  const handleBack = () => {
    setStep('name');
  };

  const getCategorySounds = (category: 'ticking' | 'breathing' | 'nature') => {
    return SOUND_LIBRARY.filter(s => s.category === category);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isEditMode ? 'Edit Sound Preset' : 'Save Sound Preset'}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={newUIColors.text} />
            </TouchableOpacity>
          </View>

          {step === 'name' ? (
            <>
              <View style={styles.content}>
                <Text style={styles.label}>Preset Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Morning Focus, Deep Work"
                  placeholderTextColor={newUIColors.textSecondary}
                  value={presetName}
                  onChangeText={setPresetName}
                  autoFocus
                  maxLength={30}
                />
                <Text style={styles.hint}>
                  Give your sound combination a memorable name
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNameNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.content}>
                <Text style={styles.stepIndicator}>Step 2 of 2</Text>
                <Text style={styles.sectionTitle}>Select Sounds for "{presetName}"</Text>
                <Text style={styles.sectionDescription}>
                  Choose which sounds to include in your preset
                </Text>

                <ScrollView style={styles.soundsList} showsVerticalScrollIndicator={false}>
                  {(['ticking', 'breathing', 'nature'] as const).map((category) => {
                    const categorySounds = getCategorySounds(category);
                    const isExpanded = expandedCategory === category;
                    const selectedSound = selectedSounds[category];

                    return (
                      <View key={category} style={styles.categorySection}>
                        <TouchableOpacity
                          style={[
                            styles.categoryHeader,
                            selectedSound.enabled && styles.categoryHeaderActive
                          ]}
                          onPress={() => setExpandedCategory(isExpanded ? null : category)}
                        >
                          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category, 0) }]}>
                            <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
                          </View>
                          <View style={styles.categoryInfo}>
                            <Text style={styles.categoryTitle}>
                              {category.charAt(0).toUpperCase() + category.slice(1)} Sounds
                            </Text>
                            {selectedSound.selectedSound && (
                              <Text style={styles.categorySubtitle} numberOfLines={1}>
                                {SOUND_LIBRARY.find(s => s.id === selectedSound.selectedSound)?.title || 'None selected'}
                              </Text>
                            )}
                          </View>
                          <TouchableOpacity
                            style={[styles.checkbox, selectedSound.enabled && styles.checkboxActive]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleSoundToggle(category);
                            }}
                          >
                            {selectedSound.enabled && (
                              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                            )}
                          </TouchableOpacity>
                          <IconSymbol
                            name={isExpanded ? "chevron.up" : "chevron.down"}
                            size={20}
                            color={newUIColors.textSecondary}
                          />
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.soundsGrid}>
                            {categorySounds.map((sound, index) => (
                              <TouchableOpacity
                                key={sound.id}
                                style={[
                                  styles.soundOption,
                                  selectedSound.selectedSound === sound.id && styles.soundOptionActive
                                ]}
                                onPress={() => handleSelectSound(category, sound.id)}
                              >
                                <View style={[styles.soundOptionIcon, { backgroundColor: getCategoryColor(category, index) }]}>
                                  <Text style={styles.soundOptionEmoji}>{getCategoryEmoji(category)}</Text>
                                </View>
                                <Text style={styles.soundOptionTitle} numberOfLines={2}>
                                  {sound.title}
                                </Text>
                                {selectedSound.selectedSound === sound.id && (
                                  <View style={styles.selectedIndicator}>
                                    <IconSymbol name="checkmark.circle.fill" size={20} color={newUIColors.primary} />
                                  </View>
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <IconSymbol name="chevron.left" size={20} color={newUIColors.text} />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{isEditMode ? 'Update Preset' : 'Save Preset'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: newUIColors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hint: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginTop: 8,
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
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: newUIColors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 20,
  },
  soundsList: {
    maxHeight: 400,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryHeaderActive: {
    borderColor: newUIColors.primary + '40',
    backgroundColor: newUIColors.primary + '08',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
    minWidth: 0,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 13,
    color: newUIColors.textSecondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: newUIColors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  soundsGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundOption: {
    width: '48%',
    backgroundColor: newUIColors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  soundOptionActive: {
    borderColor: newUIColors.primary,
    backgroundColor: newUIColors.primary + '10',
  },
  soundOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  soundOptionEmoji: {
    fontSize: 20,
  },
  soundOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: newUIColors.text,
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
});

