import { describe, it, expect } from 'vitest';
import { generateInsights } from '../../services/insights';
import type { PlanningApplication, LocalAuthority } from '../../types';

describe('Insights Service', () => {
  const createMockApplication = (
    overrides: Partial<PlanningApplication> = {}
  ): PlanningApplication => ({
    id: 'APP/2024/001',
    address: '123 Test Street',
    lat: 51.5074,
    lng: -0.1278,
    distance_m: 100,
    status: 'APPROVED',
    decision_date: '2024-06-15',
    type: 'EXTENSION',
    summary: 'Single storey rear extension',
    ...overrides,
  });

  const createMockAuthority = (
    overrides: Partial<LocalAuthority> = {}
  ): LocalAuthority => ({
    name: 'Test Council',
    approval_rate: 0.72,
    avg_decision_days: 56,
    planning_climate: 'MODERATE',
    ...overrides,
  });

  describe('Positive insights', () => {
    it('should generate positive insight for high approval rate', () => {
      const authority = createMockAuthority({ approval_rate: 0.75 });
      const applications = [createMockApplication()];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'positive' && i.message.includes('75%')
      )).toBe(true);
    });

    it('should generate positive insight for pro-development climate', () => {
      const authority = createMockAuthority({ planning_climate: 'PRO_DEVELOPMENT' });
      const applications = [createMockApplication()];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'positive' && i.message.includes('pro-development')
      )).toBe(true);
    });

    it('should generate positive insight for multiple approved extensions', () => {
      const authority = createMockAuthority();
      const applications = [
        createMockApplication({ status: 'APPROVED', type: 'EXTENSION' }),
        createMockApplication({ id: 'APP/2024/002', status: 'APPROVED', type: 'EXTENSION' }),
        createMockApplication({ id: 'APP/2024/003', status: 'APPROVED', type: 'EXTENSION' }),
      ];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'positive' && i.message.includes('extension')
      )).toBe(true);
    });

    it('should generate positive insight for fast decision times', () => {
      const authority = createMockAuthority({ avg_decision_days: 45 });
      const applications = [createMockApplication()];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'positive' && i.message.includes('45 days')
      )).toBe(true);
    });
  });

  describe('Warning insights', () => {
    it('should generate warning for restrictive climate', () => {
      const authority = createMockAuthority({ planning_climate: 'RESTRICTIVE' });
      const applications = [createMockApplication()];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'warning' && i.message.includes('restrictive')
      )).toBe(true);
    });

    it('should generate warning for low approval rate', () => {
      const authority = createMockAuthority({ approval_rate: 0.55 });
      const applications = [createMockApplication()];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'warning' && i.message.includes('55%')
      )).toBe(true);
    });

    it('should generate warning for slow decision times', () => {
      const authority = createMockAuthority({ avg_decision_days: 90 });
      const applications = [createMockApplication()];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'warning' && i.message.includes('90 days')
      )).toBe(true);
    });

    it('should generate warning for high refusal rate', () => {
      const authority = createMockAuthority();
      const applications = [
        createMockApplication({ status: 'REFUSED' }),
        createMockApplication({ id: 'APP/2024/002', status: 'REFUSED' }),
        createMockApplication({ id: 'APP/2024/003', status: 'APPROVED' }),
        createMockApplication({ id: 'APP/2024/004', status: 'APPROVED' }),
        createMockApplication({ id: 'APP/2024/005', status: 'APPROVED' }),
        createMockApplication({ id: 'APP/2024/006', status: 'APPROVED' }),
      ];

      const insights = generateInsights(applications, authority);

      // 2/6 = 33% refusal rate
      expect(insights.some(i =>
        i.type === 'warning' && i.message.includes('refused')
      )).toBe(true);
    });
  });

  describe('Info insights', () => {
    it('should generate info for pending applications', () => {
      const authority = createMockAuthority();
      const applications = [
        createMockApplication({ status: 'PENDING', decision_date: null }),
        createMockApplication({ id: 'APP/2024/002', status: 'PENDING', decision_date: null }),
        createMockApplication({ id: 'APP/2024/003', status: 'PENDING', decision_date: null }),
      ];

      const insights = generateInsights(applications, authority);

      expect(insights.some(i =>
        i.type === 'info' && i.message.includes('pending')
      )).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty applications array', () => {
      const authority = createMockAuthority();
      const insights = generateInsights([], authority);

      expect(Array.isArray(insights)).toBe(true);
    });

    it('should limit insights to maximum of 5', () => {
      const authority = createMockAuthority({
        approval_rate: 0.8,
        avg_decision_days: 40,
        planning_climate: 'PRO_DEVELOPMENT',
      });
      const applications = Array(20).fill(null).map((_, i) =>
        createMockApplication({
          id: `APP/2024/${String(i).padStart(3, '0')}`,
          status: i % 2 === 0 ? 'APPROVED' : 'PENDING',
          type: 'EXTENSION',
        })
      );

      const insights = generateInsights(applications, authority);

      expect(insights.length).toBeLessThanOrEqual(5);
    });
  });
});
