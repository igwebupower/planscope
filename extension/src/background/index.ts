// PlanScope Background Service Worker
// Handles API calls from content scripts to avoid CORS issues

import { fetchPlanningData, checkApiHealth, setUseCache } from '../services/api';
import { geocodePostcode, geocodeAddress } from '../services/geocoding';
import {
  getUsageStatus,
  canPerformLookup,
  incrementLookup,
  setTier,
  resetUsageData,
} from '../services/usage';
import {
  validateLicenceKey,
  getStoredLicence,
  storeLicence,
  clearLicence,
  isLicenceExpired,
  getLicenceStatus,
  shouldRevalidate,
  updateLastCheck,
  getCheckoutUrl,
  type LicenceData,
} from '../services/licence';
import { track, trackInstall } from '../services/analytics';

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[PlanScope] Extension installed');
  // Track installation
  await trackInstall();
  // Check licence status on install/update
  await checkLicenceOnStartup();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[PlanScope] Browser started');
  // Check licence status on browser startup
  await checkLicenceOnStartup();
});

/**
 * Check licence status on startup and set tier accordingly
 */
async function checkLicenceOnStartup(): Promise<void> {
  try {
    const licence = await getStoredLicence();

    if (!licence) {
      await setTier('free');
      console.log('[PlanScope] No licence found, tier set to free');
      return;
    }

    // Check if expired locally first
    if (isLicenceExpired(licence)) {
      await setTier('free');
      console.log('[PlanScope] Licence expired, tier set to free');
      return;
    }

    // Re-validate with server if needed (once per day)
    if (await shouldRevalidate()) {
      console.log('[PlanScope] Re-validating licence with server');
      const result = await validateLicenceKey(licence.key);

      if (!result.valid) {
        await clearLicence();
        await setTier('free');
        console.log('[PlanScope] Licence invalid on server, tier set to free');
        return;
      }

      await updateLastCheck();
    }

    await setTier('pro');
    console.log('[PlanScope] Valid licence found, tier set to pro');
  } catch (error) {
    console.error('[PlanScope] Error checking licence on startup:', error);
    // On error, trust cached licence if valid
    const licence = await getStoredLicence();
    if (licence && !isLicenceExpired(licence)) {
      await setTier('pro');
    } else {
      await setTier('free');
    }
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[PlanScope Background] Received message:', message.type);

  switch (message.type) {
    case 'FETCH_PLANNING_DATA':
      handleFetchPlanningData(message, sendResponse);
      return true; // Keep channel open for async response

    case 'GEOCODE_POSTCODE':
      handleGeocodePostcode(message, sendResponse);
      return true;

    case 'GEOCODE_ADDRESS':
      handleGeocodeAddress(message, sendResponse);
      return true;

    case 'CHECK_API_HEALTH':
      handleCheckApiHealth(sendResponse);
      return true;

    case 'SET_USE_CACHE':
      setUseCache(message.useCache);
      sendResponse({ success: true });
      return false;

    case 'GET_TAB_INFO':
      sendResponse({ tabId: sender.tab?.id, url: sender.tab?.url });
      return false;

    case 'GET_USAGE_STATUS':
      handleGetUsageStatus(sendResponse);
      return true;

    case 'CHECK_USAGE_LIMIT':
      handleCheckUsageLimit(sendResponse);
      return true;

    case 'INCREMENT_LOOKUP':
      handleIncrementLookup(sendResponse);
      return true;

    case 'SET_TIER':
      handleSetTier(message.tier, sendResponse);
      return true;

    case 'RESET_USAGE':
      handleResetUsage(sendResponse);
      return true;

    case 'VALIDATE_LICENCE':
      handleValidateLicence(message.licenceKey, sendResponse);
      return true;

    case 'GET_LICENCE_STATUS':
      handleGetLicenceStatus(sendResponse);
      return true;

    case 'CLEAR_LICENCE':
      handleClearLicence(sendResponse);
      return true;

    case 'GET_CHECKOUT_URL':
      sendResponse({ success: true, url: getCheckoutUrl() });
      return false;

    default:
      console.warn('[PlanScope Background] Unknown message type:', message.type);
      return false;
  }
});

async function handleFetchPlanningData(
  message: { lat: number; lng: number; radiusM?: number; options?: any },
  sendResponse: (response: any) => void
) {
  try {
    console.log('[PlanScope Background] Fetching planning data for:', message.lat, message.lng);
    const data = await fetchPlanningData(
      message.lat,
      message.lng,
      message.radiusM || 500,
      message.options || {}
    );
    console.log('[PlanScope Background] Planning data fetched successfully');
    sendResponse({ success: true, data });
  } catch (error) {
    console.error('[PlanScope Background] Error fetching planning data:', error);
    sendResponse({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        userMessage: (error as any).userMessage || 'An unexpected error occurred. Please try again.',
        code: (error as any).code || 'UNKNOWN_ERROR',
        retryable: (error as any).retryable ?? true,
      },
    });
  }
}

async function handleGeocodePostcode(
  message: { postcode: string },
  sendResponse: (response: any) => void
) {
  try {
    console.log('[PlanScope Background] Geocoding postcode:', message.postcode);
    const result = await geocodePostcode(message.postcode);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[PlanScope Background] Error geocoding postcode:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleGeocodeAddress(
  message: { address: string },
  sendResponse: (response: any) => void
) {
  try {
    console.log('[PlanScope Background] Geocoding address:', message.address);
    const result = await geocodeAddress(message.address);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[PlanScope Background] Error geocoding address:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleCheckApiHealth(sendResponse: (response: any) => void) {
  try {
    const healthy = await checkApiHealth();
    sendResponse({ success: true, healthy });
  } catch (error) {
    sendResponse({ success: false, healthy: false });
  }
}

async function handleGetUsageStatus(sendResponse: (response: any) => void) {
  try {
    const status = await getUsageStatus();
    sendResponse({ success: true, data: status });
  } catch (error) {
    console.error('[PlanScope Background] Error getting usage status:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleCheckUsageLimit(sendResponse: (response: any) => void) {
  try {
    const canLookup = await canPerformLookup();
    const status = await getUsageStatus();
    sendResponse({ success: true, canLookup, status });
  } catch (error) {
    console.error('[PlanScope Background] Error checking usage limit:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleIncrementLookup(sendResponse: (response: any) => void) {
  try {
    await incrementLookup();
    const status = await getUsageStatus();
    sendResponse({ success: true, status });
  } catch (error) {
    console.error('[PlanScope Background] Error incrementing lookup:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleSetTier(tier: 'free' | 'pro', sendResponse: (response: any) => void) {
  try {
    await setTier(tier);
    const status = await getUsageStatus();
    sendResponse({ success: true, status });
  } catch (error) {
    console.error('[PlanScope Background] Error setting tier:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleResetUsage(sendResponse: (response: any) => void) {
  try {
    await resetUsageData();
    const status = await getUsageStatus();
    sendResponse({ success: true, status });
  } catch (error) {
    console.error('[PlanScope Background] Error resetting usage:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleValidateLicence(
  licenceKey: string,
  sendResponse: (response: any) => void
) {
  try {
    console.log('[PlanScope Background] Validating licence key');
    const result = await validateLicenceKey(licenceKey);

    if (result.valid) {
      // Store the licence and update tier
      const licenceData: LicenceData = {
        key: licenceKey.toUpperCase(),
        email: result.email || '',
        expiresAt: result.expiresAt || null,
        activatedAt: new Date().toISOString(),
      };
      await storeLicence(licenceData);
      await updateLastCheck();
      await setTier('pro');
      console.log('[PlanScope Background] Licence activated successfully');
      // Track licence activation
      track('licence_activated');
    }

    sendResponse({ success: true, ...result });
  } catch (error) {
    console.error('[PlanScope Background] Error validating licence:', error);
    sendResponse({
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    });
  }
}

async function handleGetLicenceStatus(sendResponse: (response: any) => void) {
  try {
    const status = await getLicenceStatus();
    sendResponse({ success: true, ...status });
  } catch (error) {
    console.error('[PlanScope Background] Error getting licence status:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleClearLicence(sendResponse: (response: any) => void) {
  try {
    await clearLicence();
    await setTier('free');
    console.log('[PlanScope Background] Licence cleared');
    // Track licence deactivation
    track('licence_deactivated');
    sendResponse({ success: true });
  } catch (error) {
    console.error('[PlanScope Background] Error clearing licence:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export {};
