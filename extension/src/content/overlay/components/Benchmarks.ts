import type { CouncilPerformance } from '../../../types';
import { getBenchmarkHeadline, getBenchmarkSubtext } from '../../../services/benchmarks';
import { escapeHtml } from '../../../utils';

/**
 * Benchmarks component showing council performance vs national averages
 */
export function createBenchmarks(performance: CouncilPerformance): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-benchmarks';

  // Summary card
  const summary = document.createElement('div');
  summary.className = `planscope-benchmark-summary ${performance.overallRating}`;

  const headline = getBenchmarkHeadline(performance);
  const subtext = getBenchmarkSubtext(performance);

  summary.innerHTML = `
    <div class="planscope-benchmark-headline">${escapeHtml(headline)}</div>
    ${subtext ? `<div class="planscope-benchmark-subtext">${escapeHtml(subtext)}</div>` : ''}
  `;
  container.appendChild(summary);

  // Metric cards
  const cards = document.createElement('div');
  cards.className = 'planscope-benchmark-cards';

  // Approval rate card
  const approvalCard = createBenchmarkCard(
    'Approval Rate',
    `${Math.round(performance.approvalRate.localValue * 100)}%`,
    formatApprovalDiff(performance.approvalRate.percentDifference),
    getDiffClass(performance.approvalRate.percentDifference)
  );
  cards.appendChild(approvalCard);

  // Decision time card
  const decisionCard = createBenchmarkCard(
    'Decision Time',
    `${performance.decisionDays.localValue} days`,
    formatDecisionDiff(performance.decisionDays.difference),
    getDiffClass(performance.decisionDays.difference)
  );
  cards.appendChild(decisionCard);

  container.appendChild(cards);

  return container;
}

/**
 * Create a benchmark metric card
 */
function createBenchmarkCard(
  label: string,
  value: string,
  diff: string,
  diffClass: string
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'planscope-benchmark-card';

  card.innerHTML = `
    <div class="planscope-benchmark-card-label">${escapeHtml(label)}</div>
    <div class="planscope-benchmark-card-value">${escapeHtml(value)}</div>
    <div class="planscope-benchmark-card-diff ${diffClass}">${escapeHtml(diff)}</div>
  `;

  return card;
}

/**
 * Format approval rate difference for display
 */
function formatApprovalDiff(diff: number): string {
  if (diff > 0) return `+${diff}% vs nat.`;
  if (diff < 0) return `${diff}% vs nat.`;
  return 'same as nat.';
}

/**
 * Format decision days difference for display
 */
function formatDecisionDiff(diff: number): string {
  if (diff > 0) return `${Math.round(diff)} days faster`;
  if (diff < 0) return `${Math.abs(Math.round(diff))} days slower`;
  return 'same as nat.';
}

/**
 * Get CSS class for difference display
 */
function getDiffClass(diff: number): string {
  if (diff > 0) return 'positive';
  if (diff < 0) return 'negative';
  return 'neutral';
}
