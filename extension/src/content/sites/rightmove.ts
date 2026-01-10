import type { PropertyData } from '../../types';
import { extractPostcode } from '../../utils';

/**
 * Extract property data from Rightmove listing page
 *
 * Rightmove stores property data in various places:
 * 1. window.PAGE_MODEL (JSON object with property details) - requires page injection
 * 2. Script tags containing PAGE_MODEL
 * 3. Structured data (JSON-LD)
 * 4. DOM elements
 */
export function extractRightmoveData(): PropertyData | null {
  // Try to get data from PAGE_MODEL in script tags (most reliable)
  const pageModelData = extractFromPageModelScript();
  if (pageModelData) {
    console.log('[PlanScope] Extracted data from Rightmove PAGE_MODEL script');
    return pageModelData;
  }

  // Try structured data (JSON-LD)
  const structuredData = extractFromStructuredData();
  if (structuredData) {
    console.log('[PlanScope] Extracted data from Rightmove structured data');
    return structuredData;
  }

  // Fallback to DOM scraping
  const domData = extractFromDOM();
  if (domData) {
    console.log('[PlanScope] Extracted data from Rightmove DOM');
    return domData;
  }

  console.warn('[PlanScope] Could not extract Rightmove property data');
  return null;
}

/**
 * Extract PAGE_MODEL data from inline script tags
 * Content scripts can't access window variables directly, but can read script contents
 */
function extractFromPageModelScript(): PropertyData | null {
  try {
    // Find script tags that contain PAGE_MODEL
    const scripts = document.querySelectorAll('script:not([src])');

    for (const script of scripts) {
      const content = script.textContent || '';

      // Look for PAGE_MODEL assignment
      if (content.includes('PAGE_MODEL')) {
        // Try to extract the JSON object
        const match = content.match(/window\.PAGE_MODEL\s*=\s*(\{[\s\S]*?\});?\s*(?:window\.|$|<)/);

        if (match) {
          try {
            // Clean up the JSON string
            let jsonStr = match[1];
            // Remove trailing semicolons and whitespace
            jsonStr = jsonStr.replace(/;\s*$/, '');

            const pageModel = JSON.parse(jsonStr);

            if (pageModel?.propertyData) {
              const { propertyData } = pageModel;
              const address = propertyData.address?.displayAddress || '';
              const location = propertyData.location;

              return {
                address,
                lat: location?.latitude ?? null,
                lng: location?.longitude ?? null,
                postcode: extractPostcode(address),
              };
            }
          } catch (parseError) {
            console.warn('[PlanScope] Failed to parse PAGE_MODEL JSON:', parseError);
          }
        }
      }
    }
  } catch (error) {
    console.warn('[PlanScope] Error extracting PAGE_MODEL:', error);
  }

  return null;
}

/**
 * Extract from JSON-LD structured data
 */
function extractFromStructuredData(): PropertyData | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of scripts) {
      const data = JSON.parse(script.textContent || '');

      // Look for Product or Place schema
      if (data['@type'] === 'Product' || data['@type'] === 'Place') {
        const geo = data.geo;
        const address = data.name || data.address?.streetAddress || '';

        if (geo) {
          return {
            address,
            lat: parseFloat(geo.latitude),
            lng: parseFloat(geo.longitude),
            postcode: extractPostcode(address),
          };
        }
      }
    }
  } catch {
    // JSON parse error, continue to DOM extraction
  }

  return null;
}

/**
 * Fallback DOM extraction
 */
function extractFromDOM(): PropertyData | null {
  try {
    // Try to find address in common locations
    const addressSelectors = [
      'h1[itemprop="streetAddress"]',
      '[data-test="address-label"]',
      '.property-header-bedroom-and-price address',
      'h1.property-header-address',
      'meta[property="og:title"]',
    ];

    let address = '';

    for (const selector of addressSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        address = element.getAttribute('content') || element.textContent?.trim() || '';
        if (address) break;
      }
    }

    // Try to find coordinates from map elements or data attributes
    const mapElement = document.querySelector('[data-latitude][data-longitude]');
    let lat: number | null = null;
    let lng: number | null = null;

    if (mapElement) {
      lat = parseFloat(mapElement.getAttribute('data-latitude') || '');
      lng = parseFloat(mapElement.getAttribute('data-longitude') || '');
    }

    // Check for coordinates in Google Maps iframe src
    if (!lat || !lng) {
      const mapIframe = document.querySelector('iframe[src*="maps.google"]');
      if (mapIframe) {
        const src = mapIframe.getAttribute('src') || '';
        const coordMatch = src.match(/q=([-\d.]+),([-\d.]+)/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      }
    }

    if (!address) {
      return null;
    }

    return {
      address,
      lat: lat && !isNaN(lat) ? lat : null,
      lng: lng && !isNaN(lng) ? lng : null,
      postcode: extractPostcode(address),
    };
  } catch {
    return null;
  }
}
