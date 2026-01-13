/**
 * Licence service for PlanScope Pro
 * Handles licence key validation, storage, and management
 */

// API base URL - update for production
const API_BASE_URL = 'https://planscope.co.uk';

/**
 * Stored licence data
 */
export interface LicenceData {
  key: string;
  email: string;
  expiresAt: string | null;
  activatedAt: string;
}

/**
 * Validation result from API
 */
export interface ValidationResult {
  valid: boolean;
  email?: string;
  expiresAt?: string | null;
  error?: string;
}

/**
 * Licence status for UI
 */
export interface LicenceStatus {
  hasLicence: boolean;
  isValid: boolean;
  expired: boolean;
  licence: LicenceData | null;
}

// Storage key for licence data
const LICENCE_STORAGE_KEY = 'planscope_licence';
const LAST_CHECK_KEY = 'planscope_licence_last_check';

/**
 * Validate licence key format
 * Format: PS-XXXX-XXXX-XXXX-XXXX
 */
export function isValidLicenceFormat(key: string): boolean {
  return /^PS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key.toUpperCase());
}

/**
 * Validate a licence key against the API
 */
export async function validateLicenceKey(licenceKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/licence/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ licenceKey: licenceKey.toUpperCase() }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { valid: false, error: error.error || 'Validation failed' };
    }

    return await response.json();
  } catch (error) {
    console.error('[PlanScope Licence] Validation error:', error);
    return { valid: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Get stored licence from chrome.storage.sync
 */
export async function getStoredLicence(): Promise<LicenceData | null> {
  try {
    const result = await chrome.storage.sync.get(LICENCE_STORAGE_KEY);
    return result[LICENCE_STORAGE_KEY] || null;
  } catch (error) {
    console.error('[PlanScope Licence] Failed to get stored licence:', error);
    return null;
  }
}

/**
 * Store licence in chrome.storage.sync
 */
export async function storeLicence(licence: LicenceData): Promise<void> {
  try {
    await chrome.storage.sync.set({ [LICENCE_STORAGE_KEY]: licence });
    console.log('[PlanScope Licence] Licence stored successfully');
  } catch (error) {
    console.error('[PlanScope Licence] Failed to store licence:', error);
    throw error;
  }
}

/**
 * Remove stored licence
 */
export async function clearLicence(): Promise<void> {
  try {
    await chrome.storage.sync.remove(LICENCE_STORAGE_KEY);
    await chrome.storage.local.remove(LAST_CHECK_KEY);
    console.log('[PlanScope Licence] Licence cleared');
  } catch (error) {
    console.error('[PlanScope Licence] Failed to clear licence:', error);
    throw error;
  }
}

/**
 * Check if stored licence has expired
 */
export function isLicenceExpired(licence: LicenceData): boolean {
  if (!licence.expiresAt) return false; // Lifetime licence
  return new Date(licence.expiresAt) < new Date();
}

/**
 * Get full licence status
 */
export async function getLicenceStatus(): Promise<LicenceStatus> {
  const licence = await getStoredLicence();

  if (!licence) {
    return {
      hasLicence: false,
      isValid: false,
      expired: false,
      licence: null,
    };
  }

  const expired = isLicenceExpired(licence);

  return {
    hasLicence: true,
    isValid: !expired,
    expired,
    licence: expired ? null : licence,
  };
}

/**
 * Check if we should re-validate the licence with the server
 * (Once per day to catch cancellations)
 */
export async function shouldRevalidate(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(LAST_CHECK_KEY);
    const lastCheck = result[LAST_CHECK_KEY];

    if (!lastCheck) return true;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return lastCheck < oneDayAgo;
  } catch {
    return true;
  }
}

/**
 * Update last validation timestamp
 */
export async function updateLastCheck(): Promise<void> {
  try {
    await chrome.storage.local.set({ [LAST_CHECK_KEY]: Date.now() });
  } catch (error) {
    console.error('[PlanScope Licence] Failed to update last check:', error);
  }
}

/**
 * Get checkout URL for upgrading
 */
export function getCheckoutUrl(): string {
  return `${API_BASE_URL}/checkout/redirect`;
}
