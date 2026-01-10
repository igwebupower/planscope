import { Router, Request, Response } from 'express';
import { generateMockApplications, getLocalAuthority } from '../data/mock-applications.js';
import type { QueryParams, PlanningResponse, PlanningApplication } from '../types/index.js';

export const planningRouter = Router();

planningRouter.get('/', (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
  const { lat, lng, radius_m, from_date, to_date } = req.query;

  // Validate required parameters
  if (!lat || !lng) {
    res.status(400).json({
      error: 'Missing required parameters: lat and lng are required',
    });
    return;
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({
      error: 'Invalid coordinates: lat and lng must be valid numbers',
    });
    return;
  }

  // Parse optional parameters
  const radius = radius_m ? parseInt(radius_m, 10) : 500;

  // Generate mock data
  let applications = generateMockApplications(latitude, longitude, radius);

  // Apply date filters if provided
  if (from_date) {
    const fromDate = new Date(from_date);
    applications = applications.filter((app) => {
      if (!app.decision_date) return true; // Include pending
      return new Date(app.decision_date) >= fromDate;
    });
  }

  if (to_date) {
    const toDate = new Date(to_date);
    applications = applications.filter((app) => {
      if (!app.decision_date) return true; // Include pending
      return new Date(app.decision_date) <= toDate;
    });
  }

  // Get local authority for this location
  const localAuthority = getLocalAuthority(latitude, longitude);

  const response: PlanningResponse = {
    applications,
    local_authority: localAuthority,
  };

  // Add slight delay to simulate real API
  setTimeout(() => {
    res.json(response);
  }, 200 + Math.random() * 300);
});

// Get a specific application by ID (for detail views)
planningRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // For mock purposes, generate a single application
  const mockApp: PlanningApplication = {
    id,
    address: '42 Example Street',
    lat: 51.5074,
    lng: -0.1278,
    distance_m: 0,
    status: 'APPROVED',
    decision_date: '2024-06-15',
    type: 'EXTENSION',
    summary: 'Single storey rear extension with roof lantern',
  };

  res.json(mockApp);
});
