import { describe, it, expect } from 'vitest';
import {
  formatDistance,
  formatDate,
  formatPercent,
  calculateDistance,
  extractPostcode,
  escapeHtml,
  debounce,
} from '../../utils';

describe('Utils', () => {
  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(100)).toBe('100m');
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(2345)).toBe('2.3km');
    });

    it('should round meters to nearest integer', () => {
      expect(formatDistance(100.6)).toBe('101m');
      expect(formatDistance(100.4)).toBe('100m');
    });
  });

  describe('formatDate', () => {
    it('should format valid dates in UK format', () => {
      expect(formatDate('2024-06-15')).toBe('15 Jun 2024');
      expect(formatDate('2023-12-01')).toBe('1 Dec 2023');
    });

    it('should return "Pending" for null dates', () => {
      expect(formatDate(null)).toBe('Pending');
    });
  });

  describe('formatPercent', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercent(0.72)).toBe('72%');
      expect(formatPercent(0.5)).toBe('50%');
      expect(formatPercent(1)).toBe('100%');
      expect(formatPercent(0)).toBe('0%');
    });

    it('should round to nearest integer', () => {
      expect(formatPercent(0.726)).toBe('73%');
      expect(formatPercent(0.724)).toBe('72%');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // London to Brighton is approximately 76km
      const distance = calculateDistance(51.5074, -0.1278, 50.8225, -0.1372);
      expect(distance).toBeGreaterThan(75000);
      expect(distance).toBeLessThan(77000);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(51.5074, -0.1278, 51.5074, -0.1278);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
      expect(distance).toBeGreaterThan(700000); // Sydney to Melbourne ~714km
    });
  });

  describe('extractPostcode', () => {
    it('should extract valid UK postcodes', () => {
      expect(extractPostcode('123 High Street, London SW1A 1AA')).toBe('SW1A 1AA');
      expect(extractPostcode('Flat 2, 45 Park Lane, W1K 7TN')).toBe('W1K 7TN');
      expect(extractPostcode('10 Downing Street, SW1A 2AA, London')).toBe('SW1A 2AA');
    });

    it('should handle postcodes without spaces', () => {
      expect(extractPostcode('Address with EC1A1BB postcode')).toBe('EC1A1BB');
    });

    it('should return null for addresses without postcodes', () => {
      expect(extractPostcode('123 High Street, London')).toBeNull();
      expect(extractPostcode('')).toBeNull();
    });

    it('should handle lowercase postcodes', () => {
      expect(extractPostcode('sw1a 1aa')).toBe('SW1A 1AA');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("It's a test")).toBe('It&#39;s a test');
    });

    it('should escape angle brackets', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should not modify safe strings', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('123 Main Street')).toBe('123 Main Street');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<a href="test">Link</a>')).toBe(
        '&lt;a href=&quot;test&quot;&gt;Link&lt;/a&gt;'
      );
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const debouncedFn = debounce(fn, 50);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(1);
    });
  });
});
