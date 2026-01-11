// Utility functions

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format distance in meters to human readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format date string to UK format
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Pending';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Extract postcode from address string
 * Supports full postcodes (E16 1XX) and partial outcodes (E16)
 */
export function extractPostcode(address: string): string | null {
  // Try full postcode first (e.g., "E16 1XX", "SW1A 1AA")
  const fullPostcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/i;
  const fullMatch = address.match(fullPostcodeRegex);
  if (fullMatch) {
    return fullMatch[0].toUpperCase();
  }

  // Fall back to partial outcode (e.g., "E16", "SW1A", "EC1")
  // Must be at word boundary to avoid matching random letter-number combos
  const outcodeRegex = /\b([A-Z]{1,2}[0-9][0-9A-Z]?)\b/i;
  const outcodeMatch = address.match(outcodeRegex);
  if (outcodeMatch) {
    return outcodeMatch[1].toUpperCase();
  }

  return null;
}

/**
 * Clean address string for geocoding
 * Removes property listing prefixes like "3 bed property for sale"
 */
export function cleanAddressForGeocoding(address: string): string {
  // Remove common property listing prefixes
  const patterns = [
    /^\d+\s*bed(room)?\s*(flat|house|apartment|property|home|bungalow|maisonette|studio)?\s*(for\s*(sale|rent))?\s*/i,
    /^(flat|house|apartment|property|home|bungalow|maisonette|studio)\s*(for\s*(sale|rent))?\s*/i,
    /^for\s*(sale|rent)\s*/i,
  ];

  let cleaned = address;
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove leading punctuation/whitespace
  cleaned = cleaned.replace(/^[\s,\-:]+/, '');

  return cleaned.trim() || address;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}
