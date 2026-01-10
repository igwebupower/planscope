import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('Planning Applications API', () => {
  describe('GET /planning-applications', () => {
    it('should return planning applications for valid coordinates', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applications');
      expect(response.body).toHaveProperty('local_authority');
      expect(Array.isArray(response.body.applications)).toBe(true);
    });

    it('should return 400 for missing lat parameter', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lng: '-0.1278' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing lng parameter', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid coordinates', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: 'invalid', lng: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept optional radius parameter', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278', radius_m: '1000' });

      expect(response.status).toBe(200);
      expect(response.body.applications).toBeDefined();
    });

    it('should accept optional date filters', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({
          lat: '51.5074',
          lng: '-0.1278',
          from_date: '2024-01-01',
          to_date: '2024-12-31',
        });

      expect(response.status).toBe(200);
    });

    it('should return applications with required fields', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278' });

      expect(response.status).toBe(200);

      if (response.body.applications.length > 0) {
        const app = response.body.applications[0];
        expect(app).toHaveProperty('id');
        expect(app).toHaveProperty('address');
        expect(app).toHaveProperty('lat');
        expect(app).toHaveProperty('lng');
        expect(app).toHaveProperty('distance_m');
        expect(app).toHaveProperty('status');
        expect(app).toHaveProperty('type');
        expect(app).toHaveProperty('summary');
      }
    });

    it('should return valid status values', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278' });

      const validStatuses = ['APPROVED', 'REFUSED', 'PENDING', 'WITHDRAWN'];

      for (const application of response.body.applications) {
        expect(validStatuses).toContain(application.status);
      }
    });

    it('should return local authority with required fields', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278' });

      const authority = response.body.local_authority;
      expect(authority).toHaveProperty('name');
      expect(authority).toHaveProperty('approval_rate');
      expect(authority).toHaveProperty('avg_decision_days');
      expect(authority).toHaveProperty('planning_climate');
    });

    it('should return valid planning climate values', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278' });

      const validClimates = ['PRO_DEVELOPMENT', 'MODERATE', 'RESTRICTIVE'];
      expect(validClimates).toContain(response.body.local_authority.planning_climate);
    });

    it('should sort applications by distance', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({ lat: '51.5074', lng: '-0.1278' });

      const distances = response.body.applications.map((a: any) => a.distance_m);

      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });
  });

  describe('GET /planning-applications/:id', () => {
    it('should return a single application by ID', async () => {
      const response = await request(app)
        .get('/planning-applications/APP-2024-001');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Security Tests', () => {
    it('should handle SQL injection attempts gracefully', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({
          lat: "51.5074'; DROP TABLE--",
          lng: '-0.1278',
        });

      // parseFloat extracts valid number from start of string (51.5074)
      // This is safe because the API uses mock data, not SQL
      // The injection payload is ignored and API returns valid response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applications');
    });

    it('should handle extremely large coordinate values', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({
          lat: '999999999999',
          lng: '999999999999',
        });

      // Should still respond (coordinates are technically valid numbers)
      expect(response.status).toBe(200);
    });

    it('should handle negative coordinates', async () => {
      const response = await request(app)
        .get('/planning-applications')
        .query({
          lat: '-33.8688',
          lng: '151.2093',
        });

      expect(response.status).toBe(200);
    });

    it('should set CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3001');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
