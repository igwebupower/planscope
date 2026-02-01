import type { PlanningApplication, TrendAnalysis } from '../types';

/**
 * Analyze approval rate trends over time periods
 */
export function analyzeTrends(
  applications: PlanningApplication[],
  period: TrendAnalysis['period'] = '12mo'
): TrendAnalysis | null {
  // Filter to applications with decision dates
  const decidedApps = applications.filter(
    (app) => app.decision_date && (app.status === 'APPROVED' || app.status === 'REFUSED')
  );

  if (decidedApps.length < 5) {
    return null; // Not enough data for meaningful analysis
  }

  const now = new Date();
  const periodMonths = getPeriodMonths(period);

  // Calculate cutoff dates
  const currentPeriodStart = new Date(now);
  currentPeriodStart.setMonth(currentPeriodStart.getMonth() - periodMonths);

  const comparisonPeriodStart = new Date(currentPeriodStart);
  comparisonPeriodStart.setMonth(comparisonPeriodStart.getMonth() - periodMonths);

  // Split applications into current and comparison periods
  const currentPeriodApps = decidedApps.filter((app) => {
    const date = new Date(app.decision_date!);
    return date >= currentPeriodStart && date <= now;
  });

  const comparisonPeriodApps = decidedApps.filter((app) => {
    const date = new Date(app.decision_date!);
    return date >= comparisonPeriodStart && date < currentPeriodStart;
  });

  // Need data in both periods for comparison
  if (currentPeriodApps.length < 2 || comparisonPeriodApps.length < 2) {
    // Fall back to overall vs recent if we can't do period comparison
    return analyzeOverallTrend(decidedApps, period);
  }

  // Calculate metrics for each period
  const currentMetrics = calculatePeriodMetrics(currentPeriodApps);
  const comparisonMetrics = calculatePeriodMetrics(comparisonPeriodApps);

  // Calculate change
  const approvalRateChange = Math.round(
    (currentMetrics.approvalRate - comparisonMetrics.approvalRate) * 100
  );

  // Determine trend
  const trend = determineTrend(approvalRateChange);

  return {
    current: currentMetrics,
    comparison: comparisonMetrics,
    period,
    approvalRateChange,
    trend,
  };
}

/**
 * Fallback trend analysis comparing overall to recent
 */
function analyzeOverallTrend(
  applications: PlanningApplication[],
  period: TrendAnalysis['period']
): TrendAnalysis | null {
  if (applications.length < 5) return null;

  // Sort by date
  const sorted = [...applications].sort((a, b) => {
    return new Date(b.decision_date!).getTime() - new Date(a.decision_date!).getTime();
  });

  // Split into recent (first third) and older (rest)
  const splitIndex = Math.max(2, Math.floor(sorted.length / 3));
  const recent = sorted.slice(0, splitIndex);
  const older = sorted.slice(splitIndex);

  if (recent.length < 2 || older.length < 2) return null;

  const currentMetrics = calculatePeriodMetrics(recent);
  const comparisonMetrics = calculatePeriodMetrics(older);

  const approvalRateChange = Math.round(
    (currentMetrics.approvalRate - comparisonMetrics.approvalRate) * 100
  );

  return {
    current: currentMetrics,
    comparison: comparisonMetrics,
    period,
    approvalRateChange,
    trend: determineTrend(approvalRateChange),
  };
}

/**
 * Calculate metrics for a set of applications
 */
function calculatePeriodMetrics(applications: PlanningApplication[]): {
  approvalRate: number;
  avgDecisionDays: number;
  count: number;
} {
  const approved = applications.filter((a) => a.status === 'APPROVED').length;
  const total = applications.length;

  // Calculate average decision days (placeholder - would need submission date for accuracy)
  const avgDecisionDays = 56; // Default estimate

  return {
    approvalRate: total > 0 ? approved / total : 0,
    avgDecisionDays,
    count: total,
  };
}

/**
 * Determine trend category based on approval rate change
 */
function determineTrend(changePercent: number): TrendAnalysis['trend'] {
  if (changePercent >= 5) return 'improving';
  if (changePercent <= -5) return 'declining';
  return 'stable';
}

/**
 * Convert period string to months
 */
function getPeriodMonths(period: TrendAnalysis['period']): number {
  switch (period) {
    case '3mo':
      return 3;
    case '6mo':
      return 6;
    case '12mo':
      return 12;
    default:
      return 12;
  }
}

/**
 * Get period label for display
 */
export function getPeriodLabel(period: TrendAnalysis['period']): string {
  switch (period) {
    case '3mo':
      return '3 months';
    case '6mo':
      return '6 months';
    case '12mo':
      return '12 months';
    default:
      return '12 months';
  }
}
