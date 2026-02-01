import type { DevelopmentScore } from '../../../types';
import { escapeHtml } from '../../../utils';

/**
 * Development Score gauge component
 * Hero section showing the overall development potential score
 */
export function createDevelopmentScore(score: DevelopmentScore): HTMLElement {
  const container = document.createElement('div');
  container.className = `planscope-dev-score score-${score.rating}`;

  const factorLabels: Record<keyof typeof score.breakdown, string> = {
    constraints: 'Cnst',
    approvalRate: 'Appr',
    climate: 'Clim',
    precedent: 'Prec',
    trends: 'Trnd',
  };

  const factorFullLabels: Record<keyof typeof score.breakdown, string> = {
    constraints: 'Constraints',
    approvalRate: 'Approval',
    climate: 'Climate',
    precedent: 'Precedent',
    trends: 'Trends',
  };

  container.innerHTML = `
    <div class="planscope-dev-score-header">
      <span class="planscope-dev-score-title">Development Potential</span>
      <span class="planscope-dev-score-value">${score.overall}</span>
    </div>
    <div class="planscope-score-gauge">
      <div class="planscope-score-gauge-fill" style="width: ${score.overall}%"></div>
    </div>
    <div class="planscope-score-labels">
      <span>Difficult</span>
      <span>Excellent</span>
    </div>
    <div class="planscope-score-breakdown">
      ${Object.entries(score.breakdown)
        .map(
          ([key, value]) => `
        <div class="planscope-score-factor" title="${factorFullLabels[key as keyof typeof score.breakdown]}">
          <div class="planscope-score-factor-value">${value}</div>
          <div class="planscope-score-factor-label">${factorLabels[key as keyof typeof score.breakdown]}</div>
        </div>
      `
        )
        .join('')}
    </div>
    <div class="planscope-score-summary">"${escapeHtml(score.summary)}"</div>
  `;

  return container;
}
