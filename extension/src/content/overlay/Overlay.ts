import type { OverlayState, FilterState } from '../../types';
import { getOverlayStyles } from './styles';
import { createHeader } from './components/Header';
import { createClimateSummary } from './components/ClimateSummary';
import { createFilters } from './components/Filters';
import { createApplicationList } from './components/ApplicationList';
import { createMapView } from './components/MapView';
import { createInsights } from './components/Insights';
import { generateInsights } from '../../services/insights';

interface OverlayCallbacks {
  onToggle: (isOpen: boolean) => void;
  onFilterChange: (filters: FilterState) => void;
}

interface OverlayInstance {
  update: (state: OverlayState) => void;
  destroy: () => void;
}

/**
 * Create and inject the PlanScope overlay into the page
 * Uses Shadow DOM for style isolation
 */
export function createOverlay(
  initialState: OverlayState,
  callbacks: OverlayCallbacks
): OverlayInstance {
  // Create host element
  const host = document.createElement('div');
  host.id = 'planscope-overlay-host';

  // Attach shadow root (closed mode for better isolation)
  const shadow = host.attachShadow({ mode: 'closed' });

  // Inject styles
  const styleElement = document.createElement('style');
  styleElement.textContent = getOverlayStyles();
  shadow.appendChild(styleElement);

  // Create main container
  const container = document.createElement('div');
  container.className = 'planscope-container';
  if (!initialState.isOpen) {
    container.classList.add('collapsed');
  }
  shadow.appendChild(container);

  // State reference for updates
  let currentState = { ...initialState };

  // Toggle handler
  const handleToggle = () => {
    currentState.isOpen = !currentState.isOpen;
    container.classList.toggle('collapsed', !currentState.isOpen);
    callbacks.onToggle(currentState.isOpen);
  };

  // Filter change handler
  const handleFilterChange = (filters: FilterState) => {
    currentState.filters = filters;
    callbacks.onFilterChange(filters);
  };

  // Create header
  const header = createHeader(handleToggle);
  container.appendChild(header);

  // Create body
  const body = document.createElement('div');
  body.className = 'planscope-body';
  container.appendChild(body);

  // Render body content
  function renderBody() {
    body.innerHTML = '';

    // Loading state
    if (currentState.isLoading) {
      body.innerHTML = `
        <div class="planscope-loading">
          <div class="planscope-spinner"></div>
          <span>Loading planning data...</span>
        </div>
      `;
      return;
    }

    // Error state
    if (currentState.error) {
      body.innerHTML = `
        <div class="planscope-error">
          <strong>Error</strong><br>
          ${currentState.error}
        </div>
      `;
      return;
    }

    // Data loaded
    if (currentState.data) {
      // Climate summary
      const climate = createClimateSummary(currentState.data.local_authority);
      body.appendChild(climate);

      // Insights
      const insights = generateInsights(
        currentState.data.applications,
        currentState.data.local_authority
      );
      if (insights.length > 0) {
        const insightsEl = createInsights(insights);
        body.appendChild(insightsEl);
      }

      // Map view
      if (currentState.data.applications.length > 0) {
        // Calculate center from applications
        const centerLat = currentState.data.applications.reduce((sum, app) => sum + app.lat, 0) / currentState.data.applications.length;
        const centerLng = currentState.data.applications.reduce((sum, app) => sum + app.lng, 0) / currentState.data.applications.length;

        createMapView(centerLat, centerLng, currentState.data.applications, shadow).then((mapContainer) => {
          // Insert map after climate summary
          body.insertBefore(mapContainer, body.children[1] || null);
        });
      }

      // Filters
      const filters = createFilters(currentState.filters, handleFilterChange);
      body.appendChild(filters);

      // Application list
      const list = createApplicationList(currentState.data.applications, currentState.filters);
      body.appendChild(list);
    } else {
      body.innerHTML = `
        <div class="planscope-empty">
          No data available
        </div>
      `;
    }
  }

  // Initial render
  renderBody();

  // Inject into page
  document.body.appendChild(host);

  console.log('[PlanScope] Overlay injected');

  // Return interface
  return {
    update: (newState: OverlayState) => {
      currentState = { ...newState };
      container.classList.toggle('collapsed', !currentState.isOpen);
      renderBody();
    },
    destroy: () => {
      host.remove();
      console.log('[PlanScope] Overlay destroyed');
    },
  };
}
