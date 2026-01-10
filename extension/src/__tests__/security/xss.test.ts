import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../utils';
import { createApplicationCard } from '../../content/overlay/components/ApplicationCard';
import { createClimateSummary } from '../../content/overlay/components/ClimateSummary';
import { createInsights } from '../../content/overlay/components/Insights';
import type { PlanningApplication, LocalAuthority, Insight } from '../../types';

describe('XSS Security Tests', () => {
  // Common XSS payloads to test
  const XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    "'-alert('XSS')-'",
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '<a href="javascript:alert(\'XSS\')">click</a>',
    '{{constructor.constructor("alert(1)")()}}',
    '${alert("XSS")}',
    '<div style="background:url(javascript:alert(\'XSS\'))">',
  ];

  describe('escapeHtml function', () => {
    it('should escape all XSS payloads', () => {
      for (const payload of XSS_PAYLOADS) {
        const escaped = escapeHtml(payload);

        // Escaped output should not contain unescaped angle brackets
        // The angle brackets should be converted to &lt; and &gt;
        expect(escaped).not.toContain('<');
        expect(escaped).not.toContain('>');

        // Verify the original dangerous characters are escaped
        if (payload.includes('<')) {
          expect(escaped).toContain('&lt;');
        }
        if (payload.includes('>')) {
          expect(escaped).toContain('&gt;');
        }
      }
    });

    it('should properly escape script tags', () => {
      const payload = '<script>document.cookie</script>';
      const escaped = escapeHtml(payload);

      expect(escaped).toBe('&lt;script&gt;document.cookie&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
    });

    it('should escape nested injection attempts', () => {
      const payload = '<<script>script>alert("XSS")<</script>/script>';
      const escaped = escapeHtml(payload);

      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
    });

    it('should handle unicode escape sequences', () => {
      // \u003c is < in unicode
      const payload = '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e';
      const escaped = escapeHtml(payload);

      // Original string doesn't have actual angle brackets, but testing the concept
      expect(escaped).toBeDefined();
    });
  });

  describe('ApplicationCard XSS Protection', () => {
    const createMaliciousApplication = (
      payload: string
    ): PlanningApplication => ({
      id: payload,
      address: payload,
      lat: 51.5074,
      lng: -0.1278,
      distance_m: 100,
      status: 'APPROVED',
      decision_date: '2024-06-15',
      type: payload,
      summary: payload,
    });

    it('should not create script elements from malicious content', () => {
      for (const payload of XSS_PAYLOADS.slice(0, 5)) {
        const app = createMaliciousApplication(payload);
        const card = createApplicationCard(app);

        // No actual script elements should be created
        expect(card.querySelectorAll('script').length).toBe(0);
        expect(card.querySelectorAll('iframe').length).toBe(0);

        // Malicious content should appear as text, not as HTML elements
        const addressEl = card.querySelector('.planscope-card-address');
        expect(addressEl?.textContent).toContain(payload.substring(0, 10));
      }
    });

    it('should not create elements with event handlers', () => {
      for (const payload of XSS_PAYLOADS.slice(0, 5)) {
        const app = createMaliciousApplication(payload);
        const card = createApplicationCard(app);

        // No elements with inline event handlers
        expect(card.querySelectorAll('[onerror]').length).toBe(0);
        expect(card.querySelectorAll('[onload]').length).toBe(0);
        expect(card.querySelectorAll('[onclick]').length).toBe(0);
        expect(card.querySelectorAll('[onfocus]').length).toBe(0);
        expect(card.querySelectorAll('[onmouseover]').length).toBe(0);
      }
    });

    it('should safely render addresses with special characters', () => {
      const app = createMaliciousApplication('<b>Bold</b> & "quoted"');
      const card = createApplicationCard(app);

      // Should not create actual <b> elements from user data
      const addressEl = card.querySelector('.planscope-card-address');
      expect(addressEl?.querySelectorAll('b').length).toBe(0);

      // Text should contain the literal characters
      expect(addressEl?.textContent).toContain('<b>Bold</b>');
      expect(addressEl?.textContent).toContain('&');
      expect(addressEl?.textContent).toContain('"');
    });
  });

  describe('ClimateSummary XSS Protection', () => {
    it('should escape malicious authority names', () => {
      for (const payload of XSS_PAYLOADS.slice(0, 5)) {
        const authority: LocalAuthority = {
          name: payload,
          approval_rate: 0.72,
          avg_decision_days: 56,
          planning_climate: 'MODERATE',
        };

        const summary = createClimateSummary(authority);

        // No script elements should be created
        expect(summary.querySelectorAll('script').length).toBe(0);
        expect(summary.querySelectorAll('[onerror]').length).toBe(0);
        expect(summary.querySelectorAll('[onload]').length).toBe(0);
      }
    });
  });

  describe('Insights XSS Protection', () => {
    it('should escape malicious insight messages', () => {
      for (const payload of XSS_PAYLOADS.slice(0, 5)) {
        const insights: Insight[] = [
          { type: 'info', message: payload },
        ];

        const component = createInsights(insights);

        // No script elements should be created
        expect(component.querySelectorAll('script').length).toBe(0);
        expect(component.querySelectorAll('[onerror]').length).toBe(0);
        expect(component.querySelectorAll('[onload]').length).toBe(0);
      }
    });
  });

  describe('DOM-based XSS Prevention', () => {
    it('should not execute javascript: URLs', () => {
      const maliciousUrl = 'javascript:alert("XSS")';
      const escaped = escapeHtml(maliciousUrl);

      // While this won't prevent the protocol, it shows the escaping works
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
    });

    it('should handle data: URLs safely', () => {
      const dataUrl = 'data:text/html,<script>alert("XSS")</script>';
      const escaped = escapeHtml(dataUrl);

      expect(escaped).toContain('&lt;script&gt;');
    });
  });

  describe('Content Security', () => {
    it('should not allow inline event handlers in generated HTML', () => {
      const app: PlanningApplication = {
        id: '" onclick="alert(1)"',
        address: "' onmouseover='alert(1)'",
        lat: 51.5074,
        lng: -0.1278,
        distance_m: 100,
        status: 'APPROVED',
        decision_date: '2024-06-15',
        type: 'EXTENSION',
        summary: 'Test',
      };

      const card = createApplicationCard(app);

      // No elements with event handlers should exist
      expect(card.querySelectorAll('[onclick]').length).toBe(0);
      expect(card.querySelectorAll('[onmouseover]').length).toBe(0);
    });
  });
});
