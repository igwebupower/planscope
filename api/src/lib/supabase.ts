/**
 * Supabase client for licence key storage
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[PlanScope API] Supabase credentials not configured');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface LicenceKeyRecord {
  id: string;
  licence_key: string;
  email: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}
