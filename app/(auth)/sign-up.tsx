
import React, { useState } from 'react';
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
// Google Sign-in temporarily disabled for Expo Go compatibility
// Uncomment when building with EAS or using expo-dev-client:
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from '@react-native-google-signin/google-signin';

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
  signUpButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  googleButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  googleButtonCustom: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
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
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
  configNotice: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  configNoticeText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  successNotice: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successNoticeText: {
    color: '#2E7D32',
    fontSize: 14,
    lineHeight: 20,
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Configure Google Sign-In (disabled for Expo Go)
  React.useEffect(() => {
    // Google Sign-in is disabled for Expo Go compatibility
    // Will be enabled when building with EAS or using expo-dev-client
    setGoogleConfigured(false);
    console.log('Google Sign-In: Disabled for Expo Go compatibility');
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Please enter your name';
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email';
      isValid = false;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (!password) {
      errors.password = 'Please enter a password';
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

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setValidationErrors({});
    
    try {
      console.log('Attempting to sign up user:', { email: email.trim(), name: name.trim() });
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: name.trim(),
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        
        // Handle specific error cases
        if (error.message.includes('rate limit') || error.message.includes('For security purposes')) {
          Alert.alert(
            'Too Many Attempts',
            'For security purposes, please wait a few minutes before trying again. This helps protect against spam and abuse.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('User already registered')) {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists. Please try signing in instead, or use the "Forgot Password" option if you need to reset your password.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Sign In', 
                onPress: () => router.replace('/(auth)/sign-in')
              }
            ]
          );
        } else if (error.message.includes('Email address not authorized')) {
          Alert.alert(
            'Email Not Authorized',
            'This email address is not authorized for signup. Please contact support or try with a different email address.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Sign Up Failed', error.message || 'An error occurred during sign up. Please try again.');
        }
      } else if (data.user) {
        console.log('Sign up successful:', data);
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required - show success state
          setSignUpSuccess(true);
          setUserEmail(email.trim());
          
          Alert.alert(
            'Check Your Email! 📧',
            `We've sent a verification link to ${email.trim()}.\n\nPlease check your email (including spam folder) and click the link to activate your account.\n\nOnce verified, you can sign in with your credentials.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Keep the user on this screen so they can resend if needed
                },
              },
            ]
          );
        } else if (data.session) {
          // User is automatically signed in (email confirmation disabled)
          Alert.alert(
            'Account Created Successfully!',
            'Welcome to the app! You can now start using all features.',
            [
              {
                text: 'Continue',
                onPress: () => router.replace('/(tabs)/(home)/'),
              },
            ]
          );
        }
      } else {
        console.warn('Sign up completed but no user data returned');
        Alert.alert(
          'Sign Up Status Unknown',
          'Please try signing in or check your email for verification instructions.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/sign-in'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Sign up exception:', error);
      Alert.alert(
        'Sign Up Error', 
        error?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('For security purposes')) {
          Alert.alert(
            'Please Wait',
            'For security purposes, please wait a few minutes before requesting another confirmation email.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert(
          'Email Sent!',
          `A new confirmation email has been sent to ${userEmail}. Please check your inbox and spam folder.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert(
      'Google Sign-In Unavailable in Expo Go',
      'Google Sign-In requires native code and is not available in Expo Go. Please use email and password to create your account.\n\nTo enable Google Sign-In, build the app with EAS Build or use expo-dev-client.'
    );
  };

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
          <BlurView intensity={80} style={styles.glassCard}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join us and start your focus journey
            </Text>

            {signUpSuccess && (
              <View style={styles.successNotice}>
                <Text style={styles.successNoticeText}>
                  ✅ Account created successfully! Please check your email ({userEmail}) for a verification link. You must click the link before you can sign in.
                </Text>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendConfirmation}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>
                    {loading ? 'Sending...' : 'Resend Confirmation Email'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.configNotice}>
              <Text style={styles.configNoticeText}>
                💡 Running in Expo Go. Google Sign-In requires a custom build (EAS). Use email and password to sign up.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  nameFocused && styles.inputFocused,
                  validationErrors.name && styles.inputError,
                ]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (validationErrors.name && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                editable={!signUpSuccess}
              />
              {validationErrors.name ? (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                  validationErrors.email && styles.inputError,
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationErrors.email && text.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(text.trim())) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!signUpSuccess}
              />
              {validationErrors.email ? (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
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
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!signUpSuccess}
              />
              {validationErrors.password ? (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
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
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                editable={!signUpSuccess}
              />
              {validationErrors.confirmPassword ? (
                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
              ) : null}
            </View>

            {!signUpSuccess && (
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  loading && styles.signUpButtonDisabled
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            )}

            {!signUpSuccess && (
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            )}

            {!signUpSuccess && (
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            {!signUpSuccess && (
              <TouchableOpacity
                style={[styles.googleButtonCustom, { opacity: 0.5 }]}
                onPress={handleGoogleSignIn}
              >
                <IconSymbol name="globe" size={20} color="white" />
                <Text style={styles.googleButtonText}>Continue with Google (Requires EAS Build)</Text>
              </TouchableOpacity>
            )}

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
