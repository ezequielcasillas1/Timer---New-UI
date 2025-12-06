
import { supabase } from '@/app/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: string;
  user_id: string;
  mode: 'speed' | 'locked';
  target_duration: number;
  actual_duration: number | null;
  speed_multiplier: number | null;
  time_slot_multiplier: number | null;
  efficiency_score: number | null;
  efficiency_notes: string | null;
  mood_rating: number | null;
  feedback_text: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  sounds_master: boolean | null;
  sounds_haptics: boolean | null;
  sounds_ticking: boolean | null;
  sounds_breathing: boolean | null;
  sounds_nature: boolean | null;
  sound_ticking_type: string | null;
  sound_breathing_type: string | null;
  sound_nature_type: string | null;
  speed_multiplier: number | null;
  time_slot_multiplier: number | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  totalSessions: number;
  totalTime: number; // in minutes
  averageSessionLength: number; // in minutes
  currentStreak: number;
  bestStreak: number;
  weeklyProgress: number[]; // 7 days, 1 if session exists that day, 0 otherwise
  monthlyProgress: number[]; // 30 days, in minutes
  averageEfficiency: number;
  averageMood: number;
  completionRate: number; // percentage of sessions completed vs started
  modePreference: { speed: number; locked: number }; // percentage split
}

class DataService {
  // Profile Management
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  async createProfile(userId: string, name: string, email: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            name: name,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  }

  // Session Management
  async createSession(userId: string, sessionData: {
    mode: 'speed' | 'locked';
    target_duration: number;
    speed_multiplier?: number;
    time_slot_multiplier?: number;
  }): Promise<SessionRecord | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            user_id: userId,
            mode: sessionData.mode,
            target_duration: sessionData.target_duration,
            speed_multiplier: sessionData.speed_multiplier || 1.0,
            time_slot_multiplier: sessionData.time_slot_multiplier || 1,
            started_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  }

  async completeSession(sessionId: string, completionData: {
    actual_duration: number;
    efficiency_score?: number;
    efficiency_notes?: string;
    mood_rating?: number;
    feedback_text?: string;
  }): Promise<SessionRecord | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          actual_duration: completionData.actual_duration,
          efficiency_score: completionData.efficiency_score,
          efficiency_notes: completionData.efficiency_notes,
          mood_rating: completionData.mood_rating,
          feedback_text: completionData.feedback_text,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error completing session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in completeSession:', error);
      return null;
    }
  }

  async getUserSessions(userId: string, limit?: number): Promise<SessionRecord[]> {
    try {
      let query = supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSessions:', error);
      return [];
    }
  }

  // Settings Management
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          return await this.createDefaultSettings(userId);
        }
        console.error('Error fetching user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return null;
    }
  }

  async createDefaultSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: userId,
            sounds_master: true,
            sounds_haptics: true,
            sounds_ticking: false,
            sounds_breathing: false,
            sounds_nature: false,
            sound_ticking_type: 'ticking-classic-clock',
            sound_breathing_type: 'breathing-deep-calm',
            sound_nature_type: 'nature-gentle-rain',
            speed_multiplier: 1.0,
            time_slot_multiplier: 1,
            theme: 'auto',
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      return null;
    }
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return null;
    }
  }

  // Analytics and Metrics
  async getSessionAnalytics(userId: string): Promise<SessionAnalytics> {
    try {
      const sessions = await this.getUserSessions(userId);
      // Filter completed sessions that are >= 30 minutes (1800 seconds)
      const completedSessions = sessions.filter(s => 
        s.completed_at !== null && 
        s.actual_duration !== null && 
        s.actual_duration >= 1800
      );
      
      // Calculate basic metrics
      const totalSessions = completedSessions.length;
      const totalTimeSeconds = completedSessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
      const totalTime = Math.round(totalTimeSeconds / 60); // Convert to minutes
      
      const averageSessionLength = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;
      
      // Calculate streaks
      const { currentStreak, bestStreak } = this.calculateStreaks(completedSessions);
      
      // Calculate weekly progress (last 7 days)
      const weeklyProgress = this.calculateWeeklyProgress(completedSessions);
      
      // Calculate monthly progress (last 30 days)
      const monthlyProgress = this.calculateMonthlyProgress(completedSessions);
      
      // Calculate averages
      const efficiencyScores = completedSessions
        .map(s => s.efficiency_score)
        .filter(score => score !== null) as number[];
      const averageEfficiency = efficiencyScores.length > 0 
        ? Math.round(efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length)
        : 0;
      
      const moodRatings = completedSessions
        .map(s => s.mood_rating)
        .filter(mood => mood !== null) as number[];
      const averageMood = moodRatings.length > 0
        ? Math.round((moodRatings.reduce((sum, mood) => sum + mood, 0) / moodRatings.length) * 10) / 10
        : 0;
      
      // Calculate completion rate
      const completionRate = sessions.length > 0 
        ? Math.round((completedSessions.length / sessions.length) * 100)
        : 100;
      
      // Calculate mode preference
      const speedSessions = completedSessions.filter(s => s.mode === 'speed').length;
      const lockedSessions = completedSessions.filter(s => s.mode === 'locked').length;
      const modePreference = {
        speed: totalSessions > 0 ? Math.round((speedSessions / totalSessions) * 100) : 50,
        locked: totalSessions > 0 ? Math.round((lockedSessions / totalSessions) * 100) : 50,
      };

      return {
        totalSessions,
        totalTime,
        averageSessionLength,
        currentStreak,
        bestStreak,
        weeklyProgress,
        monthlyProgress,
        averageEfficiency,
        averageMood,
        completionRate,
        modePreference,
      };
    } catch (error) {
      console.error('Error in getSessionAnalytics:', error);
      return {
        totalSessions: 0,
        totalTime: 0,
        averageSessionLength: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
        monthlyProgress: Array(30).fill(0),
        averageEfficiency: 0,
        averageMood: 0,
        completionRate: 100,
        modePreference: { speed: 50, locked: 50 },
      };
    }
  }

  private calculateStreaks(sessions: SessionRecord[]): { currentStreak: number; bestStreak: number } {
    if (sessions.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    // Sort sessions by date (most recent first)
    const sortedSessions = sessions
      .filter(s => s.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Group sessions by date
    const sessionsByDate = new Map<string, SessionRecord[]>();
    sortedSessions.forEach(session => {
      const date = new Date(session.completed_at!);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, []);
      }
      sessionsByDate.get(dateKey)!.push(session);
    });

    // Calculate current streak
    let checkDate = new Date(today);
    let maxIterations = 365; // Prevent infinite loop
    while (maxIterations > 0) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (sessionsByDate.has(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      maxIterations--;
    }

    // Calculate best streak
    const allDates = Array.from(sessionsByDate.keys()).sort().reverse();
    for (let i = 0; i < allDates.length; i++) {
      tempStreak = 1;
      
      for (let j = i + 1; j < allDates.length; j++) {
        const currentDate = new Date(allDates[j]);
        const previousDate = new Date(allDates[j - 1]);
        const dayDiff = Math.abs(currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          break;
        }
      }
      
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    return { currentStreak, bestStreak };
  }

  private calculateWeeklyProgress(sessions: SessionRecord[]): number[] {
    const weeklyProgress = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday (session count per day)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentSessions = sessions.filter(session => 
      session.completed_at && new Date(session.completed_at) >= oneWeekAgo
    );

    // Count actual sessions per day (not binary)
    recentSessions.forEach(session => {
      if (session.completed_at && session.actual_duration) {
        const sessionDate = new Date(session.completed_at);
        const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 6 = Saturday
        weeklyProgress[dayOfWeek]++; // Increment session count for that day
      }
    });

    return weeklyProgress;
  }

  private calculateMonthlyProgress(sessions: SessionRecord[]): number[] {
    const monthlyProgress = Array(30).fill(0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = sessions.filter(session => 
      session.completed_at && new Date(session.completed_at) >= thirtyDaysAgo
    );

    recentSessions.forEach(session => {
      if (session.completed_at && session.actual_duration) {
        const sessionDate = new Date(session.completed_at);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < 30) {
          const index = 29 - daysDiff; // Most recent day at index 29
          monthlyProgress[index] += Math.round(session.actual_duration / 60); // Convert to minutes
        }
      }
    });

    return monthlyProgress;
  }

  // Initialize user data with sample sessions for demo purposes
  async initializeUserWithSampleData(userId: string): Promise<void> {
    try {
      console.log('Initializing user with sample data...');
      
      // Check if user already has sessions
      const existingSessions = await this.getUserSessions(userId, 1);
      if (existingSessions.length > 0) {
        console.log('User already has session data, skipping initialization');
        return;
      }

      // Create sample sessions over the past 2 weeks
      const sampleSessions = this.generateSampleSessions(userId);
      
      for (const sessionData of sampleSessions) {
        const { data, error } = await supabase
          .from('sessions')
          .insert([sessionData]);

        if (error) {
          console.error('Error creating sample session:', error);
        }
      }

      console.log(`Created ${sampleSessions.length} sample sessions for user`);
    } catch (error) {
      console.error('Error in initializeUserWithSampleData:', error);
    }
  }

  private generateSampleSessions(userId: string): any[] {
    const sessions = [];
    const now = new Date();
    
    // Generate sessions for the past 14 days
    for (let i = 0; i < 14; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() - i);
      
      // Skip some days to make it realistic (not every day)
      if (Math.random() > 0.3) continue;
      
      // 1-3 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const startTime = new Date(sessionDate);
        startTime.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        
        const mode = Math.random() > 0.5 ? 'speed' : 'locked';
        const targetDuration = [15, 25, 30, 45][Math.floor(Math.random() * 4)];
        const actualDuration = targetDuration * 60 + (Math.random() - 0.5) * 300; // ±2.5 minutes variation
        const efficiencyScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
        const moodRating = Math.floor(Math.random() * 3) + 3; // 3-5 range (mostly positive)
        
        const endTime = new Date(startTime);
        endTime.setSeconds(endTime.getSeconds() + actualDuration);
        
        sessions.push({
          user_id: userId,
          mode,
          target_duration: targetDuration,
          actual_duration: Math.round(actualDuration),
          speed_multiplier: mode === 'speed' ? 1.0 + Math.random() * 2 : 1.0,
          time_slot_multiplier: Math.floor(Math.random() * 3) + 1,
          efficiency_score: efficiencyScore,
          efficiency_notes: this.getRandomEfficiencyNote(efficiencyScore),
          mood_rating: moodRating,
          feedback_text: this.getRandomFeedback(moodRating),
          started_at: startTime.toISOString(),
          completed_at: endTime.toISOString(),
          created_at: startTime.toISOString(),
          updated_at: endTime.toISOString(),
        });
      }
    }
    
    return sessions.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
  }

  private getRandomEfficiencyNote(score: number): string {
    if (score >= 90) {
      return ['Excellent focus throughout', 'Very productive session', 'Maintained deep concentration'][Math.floor(Math.random() * 3)];
    } else if (score >= 75) {
      return ['Good focus with minor distractions', 'Solid session overall', 'Stayed on track most of the time'][Math.floor(Math.random() * 3)];
    } else if (score >= 60) {
      return ['Some distractions but recovered well', 'Average focus session', 'Room for improvement'][Math.floor(Math.random() * 3)];
    } else {
      return ['Many distractions today', 'Struggled to maintain focus', 'Need to adjust environment'][Math.floor(Math.random() * 3)];
    }
  }

  private getRandomFeedback(mood: number): string {
    if (mood >= 4) {
      return ['Feeling great and productive!', 'Really enjoyed this session', 'Perfect timing for focus work'][Math.floor(Math.random() * 3)];
    } else if (mood >= 3) {
      return ['Decent session, feeling okay', 'Not bad, could be better', 'Average energy today'][Math.floor(Math.random() * 3)];
    } else {
      return ['Feeling a bit tired today', 'Hard to concentrate', 'Maybe need a break'][Math.floor(Math.random() * 3)];
    }
  }
}

export const dataService = new DataService();
