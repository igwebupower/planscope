import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[PlanScope API] Supabase credentials not configured');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface LicenceKey {
  id: string;
  licence_key: string;
  email: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  last_validated_at?: string;
}
