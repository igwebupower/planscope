import type {
  LocalAuthority,
  PlanningConstraint,
  DevelopmentScore,
  TrendAnalysis,
  PropertyPrecedent,
} from '../types';
import { SCORE_RATINGS } from '../types/enhanced';

/**
 * Weights for development score calculation
 */
const WEIGHTS = {
  constraints: 0.25,
  approvalRate: 0.25,
  climate: 0.20,
  precedent: 0.15,
  trends: 0.15,
};

/**
 * Calculate the overall development potential score
 */
export function calculateDevelopmentScore(
  _applications: unknown[], // Reserved for future use
  authority: LocalAuthority,
  constraints: PlanningConstraint[] | undefined,
  trendAnalysis: TrendAnalysis | null,
  precedent: PropertyPrecedent | null
): DevelopmentScore {
  // Calculate individual component scores
  const constraintsScore = calculateConstraintsScore(constraints);
  const approvalRateScore = calculateApprovalRateScore(authority.approval_rate);
  const climateScore = calculateClimateScore(authority.planning_climate);
  const precedentScore = calculatePrecedentScore(precedent);
  const trendsScore = calculateTrendsScore(trendAnalysis);

  // Calculate weighted overall score
  const overall = Math.round(
    constraintsScore * WEIGHTS.constraints +
    approvalRateScore * WEIGHTS.approvalRate +
    climateScore * WEIGHTS.climate +
    precedentScore * WEIGHTS.precedent +
    trendsScore * WEIGHTS.trends
  );

  // Determine rating based on overall score
  const ratingConfig = SCORE_RATINGS.find(r => overall >= r.min) || SCORE_RATINGS[SCORE_RATINGS.length - 1];

  // Generate summary text
  const summary = generateSummary(overall, ratingConfig.rating, constraints, authority);

  return {
    overall,
    breakdown: {
      constraints: constraintsScore,
      approvalRate: approvalRateScore,
      climate: climateScore,
      precedent: precedentScore,
      trends: trendsScore,
    },
    weights: WEIGHTS,
    rating: ratingConfig.rating,
    summary,
  };
}

/**
 * Calculate score based on planning constraints
 * No constraints = 100, high risk = lower scores
 */
function calculateConstraintsScore(constraints: PlanningConstraint[] | undefined): number {
  if (!constraints || constraints.length === 0) {
    return 100;
  }

  // Import constraint config for risk levels
  const CONSTRAINT_CONFIG: Record<string, { risk: 'high' | 'medium' | 'low' }> = {
    'conservation-area': { risk: 'medium' },
    'listed-building': { risk: 'high' },
    'article-4-direction-area': { risk: 'high' },
    'green-belt': { risk: 'high' },
    'flood-risk-zone': { risk: 'high' },
    'tree-preservation-zone': { risk: 'medium' },
    'ancient-woodland': { risk: 'medium' },
    'area-of-outstanding-natural-beauty': { risk: 'medium' },
    'national-park': { risk: 'high' },
    'scheduled-monument': { risk: 'high' },
    'world-heritage-site': { risk: 'high' },
    'site-of-special-scientific-interest': { risk: 'high' },
  };

  let highRiskCount = 0;
  let mediumRiskCount = 0;

  for (const constraint of constraints) {
    const config = CONSTRAINT_CONFIG[constraint.type];
    if (config?.risk === 'high') {
      highRiskCount++;
    } else if (config?.risk === 'medium') {
      mediumRiskCount++;
    }
  }

  // High risk constraints significantly reduce score
  if (highRiskCount >= 3) return 20;
  if (highRiskCount === 2) return 35;
  if (highRiskCount === 1) return 50;

  // Medium risk constraints moderately reduce score
  if (mediumRiskCount >= 3) return 55;
  if (mediumRiskCount >= 2) return 65;
  if (mediumRiskCount === 1) return 75;

  return 85;
}

/**
 * Calculate score based on approval rate
 */
function calculateApprovalRateScore(approvalRate: number): number {
  if (approvalRate >= 0.90) return 100;
  if (approvalRate >= 0.85) return 92;
  if (approvalRate >= 0.80) return 85;
  if (approvalRate >= 0.75) return 78;
  if (approvalRate >= 0.70) return 70;
  if (approvalRate >= 0.65) return 60;
  if (approvalRate >= 0.60) return 50;
  if (approvalRate >= 0.55) return 40;
  if (approvalRate >= 0.50) return 30;
  return 20;
}

/**
 * Calculate score based on planning climate
 */
function calculateClimateScore(climate: LocalAuthority['planning_climate']): number {
  switch (climate) {
    case 'PRO_DEVELOPMENT':
      return 90;
    case 'MODERATE':
      return 60;
    case 'RESTRICTIVE':
      return 30;
    default:
      return 50;
  }
}

/**
 * Calculate score based on precedent
 */
function calculatePrecedentScore(precedent: PropertyPrecedent | null): number {
  if (!precedent) return 50; // Neutral if no data

  const sameAddressApproved = precedent.sameAddress.filter(a => a.status === 'APPROVED').length;
  const sameStreetApproved = precedent.sameStreet.filter(a => a.status === 'APPROVED').length;
  const sameStreetRefused = precedent.sameStreet.filter(a => a.status === 'REFUSED').length;

  // Strong positive precedent at same address
  if (sameAddressApproved >= 2) return 95;
  if (sameAddressApproved === 1) return 85;

  // Good precedent on street
  if (sameStreetApproved >= 5) return 80;
  if (sameStreetApproved >= 3) return 70;
  if (sameStreetApproved >= 1 && sameStreetRefused === 0) return 65;

  // Mixed or negative precedent
  if (sameStreetRefused > sameStreetApproved) return 35;
  if (sameStreetRefused > 0) return 45;

  // No precedent
  return 50;
}

/**
 * Calculate score based on trends
 */
function calculateTrendsScore(trendAnalysis: TrendAnalysis | null): number {
  if (!trendAnalysis) return 50; // Neutral if no data

  switch (trendAnalysis.trend) {
    case 'improving':
      // Bonus based on how much it's improving
      if (trendAnalysis.approvalRateChange >= 10) return 90;
      if (trendAnalysis.approvalRateChange >= 5) return 80;
      return 70;
    case 'stable':
      // Stable is neutral
      return 55;
    case 'declining':
      // Penalty based on how much it's declining
      if (trendAnalysis.approvalRateChange <= -10) return 25;
      if (trendAnalysis.approvalRateChange <= -5) return 35;
      return 45;
    default:
      return 50;
  }
}

/**
 * Generate a human-readable summary of the development potential
 */
function generateSummary(
  _score: number, // Reserved for future score-based messages
  rating: DevelopmentScore['rating'],
  constraints: PlanningConstraint[] | undefined,
  authority: LocalAuthority
): string {
  const hasHighRiskConstraints = constraints?.some(c => {
    const highRisk = ['listed-building', 'green-belt', 'flood-risk-zone', 'national-park'];
    return highRisk.includes(c.type);
  });

  switch (rating) {
    case 'excellent':
      return 'Excellent development potential with strong approval trends and minimal constraints.';
    case 'good':
      if (hasHighRiskConstraints) {
        return 'Good potential despite some constraints. Professional advice recommended.';
      }
      return 'Good development potential with favorable local planning conditions.';
    case 'fair':
      return 'Fair potential with some factors to consider. Review local policies carefully.';
    case 'challenging':
      if (authority.planning_climate === 'RESTRICTIVE') {
        return 'Challenging due to restrictive local policies. Strong justification will be needed.';
      }
      return 'Challenging conditions. Consider pre-application advice before proceeding.';
    case 'difficult':
      if (hasHighRiskConstraints) {
        return 'Significant constraints present. Development may face substantial hurdles.';
      }
      return 'Difficult conditions. Professional assessment strongly recommended.';
    default:
      return 'Review all factors before proceeding with any application.';
  }
}
