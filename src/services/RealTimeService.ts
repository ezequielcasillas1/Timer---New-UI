
export interface RealTimeData {
  currentTime: Date;
  timezone: string;
  utcOffset: number;
}

export class RealTimeService {
  private static instance: RealTimeService;
  private subscribers: ((data: RealTimeData) => void)[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  subscribe(callback: (data: RealTimeData) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  start() {
    if (this.isRunning) return;
    
    console.log('RealTimeService: Starting real-time updates');
    this.isRunning = true;
    
    // Update every second
    this.interval = setInterval(() => {
      this.updateTime();
    }, 1000);
    
    // Initial update
    this.updateTime();
  }

  stop() {
    console.log('RealTimeService: Stopping real-time updates');
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private updateTime() {
    const now = new Date();
    const data: RealTimeData = {
      currentTime: now,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: now.getTimezoneOffset()
    };
    
    this.notifySubscribers(data);
  }

  private notifySubscribers(data: RealTimeData) {
    this.subscribers.forEach(callback => callback(data));
  }

  // Fallback method using device time (no API needed)
  getCurrentTime(): RealTimeData {
    const now = new Date();
    return {
      currentTime: now,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: now.getTimezoneOffset()
    };
  }

  // Format time for display
  formatTime(date: Date, format: '12h' | '24h' = '12h'): string {
    if (format === '12h') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  }
}

export const realTimeService = RealTimeService.getInstance();
