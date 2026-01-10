// Planning application status types
export type ApplicationStatus = 'APPROVED' | 'REFUSED' | 'PENDING' | 'WITHDRAWN';

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
}

// Local authority data
export interface LocalAuthority {
  name: string;
  approval_rate: number;
  avg_decision_days: number;
  planning_climate: PlanningClimate;
}

// API response
export interface PlanningResponse {
  applications: PlanningApplication[];
  local_authority: LocalAuthority;
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
