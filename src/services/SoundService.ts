
import { Audio, AVPlaybackSource } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { AppState, AppStateStatus } from 'react-native';
import { freesoundAPI } from './FreesoundAPI';

/**
 * SOUND SERVICE - Audio Playback Implementation (Hybrid: Local + Streaming)
 * 
 * This service handles audio playback for focus sounds (ticking, breathing, nature).
 * Most sounds are loaded from local bundled assets for:
 * - Offline support (no network required)
 * - Faster loading (instant playback)
 * - Perfect loops (processed with audio_processor.py)
 * - Consistent volume levels (normalized)
 * 
 * Large sounds (40+ minutes) are streamed from Freesound CDN to keep app size small.
 * 
 * Features:
 * - Background playback (configured in app.json with UIBackgroundModes: ["audio"])
 * - Audio mixing with other apps (users can play music while using focus sounds)
 * - On-demand loading (sounds loaded when first played, cached thereafter)
 * - Looping support for ambient sounds
 */

// Sound definitions - supports both local files and streaming URLs
export interface SoundDefinition {
  id: string;
  title: string;
  description: string;
  localFile?: AVPlaybackSource;      // Local bundled file (preferred)
  freesoundId?: string;              // Freesound ID for streaming (fallback for large files)
  category: 'breathing' | 'ticking' | 'nature';
}

// Local sound files - processed with audio_processor.py for perfect looping
// To regenerate: python audio_processor.py --freesound_ids all --freesound_client_id YOUR_ID
export const SOUND_LIBRARY: SoundDefinition[] = [
  // Breathing sounds - processed for seamless looping
  {
    id: 'breathing-deep-calm',
    title: 'Deep Calm Breathing',
    description: 'Slow, deep breathing sounds for relaxation and focus',
    localFile: require('../../assets/sounds/breathing/deep-calm-breathing.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-gentle-waves',
    title: 'Gentle Wave Breathing',
    description: 'Soft breathing pattern like gentle ocean waves',
    localFile: require('../../assets/sounds/breathing/gentle-wave-breathing.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-meditative',
    title: 'Meditative Breathing',
    description: 'Peaceful meditative breathing for deep concentration',
    localFile: require('../../assets/sounds/breathing/meditative-breathing.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-woman-sigh',
    title: 'Woman Breathing & Sighing',
    description: 'Middle-aged woman breathing and sighing naturally',
    localFile: require('../../assets/sounds/breathing/woman-breathing-sigh.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-woman-nose',
    title: 'Woman Breathing Through Nose',
    description: 'Natural female nose breathing for calm focus',
    localFile: require('../../assets/sounds/breathing/woman-breathing-nose.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-woman-mouth',
    title: 'Woman Breathing Through Mouth',
    description: 'Natural female mouth breathing pattern',
    localFile: require('../../assets/sounds/breathing/woman-breathing-mouth.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-woman-outofbreath',
    title: 'Woman Out of Breath (Slow)',
    description: 'Young woman breathing slowly after exertion',
    localFile: require('../../assets/sounds/breathing/woman-out-of-breath.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-man-stereo',
    title: 'Man Breathing (Stereo)',
    description: 'Male breathing recorded in stereo, close proximity',
    localFile: require('../../assets/sounds/breathing/man-breathing-stereo.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-man-heavy',
    title: 'Man Heavy Breathing',
    description: 'Male breathing heavily, deep and pronounced',
    localFile: require('../../assets/sounds/breathing/man-heavy-breathing.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-woman-calm',
    title: 'Woman Calm Breathing',
    description: 'Calm woman breathing naturally and relaxed',
    localFile: require('../../assets/sounds/breathing/woman-calm-breathing.wav'),
    category: 'breathing'
  },
  {
    id: 'breathing-underwater',
    title: 'Underwater Breathing',
    description: 'Breathing with underwater atmosphere and bubble effects',
    localFile: require('../../assets/sounds/breathing/underwater-breathing.wav'),
    category: 'breathing'
  },
  
  // Ticking sounds - processed for perfect loop timing
  {
    id: 'ticking-classic-clock',
    title: 'Classic Clock Tick',
    description: 'Traditional clock ticking sound for time awareness',
    localFile: require('../../assets/sounds/ticking/classic-clock-tick.wav'),
    category: 'ticking'
  },
  {
    id: 'ticking-vintage-metronome',
    title: 'Vintage Metronome',
    description: 'Rhythmic metronome ticking for steady focus',
    localFile: require('../../assets/sounds/ticking/vintage-metronome.wav'),
    category: 'ticking'
  },
  {
    id: 'ticking-modern-digital',
    title: 'Modern Digital Tick',
    description: 'Clean digital ticking sound for contemporary focus',
    localFile: require('../../assets/sounds/ticking/modern-digital-tick.wav'),
    category: 'ticking'
  },
  {
    id: 'ticking-soft-wooden',
    title: 'Soft Wooden Clock',
    description: 'Gentle wooden clock ticking for ambient focus',
    localFile: require('../../assets/sounds/ticking/soft-wooden-clock.wav'),
    category: 'ticking'
  },
  {
    id: 'ticking-subtle-pulse',
    title: 'Subtle Pulse Tick',
    description: 'Minimal pulsing tick for background timing',
    localFile: require('../../assets/sounds/ticking/subtle-pulse-tick.wav'),
    category: 'ticking'
  },
  {
    id: 'ticking-mechanical-watch',
    title: 'Mechanical Watch',
    description: 'Precise mechanical watch ticking for structured focus',
    localFile: require('../../assets/sounds/ticking/mechanical-watch.wav'),
    category: 'ticking'
  },
  
  // Nature sounds - processed for seamless ambient looping
  {
    id: 'nature-forest-ambience',
    title: 'Forest Ambience',
    description: 'Peaceful forest sounds with birds and rustling leaves',
    localFile: require('../../assets/sounds/nature/forest-ambience.wav'),
    category: 'nature'
  },
  {
    id: 'nature-gentle-rain',
    title: 'Gentle Rain',
    description: 'Soft rainfall sounds for calming background ambience',
    localFile: require('../../assets/sounds/nature/gentle-rain.wav'),
    category: 'nature'
  },
  {
    id: 'nature-mountain-stream',
    title: 'Mountain Stream',
    description: 'Flowing water sounds from a peaceful mountain stream',
    localFile: require('../../assets/sounds/nature/mountain-stream.wav'),
    category: 'nature'
  },
  {
    id: 'nature-spa-ambience',
    title: 'Spa Ambience',
    description: 'Tranquil spa environment sounds for deep relaxation',
    localFile: require('../../assets/sounds/nature/spa-ambience.wav'),
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes',
    title: 'Wind Chimes',
    description: 'Metal wind chimes swayed at different speeds',
    localFile: require('../../assets/sounds/nature/wind-chimes-chelly.wav'),
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-relaxing',
    title: 'Relaxing Wind Chimes',
    description: 'Evening wind chimes for purifying and enhancing energy',
    localFile: require('../../assets/sounds/nature/relaxing-wind-chimes.wav'),
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-gregorian',
    title: 'Gregorian Wind Chimes',
    description: 'Gregorian wind chimes playing gently in the wind',
    localFile: require('../../assets/sounds/nature/gregorian-wind-chimes.wav'),
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-playground',
    title: 'Playground Wind Chimes',
    description: 'Distant wind chimes with meditative far background ambience',
    localFile: require('../../assets/sounds/nature/playground-wind-chimes.wav'),
    category: 'nature'
  },
  {
    id: 'nature-wind-chimes-binaural',
    title: 'Binaural Wind Chimes',
    description: 'Ambisonic-derived binaural wind chimes with yard sounds (use headphones)',
    freesoundId: '799569',  // Streamed from CDN (40+ min file too large to bundle)
    category: 'nature'
  }
];

export class SoundService {
  private sounds: { [key: string]: Audio.Sound } = {};
  private isInitialized: boolean = false;
  private masterEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  private currentlyPlaying: Set<string> = new Set();
  private fadeOutTimers: { [key: string]: NodeJS.Timeout } = {};
  private crossfadeLoops: { [key: string]: { instances: Audio.Sound[], active: boolean, scheduledTimers: NodeJS.Timeout[] } } = {};
  private appStateSubscription: { remove: () => void } | null = null;

  async initialize() {
    console.log('SoundService: Initializing');
    try {
      // Set up audio mode for background playback - using MixWithOthers so sounds keep playing when app backgrounds
      await this.setAudioModeForBackground();
      this.isInitialized = true;
      console.log('SoundService: Initialized successfully with background playback');
      
      // Listen for when app goes to background/foreground so we can re-apply audio settings
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    } catch (error) {
      console.log('SoundService: Error initializing audio:', error);
      // Try without background/interruption settings
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        this.isInitialized = true;
        console.log('SoundService: Initialized with basic audio mode');
      } catch (fallbackError) {
        console.log('SoundService: Fallback initialization failed:', fallbackError);
      }
    }
  }

  // Set audio mode for background playback
  // MixWithOthers is the key here - it lets audio keep playing when the app goes to background
  // DoNotMix doesn't work because iOS can revoke it when the app backgrounds
  private async setAudioModeForBackground() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true, // Keep playing when screen locks
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: Audio.InterruptionModeIOS.MixWithOthers, // This is what makes background audio work
      interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
    });
  }

  // Handle app state changes - re-apply audio mode when app goes to background or comes back
  // This makes sure audio keeps playing when screen locks or user switches apps
  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (!this.isInitialized) return;
    
    console.log(`SoundService: App state changed to: ${nextAppState}`);
    
    // Re-apply audio settings when transitioning to/from background
    // iOS sometimes resets audio mode, so we need to set it again
    if (nextAppState === 'background' || nextAppState === 'active') {
      try {
        await this.setAudioModeForBackground();
        console.log(`SoundService: Audio mode re-applied for ${nextAppState} state`);
      } catch (error) {
        console.log('SoundService: Error re-applying audio mode:', error);
      }
    }
  };

  async loadSound(soundId: string): Promise<Audio.Sound | null> {
    if (this.sounds[soundId]) {
      return this.sounds[soundId];
    }

    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    if (!soundDef) {
      console.log(`SoundService: Sound definition not found for ${soundId}`);
      return null;
    }

    try {
      let sound: Audio.Sound;
      
      if (soundDef.localFile) {
        // Load from bundled local file (instant, no network)
        console.log(`SoundService: Loading ${soundDef.title} from local file...`);
        const result = await Audio.Sound.createAsync(
          soundDef.localFile,
          { shouldPlay: false, isLooping: false }
        );
        sound = result.sound;
        console.log(`SoundService: ✅ Loaded ${soundDef.title} (local)`);
      } else if (soundDef.freesoundId) {
        // Stream from Freesound CDN (for large files)
        console.log(`SoundService: Loading ${soundDef.title} from Freesound CDN...`);
        const soundData = await freesoundAPI.getSound(soundDef.freesoundId);
        
        if (!soundData || !soundData.downloadUrl) {
          throw new Error(`Failed to get sound URL from Freesound API`);
        }
        
        const result = await Audio.Sound.createAsync(
          { uri: soundData.downloadUrl },
          { shouldPlay: false, isLooping: false }
        );
        sound = result.sound;
        console.log(`SoundService: ✅ Loaded ${soundDef.title} (streamed)`);
      } else {
        throw new Error('Sound definition has no localFile or freesoundId');
      }
      
      this.sounds[soundId] = sound;
      return sound;
    } catch (error) {
      console.log(`SoundService: Error loading ${soundDef.title}:`, error);
      return null;
    }
  }

  async playSound(soundId: string, loop: boolean = true) {
    if (!this.masterEnabled || !this.isInitialized) {
      console.log('SoundService: Sound disabled or not initialized');
      return;
    }

    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    if (!soundDef) {
      console.log(`SoundService: Sound definition not found for ${soundId}`);
      return;
    }

    // Stop if already playing
    if (this.currentlyPlaying.has(soundId)) {
      console.log(`SoundService: ${soundDef.title} already playing, stopping first...`);
      await this.stopSound(soundId);
    }

    console.log(`SoundService: Playing ${soundDef.title} (loop: ${loop ? 'CROSSFADE' : 'ONCE'})`);
    
    try {
      if (loop) {
        // Use crossfade looping for seamless transitions
        await this.startCrossfadeLoop(soundId, soundDef);
      } else {
        // Single playback with fade-out
        const sound = await this.loadSound(soundId);
        
        if (sound) {
          await sound.setIsLoopingAsync(false);
          await sound.setVolumeAsync(0);
          await sound.playAsync();
          this.currentlyPlaying.add(soundId);
          
          // Fade in over 1 second
          this.fadeIn(sound, 1000);
          
          // Schedule fade-out 2 seconds before end
          await this.scheduleFadeOutBeforeEnd(soundId, sound, 2000);
          
          console.log(`SoundService: ✅ ${soundDef.title} playing ONCE with fade`);
        }
      }
    } catch (error) {
      console.log(`SoundService: ❌ Error playing ${soundDef.title}:`, error);
    }
  }

  private async startCrossfadeLoop(soundId: string, soundDef: SoundDefinition) {
    console.log(`[CROSSFADE] Starting crossfade loop for ${soundDef.title}`);
    
    // Initialize crossfade loop tracking
    this.crossfadeLoops[soundId] = {
      instances: [],
      active: true,
      scheduledTimers: []
    };
    
    this.currentlyPlaying.add(soundId);
    
    // Start the first instance
    await this.playNextCrossfadeInstance(soundId, soundDef, true);
  }

  private async playNextCrossfadeInstance(soundId: string, soundDef: SoundDefinition, isFirst: boolean = false) {
    // Check if loop is still active
    if (!this.crossfadeLoops[soundId] || !this.crossfadeLoops[soundId].active) {
      console.log(`[CROSSFADE] Loop stopped for ${soundId}, not starting next instance`);
      return;
    }

    try {
      console.log(`[CROSSFADE] Loading new instance for ${soundId}...`);
      
      let sound: Audio.Sound;
      
      if (soundDef.localFile) {
        // Create new sound instance from local file (instant load)
        const result = await Audio.Sound.createAsync(
          soundDef.localFile,
          { shouldPlay: false, isLooping: false }
        );
        sound = result.sound;
      } else if (soundDef.freesoundId) {
        // Stream from Freesound CDN
        const soundData = await freesoundAPI.getSound(soundDef.freesoundId);
        if (!soundData || !soundData.downloadUrl) {
          throw new Error(`Failed to get sound URL from Freesound API`);
        }
        const result = await Audio.Sound.createAsync(
          { uri: soundData.downloadUrl },
          { shouldPlay: false, isLooping: false }
        );
        sound = result.sound;
      } else {
        throw new Error('Sound definition has no localFile or freesoundId');
      }
      
      // Get duration (may need to wait for streaming sounds)
      let duration: number | null = null;
      let attempts = 0;
      const maxAttempts = soundDef.freesoundId ? 10 : 1; // More attempts for streaming
      
      while (!duration && attempts < maxAttempts) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          duration = status.durationMillis;
          break;
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (!duration) {
        throw new Error('Could not get sound duration');
      }
      
      // Nature sounds: simple 3s overlap, no fading (ambient sounds) - longer overlap hides loop point better
      // Other sounds: 2s crossfade with fade in/out (breathing, ticking)
      const isNature = soundDef.category === 'nature';
      const overlapDuration = isNature ? 3000 : 2000; // 3s for nature, 2s for breathing/ticking
      const nextInstanceDelay = Math.max(0, duration - overlapDuration);
      
      console.log(`[CROSSFADE] ${soundDef.category.toUpperCase()} sound - Duration: ${(duration/1000).toFixed(1)}s, overlap: ${overlapDuration}ms, next at: ${(nextInstanceDelay/1000).toFixed(1)}s`);
      
      // Add to instances
      this.crossfadeLoops[soundId].instances.push(sound);
      
      // Start playback
      if (isFirst) {
        if (isNature) {
          // Nature sounds: NO FADE, start at full volume immediately
          await sound.setVolumeAsync(1);
          await sound.playAsync();
          console.log(`[CROSSFADE] ✅ First nature instance playing (NO FADE, full volume)`);
        } else {
          // First instance for breathing/ticking: fade in from 0
          await sound.setVolumeAsync(0);
          await sound.playAsync();
          this.fadeIn(sound, 1000);
          console.log(`[CROSSFADE] ✅ First instance playing, fading in`);
        }
      } else {
        if (isNature) {
          // Nature sounds: simple overlap, no fade (just play at full volume)
          await sound.setVolumeAsync(1);
          await sound.playAsync();
          console.log(`[CROSSFADE] ✅ Next instance playing (nature overlap, no fade)`);
        } else {
          // Breathing/Ticking: crossfade in
          await sound.setVolumeAsync(0);
          await sound.playAsync();
          this.fadeIn(sound, overlapDuration);
          console.log(`[CROSSFADE] ✅ Next instance playing, crossfading in`);
        }
      }
      
      // Schedule fade-out/stop for current instance
      if (!isNature) {
        // Non-nature sounds: fade out during crossfade
        const fadeTimer = setTimeout(async () => {
          try {
            console.log(`[CROSSFADE] ⬇️ Fading out current instance for ${soundId}`);
            await this.fadeOut(sound, overlapDuration);
          } catch (error) {
            console.log(`[CROSSFADE] Error fading out:`, error);
          }
        }, nextInstanceDelay);
        
        if (this.crossfadeLoops[soundId]) {
          this.crossfadeLoops[soundId].scheduledTimers.push(fadeTimer);
        }
      }
      // Nature sounds don't fade out - they just overlap and stop naturally
      
      // Schedule next instance before this one ends (at the same time fade-out starts)
      const nextInstanceTimer = setTimeout(async () => {
        if (this.crossfadeLoops[soundId] && this.crossfadeLoops[soundId].active) {
          console.log(`[CROSSFADE] ⏰ Time to start next instance for ${soundId}`);
          await this.playNextCrossfadeInstance(soundId, soundDef, false);
        }
      }, nextInstanceDelay);
      
      if (this.crossfadeLoops[soundId]) {
        this.crossfadeLoops[soundId].scheduledTimers.push(nextInstanceTimer);
      }
      
      // Schedule cleanup AFTER fade-out completes
      const cleanupTimer = setTimeout(async () => {
        try {
          // Unload after playback complete
          await sound.unloadAsync();
          
          // Remove from instances array
          if (this.crossfadeLoops[soundId]) {
            const index = this.crossfadeLoops[soundId].instances.indexOf(sound);
            if (index > -1) {
              this.crossfadeLoops[soundId].instances.splice(index, 1);
            }
          }
          
          console.log(`[CROSSFADE] Cleaned up instance for ${soundId}`);
        } catch (error) {
          console.log(`[CROSSFADE] Error cleaning up instance:`, error);
        }
      }, duration + 100); // Small buffer after sound ends
      
      if (this.crossfadeLoops[soundId]) {
        this.crossfadeLoops[soundId].scheduledTimers.push(cleanupTimer);
      }
      
    } catch (error) {
      console.log(`[CROSSFADE] ❌ Error playing instance for ${soundId}:`, error);
    }
  }

  private fadeIn(sound: Audio.Sound, duration: number) {
    const steps = 20; // Number of volume steps
    const stepDuration = duration / steps;
    const volumeIncrement = 1 / steps;
    
    let currentStep = 0;
    const fadeInterval = setInterval(async () => {
      currentStep++;
      const newVolume = Math.min(currentStep * volumeIncrement, 1);
      
      try {
        await sound.setVolumeAsync(newVolume);
      } catch (error) {
        clearInterval(fadeInterval);
      }
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  private async scheduleFadeOutBeforeEnd(soundId: string, sound: Audio.Sound, fadeOutDuration: number): Promise<void> {
    try {
      // Get the sound's duration
      const status = await sound.getStatusAsync();
      
      if (status.isLoaded && status.durationMillis) {
        const soundDuration = status.durationMillis;
        const soundDurationSec = (soundDuration / 1000).toFixed(1);
        const fadeOutSec = (fadeOutDuration / 1000).toFixed(1);
        
        // Calculate when to start fade-out (duration - fadeOutDuration)
        // Ensure we don't start fading immediately if sound is shorter than fade duration
        const fadeStartTime = Math.max(0, soundDuration - fadeOutDuration);
        const fadeStartSec = (fadeStartTime / 1000).toFixed(1);
        
        if (fadeStartTime > 0) {
          console.log(`[F12 DEBUG] SoundService: Sound duration: ${soundDurationSec}s, Fade: ${fadeOutSec}s, Will start fade at: ${fadeStartSec}s`);
          console.log(`[F12 DEBUG] SoundService: Scheduling fade-out timer for ${soundId}`);
          
          // Clear any existing timer for this sound
          if (this.fadeOutTimers[soundId]) {
            clearTimeout(this.fadeOutTimers[soundId]);
            console.log(`[F12 DEBUG] SoundService: Cleared previous fade timer for ${soundId}`);
          }
          
          // Schedule the fade-out
          this.fadeOutTimers[soundId] = setTimeout(async () => {
            console.log(`[F12 DEBUG] ⏰ Fade timer fired! Starting ${fadeOutSec}s fade-out for ${soundId}`);
            await this.fadeOut(sound, fadeOutDuration);
            console.log(`[F12 DEBUG] ✅ Fade-out complete for ${soundId}`);
            
            // CRITICAL: Stop and unload sound after fade completes to prevent harsh cutoff
            try {
              console.log(`[F12 DEBUG] Stopping and unloading ${soundId}...`);
              await sound.stopAsync();
              await sound.unloadAsync();
              delete this.sounds[soundId];
              this.currentlyPlaying.delete(soundId);
              console.log(`[F12 DEBUG] ✅✅✅ ${soundId} CLEANLY STOPPED - NO CUTOFF EXPECTED`);
            } catch (error) {
              console.log(`[F12 DEBUG] ❌ Error stopping ${soundId} after fade:`, error);
            }
            
            delete this.fadeOutTimers[soundId];
          }, fadeStartTime);
        } else {
          console.log(`[F12 DEBUG] ⚠️ Sound ${soundId} (${soundDurationSec}s) is shorter than fade (${fadeOutSec}s), skipping scheduled fade`);
        }
      }
    } catch (error) {
      console.log(`[F12 DEBUG] ❌ Error scheduling fade-out for ${soundId}:`, error);
    }
  }

  async stopSound(soundId: string) {
    const soundDef = SOUND_LIBRARY.find(s => s.id === soundId);
    const soundName = soundDef ? soundDef.title : soundId;
    
    console.log(`SoundService: 🛑 Stopping ${soundName}...`);
    
    // Clear any pending fade-out timer
    if (this.fadeOutTimers[soundId]) {
      clearTimeout(this.fadeOutTimers[soundId]);
      delete this.fadeOutTimers[soundId];
      console.log(`SoundService: Cleared pending fade-out timer for ${soundName}`);
    }
    
    // Stop crossfade loop if active
    if (this.crossfadeLoops[soundId]) {
      console.log(`[CROSSFADE] Stopping crossfade loop for ${soundName}`);
      this.crossfadeLoops[soundId].active = false;
      
      // CRITICAL: Clear all scheduled timers first to prevent new instances from starting
      console.log(`[CROSSFADE] Clearing ${this.crossfadeLoops[soundId].scheduledTimers.length} scheduled timers`);
      for (const timer of this.crossfadeLoops[soundId].scheduledTimers) {
        clearTimeout(timer);
      }
      this.crossfadeLoops[soundId].scheduledTimers = [];
      
      // Stop and unload all instances
      for (const sound of this.crossfadeLoops[soundId].instances) {
        try {
          await this.fadeOut(sound, 1000);
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.log(`[CROSSFADE] Error stopping instance:`, error);
        }
      }
      
      delete this.crossfadeLoops[soundId];
      console.log(`[CROSSFADE] ✅ Crossfade loop stopped`);
    }
    
    try {
      if (this.sounds[soundId]) {
        console.log(`SoundService: Found sound in cache, stopping...`);
        const sound = this.sounds[soundId];
        
        // Get current status to check if it's actually playing
        const status = await sound.getStatusAsync();
        console.log(`SoundService: Sound status:`, status.isLoaded ? 'loaded' : 'not loaded', status.isLoaded && status.isPlaying ? 'playing' : 'not playing');
        
        // Fade out and stop if playing
        if (status.isLoaded && status.isPlaying) {
          await this.fadeOut(sound, 1000);
          await sound.stopAsync();
          console.log(`SoundService: ✅ Stopped playback with fade out`);
        }
        
        // Unload to free resources
        await sound.unloadAsync();
        console.log(`SoundService: ✅ Unloaded from memory`);
        
        delete this.sounds[soundId];
      } else {
        console.log(`SoundService: ⚠️ Sound not found in cache (may have already been stopped)`);
      }
      
      this.currentlyPlaying.delete(soundId);
      console.log(`SoundService: ✅ ${soundName} fully stopped`);
    } catch (error) {
      console.log(`SoundService: ❌ Error stopping ${soundName}:`, error);
      // Force remove from tracking even if stop failed
      this.currentlyPlaying.delete(soundId);
      if (this.sounds[soundId]) {
        delete this.sounds[soundId];
      }
    }
  }

  private async fadeOut(sound: Audio.Sound, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const steps = 20; // Number of volume steps
      const stepDuration = duration / steps;
      const volumeDecrement = 1 / steps;
      
      let currentStep = 0;
      const fadeInterval = setInterval(async () => {
        currentStep++;
        const newVolume = Math.max(1 - (currentStep * volumeDecrement), 0);
        
        try {
          await sound.setVolumeAsync(newVolume);
        } catch (error) {
          clearInterval(fadeInterval);
          resolve();
        }
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepDuration);
    });
  }

  async forceStopAll() {
    console.log('SoundService: Force stopping all sounds');
    
    // Clear all fade-out timers first
    for (const soundId in this.fadeOutTimers) {
      clearTimeout(this.fadeOutTimers[soundId]);
      delete this.fadeOutTimers[soundId];
    }
    
    // Stop all crossfade loops
    for (const soundId in this.crossfadeLoops) {
      console.log(`[CROSSFADE] Force stopping crossfade loop for ${soundId}`);
      this.crossfadeLoops[soundId].active = false;
      
      // CRITICAL: Clear ALL scheduled timers to prevent new instances
      console.log(`[CROSSFADE] Clearing ${this.crossfadeLoops[soundId].scheduledTimers.length} scheduled timers for ${soundId}`);
      for (const timer of this.crossfadeLoops[soundId].scheduledTimers) {
        clearTimeout(timer);
      }
      this.crossfadeLoops[soundId].scheduledTimers = [];
      
      for (const sound of this.crossfadeLoops[soundId].instances) {
        try {
          await sound.setVolumeAsync(0);
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.log(`[CROSSFADE] Error force stopping instance:`, error);
        }
      }
      
      delete this.crossfadeLoops[soundId];
    }
    
    // Create array copy to avoid modification during iteration
    const soundsToStop = Array.from(this.currentlyPlaying);
    
    for (const soundId of soundsToStop) {
      try {
        if (this.sounds[soundId]) {
          // Immediately mute the sound first (instant silence)
          try {
            await this.sounds[soundId].setVolumeAsync(0);
          } catch (volumeError) {
            console.log(`SoundService: Could not set volume for ${soundId}:`, volumeError);
          }
          
          // Then stop and unload
          await this.sounds[soundId].stopAsync();
          await this.sounds[soundId].unloadAsync();
          delete this.sounds[soundId];
        }
      } catch (error) {
        console.log(`SoundService: Error force stopping ${soundId}:`, error);
        // Force cleanup even on error
        if (this.sounds[soundId]) {
          try {
            await this.sounds[soundId].unloadAsync();
          } catch (unloadError) {
            console.log(`SoundService: Error unloading ${soundId}:`, unloadError);
          }
          delete this.sounds[soundId];
        }
      }
    }
    
    this.currentlyPlaying.clear();
    console.log('SoundService: All sounds stopped and unloaded');
  }

  async setMasterEnabled(enabled: boolean) {
    console.log('SoundService: Setting master enabled to', enabled);
    this.masterEnabled = enabled;
    if (!enabled) {
      await this.forceStopAll();
    }
  }

  setHapticsEnabled(enabled: boolean) {
    console.log('SoundService: Setting haptics enabled to', enabled);
    this.hapticsEnabled = enabled;
  }

  async playHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.hapticsEnabled) {
      console.log('SoundService: Haptics disabled');
      return;
    }

    console.log(`SoundService: Playing ${type} haptic`);
    
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.log('SoundService: Error playing haptic:', error);
    }
  }

  // Get sounds by category
  getSoundsByCategory(category: 'breathing' | 'ticking' | 'nature'): SoundDefinition[] {
    return SOUND_LIBRARY.filter(sound => sound.category === category);
  }

  // Get sound definition by ID
  getSoundDefinition(soundId: string): SoundDefinition | undefined {
    return SOUND_LIBRARY.find(sound => sound.id === soundId);
  }

  // Check if a sound is currently playing
  isPlaying(soundId: string): boolean {
    return this.currentlyPlaying.has(soundId);
  }

  // Get all currently playing sounds
  getCurrentlyPlaying(): string[] {
    return Array.from(this.currentlyPlaying);
  }

  // Clean up the app state listener when service is destroyed
  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
      console.log('SoundService: Cleaned up app state listener');
    }
  }
}

export const soundService = new SoundService();
