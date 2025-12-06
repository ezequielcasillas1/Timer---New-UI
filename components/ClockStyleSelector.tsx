import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { ClockStyle, ClockStyleDefinition, CLOCK_STYLES } from '@/src/services/ClockService';
import { soundService } from '@/src/services/SoundService';

interface ClockStyleSelectorProps {
  visible: boolean;
  currentStyle: ClockStyle;
  onSelect: (style: ClockStyle) => void;
  onClose: () => void;
}

export function ClockStyleSelector({ 
  visible, 
  currentStyle, 
  onSelect, 
  onClose 
}: ClockStyleSelectorProps) {
  const [previewStyle, setPreviewStyle] = useState<ClockStyle | null>(null);

  const handleStylePress = (style: ClockStyle) => {
    setPreviewStyle(style);
    soundService.playHaptic('light');
  };

  const handleStyleSelect = (style: ClockStyle) => {
    onSelect(style);
    soundService.playHaptic('medium');
    onClose();
  };

  const handleClose = () => {
    setPreviewStyle(null);
    soundService.playHaptic('light');
    onClose();
  };

  // Group styles by category
  const groupedStyles = {
    analog: CLOCK_STYLES.filter(s => s.category === 'analog'),
    digital: CLOCK_STYLES.filter(s => s.category === 'digital'),
    creative: CLOCK_STYLES.filter(s => s.category === 'creative'),
  };

  const renderStyleCard = (styleDefinition: ClockStyleDefinition) => {
    const isSelected = currentStyle === styleDefinition.id;
    const isPreviewing = previewStyle === styleDefinition.id;

    return (
      <TouchableOpacity
        key={styleDefinition.id}
        style={[
          styles.styleCard,
          isSelected && styles.selectedStyleCard,
          isPreviewing && styles.previewingStyleCard,
        ]}
        onPress={() => handleStylePress(styleDefinition.id)}
        onLongPress={() => handleStyleSelect(styleDefinition.id)}
      >
        {/* Style Icon */}
        <View style={styles.styleIconContainer}>
          <IconSymbol 
            name={getIconForStyle(styleDefinition.id)} 
            color={isSelected ? colors.metallicGold : colors.text} 
            size={32} 
          />
        </View>

        {/* Style Info */}
        <View style={styles.styleInfo}>
          <Text style={[
            styles.styleName,
            isSelected && styles.selectedStyleName
          ]}>
            {styleDefinition.name}
          </Text>
          <Text style={[
            styles.styleDescription,
            isSelected && styles.selectedStyleDescription
          ]}>
            {styleDefinition.description}
          </Text>
        </View>

        {/* Selected Badge */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <IconSymbol name="checkmark.circle.fill" color={colors.metallicGold} size={24} />
          </View>
        )}

        {/* Select Button */}
        <TouchableOpacity
          style={[
            styles.selectButton,
            isSelected && styles.selectedButton
          ]}
          onPress={() => handleStyleSelect(styleDefinition.id)}
        >
          <Text style={styles.selectButtonText}>
            {isSelected ? 'Current' : 'Select'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCategory = (category: 'analog' | 'digital' | 'creative', styles: ClockStyleDefinition[]) => {
    const categoryIcons = {
      analog: 'clock',
      digital: 'textformat.123',
      creative: 'sparkles'
    };

    const categoryTitles = {
      analog: 'Analog Clocks',
      digital: 'Digital Clocks',
      creative: 'Creative Clocks'
    };

    return (
      <View key={category} style={stylesSheet.categorySection}>
        <View style={stylesSheet.categoryHeader}>
          <IconSymbol 
            name={categoryIcons[category]} 
            color={colors.secondary} 
            size={20} 
          />
          <Text style={stylesSheet.categoryTitle}>{categoryTitles[category]}</Text>
        </View>
        {styles.map(renderStyleCard)}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={stylesSheet.modalOverlay}>
        <View style={stylesSheet.modalContainer}>
          {/* Header */}
          <View style={stylesSheet.modalHeader}>
            <Text style={stylesSheet.modalTitle}>Clock Styles</Text>
            <TouchableOpacity onPress={handleClose} style={stylesSheet.closeButton}>
              <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={28} />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={stylesSheet.instructionsContainer}>
            <IconSymbol name="info.circle" color={colors.accent} size={16} />
            <Text style={stylesSheet.instructionsText}>
              Tap to preview • Long press or tap "Select" to apply
            </Text>
          </View>

          {/* Styles List */}
          <ScrollView 
            style={stylesSheet.scrollView}
            contentContainerStyle={stylesSheet.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCategory('analog', groupedStyles.analog)}
            {renderCategory('digital', groupedStyles.digital)}
            {renderCategory('creative', groupedStyles.creative)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Helper function to get icon for each style
function getIconForStyle(style: ClockStyle): string {
  const iconMap: Record<ClockStyle, string> = {
    'analog-classic': 'clock',
    'analog-minimalist': 'clock.badge',
    'digital-modern': 'textformat.123',
    'digital-lcd': 'rectangle.inset.filled',
    '8bit-retro': 'square.grid.3x3.fill',
    'circular-progress': 'circle.dotted',
    'flip-clock': 'clock.arrow.2.circlepath',
    'binary': '01.circle',
  };
  return iconMap[style] || 'clock';
}

const { width, height } = Dimensions.get('window');

const stylesSheet = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 20,
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.metallicPlatinum,
    boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.metallicSilver,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  styleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedStyleCard: {
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  previewingStyleCard: {
    borderColor: colors.primary,
    transform: [{ scale: 0.98 }],
  },
  styleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  styleInfo: {
    flex: 1,
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedStyleName: {
    color: colors.text,
  },
  styleDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  selectedStyleDescription: {
    color: colors.text,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: colors.metallicGold,
    borderColor: colors.metallicGold,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

const styles = stylesSheet;

