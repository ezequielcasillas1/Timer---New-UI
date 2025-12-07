
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { ClockStyle } from '@/src/services/ClockService';
import { useAuth } from './AuthContext';
import { dataService, SessionAnalytics } from '@/src/services/DataService';

// Types
export interface User {
  name: string;
  email: string;
}

export interface Session {
  isActive: boolean;
  mode: 'speed' | 'locked';
  speedSetting: number;
  timeSlotMultiplier: 1 | 2 | 3;
  timeSlotDuration: 15 | 30 | 50 | 60;
  slotEveryMinutes: number;
  targetDuration: number;
  clockStyle: ClockStyle;
  startTime?: Date;
  endTime?: Date;
  actualDuration: number;
  efficiency: {
    score: number;
    notes: string;
    suggestions: string[];
  };
  supabaseSessionId?: string; // Track Supabase session ID
  timeSlotEnabled: boolean; // Toggle for Time Slot Duration feature
  speedMultiplierEnabled: boolean; // Toggle for Time Speed Multiplier feature
}

export interface Clock {
  manipulatedTime: Date;
  speedMultiplier: number;
}

export interface Sounds {
  master: boolean;
  haptics: boolean;
  ticking: {
    enabled: boolean;
    selectedSound: string;
    volume: number; // 0.0 to 1.0
  };
  breathing: {
    enabled: boolean;
    selectedSound: string;
    volume: number; // 0.0 to 1.0
  };
  nature: {
    enabled: boolean;
    selectedSound: string;
    volume: number; // 0.0 to 1.0
  };
}

export interface Progress {
  totalSessions: number;
  totalTime: number;
  currentStreak: number;
  weeklyProgress: number[];
  averageRating: number;
  bestStreak: number;
  lastSessionDate?: string; // ISO date string (yyyy-mm-dd) for streak calculations
}

export interface SessionHistoryItem {
  id: string;
  date: Date;
  duration: number;
  mode: 'speed' | 'locked';
  efficiency: number;
  notes: string;
}

export interface Feedback {
  currentFeedback: {
    mood: number;
    text: string;
  };
  aiSuggestions: string[];
}

export interface ScheduledSession {
  id: string;
  title: string;
  startTime: Date;
  duration: number;
  mode: 'speed' | 'locked';
  isRecurring: boolean;
  recurringDays?: number[];
  isEnabled: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  scheduledSessions: ScheduledSession[];
}

export interface FollowUpNote {
  id: string;
  note: string;
  timestamp: string;
}

export interface SoundPreset {
  id: string;
  name: string;
  ticking: { enabled: boolean; selectedSound: string; volume: number };
  breathing: { enabled: boolean; selectedSound: string; volume: number };
  nature: { enabled: boolean; selectedSound: string; volume: number };
  isFavorite: boolean;
  createdAt: Date;
}

export interface AppState {
  user: User;
  session: Session;
  clock: Clock;
  sounds: Sounds;
  progress: Progress;
  history: SessionHistoryItem[];
  feedback: Feedback;
  settings: AppSettings;
  soundPresets: SoundPreset[]; // Sound presets storage
  favoriteSoundIds: string[]; // Hearted individual sounds for quick add
  followUpNotes: FollowUpNote[]; // Follow-up notes from session completions
  analytics: SessionAnalytics | null; // Real-time analytics from Supabase
  isInitialized: boolean;
  isSyncing: boolean;
}

// Initial state
const initialState: AppState = {
  user: {
    name: 'Focus User',
    email: 'user@example.com',
  },
  session: {
    isActive: false,
    mode: 'speed',
    speedSetting: 1,
    timeSlotMultiplier: 1,
    timeSlotDuration: 15,
    slotEveryMinutes: 30,
    targetDuration: 25,
    clockStyle: 'digital-modern',
    actualDuration: 0,
    efficiency: {
      score: 0,
      notes: '',
      suggestions: [],
    },
    timeSlotEnabled: true, // Time Slot Duration enabled by default
    speedMultiplierEnabled: false, // Speed Multiplier disabled by default
  },
  clock: {
    manipulatedTime: new Date(),
    speedMultiplier: 1.0,
  },
  sounds: {
    master: true,
    haptics: true,
    ticking: {
      enabled: false,
      selectedSound: 'ticking-classic-clock',
      volume: 0.8,
    },
    breathing: {
      enabled: false,
      selectedSound: 'breathing-deep-calm',
      volume: 0.7,
    },
    nature: {
      enabled: false,
      selectedSound: 'nature-gentle-rain',
      volume: 0.6,
    },
  },
  progress: {
    totalSessions: 0,
    totalTime: 0,
    currentStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    averageRating: 0,
    bestStreak: 0,
  },
  history: [],
  feedback: {
    currentFeedback: {
      mood: 3,
      text: '',
    },
    aiSuggestions: [
      'Try taking a 5-minute break between sessions',
      'Consider adjusting your session length based on your energy levels',
      'Deep breathing can help improve focus',
    ],
  },
  settings: {
    theme: 'system',
    notifications: true,
    scheduledSessions: [],
  },
  soundPresets: [], // Sound presets array
  favoriteSoundIds: [],
  followUpNotes: [], // Follow-up notes array
  analytics: null,
  isInitialized: false,
  isSyncing: false,
};

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: Partial<User> }
  | { type: 'START_SESSION'; payload: { mode: 'speed' | 'locked'; targetDuration: number } }
  | { type: 'END_SESSION'; payload: { duration: number } }
  | { type: 'UPDATE_SESSION'; payload: Partial<Session> }
  | { type: 'UPDATE_CLOCK_STYLE'; payload: ClockStyle }
  | { type: 'UPDATE_SOUNDS'; payload: Partial<Sounds> }
  | { type: 'UPDATE_CLOCK'; payload: Partial<Clock> }
  | { type: 'UPDATE_FEEDBACK'; payload: Partial<Feedback> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_SCHEDULED_SESSION'; payload: ScheduledSession }
  | { type: 'UPDATE_SCHEDULED_SESSION'; payload: { id: string; updates: Partial<ScheduledSession> } }
  | { type: 'DELETE_SCHEDULED_SESSION'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_STATE' }
  | { type: 'SET_ANALYTICS'; payload: SessionAnalytics | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<Progress> }
  | { type: 'ADD_SOUND_PRESET'; payload: SoundPreset }
  | { type: 'UPDATE_SOUND_PRESET'; payload: { id: string; updates: Partial<SoundPreset> } }
  | { type: 'DELETE_SOUND_PRESET'; payload: string }
  | { type: 'TOGGLE_PRESET_FAVORITE'; payload: string }
  | { type: 'TOGGLE_FAVORITE_SOUND'; payload: string }
  | { type: 'ADD_FOLLOW_UP_NOTE'; payload: { note: string; timestamp: string } };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case 'START_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          isActive: true,
          mode: action.payload.mode,
          targetDuration: action.payload.targetDuration,
          startTime: new Date(),
          actualDuration: 0,
        },
      };

    case 'END_SESSION': {
      // Date-only key (local) for streaks and day uniqueness
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const dateKey = todayDate.toISOString().split('T')[0];
      const lastDateKey = state.progress.lastSessionDate;

      // Streak calculation: only increment once per new day; reset if gap > 1 day
      let nextStreak = state.progress.currentStreak;
      if (!lastDateKey) {
        nextStreak = 1;
      } else {
        const lastDate = new Date(lastDateKey);
        const diffDays = Math.round(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0) {
          // Same day: keep streak as-is
          nextStreak = state.progress.currentStreak || 1;
        } else if (diffDays === 1) {
          nextStreak = state.progress.currentStreak + 1;
        } else {
          nextStreak = 1;
        }
      }

      const bestStreak = Math.max(state.progress.bestStreak || 0, nextStreak);

      const newSession: SessionHistoryItem = {
        id: Date.now().toString(),
        date: new Date(),
        duration: action.payload.duration,
        mode: state.session.mode,
        efficiency: state.session.efficiency.score,
        notes: state.session.efficiency.notes,
      };

      const newWeeklyProgress = [...state.progress.weeklyProgress];
      const today = new Date().getDay();
      newWeeklyProgress[today] += action.payload.duration / 60;

      return {
        ...state,
        session: {
          ...state.session,
          isActive: false,
          endTime: new Date(),
          actualDuration: action.payload.duration,
        },
        history: [newSession, ...state.history],
        progress: {
          ...state.progress,
          totalSessions: state.progress.totalSessions + 1,
          totalTime: state.progress.totalTime + action.payload.duration / 60,
          currentStreak: nextStreak,
          bestStreak,
          lastSessionDate: dateKey,
          weeklyProgress: newWeeklyProgress,
        },
      };
    }

    case 'UPDATE_SESSION':
      return {
        ...state,
        session: { ...state.session, ...action.payload },
      };

    case 'UPDATE_CLOCK_STYLE':
      return {
        ...state,
        session: { ...state.session, clockStyle: action.payload },
      };

    case 'UPDATE_SOUNDS':
      return {
        ...state,
        sounds: { ...state.sounds, ...action.payload },
      };

    case 'UPDATE_CLOCK':
      return {
        ...state,
        clock: { ...state.clock, ...action.payload },
      };

    case 'UPDATE_FEEDBACK':
      return {
        ...state,
        feedback: { ...state.feedback, ...action.payload },
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'ADD_SCHEDULED_SESSION':
      return {
        ...state,
        settings: {
          ...state.settings,
          scheduledSessions: [...state.settings.scheduledSessions, action.payload],
        },
      };

    case 'UPDATE_SCHEDULED_SESSION':
      return {
        ...state,
        settings: {
          ...state.settings,
          scheduledSessions: state.settings.scheduledSessions.map(session =>
            session.id === action.payload.id
              ? { ...session, ...action.payload.updates }
              : session
          ),
        },
      };

    case 'DELETE_SCHEDULED_SESSION':
      return {
        ...state,
        settings: {
          ...state.settings,
          scheduledSessions: state.settings.scheduledSessions.filter(
            session => session.id !== action.payload
          ),
        },
      };

    case 'LOAD_STATE':
      return action.payload;

    case 'RESET_STATE':
      return initialState;

    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };

    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.payload,
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: { ...state.progress, ...action.payload },
      };

    case 'ADD_SOUND_PRESET':
      return {
        ...state,
        soundPresets: [...state.soundPresets, action.payload],
      };

    case 'UPDATE_SOUND_PRESET':
      return {
        ...state,
        soundPresets: state.soundPresets.map((preset) =>
          preset.id === action.payload.id
            ? { ...preset, ...action.payload.updates }
            : preset
        ),
      };

    case 'DELETE_SOUND_PRESET':
      return {
        ...state,
        soundPresets: state.soundPresets.filter((preset) => preset.id !== action.payload),
      };

    case 'TOGGLE_PRESET_FAVORITE':
      return {
        ...state,
        soundPresets: state.soundPresets.map((preset) =>
          preset.id === action.payload
            ? { ...preset, isFavorite: !preset.isFavorite }
            : preset
        ),
      };

    case 'TOGGLE_FAVORITE_SOUND': {
      const exists = state.favoriteSoundIds.includes(action.payload);
      return {
        ...state,
        favoriteSoundIds: exists
          ? state.favoriteSoundIds.filter((id) => id !== action.payload)
          : [...state.favoriteSoundIds, action.payload],
      };
    }

    case 'ADD_FOLLOW_UP_NOTE': {
      const newNote: FollowUpNote = {
        id: Date.now().toString(),
        note: action.payload.note,
        timestamp: action.payload.timestamp,
      };
      return {
        ...state,
        followUpNotes: [newNote, ...state.followUpNotes],
      };
    }

    default:
      return state;
  }
}

// Context with actions
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    startSession: (mode: 'speed' | 'locked', targetDuration: number) => Promise<void>;
    endSession: (duration: number, efficiency?: number, notes?: string, mood?: number, feedback?: string) => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    syncSoundsToSupabase: () => Promise<void>;
    updateClockStyle: (style: ClockStyle) => Promise<void>;
    updateSounds: (soundUpdates: Partial<Sounds>) => void;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: authUser, isGuestMode } = useAuth();

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  // Load Supabase data when user authenticates
  useEffect(() => {
    if (authUser && !isGuestMode) {
      console.log('AppContext: User authenticated, loading Supabase data');
      loadSupabaseData(authUser.id);
    } else if (isGuestMode) {
      console.log('AppContext: Guest mode, using local data only');
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, [authUser, isGuestMode]);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (state.isInitialized) {
      saveState(state);
    }
  }, [state]);

  // Sync sounds to Supabase when changed (authenticated users only)
  useEffect(() => {
    if (authUser && !isGuestMode && state.isInitialized) {
      syncSoundsToSupabase();
    }
  }, [state.sounds, authUser, isGuestMode, state.isInitialized]);

  // Define refreshAnalytics BEFORE it's used in other functions/effects
  const refreshAnalytics = useCallback(async () => {
    if (!authUser || isGuestMode) {
      console.log('AppContext: Skipping analytics refresh (guest mode or no user)');
      return;
    }

    try {
      console.log('AppContext: Refreshing analytics from Supabase');
      const analytics = await dataService.getSessionAnalytics(authUser.id);
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
      
      // Update progress from analytics
      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          totalSessions: analytics.totalSessions,
          totalTime: analytics.totalTime,
          currentStreak: analytics.currentStreak,
          bestStreak: analytics.bestStreak,
          weeklyProgress: analytics.weeklyProgress,
          averageRating: analytics.averageMood,
        },
      });
      
      console.log('AppContext: Analytics refreshed successfully');
    } catch (error) {
      console.error('AppContext: Error refreshing analytics:', error);
    }
  }, [authUser, isGuestMode]);

  // Listen for app coming to foreground to sync data across devices
  useEffect(() => {
    if (!authUser || isGuestMode) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('AppContext: App became active, refreshing analytics from Supabase');
        refreshAnalytics();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [authUser, isGuestMode, refreshAnalytics]);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('adhd_focus_app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Convert date strings back to Date objects
        if (parsedState.session?.startTime) {
          parsedState.session.startTime = new Date(parsedState.session.startTime);
        }
        if (parsedState.session?.endTime) {
          parsedState.session.endTime = new Date(parsedState.session.endTime);
        }
        if (parsedState.clock?.manipulatedTime) {
          parsedState.clock.manipulatedTime = new Date(parsedState.clock.manipulatedTime);
        }
        if (parsedState.history) {
          parsedState.history = parsedState.history.map((item: any) => ({
            ...item,
            date: new Date(item.date),
          }));
        }
        
        // Handle scheduled sessions dates
        if (parsedState.settings?.scheduledSessions) {
          parsedState.settings.scheduledSessions = parsedState.settings.scheduledSessions.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
          }));
        }

        if (!parsedState.favoriteSoundIds) {
          parsedState.favoriteSoundIds = [];
        }

        // Handle sound presets dates
        if (parsedState.soundPresets) {
          parsedState.soundPresets = parsedState.soundPresets.map((preset: any) => ({
            ...preset,
            createdAt: new Date(preset.createdAt),
          }));
        }
        
        // Ensure all required fields exist
        const stateWithDefaults = {
          ...initialState,
          ...parsedState,
          isInitialized: false, // Will be set after Supabase load
        };
        
        dispatch({ type: 'LOAD_STATE', payload: stateWithDefaults });
      }
    } catch (error) {
      console.error('AppContext: Error loading state:', error);
    }
  };

  const saveState = async (stateToSave: AppState) => {
    try {
      await AsyncStorage.setItem('adhd_focus_app_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('AppContext: Error saving state:', error);
    }
  };

  const loadSupabaseData = async (userId: string) => {
    try {
      console.log('AppContext: Loading data from Supabase for user:', userId);
      dispatch({ type: 'SET_SYNCING', payload: true });

      // Load profile
      const profile = await dataService.getProfile(userId);
      if (profile) {
        dispatch({
          type: 'SET_USER',
          payload: { name: profile.name || 'Focus User', email: authUser?.email || '' },
        });
      }

      // Load settings
      const settings = await dataService.getUserSettings(userId);
      if (settings) {
        dispatch({
          type: 'UPDATE_SOUNDS',
          payload: {
            master: settings.sounds_master ?? true,
            haptics: settings.sounds_haptics ?? true,
            ticking: {
              enabled: settings.sounds_ticking ?? false,
              selectedSound: settings.sound_ticking_type ?? 'ticking-classic-clock',
              volume: 0.8,
            },
            breathing: {
              enabled: settings.sounds_breathing ?? false,
              selectedSound: settings.sound_breathing_type ?? 'breathing-deep-calm',
              volume: 0.7,
            },
            nature: {
              enabled: settings.sounds_nature ?? false,
              selectedSound: settings.sound_nature_type ?? 'nature-gentle-rain',
              volume: 0.6,
            },
          },
        });

        dispatch({
          type: 'UPDATE_CLOCK_STYLE',
          payload: (settings.clock_style as ClockStyle) ?? 'digital-modern',
        });
      }

      // Load analytics
      await refreshAnalytics();

      dispatch({ type: 'SET_INITIALIZED', payload: true });
      dispatch({ type: 'SET_SYNCING', payload: false });
      console.log('AppContext: Supabase data loaded successfully');
    } catch (error) {
      console.error('AppContext: Error loading Supabase data:', error);
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const startSession = useCallback(async (mode: 'speed' | 'locked', targetDuration: number) => {
    console.log('AppContext: Starting session', { mode, targetDuration });
    
    dispatch({
      type: 'START_SESSION',
      payload: { mode, targetDuration },
    });

    // Create session in Supabase for authenticated users
    if (authUser && !isGuestMode) {
      try {
        const sessionData = await dataService.createSession(authUser.id, {
          mode,
          target_duration: targetDuration,
          speed_multiplier: state.session.speedSetting,
          time_slot_multiplier: state.session.timeSlotMultiplier,
        });

        if (sessionData) {
          dispatch({
            type: 'UPDATE_SESSION',
            payload: { supabaseSessionId: sessionData.id },
          });
          console.log('AppContext: Session created in Supabase:', sessionData.id);
        }
      } catch (error) {
        console.error('AppContext: Error creating session in Supabase:', error);
      }
    }
  }, [authUser, isGuestMode, state.session.speedSetting, state.session.timeSlotMultiplier]);

  const endSession = useCallback(async (
    duration: number,
    efficiency?: number,
    notes?: string,
    mood?: number,
    feedback?: string
  ) => {
    console.log('AppContext: Ending session', { duration, efficiency, notes, mood });

    dispatch({
      type: 'END_SESSION',
      payload: { duration },
    });

    // Complete session in Supabase for authenticated users
    if (authUser && !isGuestMode && state.session.supabaseSessionId) {
      try {
        await dataService.completeSession(state.session.supabaseSessionId, {
          actual_duration: duration,
          efficiency_score: efficiency,
          efficiency_notes: notes,
          mood_rating: mood,
          feedback_text: feedback,
        });

        console.log('AppContext: Session completed in Supabase');
        
        // Refresh analytics after session completion
        await refreshAnalytics();
      } catch (error) {
        console.error('AppContext: Error completing session in Supabase:', error);
      }
    }
  }, [authUser, isGuestMode, state.session.supabaseSessionId, refreshAnalytics]);

  const syncSoundsToSupabase = useCallback(async () => {
    if (!authUser || isGuestMode || !state.isInitialized) return;

    try {
      await dataService.updateUserSettings(authUser.id, {
        sounds_master: state.sounds.master,
        sounds_haptics: state.sounds.haptics,
        sounds_ticking: state.sounds.ticking.enabled,
        sounds_breathing: state.sounds.breathing.enabled,
        sounds_nature: state.sounds.nature.enabled,
        sound_ticking_type: state.sounds.ticking.selectedSound,
        sound_breathing_type: state.sounds.breathing.selectedSound,
        sound_nature_type: state.sounds.nature.selectedSound,
      });
      console.log('AppContext: Sounds synced to Supabase');
    } catch (error) {
      console.error('AppContext: Error syncing sounds to Supabase:', error);
    }
  }, [authUser, isGuestMode, state.sounds, state.isInitialized]);

  const updateClockStyle = useCallback(async (style: ClockStyle) => {
    dispatch({ type: 'UPDATE_CLOCK_STYLE', payload: style });

    if (authUser && !isGuestMode) {
      try {
        await dataService.updateUserSettings(authUser.id, {
          clock_style: style,
        });
        console.log('AppContext: Clock style synced to Supabase');
      } catch (error) {
        console.error('AppContext: Error syncing clock style:', error);
      }
    }
  }, [authUser, isGuestMode]);

  const updateSounds = useCallback((soundUpdates: Partial<Sounds>) => {
    dispatch({ type: 'UPDATE_SOUNDS', payload: soundUpdates });
  }, []);

  const actions = useMemo(() => ({
    startSession,
    endSession,
    refreshAnalytics,
    syncSoundsToSupabase,
    updateClockStyle,
    updateSounds,
  }), [startSession, endSession, refreshAnalytics, syncSoundsToSupabase, updateClockStyle, updateSounds]);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
