import type { PlanningApplication, FilterState } from '../../../types';
import { createApplicationCard } from './ApplicationCard';

/**
 * Application list component that displays filtered planning applications
 */

export function createApplicationList(
  applications: PlanningApplication[],
  filters: FilterState
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-list';

  // Apply filters
  const filteredApps = filterApplications(applications, filters);

  // Header with count
  const header = document.createElement('div');
  header.className = 'planscope-list-header';
  header.innerHTML = `
    <span>${filteredApps.length} application${filteredApps.length !== 1 ? 's' : ''} found</span>
    <span>Within 500m</span>
  `;
  container.appendChild(header);

  // Empty state
  if (filteredApps.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'planscope-empty';
    empty.textContent = applications.length > 0
      ? 'No applications match your filters'
      : 'No planning applications found nearby';
    container.appendChild(empty);
    return container;
  }

  // Application cards
  for (const app of filteredApps) {
    container.appendChild(createApplicationCard(app));
  }

  return container;
}

function filterApplications(
  applications: PlanningApplication[],
  filters: FilterState
): PlanningApplication[] {
  let filtered = [...applications];

  // Filter by status
  if (filters.status.length > 0) {
    filtered = filtered.filter((app) => filters.status.includes(app.status));
  }

  // Filter by type
  if (filters.types.length > 0) {
    filtered = filtered.filter((app) => filters.types.includes(app.type));
  }

  // Filter by date range
  if (filters.fromDate) {
    const fromDate = new Date(filters.fromDate);
    filtered = filtered.filter((app) => {
      if (!app.decision_date) return true;
      return new Date(app.decision_date) >= fromDate;
    });
  }

  if (filters.toDate) {
    const toDate = new Date(filters.toDate);
    filtered = filtered.filter((app) => {
      if (!app.decision_date) return true;
      return new Date(app.decision_date) <= toDate;
    });
  }

  return filtered;
}
