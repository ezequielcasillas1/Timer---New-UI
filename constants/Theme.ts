/**
 * Centralized Theme Colors
 * Based on Calmia meditation app design - clean, modern, calming
 */
export const theme = {
  // Background colors
  background: '#E8F4F8', // Soft light blue background
  card: '#FFFFFF', // White cards
  
  // Primary colors
  primary: '#7EC8E3', // Calm blue - main accent
  secondary: '#B8E0D2', // Soft teal - secondary accent
  accent: '#A8D8EA', // Light blue accent
  
  // Text colors
  text: '#2C3E50', // Dark blue-gray for primary text
  textSecondary: '#7F8C8D', // Medium gray for secondary text
  textLight: '#B0BEC5', // Light gray for hints
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF6B6B',
  info: '#2196F3',
  
  // Special colors
  streak: '#FF6B35', // Orange for streak indicators
  favorite: '#FF6B6B', // Pink/red for favorites
  
  // Border and divider
  border: '#E0E0E0',
  divider: '#E0E0E0',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Additional colors
  progressLight: '#D4ECF5', // Light blue for progress indicators
};

export type Theme = typeof theme;

