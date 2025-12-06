import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';

const newUIColors = {
  background: '#E8F4F8', // Soft light blue
  card: '#FFFFFF',
  primary: '#7EC8E3', // Calm blue
  secondary: '#B8E0D2', // Soft teal
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  accent: '#A8D8EA',
};

export default function NewUIHome() {
  const router = useRouter();
  const { state } = useAppContext();
  const { user } = useAuth();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.name || state.user.name || 'there';
    
    if (hour < 12) {
      return `Good morning, ${name}`;
    } else if (hour < 18) {
      return `Good afternoon, ${name}`;
    } else {
      return `Good evening, ${name}`;
    }
  };

  const practices = [
    {
      id: 1,
      title: 'Calm Focus',
      description: 'Focus and calm your mind',
      duration: '20 min',
      image: '🌊',
      color: '#7EC8E3',
    },
    {
      id: 2,
      title: 'Mindful Minutes',
      description: 'Be present deeply for calm',
      duration: '20 min',
      image: '🧘',
      color: '#B8E0D2',
    },
    {
      id: 3,
      title: 'Breathe & Begin',
      description: 'Deep work session',
      duration: '25 min',
      image: '🍃',
      color: '#A8D8EA',
    },
    {
      id: 4,
      title: 'Still Mind',
      description: 'Focus your mind',
      duration: '30 min',
      image: '🌅',
      color: '#9ED9CC',
    },
  ];

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
            <Text style={styles.backText}>Go back to old UI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <IconSymbol name="person.circle" size={32} color={newUIColors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>How can I help you today?</Text>
          </View>

          {/* Category Pills */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.pillsContainer}
            contentContainerStyle={styles.pillsContent}
          >
            {['Daily Practice', 'Relaxation', 'Stress Relief', 'Mindfulness Relief'].map((category) => (
              <TouchableOpacity key={category} style={styles.pill}>
                <Text style={styles.pillText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Practice Cards */}
          <View style={styles.practicesSection}>
            {practices.map((practice) => (
              <TouchableOpacity 
                key={practice.id} 
                style={styles.practiceCard}
                onPress={() => router.push('/(new-ui)/session')}
              >
                <View style={[styles.practiceImage, { backgroundColor: practice.color }]}>
                  <Text style={styles.practiceEmoji}>{practice.image}</Text>
                </View>
                <View style={styles.practiceInfo}>
                  <Text style={styles.practiceTitle}>{practice.title}</Text>
                  <Text style={styles.practiceDescription}>{practice.description}</Text>
                  <Text style={styles.practiceDuration}>{practice.duration}</Text>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation Cards */}
          <View style={styles.navigationSection}>
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push('/(new-ui)/analytics')}
            >
              <IconSymbol name="chart.bar.fill" size={28} color={newUIColors.primary} />
              <Text style={styles.navCardTitle}>Analytics</Text>
              <Text style={styles.navCardDescription}>View your progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => router.push('/(new-ui)/sounds')}
            >
              <IconSymbol name="speaker.wave.3.fill" size={28} color={newUIColors.secondary} />
              <Text style={styles.navCardTitle}>Sounds</Text>
              <Text style={styles.navCardDescription}>Manage sound library</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="house.fill" size={24} color={newUIColors.primary} />
            <Text style={[styles.navLabel, { color: newUIColors.primary }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(new-ui)/session')}>
            <IconSymbol name="pause.fill" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <IconSymbol name="heart.fill" size={24} color={newUIColors.textSecondary} />
            <Text style={styles.navLabel}>Favorites</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 14,
    color: newUIColors.text,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  greetingSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: newUIColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: newUIColors.textSecondary,
    fontWeight: '400',
  },
  pillsContainer: {
    marginBottom: 24,
  },
  pillsContent: {
    gap: 12,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: newUIColors.card,
    borderRadius: 20,
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
  pillText: {
    fontSize: 14,
    color: newUIColors.text,
    fontWeight: '500',
  },
  practicesSection: {
    marginBottom: 24,
  },
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  practiceImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  practiceEmoji: {
    fontSize: 32,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 4,
  },
  practiceDescription: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 4,
  },
  practiceDuration: {
    fontSize: 12,
    color: newUIColors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: newUIColors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  navCard: {
    flex: 1,
    backgroundColor: newUIColors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
  navCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  navCardDescription: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    textAlign: 'center',
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});



