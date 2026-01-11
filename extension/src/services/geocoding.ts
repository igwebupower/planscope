/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Falls back when coordinates aren't available from the property page
 */

import { cleanAddressForGeocoding, extractPostcode } from '../utils';

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // Clean the address first (remove "3 bed property for sale" etc.)
    const cleanedAddress = cleanAddressForGeocoding(address);
    console.log('[PlanScope] Geocoding cleaned address:', cleanedAddress);

    // Add UK to improve accuracy for UK addresses
    const searchQuery = cleanedAddress.includes('UK') ? cleanedAddress : `${cleanedAddress}, UK`;

    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'gb',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'PlanScope/1.0', // Required by Nominatim ToS
      },
    });

    if (!response.ok) {
      console.warn('[PlanScope] Geocoding request failed:', response.status);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      console.warn('[PlanScope] No geocoding results for:', cleanedAddress);

      // Try extracting and geocoding just the postcode/outcode as fallback
      const postcode = extractPostcode(address);
      if (postcode) {
        console.log('[PlanScope] Falling back to postcode geocoding:', postcode);
        return geocodePostcode(postcode);
      }

      return null;
    }

    const result = results[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error('[PlanScope] Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode a UK postcode to coordinates
 * Supports both full postcodes (E16 1XX) and outcodes (E16)
 */
export async function geocodePostcode(postcode: string): Promise<GeocodingResult | null> {
  try {
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    console.log('[PlanScope] Geocoding postcode:', cleanPostcode);

    // Check if this is a full postcode or just an outcode
    const isFullPostcode = /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/.test(cleanPostcode);

    if (isFullPostcode) {
      // Use full postcode endpoint
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.result) {
          console.log('[PlanScope] Full postcode geocoded successfully');
          return {
            lat: data.result.latitude,
            lng: data.result.longitude,
            displayName: `${data.result.postcode}, ${data.result.admin_district}`,
          };
        }
      }
    }

    // Try outcode endpoint (works for partial postcodes like "E16")
    const outcode = cleanPostcode.replace(/[0-9][A-Z]{2}$/, ''); // Strip inward code if present
    console.log('[PlanScope] Trying outcode:', outcode);

    const outcodeResponse = await fetch(`https://api.postcodes.io/outcodes/${outcode}`);

    if (outcodeResponse.ok) {
      const outcodeData = await outcodeResponse.json();
      if (outcodeData.status === 200 && outcodeData.result) {
        console.log('[PlanScope] Outcode geocoded successfully');
        return {
          lat: outcodeData.result.latitude,
          lng: outcodeData.result.longitude,
          displayName: `${outcodeData.result.outcode}, ${outcodeData.result.admin_district?.[0] || 'UK'}`,
        };
      }
    }

    // Fall back to Nominatim for the postcode
    console.log('[PlanScope] Falling back to Nominatim for postcode');
    const searchQuery = `${postcode}, UK`;
    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      limit: '1',
      countrycodes: 'gb',
    });

    const nominatimResponse = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
      headers: { 'User-Agent': 'PlanScope/1.0' },
    });

    if (nominatimResponse.ok) {
      const results = await nominatimResponse.json();
      if (results && results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          displayName: results[0].display_name,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[PlanScope] Postcode geocoding error:', error);
    return null;
  }
}
