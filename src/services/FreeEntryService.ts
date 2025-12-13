import { supabase } from '@/app/integrations/supabase/client';

export interface PromoCodeValidation {
  success: boolean;
  valid: boolean;
  code?: string;
  type?: 'free_access' | 'trial_extension' | 'premium_unlock';
  metadata?: {
    days?: number;
  };
  error?: string;
}

export interface PromoCodeRedemption {
  success: boolean;
  accessGranted?: {
    code: string;
    type: string;
    accessDays: number;
    grantedAt: string;
  };
  message?: string;
  error?: string;
}

export class FreeEntryService {
  private edgeFunctionUrl: string;

  constructor() {
    // Edge function URL will be: https://[project-ref].supabase.co/functions/v1/free-entry
    this.edgeFunctionUrl = 'free-entry';
  }

  /**
   * Validate a promotional code without redeeming it
   */
  async validateCode(code: string): Promise<PromoCodeValidation> {
    try {
      console.log(`FreeEntryService: Validating code ${code}...`);

      const { data, error } = await supabase.functions.invoke(this.edgeFunctionUrl, {
        body: {
          action: 'validate',
          code,
        },
      });

      if (error) {
        console.error('FreeEntryService: Edge Function error:', error);
        return {
          success: false,
          valid: false,
          error: error.message || 'Failed to validate code',
        };
      }

      if (!data.success) {
        return {
          success: false,
          valid: false,
          error: data.error || 'Invalid code',
        };
      }

      console.log(`FreeEntryService: Code ${code} is valid`);
      return data as PromoCodeValidation;
    } catch (error: any) {
      console.error('FreeEntryService: Error:', error);
      return {
        success: false,
        valid: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  /**
   * Redeem a promotional code and grant free access
   */
  async redeemCode(code: string, userId?: string, email?: string): Promise<PromoCodeRedemption> {
    try {
      console.log(`FreeEntryService: Redeeming code ${code}...`);

      const { data, error } = await supabase.functions.invoke(this.edgeFunctionUrl, {
        body: {
          action: 'redeem',
          code,
          userId,
          email,
        },
      });

      if (error) {
        console.error('FreeEntryService: Edge Function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to redeem code',
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to redeem code',
        };
      }

      console.log(`FreeEntryService: Code ${code} redeemed successfully`);
      return data as PromoCodeRedemption;
    } catch (error: any) {
      console.error('FreeEntryService: Error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }
}

export const freeEntryService = new FreeEntryService();





