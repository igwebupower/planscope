import type { LocalAuthority } from '../../../types';
import { formatPercent, escapeHtml } from '../../../utils';

/**
 * Climate summary component showing local authority planning stats
 */

export function createClimateSummary(authority: LocalAuthority): HTMLElement {
  const section = document.createElement('div');
  section.className = 'planscope-climate';

  const climateClass = getClimateClass(authority.planning_climate);
  const climateLabel = getClimateLabel(authority.planning_climate);

  section.innerHTML = `
    <div class="planscope-climate-title">${escapeHtml(authority.name)} Planning Climate</div>
    <div class="planscope-climate-grid">
      <div class="planscope-climate-stat">
        <div class="planscope-climate-label">Approval Rate</div>
        <div class="planscope-climate-value">${formatPercent(authority.approval_rate)}</div>
      </div>
      <div class="planscope-climate-stat">
        <div class="planscope-climate-label">Avg. Decision Time</div>
        <div class="planscope-climate-value">${authority.avg_decision_days} days</div>
      </div>
      <div class="planscope-climate-stat" style="grid-column: span 2;">
        <div class="planscope-climate-label">Planning Climate</div>
        <span class="planscope-climate-badge ${climateClass}">${climateLabel}</span>
      </div>
    </div>
  `;

  return section;
}

function getClimateClass(climate: LocalAuthority['planning_climate']): string {
  switch (climate) {
    case 'PRO_DEVELOPMENT':
      return 'climate-pro';
    case 'MODERATE':
      return 'climate-moderate';
    case 'RESTRICTIVE':
      return 'climate-restrictive';
  }
}

function getClimateLabel(climate: LocalAuthority['planning_climate']): string {
  switch (climate) {
    case 'PRO_DEVELOPMENT':
      return 'Pro-Development';
    case 'MODERATE':
      return 'Moderate';
    case 'RESTRICTIVE':
      return 'Restrictive';
  }
}
