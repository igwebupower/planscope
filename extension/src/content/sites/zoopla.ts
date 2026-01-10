import type { PropertyData } from '../../types';
import { extractPostcode } from '../../utils';

/**
 * Extract property data from Zoopla listing page
 *
 * Zoopla stores property data in:
 * 1. __NEXT_DATA__ script (Next.js hydration data)
 * 2. JSON-LD structured data
 * 3. DOM elements
 */
export function extractZooplaData(): PropertyData | null {
  // Try __NEXT_DATA__ first (Zoopla uses Next.js)
  const nextData = extractFromNextData();
  if (nextData) {
    console.log('[PlanScope] Extracted data from Zoopla __NEXT_DATA__');
    return nextData;
  }

  // Try structured data
  const structuredData = extractFromStructuredData();
  if (structuredData) {
    console.log('[PlanScope] Extracted data from Zoopla structured data');
    return structuredData;
  }

  // Fallback to DOM
  const domData = extractFromDOM();
  if (domData) {
    console.log('[PlanScope] Extracted data from Zoopla DOM');
    return domData;
  }

  console.warn('[PlanScope] Could not extract Zoopla property data');
  return null;
}

/**
 * Extract from Next.js __NEXT_DATA__ script
 */
function extractFromNextData(): PropertyData | null {
  try {
    const nextDataScript = document.getElementById('__NEXT_DATA__');
    if (!nextDataScript) {
      return null;
    }

    const data = JSON.parse(nextDataScript.textContent || '');
    const props = data?.props?.pageProps;

    if (!props) {
      return null;
    }

    // Zoopla's data structure may vary - check common paths
    const listing = props.listingDetails || props.listing || props.data?.listing;

    if (!listing) {
      return null;
    }

    const address = listing.address?.displayAddress ||
                    listing.displayAddress ||
                    listing.title || '';

    const location = listing.location || listing.coordinates || listing.latLng;

    return {
      address,
      lat: location?.lat ?? location?.latitude ?? null,
      lng: location?.lng ?? location?.lon ?? location?.longitude ?? null,
      postcode: listing.address?.postcode || extractPostcode(address),
    };
  } catch {
    return null;
  }
}

/**
 * Extract from JSON-LD structured data
 */
function extractFromStructuredData(): PropertyData | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of scripts) {
      const data = JSON.parse(script.textContent || '');

      // Handle array of schemas
      const schemas = Array.isArray(data) ? data : [data];

      for (const schema of schemas) {
        // Look for Residence, Place, or Product schema
        if (['Residence', 'Place', 'Product', 'Apartment', 'House'].includes(schema['@type'])) {
          const geo = schema.geo;
          const address = schema.address?.streetAddress || schema.name || '';

          if (geo) {
            return {
              address,
              lat: parseFloat(geo.latitude),
              lng: parseFloat(geo.longitude),
              postcode: schema.address?.postalCode || extractPostcode(address),
            };
          }
        }
      }
    }
  } catch {
    // Continue to DOM extraction
  }

  return null;
}

/**
 * Fallback DOM extraction
 */
function extractFromDOM(): PropertyData | null {
  try {
    // Zoopla address selectors
    const addressSelectors = [
      '[data-testid="address-label"]',
      'h1[data-testid="listing-title"]',
      '.dp-sidebar-wrapper__address',
      'address',
      '[class*="Address"]',
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

    // Try to find map or coordinates
    let lat: number | null = null;
    let lng: number | null = null;

    // Check for data attributes on map containers
    const mapContainers = document.querySelectorAll('[data-lat][data-lng], [data-latitude][data-longitude]');
    for (const container of mapContainers) {
      const latAttr = container.getAttribute('data-lat') || container.getAttribute('data-latitude');
      const lngAttr = container.getAttribute('data-lng') || container.getAttribute('data-longitude');

      if (latAttr && lngAttr) {
        lat = parseFloat(latAttr);
        lng = parseFloat(lngAttr);
        break;
      }
    }

    // Check for coordinates in script content
    if (!lat || !lng) {
      const scripts = document.querySelectorAll('script:not([src])');
      for (const script of scripts) {
        const content = script.textContent || '';
        // Look for common coordinate patterns
        const latMatch = content.match(/"lat(?:itude)?"\s*:\s*([-\d.]+)/);
        const lngMatch = content.match(/"(?:lng|lon|longitude)"\s*:\s*([-\d.]+)/);

        if (latMatch && lngMatch) {
          lat = parseFloat(latMatch[1]);
          lng = parseFloat(lngMatch[1]);
          break;
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
