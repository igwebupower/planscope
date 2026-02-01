import type { CostEstimate } from '../../../types';
import { formatCurrency, formatCurrencyRange } from '../../../services/costEstimates';
import { escapeHtml } from '../../../utils';

/**
 * Cost estimates component showing UK planning fees and professional costs
 */
export function createCostEstimates(estimates: CostEstimate[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-cost-estimates';

  if (estimates.length === 0) {
    container.innerHTML = `
      <div class="planscope-enhanced-empty">
        <div class="planscope-enhanced-empty-icon">💷</div>
        <div class="planscope-enhanced-empty-title">No Cost Data</div>
        <div class="planscope-enhanced-empty-message">Cost estimates are not available</div>
      </div>
    `;
    return container;
  }

  // Create cards for each estimate
  for (const estimate of estimates) {
    const card = createCostCard(estimate);
    container.appendChild(card);
  }

  // Add disclaimer note
  const note = document.createElement('div');
  note.className = 'planscope-cost-note';
  note.innerHTML = `
    <span class="planscope-cost-note-icon">ℹ</span>
    <span>Fees based on 2024 UK planning fee schedule. Professional fees vary by project complexity - get quotes from local architects/planning consultants.</span>
  `;
  container.appendChild(note);

  return container;
}

/**
 * Create a cost card for a single estimate
 */
function createCostCard(estimate: CostEstimate): HTMLElement {
  const card = document.createElement('div');
  card.className = 'planscope-cost-card';

  card.innerHTML = `
    <div class="planscope-cost-card-title">${escapeHtml(estimate.displayName)}</div>
    <div class="planscope-cost-row">
      <span class="planscope-cost-label">Planning Fee</span>
      <span class="planscope-cost-value">${formatCurrency(estimate.planningFee)}</span>
    </div>
    <div class="planscope-cost-row">
      <span class="planscope-cost-label">Professional Fees</span>
      <span class="planscope-cost-value">${formatCurrencyRange(estimate.professionalFees.min, estimate.professionalFees.max)}</span>
    </div>
    <div class="planscope-cost-divider"></div>
    <div class="planscope-cost-row planscope-cost-total">
      <span class="planscope-cost-label">Total Estimate</span>
      <span class="planscope-cost-value">${formatCurrencyRange(estimate.totalEstimate.min, estimate.totalEstimate.max)}</span>
    </div>
  `;

  return card;
}
