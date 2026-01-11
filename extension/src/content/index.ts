// PlanScope Content Script Entry Point
// Injected into property listing pages on Rightmove and Zoopla

import { detectSite, extractPropertyData } from './sites/detector';
import { createOverlay } from './overlay/Overlay';
import type { OverlayState, PlanningResponse, UsageStatus } from '../types';

/**
 * Send message to background script and wait for response
 */
function sendMessage<T>(message: any): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

/**
 * Fetch planning data via background script
 */
async function fetchPlanningDataViaBackground(
  lat: number,
  lng: number,
  radiusM: number = 500
): Promise<PlanningResponse> {
  const response = await sendMessage<{
    success: boolean;
    data?: PlanningResponse;
    error?: { message: string; userMessage: string; code: string; retryable: boolean };
  }>({
    type: 'FETCH_PLANNING_DATA',
    lat,
    lng,
    radiusM,
  });

  if (!response.success) {
    const error = new Error(response.error?.message || 'Unknown error');
    (error as any).userMessage = response.error?.userMessage || 'An unexpected error occurred.';
    (error as any).code = response.error?.code;
    (error as any).retryable = response.error?.retryable;
    throw error;
  }

  return response.data!;
}

/**
 * Geocode postcode via background script
 */
async function geocodePostcodeViaBackground(postcode: string): Promise<{ lat: number; lng: number } | null> {
  const response = await sendMessage<{
    success: boolean;
    data?: { lat: number; lng: number; displayName: string };
    error?: string;
  }>({
    type: 'GEOCODE_POSTCODE',
    postcode,
  });

  if (!response.success || !response.data) {
    return null;
  }

  return { lat: response.data.lat, lng: response.data.lng };
}

/**
 * Geocode address via background script
 */
async function geocodeAddressViaBackground(address: string): Promise<{ lat: number; lng: number } | null> {
  const response = await sendMessage<{
    success: boolean;
    data?: { lat: number; lng: number; displayName: string };
    error?: string;
  }>({
    type: 'GEOCODE_ADDRESS',
    address,
  });

  if (!response.success || !response.data) {
    return null;
  }

  return { lat: response.data.lat, lng: response.data.lng };
}

/**
 * Check usage limit via background script
 */
async function checkUsageLimitViaBackground(): Promise<{ canLookup: boolean; status: UsageStatus }> {
  const response = await sendMessage<{
    success: boolean;
    canLookup: boolean;
    status: UsageStatus;
    error?: string;
  }>({
    type: 'CHECK_USAGE_LIMIT',
  });

  if (!response.success) {
    // Default to allowing lookup on error to avoid blocking users
    console.warn('[PlanScope] Usage check failed, allowing lookup');
    return {
      canLookup: true,
      status: {
        used: 0,
        limit: 10,
        remaining: 10,
        isUnlimited: false,
        tier: 'free',
        daysUntilReset: 30,
        resetDate: new Date().toISOString(),
      },
    };
  }

  return { canLookup: response.canLookup, status: response.status };
}

/**
 * Increment lookup counter via background script
 */
async function incrementLookupViaBackground(): Promise<UsageStatus | null> {
  try {
    const response = await sendMessage<{
      success: boolean;
      status: UsageStatus;
      error?: string;
    }>({
      type: 'INCREMENT_LOOKUP',
    });

    if (response.success) {
      return response.status;
    }
    return null;
  } catch (error) {
    console.warn('[PlanScope] Failed to increment lookup counter:', error);
    return null;
  }
}

console.log('[PlanScope] Content script loaded');

async function init(): Promise<void> {
  // Detect which property site we're on
  const site = detectSite(window.location.href);

  if (site === 'unknown') {
    console.log('[PlanScope] Not on a supported property listing page');
    return;
  }

  console.log(`[PlanScope] Detected site: ${site}`);

  // Extract property data from the page
  let propertyData = extractPropertyData(site);

  if (!propertyData) {
    console.warn('[PlanScope] Could not extract property data from page');
    return;
  }

  console.log('[PlanScope] Property data:', JSON.stringify(propertyData));

  // If we have a postcode but no coordinates, try geocoding via background script
  if ((!propertyData.lat || !propertyData.lng) && propertyData.postcode) {
    console.log('[PlanScope] Missing coordinates, attempting to geocode postcode:', propertyData.postcode);
    try {
      const geocodeResult = await geocodePostcodeViaBackground(propertyData.postcode);
      if (geocodeResult) {
        propertyData = {
          ...propertyData,
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
        };
        console.log('[PlanScope] Geocoded postcode successfully:', geocodeResult);
      }
    } catch (error) {
      console.warn('[PlanScope] Postcode geocoding failed:', error);
    }
  }

  // If still no coordinates but have an address, try geocoding the address via background script
  if ((!propertyData.lat || !propertyData.lng) && propertyData.address) {
    console.log('[PlanScope] Attempting to geocode address:', propertyData.address);
    try {
      const geocodeResult = await geocodeAddressViaBackground(propertyData.address);
      if (geocodeResult) {
        propertyData = {
          ...propertyData,
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
        };
        console.log('[PlanScope] Geocoded address successfully:', geocodeResult);
      }
    } catch (error) {
      console.warn('[PlanScope] Address geocoding failed:', error);
    }
  }

  // Initialize overlay state
  const state: OverlayState = {
    isOpen: sessionStorage.getItem('planscope_open') !== 'false',
    isLoading: true,
    error: null,
    data: null,
    filters: {
      status: [],
      types: [],
      fromDate: null,
      toDate: null,
    },
  };

  // Create and inject the overlay
  const overlay = createOverlay(state, {
    onToggle: (isOpen: boolean) => {
      state.isOpen = isOpen;
      sessionStorage.setItem('planscope_open', String(isOpen));
    },
    onFilterChange: (filters) => {
      state.filters = filters;
      overlay.update(state);
    },
  });

  // Fetch planning data via background script
  if (propertyData.lat && propertyData.lng) {
    try {
      // Check usage limit before making API call
      const { canLookup, status: usageStatus } = await checkUsageLimitViaBackground();
      state.usageStatus = usageStatus;

      if (!canLookup) {
        // Limit reached - show upgrade prompt
        state.isLoading = false;
        state.limitReached = true;
        overlay.update(state);
        console.log('[PlanScope] Monthly lookup limit reached');
        return;
      }

      const data: PlanningResponse = await fetchPlanningDataViaBackground(
        propertyData.lat,
        propertyData.lng,
        500 // 500m radius
      );

      // Increment lookup counter after successful fetch
      const updatedStatus = await incrementLookupViaBackground();
      if (updatedStatus) {
        state.usageStatus = updatedStatus;
      }

      state.isLoading = false;
      state.data = data;
      overlay.update(state);

      console.log('[PlanScope] Planning data loaded:', data);
    } catch (error) {
      state.isLoading = false;
      // Use user-friendly error message
      state.error = (error as any).userMessage || 'An unexpected error occurred. Please try again.';
      overlay.update(state);

      console.error('[PlanScope] Failed to fetch planning data:', error);
    }
  } else {
    state.isLoading = false;
    state.error = `Could not determine property location. Address: ${propertyData.address || 'unknown'}, Lat: ${propertyData.lat}, Lng: ${propertyData.lng}`;
    overlay.update(state);
    console.warn('[PlanScope] Missing coordinates:', propertyData);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch((err) => console.error('[PlanScope] Initialization error:', err));
  });
} else {
  init().catch((err) => console.error('[PlanScope] Initialization error:', err));
}
