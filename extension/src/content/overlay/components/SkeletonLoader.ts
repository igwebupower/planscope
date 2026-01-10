/**
 * Skeleton loader component for perceived performance
 * Shows placeholder content while data is loading
 */

export function createSkeletonLoader(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-skeleton-loading';

  container.innerHTML = `
    <!-- Climate Section Skeleton -->
    <div class="planscope-skeleton-climate">
      <div class="planscope-skeleton planscope-skeleton-title"></div>
      <div class="planscope-skeleton-grid">
        <div class="planscope-skeleton-stat">
          <div class="planscope-skeleton planscope-skeleton-label"></div>
          <div class="planscope-skeleton planscope-skeleton-value"></div>
        </div>
        <div class="planscope-skeleton-stat">
          <div class="planscope-skeleton planscope-skeleton-label"></div>
          <div class="planscope-skeleton planscope-skeleton-value"></div>
        </div>
        <div class="planscope-skeleton-stat">
          <div class="planscope-skeleton planscope-skeleton-label"></div>
          <div class="planscope-skeleton planscope-skeleton-value"></div>
        </div>
        <div class="planscope-skeleton-stat">
          <div class="planscope-skeleton planscope-skeleton-label"></div>
          <div class="planscope-skeleton planscope-skeleton-value"></div>
        </div>
      </div>
    </div>

    <!-- Filters Skeleton -->
    <div class="planscope-skeleton-filters">
      <div class="planscope-skeleton planscope-skeleton-filter"></div>
      <div class="planscope-skeleton planscope-skeleton-filter"></div>
      <div class="planscope-skeleton planscope-skeleton-filter"></div>
      <div class="planscope-skeleton planscope-skeleton-filter"></div>
    </div>

    <!-- Application Cards Skeleton -->
    <div class="planscope-skeleton-list">
      ${createSkeletonCard()}
      ${createSkeletonCard()}
      ${createSkeletonCard()}
    </div>
  `;

  return container;
}

function createSkeletonCard(): string {
  return `
    <div class="planscope-skeleton-card">
      <div class="planscope-skeleton-card-header">
        <div class="planscope-skeleton planscope-skeleton-status"></div>
        <div class="planscope-skeleton planscope-skeleton-distance"></div>
      </div>
      <div class="planscope-skeleton planscope-skeleton-address"></div>
      <div class="planscope-skeleton planscope-skeleton-summary"></div>
      <div class="planscope-skeleton planscope-skeleton-summary-short"></div>
    </div>
  `;
}
