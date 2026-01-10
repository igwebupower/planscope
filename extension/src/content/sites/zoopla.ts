import type { PropertyData } from '../../types';
import { extractPostcode } from '../../utils';

/**
 * Extract property data from Zoopla listing page
 *
 * Zoopla stores property data in:
 * 1. __NEXT_DATA__ script (Next.js hydration data)
 * 2. JSON-LD structured data
 * 3. DOM elements
 *
 * If coordinates are missing but postcode is available,
 * we'll use postcodes.io to geocode.
 */
export function extractZooplaData(): PropertyData | null {
  // Try __NEXT_DATA__ first (Zoopla uses Next.js)
  let data = extractFromNextData();
  if (data?.lat && data?.lng) {
    console.log('[PlanScope] Extracted complete data from Zoopla __NEXT_DATA__');
    return data;
  }

  // Try structured data
  const structuredData = extractFromStructuredData();
  if (structuredData?.lat && structuredData?.lng) {
    console.log('[PlanScope] Extracted complete data from Zoopla structured data');
    return structuredData;
  }

  // Merge partial data if we have some
  if (structuredData && !data) {
    data = structuredData;
  } else if (structuredData && data) {
    // Prefer address from structured data if more complete
    if (!data.address && structuredData.address) {
      data.address = structuredData.address;
    }
    if (!data.postcode && structuredData.postcode) {
      data.postcode = structuredData.postcode;
    }
  }

  // Fallback to DOM
  const domData = extractFromDOM();
  if (domData?.lat && domData?.lng) {
    console.log('[PlanScope] Extracted complete data from Zoopla DOM');
    return domData;
  }

  // Merge DOM data
  if (domData && !data) {
    data = domData;
  } else if (domData && data) {
    if (!data.address && domData.address) {
      data.address = domData.address;
    }
    if (!data.postcode && domData.postcode) {
      data.postcode = domData.postcode;
    }
    // Use coordinates from DOM if we don't have them
    if ((!data.lat || !data.lng) && domData.lat && domData.lng) {
      data.lat = domData.lat;
      data.lng = domData.lng;
    }
  }

  if (data) {
    console.log('[PlanScope] Extracted partial Zoopla data:', data);
    return data;
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
      console.log('[PlanScope] No __NEXT_DATA__ script found');
      return null;
    }

    const data = JSON.parse(nextDataScript.textContent || '');
    const props = data?.props?.pageProps;

    if (!props) {
      console.log('[PlanScope] No pageProps in __NEXT_DATA__');
      return null;
    }

    // Debug: log available keys to understand the structure
    console.log('[PlanScope] Zoopla pageProps keys:', Object.keys(props));

    // Zoopla's data structure varies by listing type - check many paths
    const listing = props.listingDetails ||
                    props.listing ||
                    props.data?.listing ||
                    props.propertyDetails ||
                    props.property ||
                    props.listingData ||
                    props.initialProps?.listingDetails ||
                    props;

    // For new developments, data might be under different paths
    const development = props.developmentDetails || props.development || props.newHome;

    // Debug: log what we found
    if (listing && typeof listing === 'object') {
      console.log('[PlanScope] Found listing keys:', Object.keys(listing));
    }

    // Try to find address from various paths
    const address = listing?.address?.displayAddress ||
                    listing?.displayAddress ||
                    listing?.title ||
                    listing?.propertyAddress ||
                    development?.address?.displayAddress ||
                    development?.name ||
                    props.address?.displayAddress ||
                    '';

    // Try to find location from various paths
    const location = listing?.location ||
                     listing?.coordinates ||
                     listing?.latLng ||
                     listing?.geo ||
                     listing?.position ||
                     development?.location ||
                     development?.coordinates ||
                     props.location ||
                     props.coordinates;

    // Also check for lat/lng directly on listing
    let lat = location?.lat ?? location?.latitude ?? listing?.lat ?? listing?.latitude ?? null;
    let lng = location?.lng ?? location?.lon ?? location?.longitude ?? listing?.lng ?? listing?.lon ?? listing?.longitude ?? null;

    // Check nested address object for coordinates
    if ((!lat || !lng) && listing?.address) {
      lat = listing.address.lat ?? listing.address.latitude ?? lat;
      lng = listing.address.lng ?? listing.address.lon ?? listing.address.longitude ?? lng;
    }

    // For new developments, check development-specific paths
    if ((!lat || !lng) && development) {
      const devLoc = development.location || development.coordinates || development.geo;
      lat = lat ?? devLoc?.lat ?? devLoc?.latitude ?? development.lat ?? development.latitude;
      lng = lng ?? devLoc?.lng ?? devLoc?.lon ?? devLoc?.longitude ?? development.lng ?? development.lon ?? development.longitude;
    }

    console.log('[PlanScope] Extracted from __NEXT_DATA__:', { address, lat, lng });

    if (!address && !lat && !lng) {
      return null;
    }

    return {
      address,
      lat: lat !== null && !isNaN(Number(lat)) ? Number(lat) : null,
      lng: lng !== null && !isNaN(Number(lng)) ? Number(lng) : null,
      postcode: listing?.address?.postcode || development?.address?.postcode || extractPostcode(address),
    };
  } catch (error) {
    console.warn('[PlanScope] Error parsing __NEXT_DATA__:', error);
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
      try {
        const data = JSON.parse(script.textContent || '');

        // Handle array of schemas
        const schemas = Array.isArray(data) ? data : [data];

        for (const schema of schemas) {
          // Look for various property schema types
          const propertyTypes = [
            'Residence', 'Place', 'Product', 'Apartment', 'House',
            'SingleFamilyResidence', 'RealEstateListing', 'Accommodation',
            'LodgingBusiness', 'LocalBusiness'
          ];

          if (propertyTypes.includes(schema['@type'])) {
            const geo = schema.geo || schema.location?.geo;
            const address = schema.address?.streetAddress ||
                           schema.address?.name ||
                           schema.name ||
                           schema.description?.substring(0, 100) ||
                           '';

            console.log('[PlanScope] Found structured data schema:', schema['@type']);

            if (geo) {
              const lat = parseFloat(geo.latitude);
              const lng = parseFloat(geo.longitude);

              if (!isNaN(lat) && !isNaN(lng)) {
                console.log('[PlanScope] Extracted from structured data:', { address, lat, lng });
                return {
                  address,
                  lat,
                  lng,
                  postcode: schema.address?.postalCode || extractPostcode(address),
                };
              }
            }

            // Even without geo, return address data
            if (address) {
              return {
                address,
                lat: null,
                lng: null,
                postcode: schema.address?.postalCode || extractPostcode(address),
              };
            }
          }

          // Also check for @graph structure
          if (schema['@graph']) {
            for (const item of schema['@graph']) {
              if (item.geo || item['@type']?.includes('Residence')) {
                const geo = item.geo;
                const address = item.address?.streetAddress || item.name || '';

                if (geo) {
                  const lat = parseFloat(geo.latitude);
                  const lng = parseFloat(geo.longitude);

                  if (!isNaN(lat) && !isNaN(lng)) {
                    console.log('[PlanScope] Extracted from @graph:', { address, lat, lng });
                    return {
                      address,
                      lat,
                      lng,
                      postcode: item.address?.postalCode || extractPostcode(address),
                    };
                  }
                }
              }
            }
          }
        }
      } catch (parseError) {
        // Continue to next script
        console.warn('[PlanScope] Error parsing LD+JSON:', parseError);
      }
    }
  } catch (error) {
    console.warn('[PlanScope] Error in structured data extraction:', error);
  }

  return null;
}

/**
 * Fallback DOM extraction
 */
function extractFromDOM(): PropertyData | null {
  try {
    // Zoopla address selectors - expanded list
    const addressSelectors = [
      '[data-testid="address-label"]',
      '[data-testid="listing-title"]',
      '[data-testid="listing-summary-address"]',
      'h1[data-testid="listing-title"]',
      '.dp-sidebar-wrapper__address',
      '[class*="ListingHeader"] h1',
      '[class*="address"]',
      '[class*="Address"]',
      'address',
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
    ];

    let address = '';

    for (const selector of addressSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        address = element.getAttribute('content') || element.textContent?.trim() || '';
        if (address && address.length > 5) break;
      }
    }

    console.log('[PlanScope] DOM address found:', address);

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
        console.log('[PlanScope] Found coordinates in data attributes:', { lat, lng });
        break;
      }
    }

    // Check for coordinates in script content with expanded patterns
    if (!lat || !lng) {
      const scripts = document.querySelectorAll('script:not([src])');
      for (const script of scripts) {
        const content = script.textContent || '';

        // Skip very small scripts
        if (content.length < 20) continue;

        // Multiple coordinate patterns to try
        const patterns = [
          // Standard JSON patterns
          { lat: /"lat(?:itude)?"\s*:\s*([-\d.]+)/, lng: /"(?:lng|lon|longitude)"\s*:\s*([-\d.]+)/ },
          // With single quotes
          { lat: /'lat(?:itude)?'\s*:\s*([-\d.]+)/, lng: /'(?:lng|lon|longitude)'\s*:\s*([-\d.]+)/ },
          // Coordinates object
          { lat: /coordinates.*?"lat"\s*:\s*([-\d.]+)/, lng: /coordinates.*?"(?:lng|lon)"\s*:\s*([-\d.]+)/ },
          // Location object
          { lat: /location.*?"lat"\s*:\s*([-\d.]+)/, lng: /location.*?"(?:lng|lon)"\s*:\s*([-\d.]+)/ },
          // Map center
          { lat: /center.*?(51\.\d+)/, lng: /center.*?(-?\d\.\d+)/ },
          // LatLng format
          { lat: /LatLng\(([-\d.]+)/, lng: /LatLng\([-\d.]+,\s*([-\d.]+)/ },
          // Point format
          { lat: /point.*?(51\.\d+)/, lng: /point.*?([-]?0\.\d+)/ },
        ];

        for (const pattern of patterns) {
          const latMatch = content.match(pattern.lat);
          const lngMatch = content.match(pattern.lng);

          if (latMatch && lngMatch) {
            const parsedLat = parseFloat(latMatch[1]);
            const parsedLng = parseFloat(lngMatch[1]);

            // Validate UK coordinates (roughly)
            if (parsedLat >= 49 && parsedLat <= 61 && parsedLng >= -8 && parsedLng <= 2) {
              lat = parsedLat;
              lng = parsedLng;
              console.log('[PlanScope] Found coordinates in script:', { lat, lng });
              break;
            }
          }
        }

        if (lat && lng) break;
      }
    }

    // Check meta tags for coordinates
    if (!lat || !lng) {
      const geoLat = document.querySelector('meta[property="place:location:latitude"], meta[name="geo.position"]');
      const geoLng = document.querySelector('meta[property="place:location:longitude"]');

      if (geoLat && geoLng) {
        lat = parseFloat(geoLat.getAttribute('content') || '');
        lng = parseFloat(geoLng.getAttribute('content') || '');
        console.log('[PlanScope] Found coordinates in meta tags:', { lat, lng });
      }
    }

    // Check URL for coordinates (some sites include them)
    if (!lat || !lng) {
      const urlMatch = window.location.href.match(/[?&]lat=([-\d.]+).*[?&](?:lng|lon)=([-\d.]+)/);
      if (urlMatch) {
        lat = parseFloat(urlMatch[1]);
        lng = parseFloat(urlMatch[2]);
        console.log('[PlanScope] Found coordinates in URL:', { lat, lng });
      }
    }

    console.log('[PlanScope] DOM extraction result:', { address, lat, lng });

    if (!address) {
      return null;
    }

    return {
      address,
      lat: lat && !isNaN(lat) ? lat : null,
      lng: lng && !isNaN(lng) ? lng : null,
      postcode: extractPostcode(address),
    };
  } catch (error) {
    console.warn('[PlanScope] DOM extraction error:', error);
    return null;
  }
}
