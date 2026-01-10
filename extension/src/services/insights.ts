import type { PlanningApplication, LocalAuthority, Insight } from '../types';

/**
 * Rules-based insight generator
 * Analyzes planning application data and generates actionable insights
 */

export function generateInsights(
  applications: PlanningApplication[],
  authority: LocalAuthority
): Insight[] {
  const insights: Insight[] = [];

  // Count by status
  const statusCounts = countByStatus(applications);
  const typeCounts = countByType(applications);

  // === Positive Insights ===

  // High local approval rate
  if (authority.approval_rate >= 0.7) {
    insights.push({
      type: 'positive',
      message: `${authority.name} has a ${Math.round(authority.approval_rate * 100)}% approval rate - above average for planning applications.`,
    });
  }

  // Many approved extensions nearby
  const approvedExtensions = applications.filter(
    (app) => app.status === 'APPROVED' && app.type === 'EXTENSION'
  );
  if (approvedExtensions.length >= 3) {
    insights.push({
      type: 'positive',
      message: `${approvedExtensions.length} extension applications approved nearby - good precedent for similar works.`,
    });
  }

  // Pro-development climate
  if (authority.planning_climate === 'PRO_DEVELOPMENT') {
    insights.push({
      type: 'positive',
      message: 'This area has a pro-development planning climate.',
    });
  }

  // Fast decision times
  if (authority.avg_decision_days <= 50) {
    insights.push({
      type: 'positive',
      message: `Average decision time is ${authority.avg_decision_days} days - faster than many areas.`,
    });
  }

  // === Warning Insights ===

  // High refusal rate
  const refusalRate = statusCounts.REFUSED / applications.length;
  if (refusalRate >= 0.25 && applications.length >= 5) {
    insights.push({
      type: 'warning',
      message: `${Math.round(refusalRate * 100)}% of nearby applications were refused - check local policies carefully.`,
    });
  }

  // Restrictive climate
  if (authority.planning_climate === 'RESTRICTIVE') {
    insights.push({
      type: 'warning',
      message: 'This area has a restrictive planning climate - applications may face stricter scrutiny.',
    });
  }

  // Low approval rate
  if (authority.approval_rate < 0.6) {
    insights.push({
      type: 'warning',
      message: `Low approval rate of ${Math.round(authority.approval_rate * 100)}% - consider professional advice.`,
    });
  }

  // Recent refusals for extensions
  const recentRefusedExtensions = applications.filter((app) => {
    if (app.status !== 'REFUSED' || app.type !== 'EXTENSION') return false;
    if (!app.decision_date) return false;
    const daysSinceDecision = daysSince(new Date(app.decision_date));
    return daysSinceDecision <= 365;
  });
  if (recentRefusedExtensions.length >= 2) {
    insights.push({
      type: 'warning',
      message: `${recentRefusedExtensions.length} extension applications refused in the last year nearby.`,
    });
  }

  // Slow decision times
  if (authority.avg_decision_days >= 80) {
    insights.push({
      type: 'warning',
      message: `Average decision time is ${authority.avg_decision_days} days - expect longer waits.`,
    });
  }

  // === Info Insights ===

  // Pending applications nearby
  if (statusCounts.PENDING >= 3) {
    insights.push({
      type: 'info',
      message: `${statusCounts.PENDING} applications pending nearby - area undergoing active development.`,
    });
  }

  // Common application type
  const mostCommonType = getMostCommonType(typeCounts);
  if (mostCommonType && typeCounts[mostCommonType] >= 4) {
    insights.push({
      type: 'info',
      message: `${typeCounts[mostCommonType]} ${formatType(mostCommonType)} applications nearby - common development pattern.`,
    });
  }

  // New builds in area
  if (typeCounts['NEW_BUILD'] >= 2) {
    insights.push({
      type: 'info',
      message: `${typeCounts['NEW_BUILD']} new build applications nearby - area may be seeing significant change.`,
    });
  }

  // Limit to top 5 most relevant insights
  return insights.slice(0, 5);
}

function countByStatus(applications: PlanningApplication[]): Record<string, number> {
  return applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function countByType(applications: PlanningApplication[]): Record<string, number> {
  return applications.reduce(
    (acc, app) => {
      acc[app.type] = (acc[app.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function getMostCommonType(counts: Record<string, number>): string | null {
  let maxType: string | null = null;
  let maxCount = 0;

  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxType = type;
      maxCount = count;
    }
  }

  return maxType;
}

function formatType(type: string): string {
  return type.toLowerCase().replace(/_/g, ' ');
}

function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
