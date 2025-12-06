
import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

// Google Fonts
export const fonts = {
  ui: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  clock: Platform.select({
    web: 'Orbitron, "Courier New", monospace',
    default: 'System',
  }),
  mono: Platform.select({
    web: '"Roboto Mono", "Courier New", monospace',
    default: 'monospace',
  }),
};

export const colors = {
  background: '#F5F5DC', // Beige
  text: '#282828', // Dark Gray
  textSecondary: '#71797E', // Gray
  primary: '#ADD8E6', // Light Blue
  secondary: '#90EE90', // Light Green
  accent: '#FFB6C1', // Light Pink
  card: '#FFFFFF', // White
  cardBackground: '#FFFFFF', // White - Added missing color
  border: '#E5E5E5', // Light Gray - Added missing color
  highlight: '#FFFFE0', // Light Yellow
  error: '#FF6B6B', // Light Red
  // New metallic colors for outlines
  metallicSilver: '#C0C0C0',
  metallicGold: '#D4AF37',
  metallicBronze: '#CD7F32',
  metallicPlatinum: '#E5E4E2',
  metallicChrome: '#BCC6CC',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 4px 8px rgba(192, 192, 192, 0.3)',
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.3)',
    elevation: 6,
  },
  accent: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicBronze,
    boxShadow: '0px 4px 8px rgba(205, 127, 50, 0.3)',
    elevation: 6,
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.metallicPlatinum,
    boxShadow: '0px 6px 16px rgba(229, 228, 226, 0.4)',
    elevation: 8,
  },
  glassCard: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderWidth: 2,
    borderColor: colors.metallicChrome,
    boxShadow: '0px 6px 16px rgba(188, 198, 204, 0.4)',
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: fonts.ui,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: fonts.ui,
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: fonts.ui,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontFamily: fonts.ui,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.ui,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 4px 8px rgba(192, 192, 192, 0.3)',
    elevation: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shadow: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 6,
  },
  // New metallic button styles
  metallicButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
  silverButton: {
    backgroundColor: colors.card,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 4px 8px rgba(192, 192, 192, 0.4)',
  },
  goldButton: {
    backgroundColor: colors.highlight,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
  },
  bronzeButton: {
    backgroundColor: colors.card,
    borderColor: colors.metallicBronze,
    boxShadow: '0px 4px 8px rgba(205, 127, 50, 0.4)',
  },
  // Enhanced card styles with metallic borders
  silverCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 6px 16px rgba(192, 192, 192, 0.3)',
    elevation: 8,
  },
  goldCard: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.metallicGold,
    boxShadow: '0px 6px 16px rgba(212, 175, 55, 0.3)',
    elevation: 8,
  },
  platinumCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.metallicPlatinum,
    boxShadow: '0px 6px 16px rgba(229, 228, 226, 0.4)',
    elevation: 8,
  },
  bronzeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.metallicBronze,
    boxShadow: '0px 6px 16px rgba(205, 127, 50, 0.3)',
    elevation: 8,
  },
});
