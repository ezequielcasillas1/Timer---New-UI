import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import SoundPresetCard from '@/components/SoundPresetCard';
import { Modal, TextInput } from 'react-native';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

const { width } = Dimensions.get('window');

interface ScheduledSession {
  id: string;
  title: string;
  day: string;
  time: string;
  location: string;
  presetId?: string;
  isEnabled: boolean;
}

export default function SchedulerScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([
    {
      id: '1',
      title: 'Morning Focus',
      day: 'Mon',
      time: '9:00 AM',
      location: '@Amazon',
      presetId: undefined,
      isEnabled: true,
    },
    {
      id: '2',
      title: 'Afternoon Break',
      day: 'Wed',
      time: '2:00 PM',
      location: '@Home',
      presetId: undefined,
      isEnabled: false,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState<Partial<ScheduledSession>>({
    title: '',
    day: 'Mon',
    time: '9:00 AM',
    location: '@Home',
    isEnabled: true,
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get favorite presets for automatic sound selection
  const favoritePresets = state.soundPresets.filter((p) => p.isFavorite);

  const handleToggleSession = (sessionId: string) => {
    setScheduledSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, isEnabled: !session.isEnabled }
          : session
      )
    );
  };

  const handleSelectPreset = (sessionId: string, presetId: string) => {
    setScheduledSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, presetId } : session
      )
    );
  };

  const handleAddSession = () => {
    setNewSession({
      title: '',
      day: 'Mon',
      time: '9:00 AM',
      location: '@Home',
      isEnabled: true,
      presetId: favoritePresets[0]?.id,
    });
    setShowAddModal(true);
  };

  const handleSaveSession = () => {
    if (!newSession.title) {
      setShowAddModal(false);
      return;
    }
    const session: ScheduledSession = {
      id: Date.now().toString(),
      title: newSession.title || 'Scheduled Session',
      day: newSession.day || 'Mon',
      time: newSession.time || '9:00 AM',
      location: newSession.location || '@Home',
      presetId: newSession.presetId,
      isEnabled: newSession.isEnabled ?? true,
    };
    setScheduledSessions((prev) => [...prev, session]);
    setShowAddModal(false);
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

          <Text style={styles.headerTitle}>Session Scheduler</Text>

          <TouchableOpacity onPress={handleAddSession}>
            <IconSymbol name="plus" size={24} color={newUIColors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              Automate your sessions with scheduled start times. Sessions will automatically start with your selected sound presets.
            </Text>
          </View>

          {/* Date Chart Visualization */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <View style={styles.calendarGrid}>
              {days.map((day) => {
                const daySessions = scheduledSessions.filter(
                  (s) => s.day === day && s.isEnabled
                );
                return (
                  <View key={day} style={styles.calendarDay}>
                    <Text style={styles.calendarDayLabel}>{day}</Text>
                    <View style={styles.calendarDaySessions}>
                      {daySessions.map((session) => (
                        <View
                          key={session.id}
                          style={[
                            styles.calendarSessionDot,
                            { backgroundColor: newUIColors.primary },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Scheduled Sessions List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled Sessions</Text>
            <Text style={styles.sectionDescription}>
              Sessions will automatically start at the specified time with selected sound presets
            </Text>

            {scheduledSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="calendar.badge.plus"
                  size={64}
                  color={newUIColors.textSecondary + '60'}
                />
                <Text style={styles.emptyStateText}>No scheduled sessions</Text>
                <Text style={styles.emptyStateHint}>
                  Tap the + icon to add a new scheduled session
                </Text>
              </View>
            ) : (
              <View style={styles.sessionsList}>
                {scheduledSessions.map((session) => {
                  const selectedPreset = session.presetId
                    ? state.soundPresets.find((p) => p.id === session.presetId)
                    : null;

                  return (
                    <View key={session.id} style={styles.sessionCard}>
                      <View style={styles.sessionCardHeader}>
                        <View style={styles.sessionCardInfo}>
                          <Text style={styles.sessionCardTitle}>
                            {session.title}
                          </Text>
                          <View style={styles.sessionCardMeta}>
                            <IconSymbol
                              name="calendar"
                              size={14}
                              color={newUIColors.textSecondary}
                            />
                            <Text style={styles.sessionCardMetaText}>
                              {session.day} {session.time}
                            </Text>
                            <IconSymbol
                              name="mappin.circle"
                              size={14}
                              color={newUIColors.textSecondary}
                            />
                            <Text style={styles.sessionCardMetaText}>
                              {session.location}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.toggleSwitch,
                            session.isEnabled && styles.toggleSwitchActive,
                          ]}
                          onPress={() => handleToggleSession(session.id)}
                        >
                          <View
                            style={[
                              styles.toggleSwitchCircle,
                              session.isEnabled && styles.toggleSwitchCircleActive,
                            ]}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Automatic Sound Selection */}
                      <View style={styles.presetSelection}>
                        <Text style={styles.presetSelectionLabel}>
                          Automatic Sound Preset:
                        </Text>
                        {selectedPreset ? (
                          <View style={styles.selectedPresetContainer}>
                            <SoundPresetCard
                              preset={selectedPreset}
                              onPress={() => {}}
                              onFavoriteToggle={() => {}}
                            />
                            <TouchableOpacity
                              style={styles.changePresetButton}
                              onPress={() => handleSelectPreset(session.id, '')}
                            >
                              <Text style={styles.changePresetButtonText}>
                                Change
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.presetSelector}>
                            {favoritePresets.length > 0 ? (
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.presetSelectorScroll}
                              >
                                {favoritePresets.map((preset) => (
                                  <TouchableOpacity
                                    key={preset.id}
                                    style={styles.presetOption}
                                    onPress={() =>
                                      handleSelectPreset(session.id, preset.id)
                                    }
                                  >
                                    <SoundPresetCard
                                      preset={preset}
                                      onPress={() =>
                                        handleSelectPreset(session.id, preset.id)
                                      }
                                      onFavoriteToggle={() => {}}
                                    />
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            ) : (
                              <View style={styles.noPresetsMessage}>
                                <Text style={styles.noPresetsText}>
                                  No favorite presets available. Go to Sounds page to create and favorite presets.
                                </Text>
                                <TouchableOpacity
                                  style={styles.goToSoundsButton}
                                  onPress={() =>
                                    router.push('/(new-ui)/sounds')
                                  }
                                >
                                  <Text style={styles.goToSoundsButtonText}>
                                    Go to Sounds
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add session modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Scheduled Session</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <IconSymbol name="xmark" size={22} color={newUIColors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Morning Focus"
                placeholderTextColor={newUIColors.textSecondary}
                value={newSession.title}
                onChangeText={(text) => setNewSession((prev) => ({ ...prev, title: text }))}
              />

              <Text style={styles.modalLabel}>Day & Time</Text>
              <View style={styles.modalRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayChip,
                        newSession.day === day && styles.dayChipActive,
                      ]}
                      onPress={() => setNewSession((prev) => ({ ...prev, day }))}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          newSession.day === day && styles.dayChipTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginLeft: 10 }]}
                  placeholder="9:00 AM"
                  placeholderTextColor={newUIColors.textSecondary}
                  value={newSession.time}
                  onChangeText={(text) => setNewSession((prev) => ({ ...prev, time: text }))}
                />
              </View>

              <Text style={styles.modalLabel}>Location</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="@Office"
                placeholderTextColor={newUIColors.textSecondary}
                value={newSession.location}
                onChangeText={(text) => setNewSession((prev) => ({ ...prev, location: text }))}
              />

              <Text style={styles.modalLabel}>Automatic Sound Preset</Text>
              {favoritePresets.length === 0 ? (
                <View style={styles.noPresetsMessage}>
                  <Text style={styles.noPresetsText}>
                    No favorite presets yet. Go to Sounds and tap the heart to favorite one.
                  </Text>
                  <TouchableOpacity
                    style={styles.goToSoundsButton}
                    onPress={() => {
                      setShowAddModal(false);
                      router.push('/(new-ui)/sounds');
                    }}
                  >
                    <Text style={styles.goToSoundsButtonText}>Go to Sounds</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.modalPresetScroll}
                >
                  {favoritePresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.modalPresetCard,
                        newSession.presetId === preset.id && styles.modalPresetCardActive,
                      ]}
                      onPress={() => setNewSession((prev) => ({ ...prev, presetId: preset.id }))}
                    >
                      <SoundPresetCard
                        preset={preset}
                        onPress={() => setNewSession((prev) => ({ ...prev, presetId: preset.id }))}
                        onFavoriteToggle={() => {}}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveSession}
              >
                <IconSymbol name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/home')}
          >
            <IconSymbol name="house" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/session')}
          >
            <IconSymbol name="pause" size={24} color={newUIColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/favorites')}
          >
            <IconSymbol name="heart.fill" size={24} color={newUIColors.textSecondary} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  descriptionCard: {
    backgroundColor: newUIColors.primary + '20',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: newUIColors.primary + '40',
  },
  descriptionText: {
    fontSize: 14,
    color: newUIColors.text,
    lineHeight: 20,
  },
  chartCard: {
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
    lineHeight: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
  },
  calendarDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: newUIColors.textSecondary,
    marginBottom: 8,
  },
  calendarDaySessions: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarSessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
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
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionCardInfo: {
    flex: 1,
  },
  sessionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 8,
  },
  sessionCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sessionCardMetaText: {
    fontSize: 14,
    color: newUIColors.textSecondary,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: newUIColors.background,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: newUIColors.primary,
  },
  toggleSwitchCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleSwitchCircleActive: {
    alignSelf: 'flex-end',
  },
  presetSelection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  presetSelectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 12,
  },
  selectedPresetContainer: {
    gap: 12,
  },
  changePresetButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: newUIColors.background,
  },
  changePresetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.primary,
  },
  presetSelector: {
    marginTop: 8,
  },
  presetSelectorScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  presetOption: {
    marginRight: 12,
    width: width * 0.7,
  },
  noPresetsMessage: {
    padding: 20,
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    alignItems: 'center',
  },
  noPresetsText: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  goToSoundsButton: {
    backgroundColor: newUIColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goToSoundsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: newUIColors.card,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: newUIColors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '25',
    padding: 12,
    color: newUIColors.text,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '30',
    marginRight: 8,
    backgroundColor: newUIColors.background,
  },
  dayChipActive: {
    borderColor: newUIColors.primary,
    backgroundColor: newUIColors.primary + '18',
  },
  dayChipText: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: newUIColors.primary,
  },
  modalPresetScroll: {
    marginVertical: 10,
  },
  modalPresetCard: {
    width: width * 0.65,
    marginRight: 12,
  },
  modalPresetCardActive: {
    borderWidth: 1,
    borderColor: newUIColors.primary,
    borderRadius: 14,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: newUIColors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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

