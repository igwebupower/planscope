import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../utils';
import { createApplicationCard } from '../../content/overlay/components/ApplicationCard';
import type { PlanningApplication } from '../../types';

describe('Component Escaping Debug', () => {
  it('escapeHtml should work directly', () => {
    const result = escapeHtml('<script>alert("XSS")</script>');
    console.log('Direct escapeHtml result:', result);
    expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should verify escaping works via textContent', () => {
    const app: PlanningApplication = {
      id: 'TEST-ID',
      address: '<script>evil</script>',
      lat: 51.5074,
      lng: -0.1278,
      distance_m: 100,
      status: 'APPROVED',
      decision_date: '2024-06-15',
      type: 'EXTENSION',
      summary: 'Test summary',
    };

    // Create the card
    const card = createApplicationCard(app);

    // Find the address element
    const addressEl = card.querySelector('.planscope-card-address');
    console.log('Address textContent:', addressEl?.textContent);
    console.log('Address innerHTML:', addressEl?.innerHTML);

    // textContent should show the literal text (unescaped characters as text)
    // If escaping worked, this should be '<script>evil</script>' as visible text
    expect(addressEl?.textContent).toBe('<script>evil</script>');

    // Check no actual script elements exist in the card
    const scriptElements = card.querySelectorAll('script');
    console.log('Script element count:', scriptElements.length);
    expect(scriptElements.length).toBe(0);
  });

  it('should verify no script tags are created as DOM elements', () => {
    const app: PlanningApplication = {
      id: 'MALICIOUS',
      address: '<img src=x onerror="alert(1)">',
      lat: 51.5074,
      lng: -0.1278,
      distance_m: 100,
      status: 'APPROVED',
      decision_date: '2024-06-15',
      type: '<script>evil</script>',
      summary: '<a href="javascript:alert(1)">Click me</a>',
    };

    const card = createApplicationCard(app);

    // No script, img with onerror, or javascript: links should exist
    expect(card.querySelectorAll('script').length).toBe(0);
    expect(card.querySelectorAll('img[onerror]').length).toBe(0);
    expect(card.querySelectorAll('a[href^="javascript:"]').length).toBe(0);

    // Address should contain the literal text
    const addressEl = card.querySelector('.planscope-card-address');
    expect(addressEl?.textContent).toContain('<img src=x onerror="alert(1)">');
  });
});
