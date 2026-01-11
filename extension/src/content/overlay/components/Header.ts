/**
 * Header component with logo, title, usage indicator, and collapse toggle
 */

import type { UsageStatus } from '../../../types';
import { createUsageIndicator } from './UsageIndicator';

export function createHeader(onToggle: () => void, usageStatus?: UsageStatus): HTMLElement {
  const header = document.createElement('div');
  header.className = 'planscope-header';

  // Create header structure
  const headerLeft = document.createElement('div');
  headerLeft.className = 'planscope-header-left';
  headerLeft.innerHTML = `
    <div class="planscope-logo">P</div>
    <span class="planscope-title">PlanScope</span>
  `;

  const headerRight = document.createElement('div');
  headerRight.className = 'planscope-header-right';

  // Add usage indicator
  const usageIndicator = createUsageIndicator(usageStatus);
  headerRight.appendChild(usageIndicator);

  // Add toggle button
  const toggle = document.createElement('div');
  toggle.className = 'planscope-toggle';
  toggle.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  headerRight.appendChild(toggle);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);

  header.addEventListener('click', onToggle);

  return header;
}
