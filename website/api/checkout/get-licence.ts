import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../_lib/stripe';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Session ID required' });
  }

  if (!stripe) {
    return res.status(503).json({ error: 'Service not configured' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Look up licence by subscription ID or customer ID
    const { data, error } = await supabase
      .from('licence_keys')
      .select('licence_key, email')
      .or(`stripe_subscription_id.eq.${session.subscription},stripe_customer_id.eq.${session.customer}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Licence might not be created yet (webhook delay)
      return res.status(202).json({
        pending: true,
        message: 'Licence is being generated. Please check your email or refresh in a moment.',
      });
    }

    return res.json({
      licenceKey: data.licence_key,
      email: data.email,
    });
  } catch (error) {
    console.error('[Checkout] Get licence error:', error);
    return res.status(500).json({ error: 'Failed to retrieve licence' });
  }
}
