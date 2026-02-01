import type { TypeSuccessRate } from '../../../types';
import { getTypeInsight } from '../../../services/typeSuccess';
import { escapeHtml } from '../../../utils';

/**
 * Type success rates component showing bar chart of success by application type
 */
export function createTypeSuccessRates(rates: TypeSuccessRate[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-type-rates';

  if (rates.length === 0) {
    container.innerHTML = `
      <div class="planscope-enhanced-empty">
        <div class="planscope-enhanced-empty-icon">📊</div>
        <div class="planscope-enhanced-empty-title">Not Enough Data</div>
        <div class="planscope-enhanced-empty-message">Need more decided applications to show type breakdown</div>
      </div>
    `;
    return container;
  }

  // Create bars for each type
  for (const rate of rates) {
    const rateEl = document.createElement('div');
    rateEl.className = 'planscope-type-rate';

    const percentage = Math.round(rate.successRate * 100);

    rateEl.innerHTML = `
      <div class="planscope-type-rate-label" title="${escapeHtml(rate.displayName)}">${escapeHtml(rate.displayName)}</div>
      <div class="planscope-type-rate-bar-container">
        <div class="planscope-type-rate-bar rank-${rate.rank}" style="width: ${percentage}%"></div>
      </div>
      <div class="planscope-type-rate-value">
        ${percentage}% <span class="planscope-type-rate-count">(${rate.total})</span>
      </div>
    `;

    container.appendChild(rateEl);
  }

  // Add insight if available
  const insight = getTypeInsight(rates);
  if (insight) {
    const insightEl = document.createElement('div');
    insightEl.className = 'planscope-type-insight';
    insightEl.innerHTML = `
      <span class="planscope-type-insight-icon">💡</span>
      <span>${escapeHtml(insight)}</span>
    `;
    container.appendChild(insightEl);
  }

  return container;
}
