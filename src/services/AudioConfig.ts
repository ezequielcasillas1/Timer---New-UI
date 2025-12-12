import { Audio } from 'expo-av';

/**
 * AUDIO CONFIGURATION - Flexible audio modes for the app
 * 
 * This module provides audio configuration that supports:
 * - Background audio PLAYBACK (focus sounds) - MixWithOthers mode
 * - Background audio RECORDING (environmental sound detection) - when explicitly enabled
 * 
 * CRITICAL: Recording mode is OPTIONAL and only enabled when BackgroundAudioService is used.
 * SoundService works in playback-only mode for maximum compatibility.
 */

let isAudioModeInitialized = false;
let currentAudioMode: 'playback' | 'recording' = 'playback';

/**
 * Initialize audio mode for PLAYBACK ONLY (default, safest mode)
 * This is used by SoundService for focus sounds
 * Safe to call multiple times - will only initialize once
 */
export async function initializeAudioMode(): Promise<void> {
  // Don't skip re-initialization - audio mode can be reset by iOS
  // Just log if we're re-initializing
  if (isAudioModeInitialized) {
    console.log('AudioConfig: Re-initializing audio mode...');
  } else {
    console.log('AudioConfig: Initializing playback-only audio mode...');
  }

  try {
    // Configure audio mode for PLAYBACK ONLY (no recording)
    // CRITICAL: Use DoNotMix for background playback
    // This prevents iOS from stopping audio when screen locks
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false, // ✅ NO recording - just playback
      staysActiveInBackground: true, // ✅ Continue when screen is off
      playsInSilentModeIOS: true, // ✅ Play even in silent mode
      shouldDuckAndroid: true, // Duck other audio on Android
      playThroughEarpieceAndroid: false, // Use speaker on Android
      interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix, // ✅ CRITICAL: DoNotMix + audio background mode = continuous playback
      interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
    });

    isAudioModeInitialized = true;
    currentAudioMode = 'playback';
    console.log('AudioConfig: ✅ Playback-only audio mode initialized (safest for TestFlight)');
  } catch (error) {
    console.log('AudioConfig: ❌ Error initializing audio mode:', error);
    
    // Fallback: absolute minimum config
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      isAudioModeInitialized = true;
      currentAudioMode = 'playback';
      console.log('AudioConfig: ✅ Fallback audio mode initialized (minimal config)');
    } catch (fallbackError) {
      console.log('AudioConfig: ❌ Fallback initialization failed:', fallbackError);
      // Don't throw - let app continue without audio
      isAudioModeInitialized = false;
    }
  }
}

/**
 * Initialize audio mode for RECORDING (background monitoring)
 * This is ONLY called by BackgroundAudioService when explicitly needed
 * Requires microphone permissions
 */
export async function initializeRecordingMode(): Promise<void> {
  console.log('AudioConfig: Switching to recording mode...');

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true, // ✅ Enable recording for background monitoring
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix, // Recording requires exclusive mode
      interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
    });

    currentAudioMode = 'recording';
    console.log('AudioConfig: ✅ Recording mode initialized');
  } catch (error) {
    console.log('AudioConfig: ❌ Error switching to recording mode:', error);
    throw error;
  }
}

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  console.log('AudioConfig: Requesting microphone permission...');
  
  try {
    const { status } = await Audio.requestPermissionsAsync();
    
    if (status === 'granted') {
      console.log('AudioConfig: ✅ Microphone permission granted');
      return true;
    } else {
      console.log('AudioConfig: ❌ Microphone permission denied');
      return false;
    }
  } catch (error) {
    console.log('AudioConfig: Error requesting permissions:', error);
    return false;
  }
}

/**
 * Reset audio mode initialization flag (for testing)
 */
export function resetAudioMode(): void {
  isAudioModeInitialized = false;
  console.log('AudioConfig: Reset audio mode flag');
}

/**
 * Check if audio mode is initialized
 */
export function isInitialized(): boolean {
  return isAudioModeInitialized;
}

