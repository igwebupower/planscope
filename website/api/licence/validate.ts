import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { isValidLicenceFormat } from '../_lib/licence-generator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const { licenceKey } = req.body || {};

  if (!licenceKey || typeof licenceKey !== 'string') {
    return res.status(400).json({ error: 'Licence key required' });
  }

  // Normalize the key (uppercase, trim)
  const normalizedKey = licenceKey.toUpperCase().trim();

  if (!isValidLicenceFormat(normalizedKey)) {
    return res.status(400).json({ error: 'Invalid licence key format' });
  }

  try {
    // Look up licence in database
    const { data, error } = await supabase
      .from('licence_keys')
      .select('licence_key, email, expires_at, is_active')
      .eq('licence_key', normalizedKey)
      .single();

    if (error || !data) {
      return res.json({ valid: false, error: 'Licence key not found' });
    }

    if (!data.is_active) {
      return res.json({ valid: false, error: 'Licence has been deactivated' });
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.json({ valid: false, error: 'Licence has expired' });
    }

    // Update last validated timestamp
    await supabase
      .from('licence_keys')
      .update({ last_validated_at: new Date().toISOString() })
      .eq('licence_key', normalizedKey);

    return res.json({
      valid: true,
      email: data.email,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('[Licence] Validation error:', error);
    return res.status(500).json({ error: 'Failed to validate licence' });
  }
}
