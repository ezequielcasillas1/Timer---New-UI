
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to log this to a service like Sentry
    if (!__DEV__) {
      // logErrorToService(error, errorInfo);
    }
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={[styles.errorCard, styles.glassEffect]}>
            <IconSymbol 
              name="exclamationmark.triangle" 
              size={48} 
              color={colors.error} 
              style={styles.icon}
            />
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
            )}
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 320,
  },
  glassEffect: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    ...commonStyles.heading,
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...commonStyles.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorDetails: {
    ...commonStyles.text,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    ...commonStyles.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    ...commonStyles.buttonText,
  },
});
