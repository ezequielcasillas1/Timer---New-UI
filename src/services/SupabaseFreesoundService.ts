import { supabase } from '@/app/integrations/supabase/client';

/**
 * Supabase Freesound Service
 * 
 * Calls Supabase Edge Function to securely download sounds from Freesound.
 * API credentials are stored on the server, never exposed to the client.
 */

interface FreesoundSound {
  id: string;
  name: string;
  downloadUrl: string;
}

export class SupabaseFreesoundService {
  private edgeFunctionUrl: string;

  constructor() {
    // Edge function URL will be: https://[project-ref].supabase.co/functions/v1/freesound-download
    this.edgeFunctionUrl = 'freesound-download';
  }

  /**
   * Get a single sound from Freesound via Supabase Edge Function
   */
  async getSound(soundId: string): Promise<FreesoundSound | null> {
    try {
      console.log(`SupabaseFreesoundService: Fetching sound ${soundId} via Edge Function...`);

      const { data, error } = await supabase.functions.invoke(this.edgeFunctionUrl, {
        body: {
          action: 'getSound',
          soundId,
        },
      });

      if (error) {
        console.error('SupabaseFreesoundService: Edge Function error:', error);
        return null;
      }

      if (!data.success) {
        console.error('SupabaseFreesoundService: Failed to fetch sound:', data.error);
        return null;
      }

      console.log(`SupabaseFreesoundService: Successfully fetched ${data.sound.name}`);
      return data.sound;
    } catch (error) {
      console.error('SupabaseFreesoundService: Error:', error);
      return null;
    }
  }

}

export const supabaseFreesoundService = new SupabaseFreesoundService();

