import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppContext } from '@/src/context/AppContext';
import { theme } from '@/constants/Theme';
import { useSoundStateRefresh } from '@/src/hooks/useSoundStateRefresh';

const newUIColors = theme;
const { width } = Dimensions.get('window');

export default function JourneyScreen() {
  const router = useRouter();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<'history' | 'insights' | 'loved'>('history');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai'; message: string }>>([]);
  const [showChatInput, setShowChatInput] = useState(false);

  // Refresh sound state on page load
  useSoundStateRefresh();

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    // Add user message
    setChatHistory([...chatHistory, { type: 'user', message: chatMessage }]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatMessage);
      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
    }, 1000);

    setChatMessage('');
  };

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      return "Based on your session history, I recommend:\n\n1. Consistent morning sessions (9-11 AM) show 30% higher completion rates\n2. Nature + Breathing sound combo yields best focus scores\n3. Try 45-minute sessions instead of 60-minute ones for sustained performance";
    } else if (lowerMessage.includes('streak') || lowerMessage.includes('consistent')) {
      return "Your current streak is " + state.progress.currentStreak + " days! To maintain consistency:\n\n• Set daily reminders at your peak focus time\n• Start with shorter 20-minute sessions\n• Use the Session Scheduler for automatic starts";
    } else if (lowerMessage.includes('sound') || lowerMessage.includes('preset')) {
      return "Your most effective sound combinations:\n\n1. Nature + Ticking (used in 8 sessions, 85% completion)\n2. Breathing only (used in 5 sessions, 90% completion)\n3. All layers combined (used in 3 sessions, 70% completion)\n\nTry the Breathing-only preset for deep focus work!";
    } else {
      return "I'm here to help you improve your work performance! I can provide insights on:\n\n• Best times for your focus sessions\n• Most effective sound combinations\n• Strategies to maintain streaks\n• Session duration optimization\n\nWhat would you like to know?";
    }
  };

  const getMostLovedPresets = () => {
    return state.soundPresets
      .filter(p => p.isFavorite)
      .slice(0, 5);
  };

  const getRecentSessions = () => {
    return state.history.slice(0, 10);
  };

  const getKeyInsights = () => {
    const totalSessions = state.progress.totalSessions;
    const avgSessionLength = totalSessions > 0 ? state.progress.totalTime / totalSessions : 0;
    const currentStreak = state.progress.currentStreak;
    const bestStreak = state.progress.bestStreak;

    return [
      {
        icon: 'chart.bar.fill',
        title: 'Total Sessions',
        value: totalSessions.toString(),
        trend: '+12% this week',
        color: newUIColors.primary,
      },
      {
        icon: 'clock.fill',
        title: 'Avg Session',
        value: Math.round(avgSessionLength) + 'm',
        trend: 'Optimal range',
        color: '#10B981',
      },
      {
        icon: 'flame.fill',
        title: 'Current Streak',
        value: currentStreak + ' days',
        trend: 'Best: ' + bestStreak + ' days',
        color: '#F59E0B',
      },
      {
        icon: 'star.fill',
        title: 'Focus Score',
        value: '87%',
        trend: '+5% vs last week',
        color: '#8B5CF6',
      },
    ];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Journey</Text>
            <Text style={styles.headerSubtitle}>Your Focus Performance</Text>
          </View>

          <TouchableOpacity
            style={styles.aiChatButton}
            onPress={() => setShowChatInput(!showChatInput)}
          >
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={22} color={newUIColors.primary} />
          </TouchableOpacity>
        </View>

        {/* AI Chat Tooltip */}
        {!showChatInput && chatHistory.length === 0 && (
          <View style={styles.chatTooltip}>
            <IconSymbol name="sparkles" size={16} color={newUIColors.primary} />
            <Text style={styles.chatTooltipText}>
              How may we help you improve better at work for better performance?
            </Text>
          </View>
        )}

        {/* AI Chat Interface */}
        {showChatInput && (
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <IconSymbol name="sparkles" size={20} color={newUIColors.primary} />
              <Text style={styles.chatHeaderText}>AI Performance Coach</Text>
              <TouchableOpacity onPress={() => setShowChatInput(false)}>
                <IconSymbol name="xmark.circle.fill" size={20} color={newUIColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
              {chatHistory.length === 0 ? (
                <View style={styles.chatWelcome}>
                  <Text style={styles.chatWelcomeText}>
                    👋 Hi! I'm your AI performance coach. Ask me anything about improving your focus sessions!
                  </Text>
                </View>
              ) : (
                chatHistory.map((msg, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.chatBubble,
                      msg.type === 'user' ? styles.chatBubbleUser : styles.chatBubbleAI,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatBubbleText,
                        msg.type === 'user' ? styles.chatBubbleTextUser : styles.chatBubbleTextAI,
                      ]}
                    >
                      {msg.message}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask about your performance..."
                placeholderTextColor={newUIColors.textSecondary}
                value={chatMessage}
                onChangeText={setChatMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !chatMessage.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!chatMessage.trim()}
              >
                <IconSymbol
                  name="arrow.up.circle.fill"
                  size={32}
                  color={chatMessage.trim() ? newUIColors.primary : newUIColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Key Insights Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.insightsScroll}
          contentContainerStyle={styles.insightsContainer}
        >
          {getKeyInsights().map((insight, idx) => (
            <View key={idx} style={styles.insightCard}>
              <View style={[styles.insightIconContainer, { backgroundColor: insight.color + '20' }]}>
                <IconSymbol name={insight.icon} size={24} color={insight.color} />
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightValue}>{insight.value}</Text>
              <Text style={styles.insightTrend}>{insight.trend}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <IconSymbol
              name="clock.arrow.circlepath"
              size={20}
              color={activeTab === 'history' ? newUIColors.primary : newUIColors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.tabTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'insights' && styles.tabActive]}
            onPress={() => setActiveTab('insights')}
          >
            <IconSymbol
              name="chart.line.uptrend.xyaxis"
              size={20}
              color={activeTab === 'insights' ? newUIColors.primary : newUIColors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'insights' && styles.tabTextActive,
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'loved' && styles.tabActive]}
            onPress={() => setActiveTab('loved')}
          >
            <IconSymbol
              name="heart.fill"
              size={20}
              color={activeTab === 'loved' ? newUIColors.primary : newUIColors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'loved' && styles.tabTextActive,
              ]}
            >
              Most Loved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'history' && (
            <View>
              <Text style={styles.sectionTitle}>Session History</Text>
              <Text style={styles.sectionDescription}>
                Your recent focus sessions and performance logs
              </Text>

              {getRecentSessions().length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol name="clock.badge.questionmark" size={64} color={newUIColors.textSecondary + '60'} />
                  <Text style={styles.emptyStateText}>No sessions yet</Text>
                  <Text style={styles.emptyStateHint}>Complete your first session to see history</Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {getRecentSessions().map((session, idx) => (
                    <View key={idx} style={styles.historyCard}>
                      <View style={styles.historyCardHeader}>
                        <View style={[styles.historyIcon, { backgroundColor: newUIColors.primary + '20' }]}>
                          <IconSymbol name="timer" size={20} color={newUIColors.primary} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.historyTitle} numberOfLines={1}>
                            {session.mode === 'speed' ? 'Speed Session' : 'Locked Session'}
                          </Text>
                          <Text style={styles.historyDate} numberOfLines={1}>
                            {new Date(session.startTime ?? session.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <View style={styles.historyBadge}>
                          <Text style={styles.historyDuration}>
                            {Math.round(((session.actualDuration ?? session.duration) / 60))}m
                          </Text>
                        </View>
                      </View>

                      {session.notes && (
                        <Text style={styles.historyNotes} numberOfLines={2}>
                          {session.notes}
                        </Text>
                      )}

                      <View style={styles.historyFooter}>
                        {session.efficiency && (
                          <View style={styles.historyMetric}>
                            <IconSymbol name="chart.bar.fill" size={14} color={newUIColors.textSecondary} />
                            <Text style={styles.historyMetricText}>{session.efficiency}% efficiency</Text>
                          </View>
                        )}
                        {session.mood != null && (
                          <View style={styles.historyMetric}>
                            <Text style={styles.historyMetricText}>{getMoodEmoji(session.mood)}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'insights' && (
            <View>
              <Text style={styles.sectionTitle}>Performance Insights</Text>
              <Text style={styles.sectionDescription}>
                AI-analyzed patterns and recommendations
              </Text>

              <View style={styles.insightsList}>
                <View style={styles.insightDetailCard}>
                  <View style={styles.insightDetailHeader}>
                    <IconSymbol name="brain.head.profile" size={24} color="#8B5CF6" />
                    <Text style={styles.insightDetailTitle} numberOfLines={1}>Best Focus Time</Text>
                  </View>
                  <Text style={styles.insightDetailText}>
                    Your peak productivity occurs between <Text style={styles.highlight}>9 AM - 11 AM</Text>.
                    Sessions during this window have 35% higher completion rates.
                  </Text>
                </View>

                <View style={styles.insightDetailCard}>
                  <View style={styles.insightDetailHeader}>
                    <IconSymbol name="speaker.wave.3.fill" size={24} color="#10B981" />
                    <Text style={styles.insightDetailTitle} numberOfLines={1}>Optimal Sound Mix</Text>
                  </View>
                  <Text style={styles.insightDetailText}>
                    <Text style={styles.highlight}>Nature + Breathing</Text> combination shows the best results
                    with 90% focus retention. Try this preset for deep work.
                  </Text>
                </View>

                <View style={styles.insightDetailCard}>
                  <View style={styles.insightDetailHeader}>
                    <IconSymbol name="target" size={24} color="#F59E0B" />
                    <Text style={styles.insightDetailTitle} numberOfLines={1}>Session Duration</Text>
                  </View>
                  <Text style={styles.insightDetailText}>
                    Your sweet spot is <Text style={styles.highlight}>45 minutes</Text>. Sessions longer than
                    60 minutes show 40% drop in focus quality. Take breaks!
                  </Text>
                </View>

                <View style={styles.insightDetailCard}>
                  <View style={styles.insightDetailHeader}>
                    <IconSymbol name="calendar.badge.checkmark" size={24} color="#EC4899" />
                    <Text style={styles.insightDetailTitle} numberOfLines={1}>Consistency Pattern</Text>
                  </View>
                  <Text style={styles.insightDetailText}>
                    You perform best with <Text style={styles.highlight}>daily morning sessions</Text>.
                    Consider using the Session Scheduler to automate your routine.
                  </Text>
                </View>

                {/* Follow-up Notes Section */}
                {state.followUpNotes && state.followUpNotes.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
                      Your Follow-up Notes
                    </Text>
                    {state.followUpNotes.slice(0, 5).map((note) => (
                      <View key={note.id} style={styles.followUpNoteCard}>
                        <View style={styles.followUpNoteHeader}>
                          <IconSymbol name="note.text" size={20} color={newUIColors.primary} />
                          <Text style={styles.followUpNoteDate}>
                            {new Date(note.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.followUpNoteText}>{note.note}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          )}

          {activeTab === 'loved' && (
            <View>
              <Text style={styles.sectionTitle}>Most Loved</Text>
              <Text style={styles.sectionDescription}>
                Your favorite presets and frequently used configurations
              </Text>

              {getMostLovedPresets().length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol name="heart" size={64} color={newUIColors.textSecondary + '60'} />
                  <Text style={styles.emptyStateText}>No favorites yet</Text>
                  <Text style={styles.emptyStateHint}>
                    Mark presets as favorites to see them here
                  </Text>
                </View>
              ) : (
                <View style={styles.lovedList}>
                  {getMostLovedPresets().map((preset, idx) => (
                    <View key={preset.id} style={styles.lovedCard}>
                      <View style={styles.lovedCardHeader}>
                        <View style={[styles.lovedIcon, { backgroundColor: newUIColors.primary + '20' }]}>
                          <IconSymbol name="heart.fill" size={20} color={newUIColors.primary} />
                        </View>
                        <Text style={styles.lovedTitle} numberOfLines={1}>{preset.name}</Text>
                        <View style={styles.lovedBadge}>
                          <Text style={styles.lovedBadgeText}>#{idx + 1}</Text>
                        </View>
                      </View>
                      <Text style={styles.lovedDescription} numberOfLines={1}>
                        Used in {Math.floor(Math.random() * 20) + 5} sessions
                      </Text>
                      <View style={styles.lovedStats}>
                        <View style={styles.lovedStat}>
                          <Text style={styles.lovedStatValue}>
                            {Math.floor(Math.random() * 20) + 80}%
                          </Text>
                          <Text style={styles.lovedStatLabel}>Success Rate</Text>
                        </View>
                        <View style={styles.lovedStat}>
                          <Text style={styles.lovedStatValue}>
                            {Math.floor(Math.random() * 30) + 30}m
                          </Text>
                          <Text style={styles.lovedStatLabel}>Avg Duration</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/home')}
          >
            <IconSymbol name="house" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(new-ui)/session')}
          >
            <IconSymbol name="pause" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="chart.line.uptrend.xyaxis.fill" size={24} color={newUIColors.primary} />
            <Text style={[styles.navLabel, { color: newUIColors.primary }]}>Journey</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function getMoodEmoji(mood: number): string {
  const moods = ['😕', '😐', '🙂', '😌', '😄', '🤩'];
  return moods[mood - 1] || '🙂';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newUIColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: newUIColors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginTop: 2,
  },
  aiChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: newUIColors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chatTooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: newUIColors.primary + '15',
    borderWidth: 1,
    borderColor: newUIColors.primary + '30',
  },
  chatTooltipText: {
    flex: 1,
    minWidth: 0, // Allow flex child to shrink below content size
    fontSize: 13,
    color: newUIColors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  chatContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    maxHeight: 400,
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
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: newUIColors.textSecondary + '15',
  },
  chatHeaderText: {
    flex: 1,
    minWidth: 0, // Allow flex child to shrink below content size
    fontSize: 15,
    fontWeight: '600',
    color: newUIColors.text,
  },
  chatMessages: {
    maxHeight: 250,
    padding: 12,
  },
  chatWelcome: {
    padding: 16,
    backgroundColor: newUIColors.background,
    borderRadius: 12,
  },
  chatWelcomeText: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    lineHeight: 20,
  },
  chatBubble: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: newUIColors.primary,
  },
  chatBubbleAI: {
    alignSelf: 'flex-start',
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatBubbleTextUser: {
    color: '#FFFFFF',
  },
  chatBubbleTextAI: {
    color: newUIColors.text,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: newUIColors.textSecondary + '15',
  },
  chatInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '25',
    color: newUIColors.text,
    fontSize: 14,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  insightsScroll: {
    marginBottom: 16,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  insightCard: {
    width: width * 0.4,
    padding: 16,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
  },
  insightTrend: {
    fontSize: 11,
    color: newUIColors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
  },
  tabActive: {
    backgroundColor: newUIColors.primary + '15',
    borderColor: newUIColors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: newUIColors.textSecondary,
  },
  tabTextActive: {
    color: newUIColors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  historyList: {
    gap: 12,
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  historyDate: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: newUIColors.primary + '20',
  },
  historyDuration: {
    fontSize: 13,
    fontWeight: '600',
    color: newUIColors.primary,
  },
  historyNotes: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  historyFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  historyMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyMetricText: {
    fontSize: 13,
    color: newUIColors.textSecondary,
  },
  insightsList: {
    gap: 16,
  },
  insightDetailCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  insightDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightDetailTitle: {
    flex: 1,
    minWidth: 0, // Allow flex child to shrink below content size
    fontSize: 17,
    fontWeight: '700',
    color: newUIColors.text,
  },
  insightDetailText: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '700',
    color: newUIColors.text,
  },
  lovedList: {
    gap: 12,
  },
  lovedCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.textSecondary + '20',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lovedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  lovedIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lovedTitle: {
    flex: 1,
    minWidth: 0, // Allow flex child to shrink below content size
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  lovedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: newUIColors.primary + '20',
  },
  lovedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: newUIColors.primary,
  },
  lovedDescription: {
    fontSize: 13,
    color: newUIColors.textSecondary,
    marginBottom: 12,
  },
  lovedStats: {
    flexDirection: 'row',
    gap: 24,
  },
  lovedStat: {
    gap: 4,
  },
  lovedStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: newUIColors.text,
  },
  lovedStatLabel: {
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: newUIColors.textSecondary + '20',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    color: newUIColors.textSecondary,
    fontWeight: '600',
  },
  followUpNoteCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: newUIColors.card,
    borderWidth: 1,
    borderColor: newUIColors.primary + '30',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: newUIColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  followUpNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  followUpNoteDate: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    fontWeight: '600',
  },
  followUpNoteText: {
    fontSize: 14,
    color: newUIColors.text,
    lineHeight: 20,
  },
});

