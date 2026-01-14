import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, properties, anonymousId } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event name required' });
    }

    const { error } = await supabase.from('analytics_events').insert({
      event,
      properties: properties || {},
      anonymous_id: anonymousId,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Analytics insert error:', error);
      return res.status(500).json({ error: 'Failed to record event' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
