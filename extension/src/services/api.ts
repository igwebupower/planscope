import type {
  PlanningResponse,
  PlanningApplication,
  PlanningConstraint,
  LocalAuthority,
  ApplicationStatus,
  ConstraintType,
  PlanItApplication,
  PlanItResponse,
  PlanningDataEntity,
} from '../types';
import { calculateDistance } from '../utils';
import {
  getCachedData,
  setCachedData,
  generateCacheKey,
  isCacheAvailable,
} from './cache';
import {
  PlanScopeError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  ApiError,
  OfflineError,
  ParseError,
  toPlanScopeError,
  isOnline,
} from './errors';

// API Configuration
const CONFIG = {
  // PlanIt API - Primary source for planning applications
  PLANIT_BASE_URL: 'https://www.planit.org.uk',
  PLANIT_TIMEOUT_MS: 15000,
  PLANIT_PAGE_SIZE: 50,

  // Planning Data Platform - Supplement for constraints
  PLANNING_DATA_BASE_URL: 'https://www.planning.data.gov.uk',
  PLANNING_DATA_TIMEOUT_MS: 10000,

  // Retry configuration
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 8000,

  // Cache configuration
  CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  USE_CACHE: true,
};

// Constraint datasets to fetch from Planning Data Platform
// See full list at: https://www.planning.data.gov.uk/dataset/
const CONSTRAINT_DATASETS: ConstraintType[] = [
  'conservation-area',
  'listed-building',
  'article-4-direction-area',  // Geographic areas with Article 4 restrictions
  'green-belt',
  'flood-risk-zone',
  'tree-preservation-zone',
  'area-of-outstanding-natural-beauty',
  'scheduled-monument',
  'world-heritage-site',
  'site-of-special-scientific-interest',
  'ancient-woodland',
];

interface FetchPlanningDataOptions {
  fromDate?: string;
  toDate?: string;
  radiusKm?: number;
  skipCache?: boolean;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON response with HTML detection
 */
async function parseJsonResponse<T>(response: Response, apiName: string): Promise<T> {
  // Safely get content type (headers might be undefined in some mocks)
  const contentType = response.headers?.get?.('content-type') || '';

  console.log(`[PlanScope API] ${apiName} response content-type:`, contentType);

  // Check if response is HTML (indicates error page, login redirect, etc.)
  if (contentType.includes('text/html')) {
    console.error(`[PlanScope API] ${apiName} returned HTML content-type`);
    throw new ParseError(
      new Error(`${apiName} returned HTML instead of JSON`),
      `The ${apiName} service returned an error page. The service may be temporarily unavailable.`
    );
  }

  // Get raw text first to inspect it
  const text = await response.text();

  console.log(`[PlanScope API] ${apiName} response length:`, text.length);
  console.log(`[PlanScope API] ${apiName} response preview:`, text.substring(0, 200));

  // Check if response starts with HTML markers
  const trimmedText = text.trim();
  if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html') || trimmedText.toLowerCase().startsWith('<!doctype')) {
    console.error(`[PlanScope API] ${apiName} returned HTML document`);
    throw new ParseError(
      new Error(`${apiName} returned HTML: ${text.substring(0, 100)}...`),
      `The ${apiName} service is unavailable or blocked. Please try again later.`
    );
  }

  // Handle empty response
  if (!trimmedText) {
    console.error(`[PlanScope API] ${apiName} returned empty response`);
    throw new ParseError(
      new Error('Empty response body'),
      `The ${apiName} service returned no data. Please try again.`
    );
  }

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(text) as T;
    console.log(`[PlanScope API] ${apiName} JSON parsed successfully`);
    return parsed;
  } catch (error) {
    console.error(`[PlanScope API] ${apiName} JSON parse failed:`, error);
    // Check if the unparseable content looks like HTML
    if (trimmedText.startsWith('<')) {
      throw new ParseError(
        new Error(`${apiName} returned HTML: ${text.substring(0, 100)}...`),
        `The ${apiName} service is unavailable or blocked. Please try again later.`
      );
    }
    throw new ParseError(
      error instanceof Error ? error : new Error('JSON parse failed'),
      `Invalid response from ${apiName}. The service may be experiencing issues.`
    );
  }
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(attempt: number): number {
  const delay = CONFIG.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, CONFIG.MAX_RETRY_DELAY_MS);
}

/**
 * Parse Retry-After header value
 */
function parseRetryAfter(retryAfter: string | null): number | undefined {
  if (!retryAfter) return undefined;

  // Could be seconds or HTTP date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // Try parsing as date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return undefined;
}

/**
 * Fetch with timeout, retry, and error handling
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000,
  maxRetries: number = CONFIG.MAX_RETRIES
): Promise<Response> {
  // Check if offline before making request
  if (!isOnline()) {
    throw new OfflineError();
  }

  let lastError: PlanScopeError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfterMs = parseRetryAfter(response.headers.get('Retry-After'));
        const error = new RateLimitError(retryAfterMs);

        // If we have retries left and it's not too long, wait and retry
        if (attempt < maxRetries && error.retryAfterMs && error.retryAfterMs < 30000) {
          await sleep(error.retryAfterMs);
          continue;
        }

        throw error;
      }

      // Handle other errors
      if (!response.ok) {
        const error = new ApiError(response.status, response.statusText);

        // Retry server errors
        if (error.retryable && attempt < maxRetries) {
          await sleep(getRetryDelay(attempt));
          continue;
        }

        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PlanScopeError) {
        lastError = error;

        // Don't retry non-retryable errors
        if (!error.retryable || attempt >= maxRetries) {
          throw error;
        }

        await sleep(getRetryDelay(attempt));
        continue;
      }

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new TimeoutError(timeoutMs);

        if (attempt < maxRetries) {
          await sleep(getRetryDelay(attempt));
          continue;
        }

        throw lastError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new NetworkError(error);

        if (attempt < maxRetries) {
          await sleep(getRetryDelay(attempt));
          continue;
        }

        throw lastError;
      }

      // Convert unknown errors
      lastError = toPlanScopeError(error);

      if (lastError.retryable && attempt < maxRetries) {
        await sleep(getRetryDelay(attempt));
        continue;
      }

      throw lastError;
    }
  }

  // Should not reach here, but just in case
  throw lastError || new NetworkError();
}

/**
 * Map PlanIt app_state to our ApplicationStatus
 */
function mapPlanItStatus(appState?: string): ApplicationStatus {
  if (!appState) return 'PENDING';

  const state = appState.toLowerCase();
  if (state === 'permitted' || state === 'conditions') return 'APPROVED';
  if (state === 'rejected') return 'REFUSED';
  if (state === 'withdrawn') return 'WITHDRAWN';
  return 'PENDING'; // Undecided, Referred, Unresolved, Other
}

/**
 * Map PlanIt application to our format
 */
function mapPlanItApplication(
  app: PlanItApplication,
  searchLat: number,
  searchLng: number
): PlanningApplication | null {
  // Skip applications without coordinates
  if (!app.lat || !app.lng) return null;

  const distance = calculateDistance(searchLat, searchLng, app.lat, app.lng);

  return {
    id: app.reference || app.uid,
    address: app.address || 'Address not available',
    lat: app.lat,
    lng: app.lng,
    distance_m: Math.round(distance),
    status: mapPlanItStatus(app.app_state),
    decision_date: app.decided_date || null,
    type: app.app_type || 'Unknown',
    summary: app.description || 'No description available',
    url: app.url || app.link,
    authority: app.authority_name || app.area_name,
  };
}

/**
 * Fetch planning applications from PlanIt API
 */
async function fetchFromPlanIt(
  lat: number,
  lng: number,
  radiusKm: number = 0.5,
  options: FetchPlanningDataOptions = {}
): Promise<PlanningApplication[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    krad: String(radiusKm),
    pg_sz: String(CONFIG.PLANIT_PAGE_SIZE),
    sort: 'start_date.desc.nullslast',
  });

  if (options.fromDate) {
    params.set('start_date', options.fromDate);
  }
  if (options.toDate) {
    params.set('end_date', options.toDate);
  }

  const url = `${CONFIG.PLANIT_BASE_URL}/api/applics/json?${params.toString()}`;

  console.log('[PlanScope API] Fetching from PlanIt:', url);

  const response = await fetchWithRetry(
    url,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PlanScope/1.0 (Chrome Extension)',
      },
    },
    CONFIG.PLANIT_TIMEOUT_MS
  );

  console.log('[PlanScope API] PlanIt response status:', response.status, response.statusText);

  // Use safe JSON parsing with HTML detection
  const data = await parseJsonResponse<PlanItResponse>(response, 'PlanIt API');

  console.log('[PlanScope API] PlanIt returned', data.records?.length || 0, 'records');

  // Map and filter applications
  const applications = data.records
    .map((app) => mapPlanItApplication(app, lat, lng))
    .filter((app): app is PlanningApplication => app !== null)
    .sort((a, b) => a.distance_m - b.distance_m);

  return applications;
}

/**
 * Map Planning Data Platform entity to constraint
 */
function mapPlanningDataEntity(
  entity: PlanningDataEntity,
  datasetType: ConstraintType
): PlanningConstraint {
  return {
    type: datasetType,
    name: entity.name || 'Unknown',
    reference: entity.reference,
    description: entity.description,
    designationDate: entity['designation-date'] || entity['start-date'],
    grade: entity['listed-building-grade'],
    documentUrl: entity['documentation-url'] || entity['document-url'],
  };
}

/**
 * Fetch constraints from Planning Data Platform
 */
async function fetchConstraints(
  lat: number,
  lng: number
): Promise<PlanningConstraint[]> {
  const constraints: PlanningConstraint[] = [];

  // Fetch each constraint dataset in parallel
  const fetchPromises = CONSTRAINT_DATASETS.map(async (dataset) => {
    const params = new URLSearchParams({
      dataset,
      latitude: String(lat),
      longitude: String(lng),
      limit: '10',
    });

    const url = `${CONFIG.PLANNING_DATA_BASE_URL}/entity.json?${params.toString()}`;

    try {
      const response = await fetchWithRetry(
        url,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
        CONFIG.PLANNING_DATA_TIMEOUT_MS,
        1 // Only 1 retry for constraints (they're supplementary)
      );

      // Use safe JSON parsing with HTML detection
      const data = await parseJsonResponse<{ entities?: PlanningDataEntity[] }>(
        response,
        'Planning Data API'
      );

      const entities: PlanningDataEntity[] = data.entities || [];
      return entities.map((entity) => mapPlanningDataEntity(entity, dataset));
    } catch (error) {
      // Log but don't fail for constraint errors
      console.warn(`Failed to fetch ${dataset}:`, error);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  results.forEach((result) => constraints.push(...result));

  return constraints;
}

/**
 * Calculate local authority stats from applications
 */
function calculateLocalAuthorityStats(
  applications: PlanningApplication[],
  authorityName?: string
): LocalAuthority {
  const approved = applications.filter((a) => a.status === 'APPROVED').length;
  const decided = applications.filter((a) => a.decision_date !== null).length;

  const approvalRate = decided > 0 ? approved / decided : 0.5;

  // Calculate average decision time (days between start and decision)
  const decisionDays = applications
    .filter((a) => a.decision_date)
    .map(() => {
      // Estimate based on typical processing times
      return 56; // Default to 8 weeks if we can't calculate
    });

  const avgDecisionDays =
    decisionDays.length > 0
      ? Math.round(decisionDays.reduce((sum, d) => sum + d, 0) / decisionDays.length)
      : 56;

  // Determine planning climate based on approval rate
  let planningClimate: LocalAuthority['planning_climate'];
  if (approvalRate >= 0.85) {
    planningClimate = 'PRO_DEVELOPMENT';
  } else if (approvalRate >= 0.65) {
    planningClimate = 'MODERATE';
  } else {
    planningClimate = 'RESTRICTIVE';
  }

  return {
    name: authorityName || 'Local Planning Authority',
    approval_rate: approvalRate,
    avg_decision_days: avgDecisionDays,
    planning_climate: planningClimate,
  };
}

/**
 * Fetch planning applications near a given location
 * Primary: PlanIt API
 * Supplementary: Planning Data Platform for constraints
 */
export async function fetchPlanningData(
  lat: number,
  lng: number,
  radiusM: number = 500,
  options: FetchPlanningDataOptions = {}
): Promise<PlanningResponse> {
  const cacheKey = generateCacheKey(lat, lng, radiusM);

  // Check cache first (unless skipCache is true or dates are filtered)
  if (CONFIG.USE_CACHE && isCacheAvailable() && !options.skipCache && !options.fromDate && !options.toDate) {
    try {
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        console.log('[PlanScope API] Using cached planning data');
        return cachedData;
      }
    } catch (error) {
      console.warn('[PlanScope API] Cache read failed:', error);
    }
  }

  // Check if offline - return cached data if available
  if (!isOnline()) {
    if (CONFIG.USE_CACHE && isCacheAvailable()) {
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        console.log('[PlanScope API] Offline - using cached planning data');
        return cachedData;
      }
    }
    throw new OfflineError();
  }

  const radiusKm = radiusM / 1000;

  try {
    // Fetch applications and constraints in parallel
    const [applications, constraints] = await Promise.all([
      fetchFromPlanIt(lat, lng, radiusKm, options),
      fetchConstraints(lat, lng),
    ]);

    // Get authority name from first application
    const authorityName = applications[0]?.authority;

    // Calculate local authority stats from the applications
    const localAuthority = calculateLocalAuthorityStats(applications, authorityName);

    const result: PlanningResponse = {
      applications,
      local_authority: localAuthority,
      constraints,
    };

    // Cache the result (only if no date filters)
    if (CONFIG.USE_CACHE && isCacheAvailable() && !options.fromDate && !options.toDate) {
      try {
        await setCachedData(cacheKey, result, CONFIG.CACHE_TTL_MS);
      } catch (error) {
        console.warn('[PlanScope API] Cache write failed:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('[PlanScope API] Failed to fetch from PlanIt API:', error);
    throw error;
  }
}

/**
 * Fetch a single planning application by ID
 */
export async function fetchPlanningApplication(
  _id: string
): Promise<PlanningApplication | null> {
  // PlanIt doesn't have a simple single-application endpoint
  // Would need to search by reference
  console.warn('fetchPlanningApplication not implemented for PlanIt API');
  return null;
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    // Test PlanIt API with a minimal request
    const response = await fetchWithRetry(
      `${CONFIG.PLANIT_BASE_URL}/api/areas/json?limit=1`,
      { method: 'GET' },
      5000,
      0 // No retries for health check
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Toggle caching on/off
 */
export function setUseCache(useCache: boolean): void {
  CONFIG.USE_CACHE = useCache;
}

/**
 * Check if caching is enabled
 */
export function isCacheEnabled(): boolean {
  return CONFIG.USE_CACHE && isCacheAvailable();
}
