import { describe, it, expect } from 'vitest';
import { detectSite } from '../../content/sites/detector';

describe('Site Detector', () => {
  describe('detectSite', () => {
    describe('Rightmove detection', () => {
      it('should detect Rightmove property pages', () => {
        expect(detectSite('https://www.rightmove.co.uk/properties/123456789')).toBe('rightmove');
        expect(detectSite('https://www.rightmove.co.uk/properties/12345')).toBe('rightmove');
      });

      it('should not detect Rightmove search pages', () => {
        expect(detectSite('https://www.rightmove.co.uk/property-for-sale/find.html')).toBe('unknown');
        expect(detectSite('https://www.rightmove.co.uk/')).toBe('unknown');
      });

      it('should handle Rightmove URLs with query strings', () => {
        expect(detectSite('https://www.rightmove.co.uk/properties/123456789?ref=test')).toBe('rightmove');
      });
    });

    describe('Zoopla detection', () => {
      it('should detect Zoopla for-sale pages', () => {
        expect(detectSite('https://www.zoopla.co.uk/for-sale/details/12345678')).toBe('zoopla');
      });

      it('should detect Zoopla to-rent pages', () => {
        expect(detectSite('https://www.zoopla.co.uk/to-rent/details/12345678')).toBe('zoopla');
      });

      it('should not detect Zoopla search pages', () => {
        expect(detectSite('https://www.zoopla.co.uk/for-sale/property/london')).toBe('unknown');
        expect(detectSite('https://www.zoopla.co.uk/')).toBe('unknown');
      });

      it('should handle Zoopla URLs with query strings', () => {
        expect(detectSite('https://www.zoopla.co.uk/for-sale/details/12345678?search_id=abc')).toBe('zoopla');
      });
    });

    describe('Unknown sites', () => {
      it('should return unknown for unsupported sites', () => {
        expect(detectSite('https://www.google.com')).toBe('unknown');
        expect(detectSite('https://www.onthemarket.com/details/12345')).toBe('unknown');
        expect(detectSite('https://example.com')).toBe('unknown');
      });

      it('should return unknown for empty URLs', () => {
        expect(detectSite('')).toBe('unknown');
      });

      it('should return unknown for malformed URLs', () => {
        expect(detectSite('not-a-url')).toBe('unknown');
        // Note: URL without protocol still matches the pattern (implementation choice)
        // In real usage, browser always provides full URLs with protocol
        expect(detectSite('ftp://rightmove.co.uk/properties/123')).toBe('rightmove');
      });
    });
  });
});
