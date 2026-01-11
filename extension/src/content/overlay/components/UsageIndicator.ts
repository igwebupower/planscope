/**
 * Usage indicator component for the overlay header
 * Shows remaining lookups for free tier or "Unlimited" for pro tier
 */

import type { UsageStatus } from '../../../types';

export function createUsageIndicator(status: UsageStatus | undefined): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-usage-indicator';

  if (!status) {
    // Show loading state or nothing
    return container;
  }

  if (status.isUnlimited) {
    // Pro tier - show unlimited badge
    container.innerHTML = `
      <span class="planscope-usage-badge pro">
        <span class="planscope-usage-icon">&#x221E;</span>
        <span class="planscope-usage-text">Pro</span>
      </span>
    `;
  } else {
    // Free tier - show remaining lookups
    const remaining = status.remaining;
    const limit = status.limit;
    const isLow = remaining <= 3;
    const isEmpty = remaining === 0;

    container.innerHTML = `
      <span class="planscope-usage-badge ${isEmpty ? 'empty' : isLow ? 'low' : 'normal'}">
        <span class="planscope-usage-count">${remaining}/${limit}</span>
      </span>
    `;
  }

  return container;
}

export function updateUsageIndicator(container: HTMLElement, status: UsageStatus | undefined): void {
  container.innerHTML = '';
  const newIndicator = createUsageIndicator(status);
  container.innerHTML = newIndicator.innerHTML;
}

export function getUsageIndicatorStyles(): string {
  return `
    .planscope-usage-indicator {
      display: flex;
      align-items: center;
    }

    .planscope-usage-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .planscope-usage-badge.pro {
      background: rgba(34, 197, 94, 0.3);
    }

    .planscope-usage-badge.normal {
      background: rgba(255, 255, 255, 0.2);
    }

    .planscope-usage-badge.low {
      background: rgba(245, 158, 11, 0.3);
    }

    .planscope-usage-badge.empty {
      background: rgba(239, 68, 68, 0.3);
    }

    .planscope-usage-icon {
      font-size: 12px;
    }

    .planscope-usage-count {
      font-variant-numeric: tabular-nums;
    }
  `;
}
