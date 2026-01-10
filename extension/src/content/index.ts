// PlanScope Content Script Entry Point
// Injected into property listing pages on Rightmove and Zoopla

import { detectSite, extractPropertyData } from './sites/detector';
import { createOverlay } from './overlay/Overlay';
import { fetchPlanningData } from '../services/api';
import type { OverlayState, PlanningResponse } from '../types';

console.log('[PlanScope] Content script loaded');

async function init(): Promise<void> {
  // Detect which property site we're on
  const site = detectSite(window.location.href);

  if (site === 'unknown') {
    console.log('[PlanScope] Not on a supported property listing page');
    return;
  }

  console.log(`[PlanScope] Detected site: ${site}`);

  // Extract property data from the page
  const propertyData = extractPropertyData(site);

  if (!propertyData) {
    console.warn('[PlanScope] Could not extract property data from page');
    return;
  }

  console.log('[PlanScope] Property data:', propertyData);

  // Initialize overlay state
  const state: OverlayState = {
    isOpen: sessionStorage.getItem('planscope_open') !== 'false',
    isLoading: true,
    error: null,
    data: null,
    filters: {
      status: [],
      types: [],
      fromDate: null,
      toDate: null,
    },
  };

  // Create and inject the overlay
  const overlay = createOverlay(state, {
    onToggle: (isOpen: boolean) => {
      state.isOpen = isOpen;
      sessionStorage.setItem('planscope_open', String(isOpen));
    },
    onFilterChange: (filters) => {
      state.filters = filters;
      overlay.update(state);
    },
  });

  // Fetch planning data
  if (propertyData.lat && propertyData.lng) {
    try {
      const data: PlanningResponse = await fetchPlanningData(
        propertyData.lat,
        propertyData.lng,
        500 // 500m radius
      );

      state.isLoading = false;
      state.data = data;
      overlay.update(state);

      console.log('[PlanScope] Planning data loaded:', data);
    } catch (error) {
      state.isLoading = false;
      state.error = error instanceof Error ? error.message : 'Failed to load planning data';
      overlay.update(state);

      console.error('[PlanScope] Failed to fetch planning data:', error);
    }
  } else {
    state.isLoading = false;
    state.error = 'Could not determine property location';
    overlay.update(state);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch((err) => console.error('[PlanScope] Initialization error:', err));
  });
} else {
  init().catch((err) => console.error('[PlanScope] Initialization error:', err));
}
