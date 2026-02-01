import type { PlanningApplication, PropertyPrecedent } from '../types';

/**
 * Analyze precedent for a specific property address
 */
export function analyzePropertyPrecedent(
  applications: PlanningApplication[],
  propertyAddress: string
): PropertyPrecedent {
  // Normalize the property address for matching
  const normalizedProperty = normalizeAddress(propertyAddress);
  const streetName = extractStreetName(propertyAddress);

  // Find applications at the same address
  const sameAddress = applications.filter((app) => {
    const normalizedApp = normalizeAddress(app.address);
    return isSameAddress(normalizedProperty, normalizedApp);
  });

  // Find applications on the same street (excluding same address)
  const sameStreet = streetName
    ? applications.filter((app) => {
        const normalizedApp = normalizeAddress(app.address);
        // On same street but not same address
        return (
          !isSameAddress(normalizedProperty, normalizedApp) &&
          isOnSameStreet(streetName, app.address)
        );
      })
    : [];

  // Generate summary
  const summary = generatePrecedentSummary(sameAddress, sameStreet);
  const hasPositivePrecedent = calculatePositivePrecedent(sameAddress, sameStreet);

  return {
    sameAddress: sortByDate(sameAddress),
    sameStreet: sortByDate(sameStreet).slice(0, 5), // Limit to 5 most recent
    summary,
    hasPositivePrecedent,
  };
}

/**
 * Normalize address for comparison
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[,.\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract street name from address
 */
function extractStreetName(address: string): string | null {
  // Common UK street suffixes
  const streetSuffixes = [
    'street',
    'road',
    'lane',
    'avenue',
    'drive',
    'close',
    'way',
    'court',
    'place',
    'gardens',
    'terrace',
    'crescent',
    'grove',
    'park',
    'square',
    'hill',
    'rise',
    'mews',
    'walk',
    'row',
  ];

  const normalized = address.toLowerCase();

  // Try to find a street name pattern
  for (const suffix of streetSuffixes) {
    const regex = new RegExp(`\\b([a-z]+\\s+${suffix})\\b`, 'i');
    const match = normalized.match(regex);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  // Fallback: try to extract a reasonable street name from the second line
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    const secondPart = parts[1].toLowerCase();
    // Check if it contains a street suffix
    for (const suffix of streetSuffixes) {
      if (secondPart.includes(suffix)) {
        return secondPart;
      }
    }
  }

  return null;
}

/**
 * Check if two normalized addresses are the same property
 */
function isSameAddress(addr1: string, addr2: string): boolean {
  // Simple check: exact match after normalization
  if (addr1 === addr2) return true;

  // Check if house number matches and they share significant text
  const num1 = extractHouseNumber(addr1);
  const num2 = extractHouseNumber(addr2);

  if (num1 && num2 && num1 === num2) {
    // Check for significant overlap in street/road names
    const words1 = new Set(addr1.split(' ').filter((w) => w.length > 3));
    const words2 = new Set(addr2.split(' ').filter((w) => w.length > 3));

    let matches = 0;
    for (const word of words1) {
      if (words2.has(word)) matches++;
    }

    // If more than 60% of significant words match, consider same address
    return matches >= Math.min(words1.size, words2.size) * 0.6;
  }

  return false;
}

/**
 * Extract house number from address
 */
function extractHouseNumber(address: string): string | null {
  const match = address.match(/^\s*(\d+[a-z]?)\s/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Check if address is on the same street
 */
function isOnSameStreet(streetName: string, address: string): boolean {
  const normalized = address.toLowerCase();
  return normalized.includes(streetName.toLowerCase());
}

/**
 * Sort applications by decision date, most recent first
 */
function sortByDate(applications: PlanningApplication[]): PlanningApplication[] {
  return [...applications].sort((a, b) => {
    const dateA = a.decision_date ? new Date(a.decision_date).getTime() : 0;
    const dateB = b.decision_date ? new Date(b.decision_date).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Generate a summary of the precedent situation
 */
function generatePrecedentSummary(
  sameAddress: PlanningApplication[],
  sameStreet: PlanningApplication[]
): string {
  const sameAddrApproved = sameAddress.filter((a) => a.status === 'APPROVED').length;
  const streetApproved = sameStreet.filter((a) => a.status === 'APPROVED').length;
  const streetRefused = sameStreet.filter((a) => a.status === 'REFUSED').length;

  if (sameAddrApproved > 0) {
    return `${sameAddrApproved} previous ${sameAddrApproved === 1 ? 'approval' : 'approvals'} at this address`;
  }

  if (streetApproved > 0 && streetRefused === 0) {
    return `${streetApproved} similar ${streetApproved === 1 ? 'application' : 'applications'} approved on this street`;
  }

  if (streetApproved > streetRefused && streetApproved > 0) {
    return `Mixed precedent: ${streetApproved} approved, ${streetRefused} refused on this street`;
  }

  if (streetRefused > streetApproved && streetRefused > 0) {
    return `Caution: ${streetRefused} refusals on this street vs ${streetApproved} approvals`;
  }

  if (sameStreet.length === 0 && sameAddress.length === 0) {
    return 'No direct precedent found for this property';
  }

  return 'Limited precedent data available';
}

/**
 * Determine if there's positive precedent overall
 */
function calculatePositivePrecedent(
  sameAddress: PlanningApplication[],
  sameStreet: PlanningApplication[]
): boolean {
  const sameAddrApproved = sameAddress.filter((a) => a.status === 'APPROVED').length;
  if (sameAddrApproved > 0) return true;

  const streetApproved = sameStreet.filter((a) => a.status === 'APPROVED').length;
  const streetRefused = sameStreet.filter((a) => a.status === 'REFUSED').length;

  return streetApproved >= streetRefused && streetApproved > 0;
}
