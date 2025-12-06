/**
 * Freesound API Configuration
 * 
 * ✅ SECURITY: API credentials are now stored on Supabase Edge Function
 * 
 * The app no longer uses client_id/client_secret directly.
 * Instead, it calls a Supabase Edge Function that securely handles authentication.
 * 
 * API Keys Location: Supabase Dashboard → Project Settings → Edge Functions → Secrets
 */

export const FREESOUND_CONFIG = {
  // No longer needed - using Supabase Edge Function
  clientId: '',
  clientSecret: '',
  
  // API Base URL (don't change this)
  apiBaseUrl: 'https://freesound.org/apiv2',
  
  // Sound IDs to download (from your original URLs)
  soundIds: {
    // Breathing sounds
    breathing: [
      '554735', // Deep Calm Breathing
      '391175', // Gentle Wave Breathing
      '336532', // Meditative Breathing
    ],
    // Ticking sounds
    ticking: [
      '490323', // Classic Clock Tick
      '462929', // Vintage Metronome
      '673790', // Modern Digital Tick
      '171043', // Soft Wooden Clock
      '675679', // Subtle Pulse Tick
      '161443', // Mechanical Watch
    ],
    // Nature sounds
    nature: [
      '386454', // Ocean Waves (corrected)
      '759738', // Forest Ambience (corrected)
      '398742', // Gentle Rain (moved from wind chimes)
      '734108', // Mountain Stream
      '163597', // Spa Ambience
      '541113', // Wind Chimes (Chelly01)
      '560543', // Relaxing Wind Chimes (SterckxS)
      '529016', // Gregorian Wind Chimes (SiriusParsec)
      '799569', // Binaural Wind Chimes (lonemonk)
      '521026', // Playground Wind Chimes (Profispiesser)
    ],
  },
};

