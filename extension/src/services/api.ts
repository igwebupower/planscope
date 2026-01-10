import type { PlanningResponse } from '../types';

// API base URL - configurable for different environments
const API_BASE_URL = 'http://localhost:3000';
const API_TIMEOUT_MS = 10000; // 10 second timeout

interface FetchPlanningDataOptions {
  fromDate?: string;
  toDate?: string;
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch planning applications near a given location
 */
export async function fetchPlanningData(
  lat: number,
  lng: number,
  radiusM: number = 500,
  options: FetchPlanningDataOptions = {}
): Promise<PlanningResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_m: String(radiusM),
  });

  if (options.fromDate) {
    params.set('from_date', options.fromDate);
  }

  if (options.toDate) {
    params.set('to_date', options.toDate);
  }

  const url = `${API_BASE_URL}/planning-applications?${params.toString()}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch a single planning application by ID
 */
export async function fetchPlanningApplication(id: string): Promise<PlanningResponse['applications'][0]> {
  const url = `${API_BASE_URL}/planning-applications/${encodeURIComponent(id)}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch application: ${response.status}`);
  }

  return response.json();
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
