import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import { soundService, SOUND_LIBRARY } from '@/src/services/SoundService';

const newUIColors = {
  background: '#E8F4F8',
  card: '#FFFFFF',
  primary: '#7EC8E3',
  secondary: '#B8E0D2',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  accent: '#A8D8EA',
};

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
            onPress={() => setSelectedTab('favorites')}
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
              <TouchableOpacity style={styles.addButton}>
                <IconSymbol name="plus" size={20} color={newUIColors.primary} />
                <Text style={styles.addButtonText}>Save Preset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presetsGrid}>
              {['Morning Focus', 'Deep Work', 'Evening Wind Down'].map((preset, index) => (
                <TouchableOpacity key={index} style={styles.presetCard}>
                  <View style={styles.presetIcon}>
                    <IconSymbol 
                      name={index === 0 ? 'sunrise' : index === 1 ? 'brain' : 'moon.stars'} 
                      size={24} 
                      color={newUIColors.primary} 
                    />
                  </View>
                  <Text style={styles.presetTitle}>{preset}</Text>
                  <Text style={styles.presetCount}>{Math.floor(Math.random() * 3) + 2} sounds</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    width: (width - 52) / 2,
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
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
  presetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: newUIColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: newUIColors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  presetCount: {
    fontSize: 12,
    color: newUIColors.textSecondary,
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

