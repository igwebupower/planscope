// PlanScope Background Service Worker
// Handles API calls from content scripts to avoid CORS issues

import { fetchPlanningData, checkApiHealth, setUseMockApi, setUseCache } from '../services/api';
import { geocodePostcode, geocodeAddress } from '../services/geocoding';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[PlanScope] Extension installed');
});

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

    case 'SET_USE_MOCK_API':
      setUseMockApi(message.useMock);
      sendResponse({ success: true });
      return false;

    case 'SET_USE_CACHE':
      setUseCache(message.useCache);
      sendResponse({ success: true });
      return false;

    case 'GET_TAB_INFO':
      sendResponse({ tabId: sender.tab?.id, url: sender.tab?.url });
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

export {};
