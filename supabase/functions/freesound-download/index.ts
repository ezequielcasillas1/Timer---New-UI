// Supabase Edge Function: Freesound API Proxy
// This function securely stores Freesound API credentials and proxies requests

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface FreesoundSound {
  id: string;
  name: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Freesound credentials from environment (stored as Supabase secrets)
    const FREESOUND_CLIENT_ID = Deno.env.get('FREESOUND_CLIENT_ID');
    const FREESOUND_CLIENT_SECRET = Deno.env.get('FREESOUND_CLIENT_SECRET');

    if (!FREESOUND_CLIENT_ID || !FREESOUND_CLIENT_SECRET) {
      throw new Error('Freesound API credentials not configured');
    }

    const body = await req.json();
    const { action, soundId, soundIds } = body;

    // Use Client Secret as direct API token (Freesound's simple auth method)
    const access_token = FREESOUND_CLIENT_SECRET;
    console.log('Using Freesound API token for authentication');

    // Handle different actions
    if (action === 'getSound') {
      // Fetch sound details
      console.log(`Fetching sound ${soundId}...`);
      const soundResponse = await fetch(
        `https://freesound.org/apiv2/sounds/${soundId}/?token=${access_token}`
      );

      if (!soundResponse.ok) {
        const errorText = await soundResponse.text();
        console.error(`Failed to fetch sound ${soundId}:`, soundResponse.status, errorText);
        throw new Error(`Failed to fetch sound ${soundId}: ${soundResponse.status}`);
      }

      const soundData: FreesoundSound = await soundResponse.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          sound: {
            id: soundData.id,
            name: soundData.name,
            downloadUrl: soundData.previews['preview-hq-mp3'],
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'getAllSounds') {
      // Fetch all sound IDs from request (already parsed above)
      if (!soundIds || !Array.isArray(soundIds)) {
        throw new Error('soundIds array is required for getAllSounds action');
      }
      
      console.log(`Fetching ${soundIds.length} sounds...`);
      const sounds = [];

      for (const id of soundIds) {
        try {
          const soundResponse = await fetch(
            `https://freesound.org/apiv2/sounds/${id}/?token=${access_token}`
          );

          if (soundResponse.ok) {
            const soundData: FreesoundSound = await soundResponse.json();
            sounds.push({
              id: soundData.id,
              name: soundData.name,
              downloadUrl: soundData.previews['preview-hq-mp3'],
            });
          }
        } catch (error) {
          console.error(`Error fetching sound ${id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          sounds,
          total: sounds.length,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

