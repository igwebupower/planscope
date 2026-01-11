/**
 * Licence key generator for PlanScope Pro
 * Generates keys in format: PS-XXXX-XXXX-XXXX-XXXX
 */

import crypto from 'crypto';

// Characters for licence key (alphanumeric, excluding ambiguous chars)
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random licence key
 * Format: PS-XXXX-XXXX-XXXX-XXXX (20 chars total)
 */
export function generateLicenceKey(): string {
  const segments: string[] = [];

  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const randomIndex = crypto.randomInt(0, CHARSET.length);
      segment += CHARSET[randomIndex];
    }
    segments.push(segment);
  }

  return `PS-${segments.join('-')}`;
}

/**
 * Validate licence key format
 */
export function isValidLicenceKeyFormat(key: string): boolean {
  return /^PS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
}
