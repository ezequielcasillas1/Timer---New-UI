import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext, SoundPreset } from '@/src/context/AppContext';
import { clockService } from '@/src/services/ClockService';
import { soundService } from '@/src/services/SoundService';
import ClockDisplay from '@/components/ClockDisplay';
import FullscreenClock from '@/components/FullscreenClock';
import { SOUND_LIBRARY } from '@/src/services/SoundService';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

const { width, height } = Dimensions.get('window');

export default function NewSessionScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEndFlow, setShowEndFlow] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [endNote, setEndNote] = useState<string>('');
  const [lastSessionDuration, setLastSessionDuration] = useState(0); // seconds
  const [lastSoundsUsed, setLastSoundsUsed] = useState<string[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(state.soundPresets[0]?.id || null);
  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ ticking: boolean; breathing: boolean; nature: boolean }>({
    ticking: false,
    breathing: false,
    nature: false,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [showSessionSettings, setShowSessionSettings] = useState(false);
  const [followUpNote, setFollowUpNote] = useState<string>('');
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
  const [isFollowUpSaved, setIsFollowUpSaved] = useState(false);
  const [isSavingQuickNote, setIsSavingQuickNote] = useState(false);
  const [isQuickNoteSaved, setIsQuickNoteSaved] = useState(false);
  
  // Animation for loading spinners
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinValue2 = useRef(new Animated.Value(0)).current;

  const favoriteSounds = state.favoriteSoundIds
    .map((id) => SOUND_LIBRARY.find((s) => s.id === id))
    .filter(Boolean)
    .map((sound) => ({
      id: sound!.id,
      title: sound!.title,
      category: sound!.category,
    }));

  useEffect(() => {
    try {
      const clockData = clockService.getCurrentData();
      setIsRunning(clockData?.isRunning ?? false);
    } catch (error) {
      console.log('SessionScreen: unable to read clock data', error);
      setIsRunning(false);
    }
  }, []);

  // Spinning animation for follow-up loading indicator
  useEffect(() => {
    if (isSavingFollowUp) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isSavingFollowUp, spinValue]);

  // Spinning animation for quick note loading indicator
  useEffect(() => {
    if (isSavingQuickNote) {
      Animated.loop(
        Animated.timing(spinValue2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue2.setValue(0);
    }
  }, [isSavingQuickNote, spinValue2]);

  // Auto-save follow-up note with debouncing
  useEffect(() => {
    if (followUpNote.trim() === '') {
      setIsFollowUpSaved(false);
      return;
    }

    setIsSavingFollowUp(true);
    setIsFollowUpSaved(false);

    const timeoutId = setTimeout(() => {
      // Save the follow-up note to context/state
      dispatch({
        type: 'ADD_FOLLOW_UP_NOTE',
        payload: {
          note: followUpNote,
          timestamp: new Date().toISOString(),
        },
      });
      
      setIsSavingFollowUp(false);
      setIsFollowUpSaved(true);
      
      console.log('Follow-up note auto-saved:', followUpNote);
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timeoutId);
  }, [followUpNote, dispatch]);

  // Auto-save quick note with debouncing
  useEffect(() => {
    if (endNote.trim() === '') {
      setIsQuickNoteSaved(false);
      return;
    }

    setIsSavingQuickNote(true);
    setIsQuickNoteSaved(false);

    const timeoutId = setTimeout(() => {
      // Save the quick note to session
      console.log('Quick note auto-saved:', endNote);
      
      setIsSavingQuickNote(false);
      setIsQuickNoteSaved(true);
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timeoutId);
  }, [endNote]);

  const handleTimeSlotChange = (duration: 15 | 30 | 50 | 60) => {
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { timeSlotDuration: duration },
    });
    clockService.setTimeSlotDuration(duration);
    soundService.playHaptic('light');
  };

  const handleSlotEveryChange = (minutes: number) => {
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { slotEveryMinutes: minutes },
    });
    clockService.setSlotEveryMinutes(minutes);
    soundService.playHaptic('light');
  };

  const handleSpeedChange = (speed: number) => {
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { speedSetting: speed },
    });
    clockService.setSpeedMultiplier(speed);
    soundService.playHaptic('light');
  };

  const handleDurationChange = (minutes: number) => {
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { targetDuration: minutes },
    });
    soundService.playHaptic('light');
  };

  const handleSelectFavoriteSound = (soundId: string) => {
    const soundDef = SOUND_LIBRARY.find((s) => s.id === soundId);
    if (!soundDef) return;

    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [soundDef.category]: {
          ...state.sounds[soundDef.category],
          selectedSound: soundDef.id,
          enabled: true,
        },
      },
    });
    soundService.playHaptic('light');
  };

  const handleSelectSound = (category: 'ticking' | 'breathing' | 'nature', soundId: string) => {
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [category]: {
          ...state.sounds[category],
          selectedSound: soundId,
          enabled: true,
        },
      },
    });
    soundService.playHaptic('light');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleToggleTimeSlot = () => {
    const newEnabled = !state.session.timeSlotEnabled;
    
    // Prevent both from being disabled
    if (!newEnabled && !state.session.speedMultiplierEnabled) {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { 
          timeSlotEnabled: false,
          speedMultiplierEnabled: true,
        },
      });
      Alert.alert(
        "Feature Required",
        "At least one time manipulation feature must be enabled. Speed Multiplier has been automatically enabled.",
        [{ text: "OK" }]
      );
    } else {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { timeSlotEnabled: newEnabled },
      });
    }
    soundService.playHaptic('medium');
  };

  const handleToggleSpeedMultiplier = () => {
    const newEnabled = !state.session.speedMultiplierEnabled;
    
    // Prevent both from being disabled
    if (!newEnabled && !state.session.timeSlotEnabled) {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { 
          speedMultiplierEnabled: false,
          timeSlotEnabled: true,
        },
      });
      Alert.alert(
        "Feature Required",
        "At least one time manipulation feature must be enabled. Time Slot Duration has been automatically enabled.",
        [{ text: "OK" }]
      );
    } else {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { speedMultiplierEnabled: newEnabled },
      });
    }
    soundService.playHaptic('medium');
  };

  const handleStartSession = async () => {
    if (isRunning) {
      setIsRunning(false);
      clockService.stop();
      await soundService.forceStopAll();
      
      const clockData = clockService.getCurrentData();
      const durationSeconds = Math.floor(clockData.sessionElapsedTime);
      setLastSessionDuration(durationSeconds);
      const usedSounds: string[] = [];
      if (state.sounds.master) {
        if (state.sounds.ticking.enabled) usedSounds.push('Ticking');
        if (state.sounds.breathing.enabled) usedSounds.push('Breathing');
        if (state.sounds.nature.enabled) usedSounds.push('Nature');
      }
      setLastSoundsUsed(usedSounds);
      
      dispatch({
        type: 'END_SESSION',
        payload: { duration: durationSeconds },
      });

      setShowEndFlow(true);
    } else {
      // Start session
      setIsRunning(true);
      
      dispatch({
        type: 'START_SESSION',
        payload: {
          mode: 'speed',
          targetDuration: state.session.targetDuration || 0,
        },
      });
      
      clockService.setMode('speed');
      
      if (state.session.timeSlotEnabled) {
        clockService.setTimeSlotDuration(state.session.timeSlotDuration || 15);
        clockService.setSlotEveryMinutes(state.session.slotEveryMinutes || 30);
      } else {
        clockService.setTimeSlotDuration(0);
        clockService.setSlotEveryMinutes(0);
      }
      
      if (state.session.speedMultiplierEnabled) {
        clockService.setSpeedMultiplier(state.session.speedSetting);
      } else {
        clockService.setSpeedMultiplier(1);
      }
      
      clockService.start();
      
      // Start sound layers if enabled
      if (state.sounds.master) {
        if (state.sounds.ticking.enabled) {
          soundService.playSound(state.sounds.ticking.selectedSound, true);
        }
        if (state.sounds.breathing.enabled) {
          soundService.playSound(state.sounds.breathing.selectedSound, true);
        }
        if (state.sounds.nature.enabled) {
          soundService.playSound(state.sounds.nature.selectedSound, true);
        }
      }
    }
    soundService.playHaptic('medium');
  };

  const handleSoundToggle = (soundType: 'ticking' | 'breathing' | 'nature') => {
    const currentSound = state.sounds[soundType];
    const newEnabled = !currentSound.enabled;
    
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [soundType]: {
          ...currentSound,
          enabled: newEnabled,
        },
      },
    });
    
    if (isRunning && state.sounds.master) {
      if (newEnabled) {
        soundService.playSound(currentSound.selectedSound, true);
      } else {
        soundService.stopSound(currentSound.selectedSound);
      }
    }
    soundService.playHaptic('light');
  };

  const handleSavePresetFromSummary = () => {
    const newPreset: SoundPreset = {
      id: Date.now().toString(),
      name: `Session Preset ${new Date().toLocaleTimeString()}`,
      ticking: { ...state.sounds.ticking },
      breathing: { ...state.sounds.breathing },
      nature: { ...state.sounds.nature },
      isFavorite: false,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_SOUND_PRESET', payload: newPreset });
    soundService.playHaptic('light');
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = state.soundPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        ticking: { ...state.sounds.ticking, ...preset.ticking },
        breathing: { ...state.sounds.breathing, ...preset.breathing },
        nature: { ...state.sounds.nature, ...preset.nature },
      },
    });
    soundService.playHaptic('light');
  };

  const handleVolumeChange = (category: 'ticking' | 'breathing' | 'nature', volume: number) => {
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [category]: {
          ...state.sounds[category],
          volume,
        },
      },
    });
    
    // Auto-save preset if one is selected
    if (selectedPresetId) {
      const preset = state.soundPresets.find((p) => p.id === selectedPresetId);
      if (preset) {
        dispatch({
          type: 'UPDATE_SOUND_PRESET',
          payload: {
            id: selectedPresetId,
            updates: {
              [category]: {
                ...preset[category],
                volume,
              },
            },
          },
        });
      }
    }
  };

  const handleSoundSelectionChange = (category: 'ticking' | 'breathing' | 'nature', soundId: string) => {
    handleSelectSound(category, soundId);
    
    // Auto-save preset if one is selected
    if (selectedPresetId) {
      const preset = state.soundPresets.find((p) => p.id === selectedPresetId);
      if (preset) {
        dispatch({
          type: 'UPDATE_SOUND_PRESET',
          payload: {
            id: selectedPresetId,
            updates: {
              [category]: {
                ...preset[category],
                selectedSound: soundId,
              },
            },
          },
        });
      }
    }
  };

  const handleToggleFavoriteSound = (soundId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE_SOUND', payload: soundId });
    soundService.playHaptic('light');
  };

  const handlePreviewSound = async (soundId: string) => {
    if (isRunning) return; // keep session audio clean
    if (previewingSoundId === soundId) {
      await soundService.forceStopAll();
      setPreviewingSoundId(null);
      return;
    }
    setPreviewingSoundId(soundId);
    await soundService.forceStopAll();
    await soundService.playSound(soundId, false);
    setTimeout(async () => {
      await soundService.forceStopAll();
      setPreviewingSoundId((current) => (current === soundId ? null : current));
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Hide status bar when session is running on iOS */}
      {Platform.OS === 'ios' && isRunning && <StatusBar hidden={true} />}
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header (hidden while running for minimal UI) */}
        {!isRunning && (
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
        )}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isRunning ? (
            // Pre-Start Configuration
            <View style={styles.configContainer}>
              <Text style={styles.configTitle}>Configure Session</Text>

              {/* Guided AI welcome */}
              <View style={styles.aiCard}>
                <Text style={styles.aiCardTitle}>Guided Focus</Text>
                <Text style={styles.aiCardText}>
                  Hi {state.user?.name || 'there'}, I’ll keep you on track. I can remind you about breaks, water, and wrap-ups.
                </Text>
                <View style={styles.aiPillsRow}>
                  {['Motivation', 'Empathy', 'Confidence'].map((tag) => (
                    <View key={tag} style={styles.aiPill}>
                      <Text style={styles.aiPillText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Preset Selection */}
              <View style={styles.configCard}>
                <Text style={styles.configCardTitle}>Preset Selection</Text>
                <Text style={styles.configCardDescription}>
                  Pick a preset that contains ticking, breathing, and nature layers
                </Text>
                {state.soundPresets.length === 0 ? (
                  <View style={styles.emptyPresetsInline}>
                    <Text style={styles.emptyPresetsInlineText}>
                      No presets yet. Create one from the Sounds page.
                    </Text>
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => router.push('/(new-ui)/sounds')}
                    >
                      <Text style={styles.linkButtonText}>Go to Sounds</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetScroll}
                  >
                    {state.soundPresets.map((preset) => {
                      const isSelected = preset.id === selectedPresetId;
                      return (
                        <TouchableOpacity
                          key={preset.id}
                          style={[
                            styles.presetPill,
                            isSelected && styles.presetPillActive,
                          ]}
                          onPress={() => handleSelectPreset(preset.id)}
                        >
                          <Text
                            style={[
                              styles.presetPillText,
                              isSelected && styles.presetPillTextActive,
                            ]}
                          >
                            {preset.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.presetSelectedBadge}>
                              <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Category sounds with preview + heart */}
              <View style={styles.configCard}>
                <Text style={styles.configCardTitle}>Category Sounds</Text>
                <Text style={styles.configCardDescription}>
                  Preview and favorite sounds in each category before starting
                </Text>

                {(['ticking', 'breathing', 'nature'] as const).map((category) => {
                  const sounds = SOUND_LIBRARY.filter((s) => s.category === category);
                  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
                  const categoryEmoji = category === 'ticking' ? '⏰' : category === 'breathing' ? '🌬️' : '🌿';

                  const isExpanded = expandedCategories[category];

                  return (
                    <View key={category} style={styles.categoryBlock}>
                      <View style={styles.categoryHeader}>
                        <TouchableOpacity
                          style={styles.categoryHeaderLeft}
                          onPress={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                        >
                          <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
                          <Text style={styles.categoryTitle}>{categoryLabel}</Text>
                          <IconSymbol
                            name={isExpanded ? "chevron.down" : "chevron.right"}
                            size={16}
                            color={newUIColors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.categoryToggle}
                          onPress={() => handleSoundToggle(category)}
                        >
                          <IconSymbol
                            name={state.sounds[category].enabled ? "checkmark.circle.fill" : "circle"}
                            size={22}
                            color={state.sounds[category].enabled ? newUIColors.primary : newUIColors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>

                      {isExpanded && sounds.map((sound) => {
                        const isFavorite = state.favoriteSoundIds.includes(sound.id);
                        const isSelected = state.sounds[category].selectedSound === sound.id;
                        return (
                          <View
                            key={sound.id}
                            style={[
                              styles.soundRow,
                              isSelected && styles.soundRowActive,
                            ]}
                          >
                            <View style={styles.soundRowInfo}>
                              <Text style={styles.soundRowTitle}>{sound.title}</Text>
                              <Text style={styles.soundRowDesc}>{sound.description}</Text>
                            </View>
                            <View style={styles.soundRowActions}>
                              <TouchableOpacity
                                style={[
                                  styles.iconButton,
                                  previewingSoundId === sound.id && styles.iconButtonActive,
                                ]}
                                onPress={() => handlePreviewSound(sound.id)}
                              >
                                <IconSymbol
                                  name={previewingSoundId === sound.id ? "pause.fill" : "play.fill"}
                                  size={16}
                                  color="#FFFFFF"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.iconGhostButton}
                                onPress={() => handleSoundSelectionChange(category, sound.id)}
                              >
                                <IconSymbol
                                  name={isSelected ? "checkmark.circle.fill" : "circle"}
                                  size={18}
                                  color={isSelected ? newUIColors.primary : newUIColors.textSecondary}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.iconGhostButton}
                                onPress={() => handleToggleFavoriteSound(sound.id)}
                              >
                                <IconSymbol
                                  name={isFavorite ? "heart.fill" : "heart"}
                                  size={18}
                                  color={isFavorite ? "#FF6B6B" : newUIColors.textSecondary}
                                />
                              </TouchableOpacity>
                            </View>
                            {isSelected && (
                              <View style={styles.volumeSliderContainer}>
                                <Text style={styles.volumeLabel}>Volume: {Math.round(state.sounds[category].volume * 100)}%</Text>
                                <View style={styles.volumeControls}>
                                  <TouchableOpacity
                                    style={styles.volumeButton}
                                    onPress={() => handleVolumeChange(category, Math.max(0, state.sounds[category].volume - 0.1))}
                                  >
                                    <IconSymbol name="minus" size={16} color={newUIColors.text} />
                                  </TouchableOpacity>
                                  <View style={styles.volumeBarContainer}>
                                    <View 
                                      style={[
                                        styles.volumeBar,
                                        { width: `${state.sounds[category].volume * 100}%`, backgroundColor: newUIColors.primary }
                                      ]} 
                                    />
                                  </View>
                                  <TouchableOpacity
                                    style={styles.volumeButton}
                                    onPress={() => handleVolumeChange(category, Math.min(1, state.sounds[category].volume + 0.1))}
                                  >
                                    <IconSymbol name="plus" size={16} color={newUIColors.text} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>

              {/* Session Duration */}
              <View style={styles.configCard}>
                <Text style={styles.configCardTitle}>Session Duration</Text>
                <Text style={styles.configCardDescription}>
                  Choose how long the session should run (max 60 minutes)
                </Text>
                <View style={styles.optionsRow}>
                  {[10, 20, 30, 45, 60].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.optionButton,
                        (state.session.targetDuration || 20) === duration && styles.optionButtonActive,
                      ]}
                      onPress={() => handleDurationChange(duration)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          (state.session.targetDuration || 20) === duration && styles.optionButtonTextActive,
                        ]}
                      >
                        {duration}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Time Slot Duration */}
              <View style={[styles.configCard, !state.session.timeSlotEnabled && styles.disabledCard]}>
                <View style={styles.featureHeader}>
                  <Text style={styles.configCardTitle}>Time Slot Duration</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      state.session.timeSlotEnabled && styles.toggleButtonActive,
                    ]}
                    onPress={handleToggleTimeSlot}
                  >
                    <IconSymbol 
                      name={state.session.timeSlotEnabled ? "checkmark.circle.fill" : "circle"} 
                      color={state.session.timeSlotEnabled ? newUIColors.primary : newUIColors.textSecondary} 
                      size={24} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.configCardDescription}>
                  How many minutes to advance time with each slot (max 1 hour)
                </Text>
                <View style={styles.optionsRow}>
                  {[15, 30, 50, 60].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      disabled={!state.session.timeSlotEnabled}
                      style={[
                        styles.optionButton,
                        (state.session.timeSlotDuration || 15) === duration && styles.optionButtonActive,
                        !state.session.timeSlotEnabled && styles.optionButtonDisabled,
                      ]}
                      onPress={() => handleTimeSlotChange(duration as 15 | 30 | 50 | 60)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        (state.session.timeSlotDuration || 15) === duration && styles.optionButtonTextActive,
                        !state.session.timeSlotEnabled && styles.optionButtonTextDisabled,
                      ]}>
                        {duration}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Apply Slot Every */}
              <View style={[styles.configCard, !state.session.timeSlotEnabled && styles.disabledCard]}>
                <Text style={styles.configCardTitle}>Apply Slot Every</Text>
                <Text style={styles.configCardDescription}>
                  How often to apply the time slot advancement
                </Text>
                <View style={styles.optionsRow}>
                  {[15, 30, 45, 60].map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      disabled={!state.session.timeSlotEnabled}
                      style={[
                        styles.optionButton,
                        (state.session.slotEveryMinutes || 30) === minutes && styles.optionButtonActive,
                        !state.session.timeSlotEnabled && styles.optionButtonDisabled,
                      ]}
                      onPress={() => handleSlotEveryChange(minutes)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        (state.session.slotEveryMinutes || 30) === minutes && styles.optionButtonTextActive,
                        !state.session.timeSlotEnabled && styles.optionButtonTextDisabled,
                      ]}>
                        {minutes}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Speed Multiplier */}
              <View style={[styles.configCard, !state.session.speedMultiplierEnabled && styles.disabledCard]}>
                <View style={styles.featureHeader}>
                  <Text style={styles.configCardTitle}>Time Speed Multiplier</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      state.session.speedMultiplierEnabled && styles.toggleButtonActive,
                    ]}
                    onPress={handleToggleSpeedMultiplier}
                  >
                    <IconSymbol 
                      name={state.session.speedMultiplierEnabled ? "checkmark.circle.fill" : "circle"} 
                      color={state.session.speedMultiplierEnabled ? newUIColors.primary : newUIColors.textSecondary} 
                      size={24} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.configCardDescription}>
                  Adjust the intensity/pace of sound layers
                </Text>
                <View style={styles.optionsRow}>
                  {[0.8, 1, 1.2, 1.5].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      disabled={!state.session.speedMultiplierEnabled}
                      style={[
                        styles.optionButton,
                        state.session.speedSetting === speed && styles.optionButtonActive,
                        !state.session.speedMultiplierEnabled && styles.optionButtonDisabled,
                      ]}
                      onPress={() => handleSpeedChange(speed)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        state.session.speedSetting === speed && styles.optionButtonTextActive,
                        !state.session.speedMultiplierEnabled && styles.optionButtonTextDisabled,
                      ]}>
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sound Layers */}
              <View style={styles.configCard}>
                <Text style={styles.configCardTitle}>Sound Layers</Text>
                <Text style={styles.configCardDescription}>
                  Select which sound layers to activate during the session
                </Text>
                <View style={styles.soundLayersContainer}>
                  {(['ticking', 'breathing', 'nature'] as const).map((soundType) => (
                    <TouchableOpacity
                      key={soundType}
                      style={[
                        styles.soundLayerButton,
                        state.sounds[soundType].enabled && styles.soundLayerButtonActive,
                      ]}
                      onPress={() => handleSoundToggle(soundType)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          state.sounds[soundType].enabled && styles.checkboxActive,
                        ]}
                      >
                        {state.sounds[soundType].enabled && (
                          <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.soundLayerText,
                          state.sounds[soundType].enabled && styles.soundLayerTextActive,
                        ]}
                      >
                        {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Favorites Row */}
              {favoriteSounds.length > 0 && (
                <View style={styles.configCard}>
                  <Text style={styles.configCardTitle}>Favorites Row</Text>
                  <Text style={styles.configCardDescription}>
                    Tap a favorited sound to quick-apply it to its category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.favoritesRow}
                  >
                    {favoriteSounds.map((fav) => (
                      <TouchableOpacity
                        key={fav.id}
                        style={styles.favoriteChip}
                        onPress={() => handleSelectFavoriteSound(fav.id)}
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

              {/* Session Summary Preview */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Session Summary Preview</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>
                    {(state.session.targetDuration || 0) > 0
                      ? `${state.session.targetDuration}m`
                      : 'Not set'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time Slot</Text>
                  <Text style={styles.summaryValue}>
                    {state.session.timeSlotEnabled
                      ? `+${state.session.timeSlotDuration || 15}m every ${state.session.slotEveryMinutes || 30}m`
                      : 'Off'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Speed</Text>
                  <Text style={styles.summaryValue}>
                    {state.session.speedMultiplierEnabled ? `${state.session.speedSetting}x` : 'Off'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Sounds</Text>
                  <Text style={styles.summaryValue}>
                    {['ticking', 'breathing', 'nature']
                      .filter((s) => state.sounds[s as 'ticking' | 'breathing' | 'nature'].enabled)
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(', ') || 'None selected'}
                  </Text>
                </View>
              </View>

              {/* Post-Session Summary (last run) */}
              {lastSessionDuration > 0 && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Last Session Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Duration</Text>
                    <Text style={styles.summaryValue}>{formatDuration(lastSessionDuration)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Sounds</Text>
                    <Text style={styles.summaryValue}>
                      {lastSoundsUsed.length ? lastSoundsUsed.join(', ') : 'None'}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Streak</Text>
                    <Text style={styles.summaryValue}>{state.progress.currentStreak} day</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleSavePresetFromSummary}
                  >
                    <Text style={styles.linkButtonText}>Save as preset</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Start Button */}
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartSession}
              >
                <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Running Session View (minimal)
            <View style={styles.runningContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFullscreen(true)}
              >
                <ClockDisplay />
              </TouchableOpacity>

              <Text style={styles.runningHint}>
                Minimal mode: timer only. Tap the clock for fullscreen.
              </Text>

              {/* Settings Button During Session */}
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowSessionSettings(!showSessionSettings)}
              >
                <IconSymbol name="gearshape.fill" size={18} color={newUIColors.text} />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>

              {/* Session Settings Panel */}
              {showSessionSettings && (
                <View style={styles.sessionSettingsPanel}>
                  <Text style={styles.sessionSettingsTitle}>Adjust During Session</Text>
                  
                  {/* Time Slot Duration */}
                  <View style={styles.sessionSettingRow}>
                    <Text style={styles.sessionSettingLabel}>Time Slot: +{state.session.timeSlotDuration || 15}m</Text>
                    <View style={styles.sessionSettingControls}>
                      {[15, 30, 50, 60].map((val) => (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.sessionSettingButton,
                            (state.session.timeSlotDuration || 15) === val && styles.sessionSettingButtonActive,
                          ]}
                          onPress={() => {
                            handleTimeSlotChange(val as 15 | 30 | 50 | 60);
                            clockService.setTimeSlotDuration(val);
                          }}
                        >
                          <Text style={styles.sessionSettingButtonText}>{val}m</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Speed Multiplier */}
                  <View style={styles.sessionSettingRow}>
                    <Text style={styles.sessionSettingLabel}>Speed: {state.session.speedSetting}x</Text>
                    <View style={styles.sessionSettingControls}>
                      {[0.8, 1, 1.2, 1.5].map((val) => (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.sessionSettingButton,
                            state.session.speedSetting === val && styles.sessionSettingButtonActive,
                          ]}
                          onPress={() => {
                            handleSpeedChange(val);
                            clockService.setSpeedMultiplier(val);
                          }}
                        >
                          <Text style={styles.sessionSettingButtonText}>{val}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStartSession}
              >
                <IconSymbol name="stop.fill" size={20} color="#FFFFFF" />
                <Text style={styles.stopButtonText}>Stop Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation (hidden during active session for minimal UI) */}
        {!isRunning && (
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/home')}>
              <IconSymbol name="house" size={24} color={newUIColors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <IconSymbol name="pause.fill" size={24} color={newUIColors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/(new-ui)/favorites')}
            >
              <IconSymbol name="heart.fill" size={24} color={newUIColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Fullscreen Clock Modal */}
      <FullscreenClock
        visible={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />

      {/* End-of-session intake */}
      <Modal
        visible={showEndFlow}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndFlow(false)}
      >
        <View style={styles.endModalOverlay}>
          <View style={styles.endModalContent}>
            <View style={styles.endModalHeader}>
              <Text style={styles.endModalTitle}>Session Complete</Text>
              <TouchableOpacity onPress={() => setShowEndFlow(false)}>
                <IconSymbol name="xmark" size={22} color={newUIColors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.endPrompt}>How did that feel?</Text>
            <View style={styles.emojiRow}>
              {['😕','😐','🙂','😌','😄','🤩'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedMood === emoji && styles.emojiButtonActive
                  ]}
                  onPress={() => setSelectedMood(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.endPrompt}>Quick note (optional)</Text>
            <View style={styles.quickNoteContainer}>
              <TextInput
                value={endNote}
                onChangeText={setEndNote}
                placeholder="Document your journey: Session highlights, focus wins, improvements noted..."
                placeholderTextColor={newUIColors.textSecondary}
                multiline
                numberOfLines={3}
                style={styles.endInput}
              />
              {endNote.trim() !== '' && (
                <View style={styles.quickNoteSaveIndicator}>
                  {isSavingQuickNote ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View
                        style={[
                          styles.loadingSpinner,
                          {
                            transform: [
                              {
                                rotate: spinValue2.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '360deg'],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <Text style={styles.saveIndicatorText}>Saving...</Text>
                    </View>
                  ) : isQuickNoteSaved ? (
                    <View style={styles.savedContainer}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                      <Text style={[styles.saveIndicatorText, { color: '#10B981' }]}>Saved</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            {/* Follow-up Section */}
            <View style={styles.followUpSection}>
              <Text style={styles.followUpTitle}>Follow up:</Text>
              <Text style={styles.followUpDescription}>
                How may we better improve your focus? Need help performing better? 
                We can help with anxiety, worry, fear, and doubt.
              </Text>
              
              {/* Auto-save text input */}
              <View style={styles.followUpInputContainer}>
                <TextInput
                  value={followUpNote}
                  onChangeText={setFollowUpNote}
                  placeholder="Share what's on your mind..."
                  placeholderTextColor={newUIColors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={styles.followUpInput}
                  maxLength={500}
                />
                {followUpNote.trim() !== '' && (
                  <View style={styles.followUpSaveIndicator}>
                    {isSavingFollowUp ? (
                      <View style={styles.loadingContainer}>
                        <Animated.View
                          style={[
                            styles.loadingSpinner,
                            {
                              transform: [
                                {
                                  rotate: spinValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg'],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                        <Text style={styles.saveIndicatorText}>Saving...</Text>
                      </View>
                    ) : isFollowUpSaved ? (
                      <View style={styles.savedContainer}>
                        <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
                        <Text style={[styles.saveIndicatorText, { color: '#10B981' }]}>Saved</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.journeyButton}
                onPress={() => {
                  setShowEndFlow(false);
                  router.push('/(new-ui)/journey');
                }}
              >
                <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color="#FFFFFF" />
                <Text style={styles.journeyButtonText}>View Your Journey</Text>
                <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.endSummary}>
              <Text style={styles.endSummaryTitle}>Session Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{formatDuration(lastSessionDuration)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sounds Used</Text>
                <Text style={styles.summaryValue}>
                  {lastSoundsUsed.length ? lastSoundsUsed.join(', ') : 'None'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Streak</Text>
                <Text style={styles.summaryValue}>
                  {state.progress.currentStreak} day (best {state.progress.bestStreak || state.progress.currentStreak || 0})
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.endPrimaryButton}
              onPress={() => setShowEndFlow(false)}
            >
              <IconSymbol name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.endPrimaryButtonText}>Save & Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSavePresetFromSummary}
            >
              <IconSymbol name="heart.text.square" size={18} color={newUIColors.text} />
              <Text style={styles.secondaryButtonText}>Save configuration as preset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Configuration View
  configContainer: {
    paddingVertical: 16,
  },
  configTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: newUIColors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  aiCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 6,
  },
  aiCardText: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  aiPillsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  aiPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: newUIColors.primary + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.primary + '40',
  },
  aiPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: newUIColors.primary,
    letterSpacing: -0.2,
  },
  configCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  disabledCard: {
    opacity: 0.6,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 8,
  },
  configCardDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: newUIColors.primary + '20',
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
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  optionButtonTextDisabled: {
    color: newUIColors.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
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
  emptyPresetsInline: {
    paddingVertical: 8,
    gap: 6,
  },
  emptyPresetsInlineText: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    lineHeight: 18,
  },
  presetScroll: {
    gap: 8,
  },
  presetPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '25',
    marginRight: 10,
  },
  presetPillActive: {
    backgroundColor: newUIColors.primary + '18',
    borderColor: newUIColors.primary,
  },
  presetPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
  },
  presetPillTextActive: {
    color: newUIColors.primary,
  },
  presetSelectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: newUIColors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBlock: {
    marginTop: 10,
    marginBottom: 12,
    gap: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: newUIColors.text,
  },
  categoryToggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    gap: 10,
  },
  soundRowActive: {
    borderColor: newUIColors.primary,
    backgroundColor: newUIColors.primary + '10',
  },
  soundRowInfo: {
    flex: 1,
  },
  soundRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: newUIColors.text,
  },
  soundRowDesc: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    marginTop: 2,
  },
  soundRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: newUIColors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: newUIColors.primary,
  },
  volumeSliderContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: newUIColors.textSecondary + '20',
  },
  volumeLabel: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: newUIColors.textSecondary + '20',
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    borderRadius: 3,
  },
  iconGhostButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '25',
  },
  summaryCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: newUIColors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: newUIColors.text,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: newUIColors.text,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Running View
  runningContainer: {
    paddingVertical: 16,
  },
  runningHint: {
    textAlign: 'center',
    marginTop: 12,
    color: newUIColors.textSecondary,
    fontSize: 13,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
    marginBottom: 12,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
  },
  sessionSettingsPanel: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
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
  sessionSettingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 16,
  },
  sessionSettingRow: {
    marginBottom: 16,
  },
  sessionSettingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 8,
  },
  sessionSettingControls: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sessionSettingButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
  },
  sessionSettingButtonActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  sessionSettingButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: newUIColors.text,
  },
  endModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  endModalContent: {
    backgroundColor: newUIColors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
  },
  endModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  endModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
  },
  endPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
    marginTop: 8,
    marginBottom: 6,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emojiButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
    backgroundColor: newUIColors.background,
  },
  emojiButtonActive: {
    borderColor: newUIColors.primary,
    backgroundColor: newUIColors.primary + '18',
  },
  emoji: {
    fontSize: 22,
  },
  endInput: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '25',
    padding: 12,
    color: newUIColors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  quickNoteContainer: {
    marginBottom: 12,
  },
  quickNoteSaveIndicator: {
    alignItems: 'flex-end',
    paddingRight: 4,
    marginBottom: 4,
  },
  followUpSection: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.primary + '30',
    marginBottom: 16,
    gap: 12,
  },
  followUpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
  },
  followUpDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  journeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: newUIColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  journeyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  followUpInputContainer: {
    marginBottom: 12,
  },
  followUpInput: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '25',
    padding: 12,
    color: newUIColors.text,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  followUpSaveIndicator: {
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: newUIColors.primary + '30',
    borderTopColor: newUIColors.primary,
  },
  savedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveIndicatorText: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    fontWeight: '600',
  },
  endSummary: {
    marginBottom: 12,
    backgroundColor: newUIColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    padding: 12,
  },
  endSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 8,
  },
  endPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: newUIColors.text,
    gap: 8,
  },
  endPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: newUIColors.text,
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



