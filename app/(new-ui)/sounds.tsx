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
import { useSoundStateRefresh } from '@/src/hooks/useSoundStateRefresh';

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
  const [editingPreset, setEditingPreset] = useState<SoundPreset | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{
    ticking: boolean;
    breathing: boolean;
    nature: boolean;
  }>({ ticking: false, breathing: false, nature: false });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Refresh sound state on page load
  useSoundStateRefresh();

  // Initialize sound service when component mounts if master sound is enabled
  React.useEffect(() => {
    if (state.sounds.master) {
      console.log('🎵 [Sounds] Initializing sound service on mount');
      soundService.initialize().catch(err => 
        console.error('🎵 [Sounds] Failed to initialize sound service:', err)
      );
    }
  }, []);

  // Reset pagination when favorites change or tab changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedTab, state.favoriteSoundIds.length, state.soundPresets.filter(p => p.isFavorite).length]);

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b3d0efa2-2934-43fa-b4ed-f85b94417f15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'preview-debug',hypothesisId:'H1',location:'sounds.tsx:handlePlayPreview',message:'Preview clicked',data:{soundId,playingId,isCurrentlyPlaying:playingId===soundId,masterEnabled:state.sounds.master},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (playingId === soundId) {
      await soundService.forceStopAll();
      setPlayingId(null);
    } else {
      await soundService.forceStopAll();
      setPlayingId(soundId);
      // Ensure sound service is initialized before preview
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b3d0efa2-2934-43fa-b4ed-f85b94417f15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'preview-debug',hypothesisId:'H4',location:'sounds.tsx:handlePlayPreview',message:'Initializing service for preview',data:{soundId},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      await soundService.initialize();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b3d0efa2-2934-43fa-b4ed-f85b94417f15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'preview-debug',hypothesisId:'H4',location:'sounds.tsx:handlePlayPreview',message:'Before playSound call',data:{soundId,willLoop:true},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      await soundService.playSound(soundId, true);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b3d0efa2-2934-43fa-b4ed-f85b94417f15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'preview-debug',hypothesisId:'H4',location:'sounds.tsx:handlePlayPreview',message:'After playSound call',data:{soundId},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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

  const handleSavePreset = (name: string, sounds: {
    ticking: { enabled: boolean; selectedSound: string; volume: number };
    breathing: { enabled: boolean; selectedSound: string; volume: number };
    nature: { enabled: boolean; selectedSound: string; volume: number };
  }, presetId?: string) => {
    if (presetId) {
      // Update existing preset
      dispatch({ 
        type: 'UPDATE_SOUND_PRESET', 
        payload: { 
          id: presetId, 
          updates: { name, ticking: sounds.ticking, breathing: sounds.breathing, nature: sounds.nature } 
        } 
      });
      soundService.playHaptic('light');
      Alert.alert('Success', `Preset "${name}" updated successfully!`);
    } else {
      // Create new preset
      const newPreset: SoundPreset = {
        id: Date.now().toString(),
        name,
        ticking: sounds.ticking,
        breathing: sounds.breathing,
        nature: sounds.nature,
        isFavorite: false,
        createdAt: new Date(),
      };
      dispatch({ type: 'ADD_SOUND_PRESET', payload: newPreset });
      soundService.playHaptic('light');
      Alert.alert('Success', `Preset "${name}" saved successfully!`);
    }
    setEditingPreset(null);
  };

  const handleEditPreset = (preset: SoundPreset) => {
    setEditingPreset(preset);
    setShowSavePresetModal(true);
  };

  const handleTogglePresetFavorite = (presetId: string) => {
    dispatch({ type: 'TOGGLE_PRESET_FAVORITE', payload: presetId });
    soundService.playHaptic('light');
  };

  const handleToggleFavoriteSound = (soundId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE_SOUND', payload: soundId });
    soundService.playHaptic('light');
  };

  const handleToggleCategory = (category: 'ticking' | 'breathing' | 'nature') => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
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

  const handleDeletePreset = (presetId: string) => {
    const performDelete = () => {
      dispatch({ type: 'DELETE_SOUND_PRESET', payload: presetId });
      soundService.playHaptic('medium');
    };

    if (Platform.OS === 'web') {
      // Use browser confirm for web
      const confirmed = window.confirm('Are you sure you want to delete this preset?');
      if (confirmed) {
        performDelete();
      }
    } else {
      // Use Alert.alert for native
      Alert.alert(
        'Delete Preset',
        'Are you sure you want to delete this preset?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  // Get favorite sounds
  const favoriteSounds = SOUND_LIBRARY.filter(s => state.favoriteSoundIds.includes(s.id));
  
  // Filter presets based on selected tab and remove duplicates
  const displayedPresets = (selectedTab === 'favorites'
    ? state.soundPresets.filter(p => p.isFavorite)
    : state.soundPresets
  ).filter(preset => !preset.name.includes('(Copy)'));

  // Combine favorite sounds and presets for pagination
  const allFavorites = selectedTab === 'favorites' 
    ? [
        ...favoriteSounds.map(sound => ({ type: 'sound' as const, item: sound })),
        ...displayedPresets.map(preset => ({ type: 'preset' as const, item: preset }))
      ]
    : [];

  // Pagination calculations
  const totalItems = allFavorites.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedFavorites = allFavorites.slice(startIndex, endIndex);

  // Filter sounds based on selected tab
  const getFilteredSounds = (category: 'ticking' | 'breathing' | 'nature') => {
    const categorySounds = SOUND_LIBRARY.filter(s => s.category === category);
    if (selectedTab === 'favorites') {
      return categorySounds.filter(s => state.favoriteSoundIds.includes(s.id));
    }
    return categorySounds;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          
          <Text style={styles.headerTitle}>Sound Library</Text>
          
          <TouchableOpacity>
            <IconSymbol name="magnifyingglass" size={24} color={newUIColors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => {
              setSelectedTab('all');
              setCurrentPage(0);
            }}
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
                setCurrentPage(0);
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
          {selectedTab === 'favorites' ? (
            <>
              {/* Favorites View */}
              <View style={styles.helpingTextContainer}>
                <Text style={styles.helpingText}>Your Loved Sounds & Presets</Text>
              </View>

              {totalItems === 0 ? (
                <View style={styles.emptyFavorites}>
                  <IconSymbol name="heart" size={64} color={newUIColors.textSecondary + '60'} />
                  <Text style={styles.emptyFavoritesText}>No favorites yet</Text>
                  <Text style={styles.emptyFavoritesHint}>
                    Tap the heart icon on sounds or presets to add them to favorites
                  </Text>
                </View>
              ) : (
                <>
                  {/* Pagination Info */}
                  <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                      Showing {startIndex + 1}-{endIndex} of {totalItems}
                    </Text>
                  </View>

                  {/* Favorite Items List */}
                  <View style={styles.favoritesList}>
                    {paginatedFavorites.map((fav, index) => {
                      if (fav.type === 'sound') {
                        const sound = fav.item;
                        const categorySounds = SOUND_LIBRARY.filter(s => s.category === sound.category);
                        const soundIndex = categorySounds.findIndex(s => s.id === sound.id);
                        return (
                          <TouchableOpacity
                            key={`sound-${sound.id}`}
                            style={styles.favoriteSoundCard}
                            onPress={() => {
                              const category = sound.category as 'ticking' | 'breathing' | 'nature';
                              handleSelectSound(category, sound.id);
                            }}
                          >
                            <View style={[styles.favoriteSoundImage, { backgroundColor: getCategoryColor(sound.category, soundIndex) }]}>
                              <Text style={styles.favoriteSoundEmoji}>{getSoundEmoji(sound.title, sound.category)}</Text>
                            </View>
                            <View style={styles.favoriteSoundInfo}>
                              <Text style={styles.favoriteSoundTitle} numberOfLines={2}>{sound.title}</Text>
                              <Text style={styles.favoriteSoundDescription} numberOfLines={2}>{sound.description}</Text>
                              <Text style={styles.favoriteSoundCategory}>{sound.category.charAt(0).toUpperCase() + sound.category.slice(1)}</Text>
                            </View>
                            <View style={styles.favoriteSoundActions}>
                              <TouchableOpacity
                                style={[styles.playButton, playingId === sound.id && styles.playButtonActive]}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handlePlayPreview(sound.id);
                                }}
                              >
                                <IconSymbol 
                                  name={playingId === sound.id ? "pause.fill" : "play.fill"} 
                                  size={16} 
                                  color="#FFFFFF" 
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.heartButton}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavoriteSound(sound.id);
                                }}
                              >
                                <IconSymbol
                                  name="heart.fill"
                                  size={16}
                                  color="#FF6B6B"
                                />
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        );
                      } else {
                        const preset = fav.item;
                        return (
                          <SoundPresetCard
                            key={`preset-${preset.id}`}
                            preset={preset}
                            onPress={() => handleEditPreset(preset)}
                            onFavoriteToggle={() => handleTogglePresetFavorite(preset.id)}
                            onDelete={() => handleDeletePreset(preset.id)}
                          />
                        );
                      }
                    })}
                  </View>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                      <TouchableOpacity
                        style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
                        onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                      >
                        <IconSymbol name="chevron.left" size={20} color={currentPage === 0 ? newUIColors.textSecondary + '60' : newUIColors.text} />
                      </TouchableOpacity>
                      
                      <View style={styles.paginationNumbers}>
                        {Array.from({ length: Math.min(totalPages, 11) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 11) {
                            pageNum = i;
                          } else if (currentPage < 6) {
                            pageNum = i;
                          } else if (currentPage > totalPages - 6) {
                            pageNum = totalPages - 11 + i;
                          } else {
                            pageNum = currentPage - 5 + i;
                          }
                          
                          return (
                            <TouchableOpacity
                              key={pageNum}
                              style={[
                                styles.paginationNumber,
                                currentPage === pageNum && styles.paginationNumberActive
                              ]}
                              onPress={() => setCurrentPage(pageNum)}
                            >
                              <Text style={[
                                styles.paginationNumberText,
                                currentPage === pageNum && styles.paginationNumberTextActive
                              ]}>
                                {pageNum}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <TouchableOpacity
                        style={[styles.paginationButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
                        onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                      >
                        <IconSymbol name="chevron.right" size={20} color={currentPage >= totalPages - 1 ? newUIColors.textSecondary + '60' : newUIColors.text} />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </>
          ) : (
            <>
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

          {/* Sound Layers Section with Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound Layers</Text>
            <Text style={styles.sectionDescription}>
              Tap to expand and select sounds for your session
            </Text>
            
            {activeSoundLayers.map((layer, index) => {
              const selectedSoundDef = SOUND_LIBRARY.find(s => s.id === layer.selectedSound);
              const isExpanded = expandedCategories[layer.category];
              const categorySounds = getFilteredSounds(layer.category);
              console.log(`[Sound Layers] ${layer.category}: ${categorySounds.length} sounds, expanded: ${isExpanded}`);
              
              return (
                <View key={layer.category} style={styles.categoryContainer}>
                  {/* Category Header Toggle */}
                  <TouchableOpacity 
                    style={[styles.categoryHeader, layer.enabled && styles.categoryHeaderActive]}
                    onPress={() => handleToggleCategory(layer.category)}
                  >
                    <View style={[styles.soundImage, { backgroundColor: getCategoryColor(layer.category, index) }]}>
                      <Text style={styles.soundEmoji}>{getCategoryEmoji(layer.category)}</Text>
                    </View>
                    <View style={styles.soundInfo}>
                      <Text style={styles.soundTitle} numberOfLines={1}>{layer.title}</Text>
                      <Text style={styles.soundDescription} numberOfLines={1}>
                        {selectedSoundDef ? selectedSoundDef.title : 'Tap to select'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.checkbox, layer.enabled && styles.checkboxActive]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSoundToggle(layer.category);
                      }}
                    >
                      {layer.enabled && (
                        <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <IconSymbol 
                      name={isExpanded ? "chevron.up" : "chevron.down"} 
                      size={20} 
                      color={newUIColors.textSecondary}
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>

                  {/* Expanded Sound Catalog */}
                  {isExpanded && (
                    <View style={styles.soundCatalog}>
                      {categorySounds.map((sound, soundIndex) => (
                        <TouchableOpacity 
                          key={sound.id}
                          style={[
                            styles.catalogSoundCard,
                            state.sounds[layer.category].selectedSound === sound.id && styles.catalogSoundCardActive
                          ]}
                          onPress={() => handleSelectSound(layer.category, sound.id)}
                        >
                          <View style={[styles.catalogSoundImage, { backgroundColor: getCategoryColor(layer.category, soundIndex) }]}>
                            <Text style={styles.catalogSoundEmoji}>{getSoundEmoji(sound.title, layer.category)}</Text>
                          </View>
                          <View style={styles.catalogSoundInfo}>
                            <Text style={styles.catalogSoundTitle} numberOfLines={2}>{sound.title}</Text>
                            <Text style={styles.catalogSoundDescription} numberOfLines={2}>{sound.description}</Text>
                          </View>
                          <View style={styles.soundActions}>
                            <TouchableOpacity 
                              style={[
                                styles.playButton,
                                playingId === sound.id && styles.playButtonActive
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(sound.id);
                              }}
                            >
                              <IconSymbol 
                                name={playingId === sound.id ? "pause.fill" : "play.fill"} 
                                size={16} 
                                color="#FFFFFF" 
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.heartButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleToggleFavoriteSound(sound.id);
                              }}
                            >
                              <IconSymbol
                                name={isFavoriteSound(sound.id) ? "heart.fill" : "heart"}
                                size={16}
                                color={isFavoriteSound(sound.id) ? "#FF6B6B" : newUIColors.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
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
                <Text style={styles.emptyPresetsText}>No presets saved yet</Text>
                <Text style={styles.emptyPresetsHint}>
                  Configure your sounds and tap "Save Preset" to create one
                </Text>
              </View>
            ) : (
              <View style={styles.presetsList}>
                {displayedPresets.map((preset) => (
                  <SoundPresetCard
                    key={preset.id}
                    preset={preset}
                    onPress={() => handleEditPreset(preset)}
                    onFavoriteToggle={() => handleTogglePresetFavorite(preset.id)}
                    onDelete={() => handleDeletePreset(preset.id)}
                  />
                ))}
              </View>
            )}
          </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/home')}>
            <IconSymbol name="house.fill" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/session')}>
            <IconSymbol name="pause.fill" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="heart.fill" size={24} color={newUIColors.primary} />
            <Text style={[styles.navLabel, { color: newUIColors.primary }]}>Sounds</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Save Preset Modal */}
      <SavePresetModal
        visible={showSavePresetModal}
        onClose={() => {
          setShowSavePresetModal(false);
          setEditingPreset(null);
        }}
        onSave={handleSavePreset}
        initialSounds={editingPreset ? undefined : {
          ticking: { ...state.sounds.ticking },
          breathing: { ...state.sounds.breathing },
          nature: { ...state.sounds.nature },
        }}
        editingPreset={editingPreset ? {
          id: editingPreset.id,
          name: editingPreset.name,
          sounds: {
            ticking: editingPreset.ticking,
            breathing: editingPreset.breathing,
            nature: editingPreset.nature,
          }
        } : undefined}
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
  headerSpacer: {
    width: 40,
    height: 40,
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
    minWidth: 0, // Allow flex child to shrink below content size
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
    lineHeight: 20,
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
    alignItems: 'flex-start',
    gap: 10,
    flexShrink: 0,
    marginTop: 2,
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
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
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
  categoryHeaderActive: {
    borderColor: newUIColors.primary + '40',
    backgroundColor: newUIColors.primary + '08',
  },
  soundCatalog: {
    marginTop: 8,
    paddingLeft: 16,
    gap: 8,
  },
  catalogSoundCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: newUIColors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  catalogSoundCardActive: {
    borderColor: newUIColors.primary,
    backgroundColor: newUIColors.primary + '10',
  },
  catalogSoundImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  catalogSoundEmoji: {
    fontSize: 24,
  },
  catalogSoundInfo: {
    flex: 1,
    minWidth: 0, // Allow flex child to shrink below content size
  },
  catalogSoundTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 2,
  },
  catalogSoundDescription: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    lineHeight: 18,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(126, 200, 227, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 20,
  },
  emptyFavoritesText: {
    fontSize: 18,
    fontWeight: '600',
    color: newUIColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyFavoritesHint: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  paginationText: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    fontWeight: '500',
  },
  favoritesList: {
    gap: 12,
    marginBottom: 24,
  },
  favoriteSoundCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
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
  favoriteSoundImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  favoriteSoundEmoji: {
    fontSize: 32,
  },
  favoriteSoundInfo: {
    flex: 1,
    minWidth: 0,
  },
  favoriteSoundTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 4,
  },
  favoriteSoundDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  favoriteSoundCategory: {
    fontSize: 12,
    color: newUIColors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  favoriteSoundActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  favoritePresetWrapper: {
    position: 'relative',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: newUIColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationNumber: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: newUIColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  paginationNumberActive: {
    backgroundColor: newUIColors.primary,
    borderColor: newUIColors.primary,
  },
  paginationNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
  },
  paginationNumberTextActive: {
    color: '#FFFFFF',
  },
});

