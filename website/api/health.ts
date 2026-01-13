import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from './_lib/stripe';
import { supabase } from './_lib/supabase';

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

  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      stripe: stripe ? 'configured' : 'not configured',
      supabase: supabase ? 'configured' : 'not configured',
    },
  };

  const allConfigured = stripe && supabase;

  return res.status(allConfigured ? 200 : 503).json(status);
}
