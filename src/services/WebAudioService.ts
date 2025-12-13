/**
 * WEB AUDIO SERVICE - Native Web Audio API Implementation
 * 
 * expo-av has limited web support. This service uses native Web Audio API
 * for browser playback while maintaining the same interface as SoundService.
 */

export class WebAudioService {
  private audioContext: AudioContext | null = null;
  private audioBuffers: { [key: string]: AudioBuffer } = {};
  private audioSources: { [key: string]: AudioBufferSourceNode } = {};
  private gainNodes: { [key: string]: GainNode } = {};
  private isInitialized: boolean = false;
  private masterEnabled: boolean = true;

  async initialize() {
    console.log('🌐 [WebAudioService] Initializing Web Audio API');
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('🌐 [WebAudioService] ✅ Initialized successfully');
    } catch (error) {
      console.error('🌐 [WebAudioService] Failed to initialize:', error);
    }
  }

  async loadSound(soundPath: string): Promise<boolean> {
    if (!this.audioContext) {
      console.error('🌐 [WebAudioService] AudioContext not initialized');
      return false;
    }

    try {
      console.log(`🌐 [WebAudioService] Loading sound: ${soundPath}`);
      
      // Fetch the audio file
      const response = await fetch(soundPath);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers[soundPath] = audioBuffer;
      
      console.log(`🌐 [WebAudioService] ✅ Loaded: ${soundPath}`);
      return true;
    } catch (error) {
      console.error(`🌐 [WebAudioService] Error loading ${soundPath}:`, error);
      return false;
    }
  }

  async playSound(soundPath: string, loop: boolean = true): Promise<boolean> {
    if (!this.audioContext || !this.masterEnabled) {
      console.log('🌐 [WebAudioService] Cannot play - not initialized or disabled');
      return false;
    }

    try {
      // Stop existing sound if playing
      if (this.audioSources[soundPath]) {
        this.stopSound(soundPath);
      }

      // Load sound if not already loaded
      if (!this.audioBuffers[soundPath]) {
        const loaded = await this.loadSound(soundPath);
        if (!loaded) return false;
      }

      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffers[soundPath];
      source.loop = loop;

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.7;

      // Connect: source → gain → destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Store references
      this.audioSources[soundPath] = source;
      this.gainNodes[soundPath] = gainNode;

      // Start playback
      source.start(0);
      console.log(`🌐 [WebAudioService] ▶️ Playing: ${soundPath}, loop: ${loop}`);
      
      return true;
    } catch (error) {
      console.error(`🌐 [WebAudioService] Error playing ${soundPath}:`, error);
      return false;
    }
  }

  stopSound(soundPath: string): void {
    if (this.audioSources[soundPath]) {
      try {
        this.audioSources[soundPath].stop();
        this.audioSources[soundPath].disconnect();
        delete this.audioSources[soundPath];
        delete this.gainNodes[soundPath];
        console.log(`🌐 [WebAudioService] ⏹️ Stopped: ${soundPath}`);
      } catch (error) {
        // Already stopped
      }
    }
  }

  async forceStopAll(): Promise<void> {
    console.log('🌐 [WebAudioService] Stopping all sounds');
    Object.keys(this.audioSources).forEach(soundPath => {
      this.stopSound(soundPath);
    });
  }

  setMasterEnabled(enabled: boolean): void {
    this.masterEnabled = enabled;
    if (!enabled) {
      this.forceStopAll();
    }
  }
}

// Singleton instance
export const webAudioService = new WebAudioService();










