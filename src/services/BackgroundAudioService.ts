import { Audio } from 'expo-av';
import { initializeRecordingMode, requestMicrophonePermission } from './AudioConfig';

/**
 * BACKGROUND AUDIO SERVICE - Environmental Sound Detection
 * 
 * This service enables the app to continue listening for environmental sounds
 * even when the screen is off or the app is in the background.
 * 
 * Features:
 * - Background audio recording (works when screen is off)
 * - Sound level monitoring (detects presence of sound/noise)
 * - Persistent recording session across screen lock/unlock
 * - Low-power monitoring mode
 * 
 * iOS Requirements:
 * - UIBackgroundModes: ["audio"] in app.json
 * - NSMicrophoneUsageDescription in Info.plist
 * - allowsRecordingIOS: true in Audio.setAudioModeAsync
 */

export interface AudioLevelData {
  timestamp: number;
  level: number; // -160 dB (silence) to 0 dB (max)
  isActive: boolean;
}

export class BackgroundAudioService {
  private recording: Audio.Recording | null = null;
  private isMonitoring: boolean = false;
  private isInitialized: boolean = false;
  private meteringInterval: NodeJS.Timeout | null = null;
  private onSoundDetectedCallback: ((data: AudioLevelData) => void) | null = null;

  /**
   * Initialize the audio service with recording capabilities
   */
  async initialize() {
    console.log('BackgroundAudioService: Initializing');
    
    try {
      // Request microphone permissions
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        console.log('BackgroundAudioService: Microphone permission denied');
        throw new Error('Microphone permission required for sound detection');
      }

      // Switch to recording mode (only when background monitoring is needed)
      await initializeRecordingMode();

      this.isInitialized = true;
      console.log('BackgroundAudioService: Initialized successfully');
      
      return true;
    } catch (error) {
      console.log('BackgroundAudioService: Initialization error:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Start monitoring environmental sounds
   * This will continue running even when the screen is off
   */
  async startMonitoring(onSoundDetected?: (data: AudioLevelData) => void) {
    if (!this.isInitialized) {
      console.log('BackgroundAudioService: Not initialized, initializing now...');
      await this.initialize();
    }

    if (this.isMonitoring) {
      console.log('BackgroundAudioService: Already monitoring');
      return;
    }

    try {
      console.log('BackgroundAudioService: Starting sound monitoring...');

      // Store callback
      if (onSoundDetected) {
        this.onSoundDetectedCallback = onSoundDetected;
      }

      // Create and start recording with metering enabled
      this.recording = new Audio.Recording();
      
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.LOW, // Low quality for background monitoring
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true, // ✅ CRITICAL: Enable sound level monitoring
      });

      await this.recording.startAsync();
      this.isMonitoring = true;

      console.log('BackgroundAudioService: ✅ Recording started with metering enabled');

      // Start polling for sound levels every 500ms
      this.startMetering();

    } catch (error) {
      console.log('BackgroundAudioService: ❌ Error starting monitoring:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Poll the recording for sound level data
   * This continues to work when screen is off
   */
  private startMetering() {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
    }

    console.log('BackgroundAudioService: Starting metering polling...');

    this.meteringInterval = setInterval(async () => {
      if (!this.recording || !this.isMonitoring) {
        return;
      }

      try {
        const status = await this.recording.getStatusAsync();
        
        if (status.isRecording && status.metering !== undefined) {
          const levelData: AudioLevelData = {
            timestamp: Date.now(),
            level: status.metering, // -160 dB to 0 dB
            isActive: status.metering > -50, // Consider sounds above -50 dB as "active"
          };

          // Log sound detection (throttled to avoid spam)
          if (levelData.isActive) {
            console.log(`BackgroundAudioService: 🔊 Sound detected! Level: ${levelData.level.toFixed(1)} dB`);
          }

          // Call callback if provided
          if (this.onSoundDetectedCallback) {
            this.onSoundDetectedCallback(levelData);
          }
        }
      } catch (error) {
        console.log('BackgroundAudioService: Metering error:', error);
      }
    }, 500); // Poll every 500ms
  }

  /**
   * Stop monitoring environmental sounds
   */
  async stopMonitoring() {
    console.log('BackgroundAudioService: Stopping sound monitoring...');

    // Clear metering interval
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
      this.meteringInterval = null;
    }

    // Stop and unload recording
    if (this.recording) {
      try {
        const status = await this.recording.getStatusAsync();
        
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
          console.log('BackgroundAudioService: ✅ Recording stopped');
        }
      } catch (error) {
        console.log('BackgroundAudioService: Error stopping recording:', error);
      }
      
      this.recording = null;
    }

    this.isMonitoring = false;
    this.onSoundDetectedCallback = null;
    console.log('BackgroundAudioService: Sound monitoring stopped');
  }

  /**
   * Check if currently monitoring
   */
  getIsMonitoring(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get current sound level (last reading)
   * Returns null if not monitoring
   */
  async getCurrentLevel(): Promise<number | null> {
    if (!this.recording || !this.isMonitoring) {
      return null;
    }

    try {
      const status = await this.recording.getStatusAsync();
      return status.isRecording && status.metering !== undefined ? status.metering : null;
    } catch (error) {
      console.log('BackgroundAudioService: Error getting level:', error);
      return null;
    }
  }

  /**
   * Cleanup service
   */
  async cleanup() {
    await this.stopMonitoring();
    this.isInitialized = false;
    console.log('BackgroundAudioService: Cleaned up');
  }
}

// Singleton instance
export const backgroundAudioService = new BackgroundAudioService();

