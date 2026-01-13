/**
 * Upgrade prompt component shown when monthly lookup limit is reached
 */

import type { UsageStatus } from '../../../types';

// Landing page URL for upgrade
const UPGRADE_URL = 'https://planscope.co.uk/#pricing';

export function createUpgradePrompt(status: UsageStatus | undefined): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-upgrade-prompt';

  const daysUntilReset = status?.daysUntilReset ?? 30;
  const limit = status?.limit ?? 10;

  container.innerHTML = `
    <div class="planscope-upgrade-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 class="planscope-upgrade-title">Monthly Limit Reached</h3>
    <p class="planscope-upgrade-message">
      You've used all ${limit} free lookups this month.
    </p>
    <p class="planscope-upgrade-reset">
      Resets in <strong>${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''}</strong>
    </p>
    <a href="${UPGRADE_URL}" target="_blank" rel="noopener" class="planscope-upgrade-button">
      Upgrade to Pro &mdash; £9/mo
    </a>
    <p class="planscope-upgrade-benefit">Unlimited lookups, all constraints, priority support</p>
  `;

  return container;
}

export function getUpgradePromptStyles(): string {
  return `
    .planscope-upgrade-prompt {
      padding: 32px 24px;
      text-align: center;
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-bottom: 1px solid #e9d5ff;
    }

    .planscope-upgrade-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      background: #f3e8ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7c3aed;
    }

    .planscope-upgrade-title {
      font-size: 18px;
      font-weight: 700;
      color: #5b21b6;
      margin-bottom: 8px;
    }

    .planscope-upgrade-message {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .planscope-upgrade-reset {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 20px;
    }

    .planscope-upgrade-reset strong {
      color: #7c3aed;
    }

    .planscope-upgrade-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
    }

    .planscope-upgrade-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
    }

    .planscope-upgrade-benefit {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 12px;
    }
  `;
}
