// Planning application status types
export type ApplicationStatus = 'APPROVED' | 'REFUSED' | 'PENDING' | 'WITHDRAWN';

// Subscription tier types
export type SubscriptionTier = 'free' | 'pro';

// Usage tracking data
export interface UsageData {
  monthlyLookups: number;
  resetDate: string; // ISO date string
  tier: SubscriptionTier;
}

// Usage status for UI display
export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  tier: SubscriptionTier;
  daysUntilReset: number;
  resetDate: string;
}

// Planning climate assessment
export type PlanningClimate = 'PRO_DEVELOPMENT' | 'MODERATE' | 'RESTRICTIVE';

// Planning application data
export interface PlanningApplication {
  id: string;
  address: string;
  lat: number;
  lng: number;
  distance_m: number;
  status: ApplicationStatus;
  decision_date: string | null;
  type: string;
  summary: string;
  url?: string; // Link to original application
  authority?: string; // Local authority name
}

// Local authority data
export interface LocalAuthority {
  name: string;
  approval_rate: number;
  avg_decision_days: number;
  planning_climate: PlanningClimate;
}

// Planning constraint types from Planning Data Platform
// Dataset names must match: https://www.planning.data.gov.uk/dataset/
export type ConstraintType =
  | 'conservation-area'
  | 'listed-building'
  | 'article-4-direction-area'
  | 'green-belt'
  | 'flood-risk-zone'
  | 'tree-preservation-zone'
  | 'ancient-woodland'
  | 'area-of-outstanding-natural-beauty'
  | 'national-park'
  | 'scheduled-monument'
  | 'world-heritage-site'
  | 'site-of-special-scientific-interest';

// Planning constraint data
export interface PlanningConstraint {
  type: ConstraintType;
  name: string;
  reference?: string;
  description?: string;
  designationDate?: string;
  grade?: string; // For listed buildings (I, II*, II)
  documentUrl?: string;
}

// API response
export interface PlanningResponse {
  applications: PlanningApplication[];
  local_authority: LocalAuthority;
  constraints?: PlanningConstraint[]; // From Planning Data Platform
}

// Property data extracted from listing pages
export interface PropertyData {
  address: string;
  lat: number | null;
  lng: number | null;
  postcode: string | null;
}

// Supported property sites
export type SupportedSite = 'rightmove' | 'zoopla' | 'unknown';

// Filter state
export interface FilterState {
  status: ApplicationStatus[];
  types: string[];
  fromDate: string | null;
  toDate: string | null;
}

// Overlay state
export interface OverlayState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  data: PlanningResponse | null;
  filters: FilterState;
  limitReached?: boolean;
  usageStatus?: UsageStatus;
  propertyAddress?: string; // For enhanced insights precedent analysis
}

// Insight types
export interface Insight {
  type: 'positive' | 'warning' | 'info';
  message: string;
}

// Status color mapping
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPROVED: '#22c55e',
  REFUSED: '#ef4444',
  PENDING: '#f59e0b',
  WITHDRAWN: '#6b7280',
};

// Status labels
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPROVED: 'Approved',
  REFUSED: 'Refused',
  PENDING: 'Pending',
  WITHDRAWN: 'Withdrawn',
};

// Climate labels and colors
export const CLIMATE_CONFIG: Record<PlanningClimate, { label: string; color: string }> = {
  PRO_DEVELOPMENT: { label: 'Pro-Development', color: '#22c55e' },
  MODERATE: { label: 'Moderate', color: '#f59e0b' },
  RESTRICTIVE: { label: 'Restrictive', color: '#ef4444' },
};

// Constraint labels, colors, and risk levels for investors
export const CONSTRAINT_CONFIG: Record<ConstraintType, { label: string; color: string; icon: string; risk: 'high' | 'medium' | 'low' }> = {
  'conservation-area': { label: 'Conservation Area', color: '#8b5cf6', icon: 'C', risk: 'medium' },
  'listed-building': { label: 'Listed Building', color: '#ec4899', icon: 'L', risk: 'high' },
  'article-4-direction-area': { label: 'Article 4 Direction', color: '#f97316', icon: '4', risk: 'high' },
  'green-belt': { label: 'Green Belt', color: '#22c55e', icon: 'G', risk: 'high' },
  'flood-risk-zone': { label: 'Flood Risk Zone', color: '#3b82f6', icon: 'F', risk: 'high' },
  'tree-preservation-zone': { label: 'Tree Preservation Zone', color: '#84cc16', icon: 'T', risk: 'medium' },
  'ancient-woodland': { label: 'Ancient Woodland', color: '#15803d', icon: 'W', risk: 'medium' },
  'area-of-outstanding-natural-beauty': { label: 'AONB', color: '#a855f7', icon: 'A', risk: 'medium' },
  'national-park': { label: 'National Park', color: '#14b8a6', icon: 'N', risk: 'high' },
  'scheduled-monument': { label: 'Scheduled Monument', color: '#d97706', icon: 'M', risk: 'high' },
  'world-heritage-site': { label: 'World Heritage Site', color: '#dc2626', icon: 'H', risk: 'high' },
  'site-of-special-scientific-interest': { label: 'SSSI', color: '#059669', icon: 'S', risk: 'high' },
};

// PlanIt API response types
export interface PlanItApplication {
  uid: string;
  name: string;
  reference: string;
  address: string;
  postcode?: string;
  description: string;
  lat?: number;
  lng?: number;
  link?: string;
  url?: string;
  authority_name?: string;
  area_name?: string;
  start_date?: string;
  decided_date?: string;
  app_type?: string;
  app_state?: string;
  app_size?: string;
  distance?: number;
}

export interface PlanItResponse {
  records: PlanItApplication[];
  count: number;
  page_size: number;
}

// Planning Data Platform response types
export interface PlanningDataEntity {
  entity: number;
  name: string;
  reference?: string;
  description?: string;
  'start-date'?: string;
  'designation-date'?: string;
  'listed-building-grade'?: string;
  'documentation-url'?: string;
  'document-url'?: string;
  point?: string;
  geometry?: string;
}

export interface PlanningDataResponse {
  entities: PlanningDataEntity[];
  count: number;
}

// Re-export enhanced insight types
export * from './enhanced';
