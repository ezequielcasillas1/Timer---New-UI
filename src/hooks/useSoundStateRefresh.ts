import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { soundService } from '@/src/services/SoundService';

/**
 * Hook to automatically refresh sound state when a page loads/focuses.
 * Stops all playing sounds (audio playback) but preserves enabled flags and user selections.
 * This prevents sounds from continuing to play from previous sessions while preserving
 * checkbox states and form inputs.
 */
export function useSoundStateRefresh() {
  useFocusEffect(
    useCallback(() => {
      // Stop all sounds immediately when page loads
      // This prevents audio from continuing to play, but preserves the enabled flags
      // so checkboxes remain checked and user preferences are maintained
      soundService.forceStopAll().catch((error) => {
        console.error('useSoundStateRefresh: Error stopping sounds:', error);
      });
    }, [])
  );
}
