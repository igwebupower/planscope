import type { SupportedSite, PropertyData } from '../../types';
import { extractRightmoveData } from './rightmove';
import { extractZooplaData } from './zoopla';

// URL patterns for supported property listing sites
const SITE_PATTERNS: Record<SupportedSite, RegExp> = {
  rightmove: /rightmove\.co\.uk\/properties\/\d+/,
  zoopla: /zoopla\.co\.uk\/(for-sale|to-rent|new-homes)\/details\/\d+/,
  unknown: /^$/,
};

/**
 * Detect which property portal we're on based on URL
 */
export function detectSite(url: string): SupportedSite {
  if (SITE_PATTERNS.rightmove.test(url)) {
    return 'rightmove';
  }
  if (SITE_PATTERNS.zoopla.test(url)) {
    return 'zoopla';
  }
  return 'unknown';
}

/**
 * Extract property data from the current page based on detected site
 */
export function extractPropertyData(site: SupportedSite): PropertyData | null {
  switch (site) {
    case 'rightmove':
      return extractRightmoveData();
    case 'zoopla':
      return extractZooplaData();
    default:
      return null;
  }
}

/**
 * Check if we're on a property detail page (not search results)
 */
export function isPropertyDetailPage(site: SupportedSite): boolean {
  switch (site) {
    case 'rightmove':
      return /\/properties\/\d+/.test(window.location.pathname);
    case 'zoopla':
      return /\/details\/\d+/.test(window.location.pathname);
    default:
      return false;
  }
}
