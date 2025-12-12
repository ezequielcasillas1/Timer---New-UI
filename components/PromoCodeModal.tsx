import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './IconSymbol';
import { freeEntryService } from '@/src/services/FreeEntryService';
import { useAuth } from '@/src/context/AuthContext';
import { theme } from '@/constants/Theme';

const newUIColors = theme;

interface PromoCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (accessDays: number) => void;
}

export default function PromoCodeModal({ visible, onClose, onSuccess }: PromoCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const { user } = useAuth();

  const handleValidate = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a promotional code');
      return;
    }

    setValidating(true);
    const validation = await freeEntryService.validateCode(code.trim().toUpperCase());
    setValidating(false);

    if (validation.success && validation.valid) {
      Alert.alert(
        'Code Valid!',
        `This code grants ${validation.metadata?.days || 30} days of free access. Would you like to redeem it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Redeem', onPress: handleRedeem },
        ]
      );
    } else {
      Alert.alert('Invalid Code', validation.error || 'This promotional code is not valid or has expired.');
    }
  };

  const handleRedeem = async () => {
    if (!code.trim()) {
      return;
    }

    setLoading(true);
    // Allow redemption even if user is not authenticated yet (during sign-up)
    const redemption = await freeEntryService.redeemCode(
      code.trim().toUpperCase(),
      user?.id || undefined,
      user?.email || undefined
    );
    setLoading(false);

    if (redemption.success && redemption.accessGranted) {
      Alert.alert(
        'Success!',
        redemption.message || `Free access granted for ${redemption.accessGranted.accessDays} days!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCode('');
              onSuccess?.(redemption.accessGranted!.accessDays);
              onClose();
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', redemption.error || 'Failed to redeem code. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Enter Promotional Code</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={24} color={newUIColors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Have a promotional code? Enter it below to unlock free access to premium features.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter code (e.g., FREETRIAL2024)"
                placeholderTextColor={newUIColors.textSecondary}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading && !validating}
              />
              {validating && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={newUIColors.primary} />
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.validateButton, (loading || validating) && styles.buttonDisabled]}
                onPress={handleValidate}
                disabled={loading || validating || !code.trim()}
              >
                {validating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.validateButtonText}>Validate Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.redeemButton, (loading || validating || !code.trim()) && styles.buttonDisabled]}
                onPress={handleRedeem}
                disabled={loading || validating || !code.trim()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol name="gift.fill" size={18} color="#FFFFFF" />
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <IconSymbol name="info.circle" size={16} color={newUIColors.primary} />
              <Text style={styles.infoText}>
                You can enter a code during sign-up or redeem it later in your profile settings.
              </Text>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    padding: 24,
    backgroundColor: newUIColors.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: newUIColors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: newUIColors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: newUIColors.text,
    borderWidth: 2,
    borderColor: newUIColors.border,
    textTransform: 'uppercase',
  },
  loadingOverlay: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  validateButton: {
    backgroundColor: newUIColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: newUIColors.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: newUIColors.primary + '10',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: newUIColors.textSecondary,
    lineHeight: 16,
  },
});
