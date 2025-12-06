import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import { soundService, SOUND_LIBRARY } from '@/src/services/SoundService';
import { testSoundService } from '@/src/services/TestSoundService';
import SoundPresetCard from '@/components/SoundPresetCard';
import SavePresetModal from '@/components/SavePresetModal';
import { SoundPreset } from '@/src/context/AppContext';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

const { width } = Dimensions.get('window');

// Emoji mapping for sound categories
const getCategoryEmoji = (category: string) => {
  const emojiMap: { [key: string]: string } = {
    'ticking': '⏰',
    'breathing': '🌬️',
    'nature': '🌿',
  };
  return emojiMap[category] || '🎵';
};

// Get emoji for specific sounds
const getSoundEmoji = (title: string, category: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ocean') || titleLower.includes('wave')) return '🌊';
  if (titleLower.includes('rain')) return '🌧️';
  if (titleLower.includes('forest') || titleLower.includes('tree')) return '🌲';
  if (titleLower.includes('wind')) return '💨';
  if (titleLower.includes('fire') || titleLower.includes('crackle')) return '🔥';
  if (titleLower.includes('stream') || titleLower.includes('water')) return '💧';
  if (titleLower.includes('chime')) return '🎐';
  if (titleLower.includes('spa')) return '🧖';
  if (titleLower.includes('mountain')) return '⛰️';
  return getCategoryEmoji(category);
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

export default function SoundsScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'all' | 'favorites'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  // Get selected sound for each category to show as "Active Sound Layers"
  const activeSoundLayers = [
    {
      category: 'ticking' as const,
      title: 'Clock Ticking',
      selectedSound: state.sounds.ticking.selectedSound,
      enabled: state.sounds.ticking.enabled,
    },
    {
      category: 'breathing' as const,
      title: 'Breathing Guide',
      selectedSound: state.sounds.breathing.selectedSound,
      enabled: state.sounds.breathing.enabled,
    },
    {
      category: 'nature' as const,
      title: 'Nature Sounds',
      selectedSound: state.sounds.nature.selectedSound,
      enabled: state.sounds.nature.enabled,
    },
  ];

  // Get all sounds from library grouped by category
  const breathingSounds = SOUND_LIBRARY.filter(s => s.category === 'breathing');
  const tickingSounds = SOUND_LIBRARY.filter(s => s.category === 'ticking');
  const natureSounds = SOUND_LIBRARY.filter(s => s.category === 'nature');

  const handleSoundToggle = (category: 'ticking' | 'breathing' | 'nature') => {
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [category]: {
          ...state.sounds[category],
          enabled: !state.sounds[category].enabled,
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
        },
      },
    });
    soundService.playHaptic('light');
  };

  const handlePlayPreview = async (soundId: string) => {
    if (playingId === soundId) {
      await soundService.forceStopAll();
      setPlayingId(null);
    } else {
      await soundService.forceStopAll();
      setPlayingId(soundId);
      await soundService.playSound(soundId, false);
      // Stop preview after 5 seconds
      setTimeout(async () => {
        await soundService.forceStopAll();
        setPlayingId(null);
      }, 5000);
    }
  };

  const handleMasterSoundToggle = async () => {
    const newMasterState = !state.sounds.master;
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: { master: newMasterState },
    });
    if (newMasterState) {
      await soundService.initialize();
    } else {
      await soundService.forceStopAll();
    }
    soundService.playHaptic('medium');
  };

  const handleHapticsToggle = () => {
    const newHapticsState = !state.sounds.haptics;
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: { haptics: newHapticsState },
    });
    soundService.setHapticsEnabled(newHapticsState);
    if (newHapticsState) {
      soundService.playHaptic('medium');
    }
  };

  const handleTestHaptics = async () => {
    await testSoundService.testHaptics();
  };

  const handleSavePreset = (name: string) => {
    const newPreset: SoundPreset = {
      id: Date.now().toString(),
      name,
      ticking: { ...state.sounds.ticking },
      breathing: { ...state.sounds.breathing },
      nature: { ...state.sounds.nature },
      isFavorite: false,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_SOUND_PRESET', payload: newPreset });
    soundService.playHaptic('light');
  };

  const handleTogglePresetFavorite = (presetId: string) => {
    dispatch({ type: 'TOGGLE_PRESET_FAVORITE', payload: presetId });
    soundService.playHaptic('light');
  };

  const handleToggleFavoriteSound = (soundId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE_SOUND', payload: soundId });
    soundService.playHaptic('light');
  };

  const isFavoriteSound = (soundId: string) => state.favoriteSoundIds.includes(soundId);

  const handleApplyPreset = (preset: SoundPreset) => {
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        ticking: preset.ticking,
        breathing: preset.breathing,
        nature: preset.nature,
      },
    });
    soundService.playHaptic('medium');
  };

  const handleDuplicatePreset = (preset: SoundPreset) => {
    const duplicatedPreset: SoundPreset = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
      isFavorite: false,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_SOUND_PRESET', payload: duplicatedPreset });
    soundService.playHaptic('light');
    Alert.alert('Success', 'Preset duplicated successfully');
  };

  // Filter presets based on selected tab
  const displayedPresets = selectedTab === 'favorites'
    ? state.soundPresets.filter(p => p.isFavorite)
    : state.soundPresets;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="arrow.left" size={24} color={newUIColors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Sound Library</Text>
          
          <TouchableOpacity>
            <IconSymbol name="magnifyingglass" size={24} color={newUIColors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              All Sounds
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'favorites' && styles.tabActive]}
            onPress={() => {
              if (selectedTab === 'favorites') {
                router.push('/(new-ui)/favorites');
              } else {
                setSelectedTab('favorites');
              }
            }}
          >
            <Text style={[styles.tabText, selectedTab === 'favorites' && styles.tabTextActive]}>
              Favorites
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Helping Text */}
          <View style={styles.helpingTextContainer}>
            <Text style={styles.helpingText}>Pick your sound types.</Text>
          </View>

          {/* Master Sound Toggle */}
          <View style={styles.masterSoundContainer}>
            <View style={styles.masterSoundContent}>
              <IconSymbol 
                name={state.sounds.master ? "speaker.wave.3.fill" : "speaker.slash.fill"} 
                size={24} 
                color={newUIColors.text} 
              />
              <Text style={styles.masterSoundText}>Master Sound</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                state.sounds.master ? styles.toggleActive : styles.toggleInactive,
              ]}
              onPress={handleMasterSoundToggle}
            >
              <View
                style={[
                  styles.toggleCircle,
                  state.sounds.master ? styles.toggleCircleActive : styles.toggleCircleInactive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Haptics Toggle */}
          <View style={styles.masterSoundContainer}>
            <View style={styles.masterSoundContent}>
              <IconSymbol 
                name="hand.tap.fill" 
                size={22} 
                color={newUIColors.text} 
              />
              <Text style={styles.masterSoundText}>Haptic Feedback</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                state.sounds.haptics ? styles.toggleActive : styles.toggleInactive,
              ]}
              onPress={handleHapticsToggle}
            >
              <View
                style={[
                  styles.toggleCircle,
                  state.sounds.haptics ? styles.toggleCircleActive : styles.toggleCircleInactive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Test haptics CTA */}
          <TouchableOpacity style={styles.testButton} onPress={handleTestHaptics}>
            <IconSymbol name="waveform.path.ecg" size={18} color={newUIColors.text} />
            <Text style={styles.testButtonText}>Test Haptics</Text>
          </TouchableOpacity>

          {/* Active Sounds Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Sound Layers</Text>
            <Text style={styles.sectionDescription}>
              Sounds that will play during your session
            </Text>
            
            {activeSoundLayers.map((layer, index) => {
              const selectedSoundDef = SOUND_LIBRARY.find(s => s.id === layer.selectedSound);
              return (
                <TouchableOpacity 
                  key={layer.category}
                  style={[styles.soundCard, layer.enabled && styles.soundCardActive]}
                  onPress={() => handleSoundToggle(layer.category)}
                >
                  <View style={[styles.soundImage, { backgroundColor: getCategoryColor(layer.category, index) }]}>
                    <Text style={styles.soundEmoji}>{getCategoryEmoji(layer.category)}</Text>
                  </View>
                  <View style={styles.soundInfo}>
                    <Text style={styles.soundTitle}>{layer.title}</Text>
                    <Text style={styles.soundDescription}>
                      {selectedSoundDef ? selectedSoundDef.title : 'No sound selected'}
                    </Text>
                    <Text style={styles.soundDuration}>Continuous</Text>
                  </View>
                  <View style={[styles.checkbox, layer.enabled && styles.checkboxActive]}>
                    {layer.enabled && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* All Sound Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breathing Sounds</Text>
            <Text style={styles.sectionDescription}>
              Calm breathing patterns
            </Text>
            
            {breathingSounds.map((sound, index) => (
              <TouchableOpacity 
                key={sound.id}
                style={[
                  styles.soundCard,
                  state.sounds.breathing.selectedSound === sound.id && styles.soundCardActive
                ]}
                onPress={() => handleSelectSound('breathing', sound.id)}
              >
                <View style={[styles.soundImage, { backgroundColor: getCategoryColor('breathing', index) }]}>
                  <Text style={styles.soundEmoji}>{getSoundEmoji(sound.title, 'breathing')}</Text>
                </View>
                <View style={styles.soundInfo}>
                  <Text style={styles.soundTitle}>{sound.title}</Text>
                  <Text style={styles.soundDescription}>{sound.description}</Text>
                </View>
                <View style={styles.soundActions}>
                  <TouchableOpacity 
                    style={[
                      styles.playButton,
                      playingId === sound.id && styles.playButtonActive
                    ]}
                    onPress={() => handlePlayPreview(sound.id)}
                  >
                    <IconSymbol 
                      name={playingId === sound.id ? "pause.fill" : "play.fill"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => handleToggleFavoriteSound(sound.id)}
                  >
                    <IconSymbol
                      name={isFavoriteSound(sound.id) ? "heart.fill" : "heart"}
                      size={20}
                      color={isFavoriteSound(sound.id) ? "#FF6B6B" : newUIColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticking Sounds</Text>
            <Text style={styles.sectionDescription}>
              Steady rhythmic ticking
            </Text>
            
            {tickingSounds.map((sound, index) => (
              <TouchableOpacity 
                key={sound.id}
                style={[
                  styles.soundCard,
                  state.sounds.ticking.selectedSound === sound.id && styles.soundCardActive
                ]}
                onPress={() => handleSelectSound('ticking', sound.id)}
              >
                <View style={[styles.soundImage, { backgroundColor: getCategoryColor('ticking', index) }]}>
                  <Text style={styles.soundEmoji}>{getSoundEmoji(sound.title, 'ticking')}</Text>
                </View>
                <View style={styles.soundInfo}>
                  <Text style={styles.soundTitle}>{sound.title}</Text>
                  <Text style={styles.soundDescription}>{sound.description}</Text>
                </View>
                <View style={styles.soundActions}>
                  <TouchableOpacity 
                    style={[
                      styles.playButton,
                      playingId === sound.id && styles.playButtonActive
                    ]}
                    onPress={() => handlePlayPreview(sound.id)}
                  >
                    <IconSymbol 
                      name={playingId === sound.id ? "pause.fill" : "play.fill"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => handleToggleFavoriteSound(sound.id)}
                  >
                    <IconSymbol
                      name={isFavoriteSound(sound.id) ? "heart.fill" : "heart"}
                      size={20}
                      color={isFavoriteSound(sound.id) ? "#FF6B6B" : newUIColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nature Sounds</Text>
            <Text style={styles.sectionDescription}>
              Peaceful ambient nature
            </Text>
            
            {natureSounds.map((sound, index) => (
              <TouchableOpacity 
                key={sound.id}
                style={[
                  styles.soundCard,
                  state.sounds.nature.selectedSound === sound.id && styles.soundCardActive
                ]}
                onPress={() => handleSelectSound('nature', sound.id)}
              >
                <View style={[styles.soundImage, { backgroundColor: getCategoryColor('nature', index) }]}>
                  <Text style={styles.soundEmoji}>{getSoundEmoji(sound.title, 'nature')}</Text>
                </View>
                <View style={styles.soundInfo}>
                  <Text style={styles.soundTitle}>{sound.title}</Text>
                  <Text style={styles.soundDescription}>{sound.description}</Text>
                </View>
                <View style={styles.soundActions}>
                  <TouchableOpacity 
                    style={[
                      styles.playButton,
                      playingId === sound.id && styles.playButtonActive
                    ]}
                    onPress={() => handlePlayPreview(sound.id)}
                  >
                    <IconSymbol 
                      name={playingId === sound.id ? "pause.fill" : "play.fill"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => handleToggleFavoriteSound(sound.id)}
                  >
                    <IconSymbol
                      name={isFavoriteSound(sound.id) ? "heart.fill" : "heart"}
                      size={20}
                      color={isFavoriteSound(sound.id) ? "#FF6B6B" : newUIColors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Presets Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sound Presets</Text>
                <Text style={styles.sectionDescription}>Saved sound combinations</Text>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowSavePresetModal(true)}
              >
                <IconSymbol name="plus" size={20} color={newUIColors.primary} />
                <Text style={styles.addButtonText}>Save Preset</Text>
              </TouchableOpacity>
            </View>

            {displayedPresets.length === 0 ? (
              <View style={styles.emptyPresets}>
                <IconSymbol name="music.note.list" size={48} color={newUIColors.textSecondary} />
                <Text style={styles.emptyPresetsText}>
                  {selectedTab === 'favorites' 
                    ? 'No favorite presets yet' 
                    : 'No presets saved yet'}
                </Text>
                <Text style={styles.emptyPresetsHint}>
                  {selectedTab === 'favorites'
                    ? 'Tap the heart icon on a preset to add it to favorites'
                    : 'Configure your sounds and tap "Save Preset" to create one'}
                </Text>
              </View>
            ) : (
              <View style={styles.presetsList}>
                {displayedPresets.map((preset) => (
                  <View key={preset.id} style={styles.presetCardWrapper}>
                    <SoundPresetCard
                      preset={preset}
                      onPress={() => handleApplyPreset(preset)}
                      onFavoriteToggle={() => handleTogglePresetFavorite(preset.id)}
                    />
                    <TouchableOpacity
                      style={styles.duplicateButton}
                      onPress={() => handleDuplicatePreset(preset)}
                    >
                      <IconSymbol name="doc.on.doc" size={16} color={newUIColors.textSecondary} />
                      <Text style={styles.duplicateButtonText}>Duplicate</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/home')}>
            <IconSymbol name="house" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/session')}>
            <IconSymbol name="pause" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="speaker.wave.3.fill" size={24} color={newUIColors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Save Preset Modal */}
      <SavePresetModal
        visible={showSavePresetModal}
        onClose={() => setShowSavePresetModal(false)}
        onSave={handleSavePreset}
      />
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: newUIColors.card,
  },
  tabActive: {
    backgroundColor: newUIColors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: newUIColors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  helpingTextContainer: {
    marginBottom: 20,
    paddingVertical: 12,
  },
  helpingText: {
    fontSize: 18,
    fontWeight: '600',
    color: newUIColors.text,
    textAlign: 'center',
  },
  masterSoundContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  masterSoundContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  masterSoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: newUIColors.text,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: newUIColors.textSecondary + '40',
  },
  toggleActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  toggleInactive: {
    backgroundColor: newUIColors.background,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  toggleCircleInactive: {
    alignSelf: 'flex-start',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 16,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
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
  soundCardActive: {
    borderColor: newUIColors.primary,
    backgroundColor: newUIColors.primary + '10',
  },
  soundImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  soundEmoji: {
    fontSize: 32,
  },
  soundInfo: {
    flex: 1,
  },
  soundTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 4,
  },
  soundDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 4,
  },
  soundDuration: {
    fontSize: 12,
    color: newUIColors.textSecondary,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: newUIColors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: newUIColors.primary,
  },
  soundActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: newUIColors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: newUIColors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.primary,
  },
  presetsList: {
    gap: 12,
  },
  presetCardWrapper: {
    position: 'relative',
  },
  duplicateButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: newUIColors.background + 'E0',
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
  },
  duplicateButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: newUIColors.textSecondary,
  },
  emptyPresets: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyPresetsText: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyPresetsHint: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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

