/**
 * Licence validation routes for PlanScope Pro
 */

import { Router, Request, Response } from 'express';
import { supabase, LicenceKeyRecord } from '../lib/supabase.js';
import { isValidLicenceKeyFormat } from '../lib/licence-generator.js';

export const licenceRouter = Router();

interface ValidateLicenceRequest {
  licenceKey: string;
}

interface ValidateLicenceResponse {
  valid: boolean;
  email?: string;
  expiresAt?: string | null;
  error?: string;
}

/**
 * POST /licence/validate
 * Validate a licence key against the database
 */
licenceRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { licenceKey } = req.body as ValidateLicenceRequest;

    // Check if licence key is provided
    if (!licenceKey) {
      const response: ValidateLicenceResponse = {
        valid: false,
        error: 'Licence key is required',
      };
      res.status(400).json(response);
      return;
    }

    // Validate format
    const normalizedKey = licenceKey.trim().toUpperCase();
    if (!isValidLicenceKeyFormat(normalizedKey)) {
      const response: ValidateLicenceResponse = {
        valid: false,
        error: 'Invalid licence key format',
      };
      res.status(400).json(response);
      return;
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error('[Licence] Supabase not configured');
      const response: ValidateLicenceResponse = {
        valid: false,
        error: 'Service temporarily unavailable',
      };
      res.status(503).json(response);
      return;
    }

    // Look up licence in database
    const { data, error } = await supabase
      .from('licence_keys')
      .select('*')
      .eq('licence_key', normalizedKey)
      .single();

    if (error || !data) {
      const response: ValidateLicenceResponse = {
        valid: false,
        error: 'Invalid licence key',
      };
      res.status(200).json(response);
      return;
    }

    const licence = data as LicenceKeyRecord;

    // Check if licence is active
    if (!licence.is_active) {
      const response: ValidateLicenceResponse = {
        valid: false,
        error: 'Licence key has been deactivated',
      };
      res.status(200).json(response);
      return;
    }

    // Check if licence has expired
    if (licence.expires_at && new Date(licence.expires_at) < new Date()) {
      const response: ValidateLicenceResponse = {
        valid: false,
        error: 'Licence key has expired',
      };
      res.status(200).json(response);
      return;
    }

    // Update last validated timestamp
    await supabase
      .from('licence_keys')
      .update({ last_validated_at: new Date().toISOString() })
      .eq('licence_key', normalizedKey);

    // Return success
    const response: ValidateLicenceResponse = {
      valid: true,
      email: licence.email,
      expiresAt: licence.expires_at,
    };
    res.json(response);
  } catch (error) {
    console.error('[Licence] Validation error:', error);
    const response: ValidateLicenceResponse = {
      valid: false,
      error: 'Validation failed',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /licence/check/:key
 * Quick check if a licence key exists and is valid (for success page)
 */
licenceRouter.get('/check/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!supabase) {
      res.status(503).json({ error: 'Service temporarily unavailable' });
      return;
    }

    const normalizedKey = key.trim().toUpperCase();

    const { data, error } = await supabase
      .from('licence_keys')
      .select('licence_key, email, is_active, expires_at')
      .eq('licence_key', normalizedKey)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Licence not found' });
      return;
    }

    res.json({
      valid: data.is_active,
      email: data.email,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error('[Licence] Check error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});
