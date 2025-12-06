import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

import { theme } from '@/constants/Theme';

const newUIColors = theme;

interface SavePresetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function SavePresetModal({
  visible,
  onClose,
  onSave,
}: SavePresetModalProps) {
  const [presetName, setPresetName] = useState('');

  const handleSave = () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a name for your preset');
      return;
    }
    onSave(presetName.trim());
    setPresetName('');
    onClose();
  };

  const handleClose = () => {
    setPresetName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save Sound Preset</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={newUIColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Preset Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Focus, Deep Work"
              placeholderTextColor={newUIColors.textSecondary}
              value={presetName}
              onChangeText={setPresetName}
              autoFocus
              maxLength={30}
            />
            <Text style={styles.hint}>
              Give your sound combination a memorable name
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: newUIColors.card,
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: newUIColors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: newUIColors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: newUIColors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hint: {
    fontSize: 12,
    color: newUIColors.textSecondary,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: newUIColors.text,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: newUIColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

