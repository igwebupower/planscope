export type ApplicationStatus = 'APPROVED' | 'REFUSED' | 'PENDING' | 'WITHDRAWN';
export type PlanningClimate = 'PRO_DEVELOPMENT' | 'MODERATE' | 'RESTRICTIVE';

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

export interface LocalAuthority {
  name: string;
  approval_rate: number;
  avg_decision_days: number;
  planning_climate: PlanningClimate;
}

export interface PlanningResponse {
  applications: PlanningApplication[];
  local_authority: LocalAuthority;
}

export interface QueryParams {
  lat: string;
  lng: string;
  radius_m?: string;
  from_date?: string;
  to_date?: string;
}
