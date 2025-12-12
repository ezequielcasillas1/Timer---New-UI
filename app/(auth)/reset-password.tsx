import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glassCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  signInLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
});

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState<'request' | 'sent' | 'reset'>('request');
  const [resetError, setResetError] = useState<string | null>(null);

  const redirectUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/reset-password`;
    }
    return 'https://natively.dev/reset-password';
  }, []);

  useEffect(() => {
    const detectRecoveryFromUrl = () => {
      if (typeof window === 'undefined') return false;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token');
      const hasRecoveryQuery = searchParams.get('type') === 'recovery';
      return hasRecoveryHash || hasRecoveryQuery;
    };

    const fromUrl = detectRecoveryFromUrl();
    if (fromUrl) {
      setStep('reset');
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('reset');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const validateEmail = () => {
    const errors: {[key: string]: string} = {};

    if (!email.trim()) {
      errors.email = 'Please enter your email address';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {};

    if (!password) {
      errors.password = 'Please enter a new password';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRequestReset = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setValidationErrors({});
    setResetError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset request error:', error);
        if (Platform.OS === 'web') {
          alert(error.message || 'Failed to send reset email');
        } else {
          Alert.alert('Error', error.message || 'Failed to send reset email');
        }
        return;
      }

      setStep('sent');
    } catch (error: any) {
      console.error('Password reset request exception:', error);
      if (Platform.OS === 'web') {
        alert(error?.message || 'An unexpected error occurred');
      } else {
        Alert.alert('Error', error?.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    setValidationErrors({});
    setResetError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) {
        console.error('Password reset error:', error);
        if (Platform.OS === 'web') {
          alert(error.message || 'Failed to reset password');
        } else {
          Alert.alert('Password Reset Failed', error.message || 'An error occurred while resetting your password');
        }
        return;
      }

      if (Platform.OS === 'web') {
        if (window.confirm('Password updated. Return to sign in?')) {
          supabase.auth.signOut().finally(() => {
            router.replace('/(auth)/sign-in');
          });
        }
      } else {
        Alert.alert(
          'Password Updated',
          'Your password has been reset. Please sign in with your new password.',
          [
            {
              text: 'Continue',
              onPress: () => {
                supabase.auth.signOut().finally(() => {
                  router.replace('/(auth)/sign-in');
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Password reset exception:', error);
      if (Platform.OS === 'web') {
        alert(error?.message || 'An unexpected error occurred');
      } else {
        Alert.alert(
          'Password Reset Error',
          error?.message || 'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRequestForm = () => (
    <BlurView intensity={80} style={styles.glassCard}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email to get a reset link.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.email && styles.inputError,
          ]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (validationErrors.email) {
              setValidationErrors(prev => ({ ...prev, email: '' }));
            }
          }}
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {validationErrors.email ? (
          <Text style={styles.errorText}>{validationErrors.email}</Text>
        ) : null}
        <Text style={styles.helper}>
          We’ll email you a secure link. Check spam if you don’t see it.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          loading && styles.primaryButtonDisabled,
        ]}
        onPress={handleRequestReset}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Remember your password?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {resetError ? (
        <Text style={[styles.errorText, { marginTop: 12 }]}>{resetError}</Text>
      ) : null}
    </BlurView>
  );

  const renderSentConfirmation = () => (
    <BlurView intensity={80} style={styles.glassCard}>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We sent a reset link to {email || 'your email'}. Open it on your device to continue.
      </Text>
      <Text style={styles.helper}>
        If nothing arrives, wait a moment and check spam/junk. You can also try again.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/(auth)/sign-in')}
      >
        <Text style={styles.primaryButtonText}>
          Return to Sign In
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Didn't receive the email?</Text>
        <TouchableOpacity onPress={() => setStep('request')}>
          <Text style={styles.signInLink}>Send Again</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const renderResetForm = () => (
    <BlurView intensity={80} style={styles.glassCard}>
      <Text style={styles.title}>Create a New Password</Text>
      <Text style={styles.subtitle}>
        Set a strong password to secure your account.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.password && styles.inputError,
          ]}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (validationErrors.password && text.length >= 6) {
              setValidationErrors(prev => ({ ...prev, password: '' }));
            }
            if (validationErrors.confirmPassword && text === confirmPassword) {
              setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
          }}
          placeholder="At least 6 characters"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
        {validationErrors.password ? (
          <Text style={styles.errorText}>{validationErrors.password}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.confirmPassword && styles.inputError,
          ]}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (validationErrors.confirmPassword && text === password) {
              setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
          }}
          placeholder="Re-enter your new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
        {validationErrors.confirmPassword ? (
          <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
        ) : null}
        <Text style={styles.helper}>
          You’ll be signed out after resetting and can sign in with the new password.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          loading && styles.primaryButtonDisabled,
        ]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Need to start over?</Text>
        <TouchableOpacity onPress={() => setStep('request')}>
          <Text style={styles.signInLink}>Send a New Link</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {step !== 'reset' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'request' && renderRequestForm()}
          {step === 'sent' && renderSentConfirmation()}
          {step === 'reset' && renderResetForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
