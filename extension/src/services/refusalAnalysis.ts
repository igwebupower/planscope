import type { PlanningApplication, RefusalReason } from '../types';
import { REFUSAL_PATTERNS } from '../types/enhanced';

/**
 * Analyze refusal reasons from application summaries
 */
export function analyzeRefusalReasons(
  applications: PlanningApplication[]
): RefusalReason[] {
  // Filter to refused applications only
  const refusedApps = applications.filter((app) => app.status === 'REFUSED');

  if (refusedApps.length < 2) {
    return []; // Not enough refusals to analyze
  }

  // Count matches for each pattern category
  const categoryCounts = new Map<string, { count: number; keywords: string[] }>();

  for (const category of Object.keys(REFUSAL_PATTERNS)) {
    categoryCounts.set(category, { count: 0, keywords: [] });
  }

  // Analyze each refused application's summary
  for (const app of refusedApps) {
    const summary = app.summary.toLowerCase();
    const matchedCategories = new Set<string>();

    for (const [category, config] of Object.entries(REFUSAL_PATTERNS)) {
      for (const keyword of config.keywords) {
        if (summary.includes(keyword.toLowerCase()) && !matchedCategories.has(category)) {
          const data = categoryCounts.get(category)!;
          data.count++;
          if (!data.keywords.includes(keyword)) {
            data.keywords.push(keyword);
          }
          matchedCategories.add(category);
          break; // Count each category only once per application
        }
      }
    }
  }

  // Convert to RefusalReason array
  const reasons: RefusalReason[] = [];
  const totalRefused = refusedApps.length;

  for (const [category, data] of categoryCounts) {
    if (data.count > 0) {
      const config = REFUSAL_PATTERNS[category];
      reasons.push({
        category,
        displayName: config.displayName,
        count: data.count,
        percentage: Math.round((data.count / totalRefused) * 100),
        keywords: data.keywords,
      });
    }
  }

  // Sort by count descending and return top 5
  reasons.sort((a, b) => b.count - a.count);
  return reasons.slice(0, 5);
}

/**
 * Get total refusal count for header display
 */
export function getRefusalCount(applications: PlanningApplication[]): number {
  return applications.filter((app) => app.status === 'REFUSED').length;
}

/**
 * Generate advice based on top refusal reasons
 */
export function getRefusalAdvice(reasons: RefusalReason[]): string {
  if (reasons.length === 0) {
    return 'No clear patterns in refusals. Review individual decisions for insights.';
  }

  const topReason = reasons[0];

  // Provide specific advice based on top reason
  switch (topReason.category) {
    case 'bulk-mass':
      return 'Address bulk and massing concerns proactively in your design statement.';
    case 'character':
      return 'Ensure design complements the local character. Consider using local materials.';
    case 'overlooking':
      return 'Privacy impacts are a concern. Consider obscured glazing or repositioning windows.';
    case 'light':
      return 'Daylight/sunlight assessments may strengthen your application.';
    case 'parking':
      return 'Parking provision is scrutinized. Include a parking statement with your application.';
    case 'amenity':
      return 'Neighbour amenity is a key concern. Consider noise/visual impact mitigation.';
    case 'heritage':
      return 'Heritage sensitivity is high. A heritage statement may be required.';
    default:
      return 'Address these concerns proactively in your application.';
  }
}
