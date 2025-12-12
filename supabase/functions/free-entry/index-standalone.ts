// Supabase Edge Function: Free Entry / Promotional Access
// Validates promotional codes and grants free access
// COPY THIS ENTIRE FILE INTO SUPABASE EDGE FUNCTIONS WEB INTERFACE

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers (inlined for standalone use)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FreeEntryRequest {
  action: 'validate' | 'redeem';
  code?: string;
  userId?: string;
  email?: string;
}

interface PromoCode {
  code: string;
  type: 'free_access' | 'trial_extension' | 'premium_unlock';
  maxUses: number;
  expiresAt: string | null;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: FreeEntryRequest = await req.json();
    const { action, code, userId, email } = body;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Validate user session (optional - can be made public for guest access)
    let user = null;
    if (userId) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (!userError) {
        user = userData.user;
      }
    }

    // Define promotional codes (in production, store these in a database table)
    const promoCodes: Record<string, PromoCode> = {
      'FREETRIAL2024': {
        code: 'FREETRIAL2024',
        type: 'free_access',
        maxUses: 1000,
        expiresAt: '2024-12-31T23:59:59Z',
        metadata: { days: 30 }
      },
      'ADHDTIMER': {
        code: 'ADHDTIMER',
        type: 'free_access',
        maxUses: 5000,
        expiresAt: null, // No expiration
        metadata: { days: 7 }
      },
      // Add more codes as needed
    };

    if (action === 'validate') {
      // Validate a promotional code
      if (!code) {
        throw new Error('Code is required for validation');
      }

      const promoCode = promoCodes[code.toUpperCase()];
      
      if (!promoCode) {
        return new Response(
          JSON.stringify({
            success: false,
            valid: false,
            error: 'Invalid promotional code',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Check expiration
      if (promoCode.expiresAt) {
        const expiresAt = new Date(promoCode.expiresAt);
        if (new Date() > expiresAt) {
          return new Response(
            JSON.stringify({
              success: false,
              valid: false,
              error: 'Promotional code has expired',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }

      // Check usage count (in production, query from database)
      // For now, we'll skip this check or implement a simple counter

      return new Response(
        JSON.stringify({
          success: true,
          valid: true,
          code: promoCode.code,
          type: promoCode.type,
          metadata: promoCode.metadata,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'redeem') {
      // Redeem a promotional code and grant access
      if (!code) {
        throw new Error('Code is required for redemption');
      }

      const promoCode = promoCodes[code.toUpperCase()];
      
      if (!promoCode) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid promotional code',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Check expiration
      if (promoCode.expiresAt) {
        const expiresAt = new Date(promoCode.expiresAt);
        if (new Date() > expiresAt) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Promotional code has expired',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }

      // In production, you would:
      // 1. Check if code was already used by this user/email
      // 2. Record the redemption in a database table
      // 3. Grant access based on code type (update user profile, create subscription, etc.)

      // For now, return success with access details
      const accessGranted = {
        code: promoCode.code,
        type: promoCode.type,
        accessDays: promoCode.metadata?.days || 30,
        grantedAt: new Date().toISOString(),
      };

      // If user is authenticated, you could update their profile here
      if (userId && user) {
        // Example: Update user metadata or create a free access record
        // await supabase
        //   .from('user_access')
        //   .insert({
        //     user_id: userId,
        //     promo_code: code,
        //     access_type: promoCode.type,
        //     expires_at: new Date(Date.now() + (promoCode.metadata?.days || 30) * 24 * 60 * 60 * 1000).toISOString(),
        //   });
      }

      return new Response(
        JSON.stringify({
          success: true,
          accessGranted,
          message: `Free access granted for ${accessGranted.accessDays} days!`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action. Use "validate" or "redeem"');

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
