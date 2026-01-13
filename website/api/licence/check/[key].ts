import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { isValidLicenceFormat } from '../../_lib/licence-generator';

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

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const { key } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Licence key required' });
  }

  // Normalize the key (uppercase, trim)
  const normalizedKey = key.toUpperCase().trim();

  if (!isValidLicenceFormat(normalizedKey)) {
    return res.json({ valid: false });
  }

  try {
    // Quick lookup
    const { data, error } = await supabase
      .from('licence_keys')
      .select('is_active, expires_at')
      .eq('licence_key', normalizedKey)
      .single();

    if (error || !data) {
      return res.json({ valid: false });
    }

    if (!data.is_active) {
      return res.json({ valid: false });
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.json({ valid: false });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error('[Licence] Check error:', error);
    return res.status(500).json({ error: 'Failed to check licence' });
  }
}
