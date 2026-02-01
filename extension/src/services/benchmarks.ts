import type { LocalAuthority, BenchmarkComparison, CouncilPerformance } from '../types';
import { NATIONAL_AVERAGES } from '../types/enhanced';

/**
 * Calculate benchmark comparisons for a local authority
 */
export function calculateBenchmarks(authority: LocalAuthority): CouncilPerformance {
  const approvalBenchmark = calculateApprovalBenchmark(authority.approval_rate);
  const decisionBenchmark = calculateDecisionDaysBenchmark(authority.avg_decision_days);

  // Calculate estimated national rank based on approval rate
  // This is an estimate - higher approval rate = better rank
  const estimatedRank = estimateNationalRank(authority.approval_rate);

  // Determine overall rating
  const overallRating = determineOverallRating(approvalBenchmark, decisionBenchmark);

  return {
    approvalRate: approvalBenchmark,
    decisionDays: decisionBenchmark,
    nationalRank: estimatedRank,
    totalCouncils: NATIONAL_AVERAGES.totalCouncils,
    overallRating,
  };
}

/**
 * Calculate approval rate benchmark comparison
 */
function calculateApprovalBenchmark(localRate: number): BenchmarkComparison {
  const nationalAvg = NATIONAL_AVERAGES.approvalRate;
  const difference = localRate - nationalAvg;
  const percentDifference = Math.round(difference * 100);

  return {
    metric: 'approval_rate',
    displayName: 'Approval Rate',
    localValue: localRate,
    nationalAverage: nationalAvg,
    difference,
    percentDifference,
    rating: getRating(percentDifference, 5, -5), // +5% is above, -5% is below
  };
}

/**
 * Calculate decision days benchmark comparison
 * Note: For decision days, LOWER is better
 */
function calculateDecisionDaysBenchmark(localDays: number): BenchmarkComparison {
  const nationalAvg = NATIONAL_AVERAGES.avgDecisionDays;
  const difference = nationalAvg - localDays; // Inverted: faster is positive
  const percentDifference = Math.round((difference / nationalAvg) * 100);

  return {
    metric: 'decision_days',
    displayName: 'Decision Time',
    localValue: localDays,
    nationalAverage: nationalAvg,
    difference,
    percentDifference,
    rating: getRating(difference, 5, -5), // 5+ days faster is above average
  };
}

/**
 * Determine rating based on difference value
 */
function getRating(
  value: number,
  aboveThreshold: number,
  belowThreshold: number
): BenchmarkComparison['rating'] {
  if (value >= aboveThreshold) return 'above-average';
  if (value <= belowThreshold) return 'below-average';
  return 'average';
}

/**
 * Estimate national rank based on approval rate
 * Higher approval rate = better (lower) rank number
 */
function estimateNationalRank(approvalRate: number): number {
  // Simple linear estimation
  // 90%+ approval = top 50 councils
  // 76% (average) = around 170
  // 60% = around 300

  const totalCouncils = NATIONAL_AVERAGES.totalCouncils;

  if (approvalRate >= 0.95) return Math.floor(totalCouncils * 0.05);
  if (approvalRate >= 0.90) return Math.floor(totalCouncils * 0.15);
  if (approvalRate >= 0.85) return Math.floor(totalCouncils * 0.25);
  if (approvalRate >= 0.80) return Math.floor(totalCouncils * 0.35);
  if (approvalRate >= 0.76) return Math.floor(totalCouncils * 0.50);
  if (approvalRate >= 0.70) return Math.floor(totalCouncils * 0.65);
  if (approvalRate >= 0.65) return Math.floor(totalCouncils * 0.75);
  if (approvalRate >= 0.60) return Math.floor(totalCouncils * 0.85);

  return Math.floor(totalCouncils * 0.90);
}

/**
 * Determine overall council performance rating
 */
function determineOverallRating(
  approvalBenchmark: BenchmarkComparison,
  decisionBenchmark: BenchmarkComparison
): CouncilPerformance['overallRating'] {
  const ratings = [approvalBenchmark.rating, decisionBenchmark.rating];

  // Both above average = above average
  if (ratings.every((r) => r === 'above-average')) return 'above-average';

  // Both below average = below average
  if (ratings.every((r) => r === 'below-average')) return 'below-average';

  // Approval rate is more important for planning potential
  if (approvalBenchmark.rating === 'above-average') return 'above-average';
  if (approvalBenchmark.rating === 'below-average') return 'below-average';

  return 'average';
}

/**
 * Get headline text for benchmark summary
 */
export function getBenchmarkHeadline(performance: CouncilPerformance): string {
  const approvalDiff = performance.approvalRate.percentDifference;

  if (approvalDiff >= 10) {
    return `${approvalDiff}% above national average`;
  }

  if (approvalDiff >= 5) {
    return `${approvalDiff}% above national average`;
  }

  if (approvalDiff <= -10) {
    return `${Math.abs(approvalDiff)}% below national average`;
  }

  if (approvalDiff <= -5) {
    return `${Math.abs(approvalDiff)}% below national average`;
  }

  return 'In line with national average';
}

/**
 * Get subtext for benchmark summary
 */
export function getBenchmarkSubtext(performance: CouncilPerformance): string {
  if (performance.nationalRank && performance.totalCouncils) {
    return `Ranked ~${performance.nationalRank} of ${performance.totalCouncils} councils`;
  }
  return '';
}
