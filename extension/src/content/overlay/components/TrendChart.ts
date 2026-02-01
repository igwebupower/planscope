import type { TrendAnalysis } from '../../../types';
import { getPeriodLabel } from '../../../services/trendAnalysis';

/**
 * Trend analysis component showing approval rate changes over time
 */
export function createTrendChart(trend: TrendAnalysis): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-trend';

  const arrowIcon = getArrowIcon(trend.trend);
  const changeClass = getChangeClass(trend.approvalRateChange);
  const changePrefix = trend.approvalRateChange > 0 ? '+' : '';

  container.innerHTML = `
    <div class="planscope-trend-header">
      <span class="planscope-trend-arrow ${trend.trend}">${arrowIcon}</span>
      <span class="planscope-trend-change ${changeClass}">${changePrefix}${trend.approvalRateChange}%</span>
      <span class="planscope-trend-period">vs ${getPeriodLabel(trend.period)} ago</span>
    </div>
    <div class="planscope-trend-cards">
      <div class="planscope-trend-card">
        <div class="planscope-trend-card-label">Current</div>
        <div class="planscope-trend-card-value">${Math.round(trend.current.approvalRate * 100)}%</div>
        <div class="planscope-trend-card-sub">(${trend.current.count} apps)</div>
      </div>
      <div class="planscope-trend-card">
        <div class="planscope-trend-card-label">Previous</div>
        <div class="planscope-trend-card-value">${Math.round(trend.comparison.approvalRate * 100)}%</div>
        <div class="planscope-trend-card-sub">(${trend.comparison.count} apps)</div>
      </div>
    </div>
  `;

  return container;
}

function getArrowIcon(trend: TrendAnalysis['trend']): string {
  switch (trend) {
    case 'improving':
      return '&#8593;'; // Up arrow
    case 'declining':
      return '&#8595;'; // Down arrow
    case 'stable':
      return '&#8594;'; // Right arrow
    default:
      return '&#8594;';
  }
}

function getChangeClass(change: number): string {
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
}
