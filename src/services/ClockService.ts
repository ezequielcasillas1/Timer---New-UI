
import { realTimeService, RealTimeData } from './RealTimeService';

export interface ClockData {
  displayTime: Date; // The manipulated time to display
  realTime: Date; // The actual current time
  sessionStartTime?: Date; // When the session started
  sessionElapsedTime: number; // How long the session has been running (seconds)
  timeSlotAdvancement: number; // Minutes added by time slot
  speedMultiplier: number; // Current speed multiplier
  timeSlotDuration: number; // Time slot duration in minutes (15, 30, 50)
  slotEveryMinutes: number; // How often to apply time slot advancement
  mode: 'speed' | 'locked';
  isRunning: boolean;
  nextSlotTime?: Date; // When the next slot advancement will occur
}

// Clock Style Types
export type ClockStyle = 
  | 'analog-classic'      // Classic analog clock with hour/minute hands
  | 'analog-minimalist'   // Minimalist analog with thin lines
  | 'digital-modern'      // Large digital numbers, modern font
  | 'digital-lcd'         // LCD/segment display style
  | '8bit-retro'          // 8-bit pixel art style clock
  | 'circular-progress'   // Circular progress bar style
  | 'flip-clock'          // Flip clock animation style
  | 'binary';             // Binary clock representation

export interface ClockStyleDefinition {
  id: ClockStyle;
  name: string;
  description: string;
  thumbnail?: string; // Optional preview image
  category: 'analog' | 'digital' | 'creative';
}

// Clock Style Library
export const CLOCK_STYLES: ClockStyleDefinition[] = [
  {
    id: 'analog-classic',
    name: 'Classic Analog',
    description: 'Traditional clock with hour and minute hands',
    category: 'analog'
  },
  {
    id: 'analog-minimalist',
    name: 'Minimalist Analog',
    description: 'Clean, minimal design with thin lines',
    category: 'analog'
  },
  {
    id: 'digital-modern',
    name: 'Modern Digital',
    description: 'Large, easy-to-read digital display',
    category: 'digital'
  },
  {
    id: 'digital-lcd',
    name: 'LCD Display',
    description: 'Retro LCD segment display style',
    category: 'digital'
  },
  {
    id: '8bit-retro',
    name: '8-Bit Retro',
    description: 'Pixel art style inspired by classic games',
    category: 'creative'
  },
  {
    id: 'circular-progress',
    name: 'Circular Progress',
    description: 'Progress ring showing time advancement',
    category: 'creative'
  },
  {
    id: 'flip-clock',
    name: 'Flip Clock',
    description: 'Animated flip-style numbers',
    category: 'digital'
  },
  {
    id: 'binary',
    name: 'Binary Clock',
    description: 'For the tech-savvy: time in binary',
    category: 'creative'
  }
];

export class ClockService {
  private subscribers: ((data: ClockData) => void)[] = [];
  private realTimeUnsubscribe: (() => void) | null = null;
  private sessionInterval: NodeJS.Timeout | null = null;
  private slotInterval: NodeJS.Timeout | null = null;
  
  // Session state
  private sessionStartTime: Date | null = null;
  private sessionElapsedTime: number = 0;
  private baseDisplayTime: Date = new Date();
  private lastUpdateTime: Date = new Date();
  
  // Configuration
  private speedMultiplier: number = 1.0;
  private timeSlotDuration: number = 15; // 15, 30, or 50 minutes
  private slotEveryMinutes: number = 30; // Apply slot advancement every X minutes
  private timeSlotAdvancement: number = 0; // Total minutes advanced
  private mode: 'speed' | 'locked' = 'speed';
  private isRunning: boolean = false;
  private nextSlotTime: Date | null = null;

  constructor() {
    // Subscribe to real-time updates
    this.realTimeUnsubscribe = realTimeService.subscribe((realTimeData: RealTimeData) => {
      this.handleRealTimeUpdate(realTimeData);
    });
  }

  subscribe(callback: (data: ClockData) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  setMode(mode: 'speed' | 'locked') {
    console.log('ClockService: Setting mode to', mode);
    this.mode = mode;
    if (mode === 'locked') {
      this.speedMultiplier = 1.0;
    }
    this.notifySubscribers();
  }

  setSpeedMultiplier(multiplier: number) {
    console.log('ClockService: Setting speed multiplier to', multiplier);
    if (this.mode !== 'locked') {
      this.speedMultiplier = multiplier;
      this.notifySubscribers();
    }
  }

  setTimeSlotDuration(minutes: 0 | 15 | 30 | 50) {
    console.log('ClockService: Setting time slot duration to', minutes, 'minutes');
    this.timeSlotDuration = minutes;
    this.notifySubscribers();
  }

  setSlotEveryMinutes(minutes: number) {
    console.log('ClockService: Setting slot every to', minutes, 'minutes');
    this.slotEveryMinutes = minutes;
    if (this.isRunning) {
      this.scheduleNextSlot();
    }
    this.notifySubscribers();
  }

  start() {
    console.log('ClockService: Starting session');
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.sessionStartTime = new Date();
    this.sessionElapsedTime = 0;
    this.timeSlotAdvancement = 0;
    this.baseDisplayTime = new Date();
    this.lastUpdateTime = new Date();
    
    // Start real-time service
    realTimeService.start();
    
    // Start session timer (updates every 100ms for smooth display)
    this.sessionInterval = setInterval(() => {
      this.updateSessionTime();
    }, 100);
    
    // Schedule first slot advancement
    this.scheduleNextSlot();
    
    this.notifySubscribers();
  }

  stop() {
    console.log('ClockService: Stopping session');
    this.isRunning = false;
    
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
    
    if (this.slotInterval) {
      clearInterval(this.slotInterval);
      this.slotInterval = null;
    }
    
    this.nextSlotTime = null;
    realTimeService.stop();
    this.notifySubscribers();
  }

  private handleRealTimeUpdate(realTimeData: RealTimeData) {
    if (!this.isRunning) {
      // When not running, just display real time
      this.baseDisplayTime = realTimeData.currentTime;
      this.notifySubscribers();
    }
  }

  private updateSessionTime() {
    if (!this.isRunning || !this.sessionStartTime) return;

    const now = new Date();
    const realElapsed = (now.getTime() - this.sessionStartTime.getTime()) / 1000; // seconds
    this.sessionElapsedTime = realElapsed;

    // Calculate display time based on mode and speed
    this.calculateDisplayTime(now);
    this.notifySubscribers();
  }

  private calculateDisplayTime(currentRealTime: Date) {
    if (!this.sessionStartTime) return;

    // Calculate how much time has passed since session start
    const sessionElapsedMs = currentRealTime.getTime() - this.sessionStartTime.getTime();
    
    // Apply speed multiplier to the elapsed time
    const speedAdjustedElapsedMs = sessionElapsedMs * this.speedMultiplier;
    
    // Debug log every 10 seconds
    const elapsedSeconds = Math.floor(sessionElapsedMs / 1000);
    if (elapsedSeconds % 10 === 0 && elapsedSeconds > 0) {
      console.log(`ClockService: Multiplier=${this.speedMultiplier}x, Real=${elapsedSeconds}s, Adjusted=${Math.floor(speedAdjustedElapsedMs/1000)}s`);
    }
    
    // Start with the real time when session began
    const baseTime = this.sessionStartTime.getTime();
    
    // Add speed-adjusted elapsed time
    let displayTimeMs = baseTime + speedAdjustedElapsedMs;
    
    // Add time slot advancement (convert minutes to milliseconds)
    displayTimeMs += this.timeSlotAdvancement * 60 * 1000;
    
    this.baseDisplayTime = new Date(displayTimeMs);
  }

  private scheduleNextSlot() {
    if (!this.isRunning || !this.sessionStartTime) return;

    // Clear existing slot timer
    if (this.slotInterval) {
      clearInterval(this.slotInterval);
    }

    // Don't schedule slots if slotEveryMinutes is 0 (feature disabled)
    if (this.slotEveryMinutes === 0 || this.timeSlotDuration === 0) {
      console.log('ClockService: Time slot feature is disabled, skipping slot scheduling');
      this.nextSlotTime = null;
      return;
    }

    // Calculate when the next slot should occur
    const nextSlotMs = this.slotEveryMinutes * 60 * 1000; // Convert to milliseconds
    this.nextSlotTime = new Date(Date.now() + nextSlotMs);

    console.log('ClockService: Next slot advancement scheduled for', this.nextSlotTime);

    this.slotInterval = setTimeout(() => {
      this.applyTimeSlotAdvancement();
      // Schedule the next slot
      this.scheduleNextSlot();
    }, nextSlotMs);
  }

  private applyTimeSlotAdvancement() {
    console.log('ClockService: Applying time slot advancement of', this.timeSlotDuration, 'minutes');
    this.timeSlotAdvancement += this.timeSlotDuration;
    this.notifySubscribers();
  }

  getCurrentData(): ClockData {
    const realTime = new Date();
    
    return {
      displayTime: this.baseDisplayTime,
      realTime: realTime,
      sessionStartTime: this.sessionStartTime || undefined,
      sessionElapsedTime: this.sessionElapsedTime,
      timeSlotAdvancement: this.timeSlotAdvancement,
      speedMultiplier: this.speedMultiplier,
      timeSlotDuration: this.timeSlotDuration,
      slotEveryMinutes: this.slotEveryMinutes,
      mode: this.mode,
      isRunning: this.isRunning,
      nextSlotTime: this.nextSlotTime || undefined
    };
  }

  formatTime(date: Date, format: '12h' | '24h' = '12h'): string {
    return realTimeService.formatTime(date, format);
  }

  private notifySubscribers() {
    const data = this.getCurrentData();
    this.subscribers.forEach(callback => callback(data));
  }

  // Cleanup
  destroy() {
    this.stop();
    if (this.realTimeUnsubscribe) {
      this.realTimeUnsubscribe();
    }
  }
}

export const clockService = new ClockService();
