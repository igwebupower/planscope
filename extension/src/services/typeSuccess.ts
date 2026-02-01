import type { PlanningApplication, TypeSuccessRate } from '../types';

/**
 * Application type display names
 */
const TYPE_DISPLAY_NAMES: Record<string, string> = {
  EXTENSION: 'Extensions',
  LOFT_CONVERSION: 'Loft Conv.',
  NEW_BUILD: 'New Builds',
  CHANGE_OF_USE: 'Change of Use',
  DEMOLITION: 'Demolition',
  ADVERTISEMENT: 'Adverts',
  LISTED_BUILDING: 'Listed Bldg',
  TREE_WORKS: 'Tree Works',
  PRIOR_APPROVAL: 'Prior Appr.',
  OTHER: 'Other',
};

/**
 * Analyze success rates by application type
 */
export function analyzeTypeSuccessRates(
  applications: PlanningApplication[]
): TypeSuccessRate[] {
  // Filter to decided applications only
  const decidedApps = applications.filter(
    (app) => app.status === 'APPROVED' || app.status === 'REFUSED'
  );

  if (decidedApps.length < 3) {
    return []; // Not enough data
  }

  // Group by type
  const typeGroups = new Map<string, PlanningApplication[]>();

  for (const app of decidedApps) {
    const type = app.type || 'OTHER';
    if (!typeGroups.has(type)) {
      typeGroups.set(type, []);
    }
    typeGroups.get(type)!.push(app);
  }

  // Calculate success rate for each type
  const rates: TypeSuccessRate[] = [];

  for (const [type, apps] of typeGroups) {
    if (apps.length < 1) continue; // Skip types with too few applications

    const approved = apps.filter((a) => a.status === 'APPROVED').length;
    const refused = apps.filter((a) => a.status === 'REFUSED').length;
    const total = apps.length;
    const successRate = total > 0 ? approved / total : 0;

    rates.push({
      type,
      displayName: TYPE_DISPLAY_NAMES[type] || formatTypeName(type),
      approved,
      refused,
      total,
      successRate,
      rank: 'average', // Will be set after ranking
    });
  }

  // Sort by success rate descending
  rates.sort((a, b) => b.successRate - a.successRate);

  // Assign ranks
  rates.forEach((rate) => {
    rate.rank = getRank(rate.successRate);
  });

  return rates;
}

/**
 * Determine rank category based on success rate
 */
function getRank(successRate: number): TypeSuccessRate['rank'] {
  // Primary ranking based on success rate
  if (successRate >= 0.80) return 'best';
  if (successRate >= 0.65) return 'good';
  if (successRate >= 0.50) return 'average';
  if (successRate >= 0.35) return 'poor';
  return 'worst';
}

/**
 * Format type name for display
 */
function formatTypeName(type: string): string {
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get the best performing type for insight
 */
export function getBestType(rates: TypeSuccessRate[]): TypeSuccessRate | null {
  if (rates.length === 0) return null;
  return rates[0]; // Already sorted by success rate
}

/**
 * Get insight text based on type success rates
 */
export function getTypeInsight(rates: TypeSuccessRate[]): string | null {
  if (rates.length === 0) return null;

  const best = rates[0];
  if (best.successRate >= 0.70 && best.total >= 2) {
    return `${best.displayName} have highest success rate at ${Math.round(best.successRate * 100)}%`;
  }

  // Check if any type has particularly low success
  const worst = rates[rates.length - 1];
  if (worst.successRate < 0.40 && worst.total >= 2) {
    return `${worst.displayName} have lower success rate (${Math.round(worst.successRate * 100)}%) in this area`;
  }

  return null;
}
