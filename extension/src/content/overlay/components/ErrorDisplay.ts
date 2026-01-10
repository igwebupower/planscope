/**
 * Enhanced error display component with specific error types and retry button
 */

import { PlanScopeError, toPlanScopeError } from '../../../services/errors';
import { escapeHtml } from '../../../utils';

interface ErrorDisplayOptions {
  error: unknown;
  onRetry?: () => void;
}

export function createErrorDisplay({ error, onRetry }: ErrorDisplayOptions): HTMLElement {
  const planScopeError = toPlanScopeError(error);
  const container = document.createElement('div');
  container.className = 'planscope-error';

  const icon = getErrorIcon(planScopeError);
  const title = getErrorTitle(planScopeError);

  container.innerHTML = `
    <div class="planscope-error-icon">${icon}</div>
    <div class="planscope-error-title">${escapeHtml(title)}</div>
    <div class="planscope-error-message">${escapeHtml(planScopeError.userMessage)}</div>
    ${planScopeError.retryable ? '<button class="planscope-error-retry">Try Again</button>' : ''}
  `;

  // Add retry handler
  if (planScopeError.retryable && onRetry) {
    const retryButton = container.querySelector('.planscope-error-retry');
    if (retryButton) {
      retryButton.addEventListener('click', onRetry);
    }
  }

  return container;
}

function getErrorIcon(error: PlanScopeError): string {
  switch (error.code) {
    case 'OFFLINE_ERROR':
      return '&#128268;'; // wifi off symbol
    case 'TIMEOUT_ERROR':
      return '&#9203;'; // clock
    case 'RATE_LIMIT_ERROR':
      return '&#128683;'; // stop sign
    case 'NETWORK_ERROR':
      return '&#127760;'; // globe
    default:
      return '&#9888;'; // warning triangle
  }
}

function getErrorTitle(error: PlanScopeError): string {
  switch (error.code) {
    case 'OFFLINE_ERROR':
      return 'You\'re Offline';
    case 'TIMEOUT_ERROR':
      return 'Request Timed Out';
    case 'RATE_LIMIT_ERROR':
      return 'Too Many Requests';
    case 'NETWORK_ERROR':
      return 'Connection Error';
    case 'API_ERROR':
      return 'Service Unavailable';
    case 'PARSE_ERROR':
      return 'Data Error';
    default:
      return 'Something Went Wrong';
  }
}

/**
 * Create an offline banner to show when using cached data
 */
export function createOfflineBanner(): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'planscope-offline-banner';
  banner.innerHTML = `
    <svg class="planscope-offline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
    <span>You're offline. Showing cached data.</span>
  `;
  return banner;
}

/**
 * Create a rate limit warning with countdown timer
 */
export function createRateLimitWarning(retryAfterMs: number, onRetry?: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-rate-limit';

  let remainingSeconds = Math.ceil(retryAfterMs / 1000);

  const updateTimer = () => {
    const timerEl = container.querySelector('.planscope-rate-limit-timer');
    if (timerEl) {
      timerEl.textContent = `${remainingSeconds}s`;
    }
  };

  container.innerHTML = `
    <div class="planscope-rate-limit-icon">&#9203;</div>
    <div class="planscope-rate-limit-title">Rate Limited</div>
    <div class="planscope-rate-limit-message">Please wait before trying again</div>
    <div class="planscope-rate-limit-timer">${remainingSeconds}s</div>
  `;

  // Countdown timer
  const interval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      clearInterval(interval);
      if (onRetry) {
        onRetry();
      }
    } else {
      updateTimer();
    }
  }, 1000);

  return container;
}

/**
 * Create a cache indicator badge
 */
export function createCacheBadge(): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'planscope-cache-badge';
  badge.innerHTML = `
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
    Cached
  `;
  return badge;
}
