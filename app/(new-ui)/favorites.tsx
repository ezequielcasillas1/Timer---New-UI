import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import SoundPresetCard from '@/components/SoundPresetCard';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

export default function FavoritesScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [preJournalText, setPreJournalText] = useState('');
  const [showPreJournal, setShowPreJournal] = useState(false);

  const favoritePresets = state.soundPresets.filter((p) => p.isFavorite);

  const handleTogglePresetFavorite = (presetId: string) => {
    dispatch({ type: 'TOGGLE_PRESET_FAVORITE', payload: presetId });
  };

  const handleApplyPreset = (preset: typeof favoritePresets[0]) => {
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        ticking: preset.ticking,
        breathing: preset.breathing,
        nature: preset.nature,
      },
    });
    // Navigate to session page to use the preset
    router.push('/(new-ui)/session');
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

          <Text style={styles.headerTitle}>Journey</Text>

          <View style={styles.placeholderIcon} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pre-Journal Feature (Future Release Placeholder) */}
          <View style={styles.preJournalCard}>
            <TouchableOpacity
              style={styles.preJournalHeader}
              onPress={() => setShowPreJournal(!showPreJournal)}
            >
              <View style={styles.preJournalHeaderLeft}>
                <IconSymbol name="book.fill" size={20} color={newUIColors.primary} />
                <Text style={styles.preJournalTitle}>Pre-Journal</Text>
              </View>
              <IconSymbol
                name={showPreJournal ? "chevron.up" : "chevron.down"}
                size={20}
                color={newUIColors.textSecondary}
              />
            </TouchableOpacity>

            {showPreJournal && (
              <View style={styles.preJournalContent}>
                <Text style={styles.preJournalQuestion}>
                  What do you feel or expect from the Session experience?
                </Text>
                <TextInput
                  style={styles.preJournalInput}
                  placeholder="Share your thoughts, feelings, or expectations..."
                  placeholderTextColor={newUIColors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={preJournalText}
                  onChangeText={setPreJournalText}
                />
                <Text style={styles.preJournalHint}>
                  This feature is coming soon. Your journal entries will help personalize your session experience.
                </Text>
                <View style={styles.preJournalGuide}>
                  <Text style={styles.preJournalGuideTitle}>Documenting Experience Guide:</Text>
                  <Text style={styles.preJournalGuideText}>
                    • Note your current mood and energy level{'\n'}
                    • Set intentions for this session{'\n'}
                    • Record any concerns or goals{'\n'}
                    • Track what works best for you
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Favorite Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Sound Presets</Text>
            <Text style={styles.sectionDescription}>
              Your saved sound combinations with 3-tiered curl system
            </Text>

            {favoritePresets.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="heart"
                  size={64}
                  color={newUIColors.textSecondary + '60'}
                />
                <Text style={styles.emptyStateText}>No favorites yet</Text>
                <Text style={styles.emptyStateHint}>
                  Go to Sounds page and tap the heart icon on a preset to add it to favorites
                </Text>
                <TouchableOpacity
                  style={styles.goToSoundsButton}
                  onPress={() => router.push('/(new-ui)/sounds')}
                >
                  <Text style={styles.goToSoundsButtonText}>Go to Sounds</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.presetsList}>
                {favoritePresets.map((preset) => (
                  <SoundPresetCard
                    key={preset.id}
                    preset={preset}
                    onPress={() => handleApplyPreset(preset)}
                    onFavoriteToggle={() => handleTogglePresetFavorite(preset.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/home')}
          >
            <IconSymbol name="house.fill" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/session')}
          >
            <IconSymbol name="pause.fill" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="heart.fill" size={24} color={newUIColors.primary} />
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
  placeholderIcon: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Pre-Journal Card
  preJournalCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  preJournalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preJournalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preJournalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
  },
  preJournalContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  preJournalQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 12,
  },
  preJournalInput: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: newUIColors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  preJournalHint: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 18,
  },
  preJournalGuide: {
    backgroundColor: newUIColors.primary + '10',
    borderRadius: 12,
    padding: 16,
  },
  preJournalGuideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 8,
  },
  preJournalGuideText: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    lineHeight: 20,
  },
  // Section
  section: {
    marginBottom: 32,
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
  presetsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: newUIColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  goToSoundsButton: {
    backgroundColor: newUIColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goToSoundsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

