import { supabaseFreesoundService } from './SupabaseFreesoundService';

/**
 * Freesound API Service (Secure Version)
 * 
 * Streams sounds directly from Freesound CDN via Supabase Edge Function.
 * API keys are stored on Supabase servers, never exposed in the app.
 * 
 * API Documentation: https://freesound.org/docs/api/
 */

export interface FreesoundSound {
  id: string;
  name: string;
  downloadUrl: string;
}

export class FreesoundAPI {
  /**
   * Get sound details by ID (via Supabase Edge Function)
   * Returns CDN URL for direct streaming
   */
  async getSound(soundId: string): Promise<FreesoundSound | null> {
    return await supabaseFreesoundService.getSound(soundId);
  }
}

export const freesoundAPI = new FreesoundAPI();

