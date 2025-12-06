
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function TabBarBackground() {
  const theme = useTheme();
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={Platform.OS === 'web' ? 0 : 95}
        tint={theme.dark ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          {
            overflow: 'hidden',
            backgroundColor: Platform.select({
              ios: theme.dark 
                ? 'rgba(18, 18, 18, 0.92)' 
                : 'rgba(255, 255, 255, 0.88)',
              android: theme.dark 
                ? 'rgba(18, 18, 18, 0.96)' 
                : 'rgba(255, 255, 255, 0.96)',
              web: theme.dark 
                ? 'rgba(18, 18, 18, 0.92)' 
                : 'rgba(255, 255, 255, 0.88)',
            }),
          },
        ]}
      />
      {/* Top border with gradient effect */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: StyleSheet.hairlineWidth,
          backgroundColor: theme.dark 
            ? 'rgba(255, 255, 255, 0.18)' 
            : 'rgba(0, 0, 0, 0.12)',
        }}
      />
      {/* Subtle inner glow */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: theme.dark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.8)',
        }}
      />
    </View>
  );
}
