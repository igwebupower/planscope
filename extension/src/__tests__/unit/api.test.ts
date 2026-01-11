import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPlanningData, checkApiHealth, setUseCache } from '../../services/api';

/**
 * Helper to create a proper mock Response with both text() and json() methods
 */
function createMockResponse(data: unknown, options: { ok?: boolean; status?: number; statusText?: string } = {}): Response {
  const body = JSON.stringify(data);
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.statusText ?? 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(data),
  } as Response;
}

// Mock PlanIt API response format
const mockPlanItResponse = {
  records: [
    {
      uid: 'APP-001',
      name: 'APP/2024/001',
      reference: 'APP/2024/001',
      address: '123 Test Street, London SW1A 1AA',
      postcode: 'SW1A 1AA',
      description: 'Single storey rear extension',
      lat: 51.5074,
      lng: -0.1278,
      link: 'https://example.com/app/001',
      url: 'https://example.com/app/001',
      authority_name: 'Test Council',
      area_name: 'Test Area',
      start_date: '2024-01-15',
      decided_date: '2024-06-15',
      app_type: 'Full',
      app_state: 'Permitted',
      app_size: 'small',
      distance: 100,
    },
  ],
  count: 1,
  page_size: 50,
};

// Mock Planning Data Platform response format
const mockConstraintsResponse = {
  entities: [
    {
      entity: 12345,
      name: 'Test Conservation Area',
      reference: 'CA-001',
      description: 'Historic conservation area',
      'designation-date': '1990-01-01',
    },
  ],
  count: 1,
};

// Empty constraints response
const emptyConstraintsResponse = { entities: [], count: 0 };

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Disable caching for tests
    setUseCache(false);
  });

  describe('fetchPlanningData', () => {
    it('should fetch planning data from PlanIt API', async () => {
      // Mock both API calls - PlanIt returns first, then constraint calls
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockPlanItResponse))
        // Mock constraint API calls (one per dataset)
        .mockResolvedValue(createMockResponse(emptyConstraintsResponse));

      const result = await fetchPlanningData(51.5074, -0.1278, 500);

      // Check PlanIt API was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('planit.org.uk'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=51.5074'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('lng=-0.1278'),
        expect.any(Object)
      );
      // Radius is in km for PlanIt (0.5km = 500m)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('krad=0.5'),
        expect.any(Object)
      );

      // Check result structure
      expect(result.applications).toBeDefined();
      expect(result.applications.length).toBe(1);
      expect(result.applications[0].id).toBe('APP/2024/001');
      expect(result.applications[0].status).toBe('APPROVED'); // Mapped from 'Permitted'
      expect(result.local_authority).toBeDefined();
      expect(result.local_authority.name).toBe('Test Council');
    });

    it('should include date filters when provided', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse({ records: [], count: 0, page_size: 50 }))
        .mockResolvedValue(createMockResponse(emptyConstraintsResponse));

      await fetchPlanningData(51.5074, -0.1278, 500, {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      });

      // PlanIt uses start_date and end_date
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2024-01-01'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2024-12-31'),
        expect.any(Object)
      );
    });

    it('should throw error for non-OK response', async () => {
      // Mock 4 failed attempts (initial + 3 retries) for PlanIt
      vi.mocked(fetch).mockResolvedValue(
        createMockResponse({}, { ok: false, status: 400, statusText: 'Bad Request' })
      );

      // Non-retryable 400 error should throw immediately
      await expect(fetchPlanningData(51.5074, -0.1278)).rejects.toThrow('API returned 400');
    });

    it('should throw error for network failure after retries', async () => {
      // Mock failed attempts - the error gets wrapped
      const networkError = new TypeError('fetch failed');
      vi.mocked(fetch).mockRejectedValue(networkError);

      await expect(fetchPlanningData(51.5074, -0.1278)).rejects.toThrow();
    }, 15000); // Extended timeout for retries

    it('should handle timeout with AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      // Mock 4 timeout attempts
      vi.mocked(fetch).mockRejectedValue(abortError);

      await expect(fetchPlanningData(51.5074, -0.1278)).rejects.toThrow(
        'timed out'
      );
    }, 15000); // Extended timeout for retries

    it('should fetch constraints from Planning Data Platform', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockPlanItResponse))
        .mockResolvedValue(createMockResponse(mockConstraintsResponse));

      const result = await fetchPlanningData(51.5074, -0.1278);

      // Check Planning Data Platform was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('planning.data.gov.uk'),
        expect.any(Object)
      );

      // Check constraints were included
      expect(result.constraints).toBeDefined();
    });

    it('should handle constraint API failures gracefully', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(createMockResponse(mockPlanItResponse))
        .mockResolvedValue(
          createMockResponse({}, { ok: false, status: 500, statusText: 'Internal Server Error' })
        );

      // Should not throw - constraint failures are handled gracefully
      const result = await fetchPlanningData(51.5074, -0.1278);

      expect(result.applications).toBeDefined();
      expect(result.constraints).toEqual([]);
    }, 10000); // Extended timeout for constraint retries
  });

  describe('checkApiHealth', () => {
    it('should return true for healthy API', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse({}));

      const result = await checkApiHealth();

      expect(result).toBe(true);
    });

    it('should return false for unhealthy API', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse({}, { ok: false, status: 500, statusText: 'Internal Server Error' })
      );

      const result = await checkApiHealth();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkApiHealth();

      expect(result).toBe(false);
    });
  });
});
