import { randomBytes } from 'crypto';

// Characters that are unambiguous (no 0/O, 1/I confusion)
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateSegment(length: number): string {
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generate a unique licence key in format: PS-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenceKey(): string {
  return `PS-${generateSegment(4)}-${generateSegment(4)}-${generateSegment(4)}-${generateSegment(4)}`;
}

/**
 * Validate licence key format
 */
export function isValidLicenceFormat(key: string): boolean {
  return /^PS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
}
