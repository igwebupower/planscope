import type { OverlayState, FilterState } from '../../types';
import { getOverlayStyles } from './styles';
import { getEnhancedStyles } from './enhancedStyles';
import { createHeader } from './components/Header';
import { createClimateSummary } from './components/ClimateSummary';
import { createFilters } from './components/Filters';
import { createApplicationList } from './components/ApplicationList';
import { createMapView } from './components/MapView';
import { createInsights } from './components/Insights';
import { createConstraints } from './components/Constraints';
import { createSkeletonLoader } from './components/SkeletonLoader';
import { createErrorDisplay, createOfflineBanner } from './components/ErrorDisplay';
import { createUpgradePrompt, getUpgradePromptStyles } from './components/UpgradePrompt';
import { getUsageIndicatorStyles } from './components/UsageIndicator';
import { createDevelopmentScore } from './components/DevelopmentScore';
import { createEnhancedInsights } from './components/EnhancedInsights';
import { generateInsights } from '../../services/insights';
import { generateEnhancedInsights, shouldShowEnhancedInsights } from '../../services/enhancedInsights';
import { getRefusalCount } from '../../services/refusalAnalysis';
import { isOnline } from '../../services/errors';

interface OverlayCallbacks {
  onToggle: (isOpen: boolean) => void;
  onFilterChange: (filters: FilterState) => void;
  onRetry?: () => void;
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

  // Inject styles (base + component styles + enhanced insights styles)
  const styleElement = document.createElement('style');
  styleElement.textContent = getOverlayStyles() + getUsageIndicatorStyles() + getUpgradePromptStyles() + getEnhancedStyles();
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

  // Retry handler
  const handleRetry = () => {
    if (callbacks.onRetry) {
      callbacks.onRetry();
    }
  };

  // Create body
  const body = document.createElement('div');
  body.className = 'planscope-body';

  // Header reference for updates
  let headerElement: HTMLElement | null = null;

  // Render the entire overlay content
  function render() {
    // Update or create header
    if (headerElement) {
      const newHeader = createHeader(handleToggle, currentState.usageStatus);
      container.replaceChild(newHeader, headerElement);
      headerElement = newHeader;
    } else {
      headerElement = createHeader(handleToggle, currentState.usageStatus);
      container.appendChild(headerElement);
      container.appendChild(body);
    }

    renderBody();
  }

  // Render body content
  function renderBody() {
    body.innerHTML = '';

    // Loading state - show skeleton loader instead of spinner
    if (currentState.isLoading) {
      const skeleton = createSkeletonLoader();
      body.appendChild(skeleton);
      return;
    }

    // Limit reached - show upgrade prompt
    if (currentState.limitReached) {
      const upgradePrompt = createUpgradePrompt(currentState.usageStatus);
      body.appendChild(upgradePrompt);
      return;
    }

    // Error state - show enhanced error display
    if (currentState.error) {
      const errorDisplay = createErrorDisplay({
        error: currentState.error,
        onRetry: handleRetry,
      });
      body.appendChild(errorDisplay);
      return;
    }

    // Data loaded
    if (currentState.data) {
      // Show offline banner if using cached data while offline
      if (!isOnline()) {
        const offlineBanner = createOfflineBanner();
        body.appendChild(offlineBanner);
      }

      // Generate enhanced insights data
      const propertyAddress = currentState.propertyAddress || '';
      const enhancedData = generateEnhancedInsights(
        currentState.data.applications,
        currentState.data.local_authority,
        currentState.data.constraints,
        propertyAddress
      );

      // Development Score (Hero Section) - show if we have enough data
      if (enhancedData.developmentScore) {
        const devScore = createDevelopmentScore(enhancedData.developmentScore);
        body.appendChild(devScore);
      }

      // Climate summary
      const climate = createClimateSummary(currentState.data.local_authority);
      body.appendChild(climate);

      // Enhanced Insights (Tabbed Interface) - show if we have enough data
      if (shouldShowEnhancedInsights(currentState.data.applications)) {
        const refusalCount = getRefusalCount(currentState.data.applications);
        const enhancedInsightsEl = createEnhancedInsights(enhancedData, refusalCount);
        body.appendChild(enhancedInsightsEl);
      }

      // Planning constraints (from Planning Data Platform)
      if (currentState.data.constraints) {
        const constraintsEl = createConstraints(currentState.data.constraints);
        body.appendChild(constraintsEl);
      }

      // Basic Insights (existing)
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
          // Insert map after enhanced insights (or constraints, or climate if no constraints)
          const insertAfter = body.querySelector('.planscope-enhanced-insights') || body.querySelector('.planscope-constraints') || body.querySelector('.planscope-climate');
          if (insertAfter && insertAfter.nextSibling) {
            body.insertBefore(mapContainer, insertAfter.nextSibling);
          } else {
            body.insertBefore(mapContainer, body.children[3] || null);
          }
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
  render();

  // Inject into page
  document.body.appendChild(host);

  console.log('[PlanScope] Overlay injected');

  // Return interface
  return {
    update: (newState: OverlayState) => {
      currentState = { ...newState };
      container.classList.toggle('collapsed', !currentState.isOpen);
      render();
    },
    destroy: () => {
      host.remove();
      console.log('[PlanScope] Overlay destroyed');
    },
  };
}
