import type { RefusalReason } from '../../../types';
import { getRefusalAdvice } from '../../../services/refusalAnalysis';
import { escapeHtml } from '../../../utils';

/**
 * Refusal reasons component showing common reasons for refusal in the area
 */
export function createRefusalReasons(
  reasons: RefusalReason[],
  totalRefused: number
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-refusals';

  if (reasons.length === 0) {
    container.innerHTML = `
      <div class="planscope-refusals-empty">
        <div class="planscope-enhanced-empty-icon">🎉</div>
        <div class="planscope-enhanced-empty-title">No Clear Patterns</div>
        <div class="planscope-enhanced-empty-message">Not enough refusals to identify patterns, or refusal reasons are varied</div>
      </div>
    `;
    return container;
  }

  // Build header
  const header = document.createElement('div');
  header.className = 'planscope-refusals-header';
  header.innerHTML = `
    <span class="planscope-refusals-title">Common Refusal Reasons</span>
    <span class="planscope-refusals-count">${totalRefused} refused</span>
  `;
  container.appendChild(header);

  // Build list of reasons
  const list = document.createElement('div');
  list.className = 'planscope-refusal-list';

  reasons.forEach((reason, index) => {
    const item = document.createElement('div');
    item.className = 'planscope-refusal-item';

    item.innerHTML = `
      <div class="planscope-refusal-item-header">
        <span class="planscope-refusal-item-rank">${index + 1}</span>
        <span class="planscope-refusal-item-name">${escapeHtml(reason.displayName)}</span>
        <span class="planscope-refusal-percentage">${reason.percentage}%</span>
      </div>
      <div class="planscope-refusal-bar-container">
        <div class="planscope-refusal-bar" style="width: ${reason.percentage}%"></div>
      </div>
    `;

    list.appendChild(item);
  });

  container.appendChild(list);

  // Add advice tip
  const advice = getRefusalAdvice(reasons);
  const tip = document.createElement('div');
  tip.className = 'planscope-refusals-tip';
  tip.innerHTML = `
    <span class="planscope-refusals-tip-icon">💡</span>
    <span>${escapeHtml(advice)}</span>
  `;
  container.appendChild(tip);

  return container;
}
