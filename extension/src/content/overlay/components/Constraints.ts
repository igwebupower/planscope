import type { PlanningConstraint } from '../../../types';
import { CONSTRAINT_CONFIG } from '../../../types';
import { escapeHtml } from '../../../utils';

/**
 * Create constraints summary component
 */
export function createConstraints(constraints: PlanningConstraint[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-constraints';

  if (constraints.length === 0) {
    container.innerHTML = `
      <div class="planscope-constraints-header">
        <span class="planscope-constraints-title">Planning Constraints</span>
      </div>
      <div class="planscope-constraints-empty">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
        </svg>
        <span>No constraints found at this location</span>
      </div>
    `;
    return container;
  }

  // Group constraints by type
  const grouped = constraints.reduce((acc, constraint) => {
    if (!acc[constraint.type]) {
      acc[constraint.type] = [];
    }
    acc[constraint.type].push(constraint);
    return acc;
  }, {} as Record<string, PlanningConstraint[]>);

  const constraintTypes = Object.keys(grouped);

  container.innerHTML = `
    <div class="planscope-constraints-header">
      <span class="planscope-constraints-title">Planning Constraints</span>
      <span class="planscope-constraints-count">${constraints.length} found</span>
    </div>
    <div class="planscope-constraints-list">
      ${constraintTypes
        .map((type) => {
          const config = CONSTRAINT_CONFIG[type as keyof typeof CONSTRAINT_CONFIG];
          const items = grouped[type];
          return `
            <div class="planscope-constraint-group">
              <div class="planscope-constraint-badge" style="background-color: ${config.color}">
                <span class="planscope-constraint-icon">${config.icon}</span>
                <span class="planscope-constraint-label">${escapeHtml(config.label)}</span>
                ${items.length > 1 ? `<span class="planscope-constraint-count">${items.length}</span>` : ''}
              </div>
              <div class="planscope-constraint-details">
                ${items
                  .map(
                    (item) => `
                  <div class="planscope-constraint-item">
                    <span class="planscope-constraint-name">${escapeHtml(item.name)}</span>
                    ${item.grade ? `<span class="planscope-constraint-grade">Grade ${escapeHtml(item.grade)}</span>` : ''}
                    ${item.documentUrl ? `<a href="${escapeHtml(item.documentUrl)}" target="_blank" class="planscope-constraint-link">View</a>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;

  return container;
}

/**
 * Create compact constraint badges for header display
 */
export function createConstraintBadges(constraints: PlanningConstraint[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-constraint-badges';

  if (constraints.length === 0) {
    return container;
  }

  // Get unique constraint types
  const types = [...new Set(constraints.map((c) => c.type))];

  container.innerHTML = types
    .map((type) => {
      const config = CONSTRAINT_CONFIG[type as keyof typeof CONSTRAINT_CONFIG];
      const count = constraints.filter((c) => c.type === type).length;
      return `
        <span class="planscope-badge-mini" style="background-color: ${config.color}" title="${config.label}${count > 1 ? ` (${count})` : ''}">
          ${config.icon}
        </span>
      `;
    })
    .join('');

  return container;
}
