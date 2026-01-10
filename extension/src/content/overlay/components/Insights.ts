import type { Insight } from '../../../types';
import { escapeHtml } from '../../../utils';

/**
 * Insights component for displaying planning intelligence signals
 */

export function createInsights(insights: Insight[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-insights';

  if (insights.length === 0) {
    return container; // Empty, will not be visible
  }

  for (const insight of insights) {
    const insightEl = document.createElement('div');
    insightEl.className = `planscope-insight insight-${insight.type}`;

    insightEl.innerHTML = `
      <div class="planscope-insight-icon">${getInsightIcon(insight.type)}</div>
      <span>${escapeHtml(insight.message)}</span>
    `;

    container.appendChild(insightEl);
  }

  return container;
}

function getInsightIcon(type: Insight['type']): string {
  switch (type) {
    case 'positive':
      return '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm-1 12l-3-3 1.5-1.5L7 9l4-4 1.5 1.5L7 12z"/></svg>';
    case 'warning':
      return '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L0 14h16L8 0zm0 12a1 1 0 110-2 1 1 0 010 2zm1-3H7V5h2v4z"/></svg>';
    case 'info':
      return '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zm0-6H7V4h2v2z"/></svg>';
  }
}
