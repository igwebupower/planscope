/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Falls back when coordinates aren't available from the property page
 */

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
    // Add UK to improve accuracy for UK addresses
    const searchQuery = address.includes('UK') ? address : `${address}, UK`;

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
      console.warn('[PlanScope] No geocoding results for:', address);
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
 */
export async function geocodePostcode(postcode: string): Promise<GeocodingResult | null> {
  try {
    // Use postcodes.io for UK postcodes (more accurate)
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);

    if (!response.ok) {
      // Fall back to Nominatim
      return geocodeAddress(postcode);
    }

    const data = await response.json();

    if (data.status !== 200 || !data.result) {
      return geocodeAddress(postcode);
    }

    return {
      lat: data.result.latitude,
      lng: data.result.longitude,
      displayName: `${data.result.postcode}, ${data.result.admin_district}`,
    };
  } catch (error) {
    console.error('[PlanScope] Postcode geocoding error:', error);
    return geocodeAddress(postcode);
  }
}
