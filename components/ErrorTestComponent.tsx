
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { 
  logError, 
  logWarning, 
  logInfo, 
  addBreadcrumb, 
  reportError, 
  startTransaction 
} from '@/utils/errorLogger';
import { env } from '@/app/config/environment';

interface ErrorTestComponentProps {
  onClose?: () => void;
}

export const ErrorTestComponent: React.FC<ErrorTestComponentProps> = ({ onClose }) => {
  const [testCount, setTestCount] = useState(0);

  const handleRuntimeError = () => {
    addBreadcrumb('User triggered runtime error test', 'test');
    
    // This will cause a runtime error that the ErrorBoundary should catch
    throw new Error(`Test runtime error #${testCount + 1} - This is intentional for testing`);
  };

  const handleAsyncError = async () => {
    addBreadcrumb('User triggered async error test', 'test');
    setTestCount(prev => prev + 1);
    
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Test async error #${testCount + 1} - This is intentional for testing`));
        }, 1000);
      });
    } catch (error) {
      logError(error as Error, {
        customData: {
          testType: 'async-error',
          testCount: testCount + 1,
          timestamp: new Date().toISOString(),
        },
      });
      
      Alert.alert(
        'Async Error Logged',
        'An async error was caught and logged to the monitoring system.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWarningTest = () => {
    addBreadcrumb('User triggered warning test', 'test');
    setTestCount(prev => prev + 1);
    
    logWarning(`Test warning #${testCount + 1} - This is a warning level log`, {
      customData: {
        testType: 'warning',
        testCount: testCount + 1,
        severity: 'medium',
      },
    });
    
    Alert.alert(
      'Warning Logged',
      'A warning was logged to the monitoring system.',
      [{ text: 'OK' }]
    );
  };

  const handleInfoTest = () => {
    addBreadcrumb('User triggered info test', 'test');
    setTestCount(prev => prev + 1);
    
    logInfo(`Test info log #${testCount + 1} - This is an info level log`, {
      customData: {
        testType: 'info',
        testCount: testCount + 1,
        feature: 'error-testing',
      },
    });
    
    Alert.alert(
      'Info Logged',
      'An info message was logged to the monitoring system.',
      [{ text: 'OK' }]
    );
  };

  const handlePerformanceTest = () => {
    addBreadcrumb('User triggered performance test', 'test');
    setTestCount(prev => prev + 1);
    
    const transaction = startTransaction(`test-operation-${testCount + 1}`, 'test');
    
    // Simulate some work
    setTimeout(() => {
      transaction.finish();
      
      Alert.alert(
        'Performance Tracked',
        'A performance transaction was tracked in the monitoring system.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleBreadcrumbTest = () => {
    setTestCount(prev => prev + 1);
    
    // Add multiple breadcrumbs to show the trail
    addBreadcrumb('User started breadcrumb test', 'test', { testCount: testCount + 1 });
    addBreadcrumb('Step 1: Preparing test data', 'test');
    addBreadcrumb('Step 2: Processing test data', 'test');
    addBreadcrumb('Step 3: Validating results', 'test');
    addBreadcrumb('Breadcrumb test completed', 'test', { success: true });
    
    Alert.alert(
      'Breadcrumbs Added',
      'Multiple breadcrumbs were added to help with debugging context.',
      [{ text: 'OK' }]
    );
  };

  if (!env.isDevelopment) {
    return null; // Only show in development
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.glassEffect]}>
        <View style={styles.header}>
          <IconSymbol name="hammer.fill" size={24} color={colors.primary} />
          <Text style={styles.title}>Error Testing Tools</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.description}>
          Test the error handling and logging system. Only visible in development mode.
        </Text>
        
        <Text style={styles.testCount}>
          Tests run: {testCount}
        </Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity style={[styles.testButton, styles.errorButton]} onPress={handleRuntimeError}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.background} />
            <Text style={styles.errorButtonText}>Runtime Error</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.testButton, styles.warningButton]} onPress={handleAsyncError}>
            <IconSymbol name="clock.fill" size={16} color={colors.background} />
            <Text style={styles.warningButtonText}>Async Error</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.testButton, styles.infoButton]} onPress={handleWarningTest}>
            <IconSymbol name="exclamationmark.triangle" size={16} color={colors.background} />
            <Text style={styles.infoButtonText}>Warning Log</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.testButton, styles.successButton]} onPress={handleInfoTest}>
            <IconSymbol name="info.circle" size={16} color={colors.background} />
            <Text style={styles.successButtonText}>Info Log</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.testButton, styles.primaryButton]} onPress={handlePerformanceTest}>
            <IconSymbol name="speedometer" size={16} color={colors.background} />
            <Text style={styles.primaryButtonText}>Performance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.testButton, styles.secondaryButton]} onPress={handleBreadcrumbTest}>
            <IconSymbol name="list.bullet" size={16} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Breadcrumbs</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          💡 Check console logs and monitoring dashboard to see the results
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  glassEffect: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...commonStyles.heading,
    fontSize: 18,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    ...commonStyles.text,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  testCount: {
    ...commonStyles.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.primary,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: '48%',
    justifyContent: 'center',
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  warningButton: {
    backgroundColor: colors.secondary,
  },
  infoButton: {
    backgroundColor: '#3498db',
  },
  successButton: {
    backgroundColor: '#2ecc71',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  errorButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  warningButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  infoButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  successButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ErrorTestComponent;
