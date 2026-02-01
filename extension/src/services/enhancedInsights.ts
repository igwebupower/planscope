import type {
  PlanningApplication,
  LocalAuthority,
  PlanningConstraint,
  EnhancedInsightsData,
} from '../types';
import { calculateDevelopmentScore } from './developmentScore';
import { analyzeTrends } from './trendAnalysis';
import { analyzeTypeSuccessRates } from './typeSuccess';
import { analyzePropertyPrecedent } from './precedent';
import { getCostEstimates } from './costEstimates';
import { analyzeRefusalReasons } from './refusalAnalysis';
import { calculateBenchmarks } from './benchmarks';

/**
 * Minimum number of applications required for enhanced insights
 */
const MINIMUM_APPLICATIONS = 3;

/**
 * Generate all enhanced insights data
 * Orchestrates calls to individual analysis services
 */
export function generateEnhancedInsights(
  applications: PlanningApplication[],
  authority: LocalAuthority,
  constraints: PlanningConstraint[] | undefined,
  propertyAddress: string
): EnhancedInsightsData {
  // Check if we have enough data
  const hasEnoughData = applications.length >= MINIMUM_APPLICATIONS;

  if (!hasEnoughData) {
    return {
      developmentScore: null,
      trendAnalysis: null,
      typeSuccessRates: [],
      propertyPrecedent: null,
      costEstimates: getCostEstimates(), // Always available
      refusalReasons: [],
      benchmarks: null,
      hasEnoughData: false,
      minimumApplications: MINIMUM_APPLICATIONS,
    };
  }

  // Run all analyses
  const trendAnalysis = analyzeTrends(applications, '12mo');
  const typeSuccessRates = analyzeTypeSuccessRates(applications);
  const propertyPrecedent = analyzePropertyPrecedent(applications, propertyAddress);
  const refusalReasons = analyzeRefusalReasons(applications);
  const benchmarks = calculateBenchmarks(authority);

  // Calculate development score (depends on other analyses)
  const developmentScore = calculateDevelopmentScore(
    applications,
    authority,
    constraints,
    trendAnalysis,
    propertyPrecedent
  );

  return {
    developmentScore,
    trendAnalysis,
    typeSuccessRates,
    propertyPrecedent,
    costEstimates: getCostEstimates(),
    refusalReasons,
    benchmarks,
    hasEnoughData: true,
    minimumApplications: MINIMUM_APPLICATIONS,
  };
}

/**
 * Check if enhanced insights should be shown
 */
export function shouldShowEnhancedInsights(
  applications: PlanningApplication[]
): boolean {
  return applications.length >= MINIMUM_APPLICATIONS;
}
