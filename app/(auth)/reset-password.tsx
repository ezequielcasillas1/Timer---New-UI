
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { BlurView } from 'expo-blur';
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
    marginBottom: 32,
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
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  resetButtonText: {
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
});

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState<'request' | 'sent' | 'reset'>('request');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Check if user has a valid reset token (came from email link)
  useEffect(() => {
    const checkResetToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // If there's a session and it's from a password recovery, show reset form
      if (session) {
        setIsResettingPassword(true);
        setStep('reset');
      }
    };
    checkResetToken();
  }, []);

  const validateEmail = () => {
    const errors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      errors.email = 'Please enter your email address';
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  };

  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    if (!password) {
      errors.password = 'Please enter a new password';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleRequestReset = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setValidationErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/(auth)/reset-password`,
      });

      if (error) {
        console.error('Password reset request error:', error);
        if (Platform.OS === 'web') {
          alert(error.message || 'Failed to send reset email');
        } else {
          Alert.alert('Error', error.message || 'Failed to send reset email');
        }
      } else {
        setStep('sent');
      }
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

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password reset error:', error);
        if (Platform.OS === 'web') {
          alert(error.message || 'Failed to reset password');
        } else {
          Alert.alert('Password Reset Failed', error.message || 'An error occurred while resetting your password');
        }
      } else {
        const message = 'Your password has been updated successfully. You can now sign in with your new password.';
        if (Platform.OS === 'web') {
          if (window.confirm(message + '\n\nGo to Sign In?')) {
            router.replace('/(auth)/sign-in');
          }
        } else {
          Alert.alert(
            'Password Reset Successful!',
            message,
            [
              {
                text: 'Continue to Sign In',
                onPress: () => router.replace('/(auth)/sign-in'),
              },
            ]
          );
        }
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

  // Render email request form
  const renderRequestForm = () => (
    <BlurView intensity={80} style={styles.glassCard}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            emailFocused && styles.inputFocused,
            validationErrors.email && styles.inputError,
          ]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (validationErrors.email) {
              setValidationErrors(prev => ({ ...prev, email: '' }));
            }
          }}
          placeholder="Enter your email address"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
        {validationErrors.email ? (
          <Text style={styles.errorText}>{validationErrors.email}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.resetButton,
          loading && styles.resetButtonDisabled
        ]}
        onPress={handleRequestReset}
        disabled={loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Remember your password?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
          </BlurView>
  );

  // Render confirmation that email was sent
  const renderSentConfirmation = () => (
    <BlurView intensity={80} style={styles.glassCard}>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a password reset link to {email}. Please check your inbox and click the link to reset your password.
      </Text>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => router.push('/(auth)/sign-in')}
      >
        <Text style={styles.resetButtonText}>
          Return to Sign In
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Didn't receive the email?</Text>
        <TouchableOpacity onPress={() => setStep('request')}>
          <Text style={styles.signInLink}>Try Again</Text>
        </TouchableOpacity>
      </View>
          </BlurView>
  );

  // Render password reset form (after clicking email link)
  const renderResetForm = () => (
    <BlurView intensity={80} style={styles.glassCard}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your new password below
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={[
            styles.input,
            passwordFocused && styles.inputFocused,
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
          placeholder="Enter your new password (min. 6 characters)"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
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
            confirmPasswordFocused && styles.inputFocused,
            validationErrors.confirmPassword && styles.inputError,
          ]}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (validationErrors.confirmPassword && text === password) {
              setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
          }}
          placeholder="Confirm your new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          onFocus={() => setConfirmPasswordFocused(true)}
          onBlur={() => setConfirmPasswordFocused(false)}
        />
        {validationErrors.confirmPassword ? (
          <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.resetButton,
          loading && styles.resetButtonDisabled
        ]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? 'Updating Password...' : 'Update Password'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Remember your password?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
          </BlurView>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
      </TouchableOpacity>

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
