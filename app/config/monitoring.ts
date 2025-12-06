
import { env } from './environment';

// Monitoring configuration
export const monitoringConfig = {
  // Sentry configuration
  sentry: {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '', // Add your Sentry DSN here
    environment: env.isProduction ? 'production' : 'development',
    release: '1.0.0', // Update this with your app version
    dist: '1',
    enabled: env.isProduction, // Only enable in production
    
    // Performance monitoring
    tracesSampleRate: env.isProduction ? 0.1 : 1.0, // Lower sample rate in production
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    enableNativeCrashHandling: true,
    enableAutoPerformanceTracing: true,
    
    // Privacy settings
    beforeSend: (event: any) => {
      // Filter out sensitive information
      if (event.exception) {
        event.exception.values?.forEach((exception: any) => {
          if (exception.stacktrace?.frames) {
            // Remove node_modules frames to reduce noise
            exception.stacktrace.frames = exception.stacktrace.frames.filter(
              (frame: any) => !frame.filename?.includes('node_modules')
            );
          }
        });
      }
      
      // Remove sensitive user data
      if (event.user) {
        delete event.user.email; // Remove email for privacy
      }
      
      return event;
    },
  },
  
  // Logging levels
  logLevels: {
    production: ['error', 'warning'],
    development: ['error', 'warning', 'info', 'debug'],
  },
  
  // Error reporting settings
  errorReporting: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  },
  
  // Performance monitoring
  performance: {
    enableTransactionTracking: true,
    enableNetworkTracking: env.isProduction,
    enableNavigationTracking: true,
    slowTransactionThreshold: 2000, // 2 seconds
  },
  
  // User feedback
  userFeedback: {
    enableUserFeedback: true,
    enableScreenshots: !env.isProduction, // Only in development
    enableUserReplay: false, // Disabled for privacy
  },
};

// Feature flags for error handling
export const errorHandlingFeatures = {
  enableErrorBoundary: true,
  enableGlobalErrorHandler: true,
  enableUnhandledPromiseRejectionHandler: true,
  enableConsoleErrorCapture: !env.isProduction, // Only in development
  enableBreadcrumbs: true,
  enableUserContext: true,
  enablePerformanceMonitoring: true,
  enableNetworkErrorTracking: env.isProduction,
};

// Error categories for better organization
export const errorCategories = {
  AUTHENTICATION: 'authentication',
  NETWORK: 'network',
  STORAGE: 'storage',
  UI: 'ui',
  PERFORMANCE: 'performance',
  BUSINESS_LOGIC: 'business_logic',
  THIRD_PARTY: 'third_party',
  UNKNOWN: 'unknown',
};

// Error severity levels
export const errorSeverity = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug',
};

export default monitoringConfig;
