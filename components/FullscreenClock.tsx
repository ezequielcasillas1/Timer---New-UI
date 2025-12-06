import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import ClockDisplay from './ClockDisplay';

interface FullscreenClockProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullscreenClock({ visible, onClose }: FullscreenClockProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar hidden={true} />
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.clockContainer}>
          <ClockDisplay isFullscreen={true} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

