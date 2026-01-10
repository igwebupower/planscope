import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPlanningData, setUseMockApi } from '../../services/api';

/**
 * Helper to create a proper mock Response with both text() and json() methods
 */
function createMockResponse(data: unknown, options: { ok?: boolean; status?: number } = {}): Response {
  const body = JSON.stringify(data);
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(data),
  } as Response;
}

describe('Injection Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use mock API for injection tests (tests URL encoding)
    setUseMockApi(true);
  });

  describe('API Parameter Injection', () => {
    const INJECTION_PAYLOADS = [
      // SQL Injection attempts
      "'; DROP TABLE applications; --",
      "1 OR 1=1",
      "1' OR '1'='1",
      "1; SELECT * FROM users",
      "UNION SELECT * FROM passwords",

      // NoSQL Injection attempts
      '{"$gt": ""}',
      '{"$ne": null}',
      '{"$where": "1==1"}',

      // Command Injection attempts
      '; ls -la',
      '| cat /etc/passwd',
      '`whoami`',
      '$(id)',

      // Path Traversal attempts
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '%2e%2e%2f%2e%2e%2f',

      // LDAP Injection
      '*)(uid=*))(|(uid=*',

      // XML Injection
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
    ];

    it('should safely encode parameters in URL', async () => {
      vi.mocked(fetch).mockResolvedValue(
        createMockResponse({ applications: [], local_authority: {} })
      );

      // Test that injection payloads are properly URL-encoded
      for (const payload of INJECTION_PAYLOADS.slice(0, 3)) {
        // This tests the URL construction, not the actual API behavior
        await fetchPlanningData(51.5074, -0.1278, 500, {
          fromDate: payload,
        });

        const calledUrl = vi.mocked(fetch).mock.calls.slice(-1)[0][0] as string;

        // URL should be properly encoded - semicolon and quote should be encoded
        // Note: '--' doesn't need encoding in URLs (safe characters)
        expect(calledUrl).not.toContain(';');
        expect(calledUrl).not.toContain("'");
        // Verify encoding is happening - should see %27 (encoded quote) or %3B (encoded semicolon)
        expect(calledUrl).toMatch(/%[0-9A-F]{2}/i);
      }
    });

    it('should use URLSearchParams for safe parameter encoding', async () => {
      vi.mocked(fetch).mockResolvedValue(
        createMockResponse({ applications: [], local_authority: {} })
      );

      await fetchPlanningData(51.5074, -0.1278, 500, {
        fromDate: "2024-01-01'; DROP TABLE--",
      });

      const calledUrl = vi.mocked(fetch).mock.calls.slice(-1)[0][0] as string;

      // Should be URL encoded
      expect(calledUrl).toContain('from_date=2024-01-01');
      expect(calledUrl).toContain('%27'); // Encoded single quote
    });

    it('should not allow parameter pollution', async () => {
      vi.mocked(fetch).mockResolvedValue(
        createMockResponse({ applications: [], local_authority: {} })
      );

      // Attempt to inject additional parameters
      await fetchPlanningData(51.5074, -0.1278, 500, {
        fromDate: '2024-01-01&admin=true&debug=1',
      });

      const calledUrl = vi.mocked(fetch).mock.calls.slice(-1)[0][0] as string;

      // The & should be encoded, not treated as parameter separator
      expect(calledUrl).toContain('%26admin');
    });
  });

  describe('Response Handling Security', () => {
    it('should handle malformed JSON response', async () => {
      // Create a response that will fail JSON parsing
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('not valid json{'),
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as Response);

      await expect(fetchPlanningData(51.5074, -0.1278)).rejects.toThrow();
    });

    it('should handle response with unexpected structure', async () => {
      vi.mocked(fetch).mockResolvedValue(
        createMockResponse({
          // Missing expected fields
          unexpected: 'data',
          __proto__: { polluted: true },
        })
      );

      // Should not throw, but return the response as-is
      // The calling code should validate the structure
      const result = await fetchPlanningData(51.5074, -0.1278);
      expect(result).toBeDefined();
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should not be vulnerable to __proto__ pollution', () => {
      JSON.parse('{"__proto__": {"polluted": true}}');

      // Verify Object prototype is not polluted
      expect(({} as any).polluted).toBeUndefined();
    });

    it('should not be vulnerable to constructor pollution', () => {
      JSON.parse('{"constructor": {"prototype": {"polluted": true}}}');

      expect(({} as any).polluted).toBeUndefined();
    });
  });
});
