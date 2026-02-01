import type { PlanningApplication } from './index';

/**
 * Enhanced insight types for in-depth planning analysis
 */

// Trend analysis for approval rates over time
export interface TrendAnalysis {
  current: {
    approvalRate: number;
    avgDecisionDays: number;
    count: number;
  };
  comparison: {
    approvalRate: number;
    avgDecisionDays: number;
    count: number;
  };
  period: '3mo' | '6mo' | '12mo';
  approvalRateChange: number; // +8 means up 8 percentage points
  trend: 'improving' | 'stable' | 'declining';
}

// Success rates broken down by application type
export interface TypeSuccessRate {
  type: string;
  displayName: string;
  approved: number;
  refused: number;
  total: number;
  successRate: number; // 0-1
  rank: 'best' | 'good' | 'average' | 'poor' | 'worst';
}

// Precedent data for the specific property address and street
export interface PropertyPrecedent {
  sameAddress: PlanningApplication[];
  sameStreet: PlanningApplication[];
  summary: string;
  hasPositivePrecedent: boolean;
}

// Cost estimates for planning applications
export interface CostEstimate {
  applicationType: string;
  displayName: string;
  planningFee: number;
  professionalFees: {
    min: number;
    max: number;
  };
  totalEstimate: {
    min: number;
    max: number;
  };
}

// Development potential score combining all factors
export interface DevelopmentScore {
  overall: number; // 0-100
  breakdown: {
    constraints: number; // 0-100
    approvalRate: number; // 0-100
    climate: number; // 0-100
    precedent: number; // 0-100
    trends: number; // 0-100
  };
  weights: {
    constraints: number;
    approvalRate: number;
    climate: number;
    precedent: number;
    trends: number;
  };
  rating: 'excellent' | 'good' | 'fair' | 'challenging' | 'difficult';
  summary: string;
}

// Refusal reason analysis
export interface RefusalReason {
  category: string;
  displayName: string;
  count: number;
  percentage: number;
  keywords: string[];
}

// Benchmark comparison against national/regional averages
export interface BenchmarkComparison {
  metric: string;
  displayName: string;
  localValue: number;
  nationalAverage: number;
  difference: number; // positive = better than average
  percentDifference: number;
  rating: 'above-average' | 'average' | 'below-average';
}

// Council performance data
export interface CouncilPerformance {
  approvalRate: BenchmarkComparison;
  decisionDays: BenchmarkComparison;
  nationalRank?: number;
  totalCouncils?: number;
  overallRating: 'above-average' | 'average' | 'below-average';
}

// Combined enhanced insights data
export interface EnhancedInsightsData {
  developmentScore: DevelopmentScore | null;
  trendAnalysis: TrendAnalysis | null;
  typeSuccessRates: TypeSuccessRate[];
  propertyPrecedent: PropertyPrecedent | null;
  costEstimates: CostEstimate[];
  refusalReasons: RefusalReason[];
  benchmarks: CouncilPerformance | null;
  hasEnoughData: boolean;
  minimumApplications: number;
}

// Tab identifiers for the enhanced insights panel
export type EnhancedInsightTab =
  | 'trends'
  | 'types'
  | 'precedent'
  | 'costs'
  | 'refusals'
  | 'benchmarks';

// Tab configuration
export interface TabConfig {
  id: EnhancedInsightTab;
  label: string;
  icon: string;
}

// Refusal pattern categories for analysis
export const REFUSAL_PATTERNS: Record<string, { displayName: string; keywords: string[] }> = {
  'bulk-mass': {
    displayName: 'Bulk & Massing',
    keywords: ['bulk', 'mass', 'scale', 'size', 'dominant', 'overbearing', 'excessive', 'oversized'],
  },
  'character': {
    displayName: 'Design & Character',
    keywords: ['character', 'appearance', 'design', 'aesthetic', 'visual', 'incongruous', 'unsympathetic'],
  },
  'overlooking': {
    displayName: 'Privacy & Overlooking',
    keywords: ['overlook', 'privacy', 'window', 'outlook', 'intrusive', 'overshadow'],
  },
  'light': {
    displayName: 'Light & Overshadowing',
    keywords: ['light', 'daylight', 'sunlight', 'shadow', 'dark', 'overshadow'],
  },
  'parking': {
    displayName: 'Parking & Access',
    keywords: ['parking', 'highway', 'access', 'traffic', 'vehicle', 'road'],
  },
  'amenity': {
    displayName: 'Residential Amenity',
    keywords: ['amenity', 'noise', 'disturbance', 'nuisance', 'impact'],
  },
  'heritage': {
    displayName: 'Heritage & Conservation',
    keywords: ['heritage', 'conservation', 'listed', 'historic', 'character area'],
  },
};

// UK Planning fees (2024 schedule)
export const UK_PLANNING_FEES: Record<string, { householder?: number; full?: number; displayName: string }> = {
  'EXTENSION': { householder: 258, displayName: 'Extension' },
  'LOFT_CONVERSION': { householder: 258, displayName: 'Loft Conversion' },
  'NEW_BUILD': { full: 528, displayName: 'New Build' },
  'CHANGE_OF_USE': { full: 528, displayName: 'Change of Use' },
  'OTHER': { householder: 258, full: 528, displayName: 'Other' },
};

// Professional fee estimates by type
export const PROFESSIONAL_FEE_ESTIMATES: Record<string, { min: number; max: number }> = {
  'EXTENSION': { min: 800, max: 3000 },
  'LOFT_CONVERSION': { min: 800, max: 2500 },
  'NEW_BUILD': { min: 5000, max: 20000 },
  'CHANGE_OF_USE': { min: 1500, max: 5000 },
  'OTHER': { min: 500, max: 3000 },
};

// National averages for benchmarking
export const NATIONAL_AVERAGES = {
  approvalRate: 0.76, // 76% national average
  avgDecisionDays: 63, // 63 days average
  totalCouncils: 340,
};

// Development score rating thresholds
export const SCORE_RATINGS: { min: number; rating: DevelopmentScore['rating']; label: string }[] = [
  { min: 80, rating: 'excellent', label: 'Excellent potential' },
  { min: 65, rating: 'good', label: 'Good potential' },
  { min: 50, rating: 'fair', label: 'Fair potential' },
  { min: 35, rating: 'challenging', label: 'Challenging' },
  { min: 0, rating: 'difficult', label: 'Difficult' },
];
