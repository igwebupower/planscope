import type { PlanningApplication } from '../../../types';
import { formatDistance, formatDate, escapeHtml } from '../../../utils';

/**
 * Application card component for displaying a single planning application
 */

export function createApplicationCard(application: PlanningApplication): HTMLElement {
  const card = document.createElement('div');
  card.className = 'planscope-card';

  const statusClass = getStatusClass(application.status);
  const statusLabel = getStatusLabel(application.status);

  card.innerHTML = `
    <div class="planscope-card-header">
      <span class="planscope-card-status ${statusClass}">
        ${getStatusIcon(application.status)}
        ${statusLabel}
      </span>
      <span class="planscope-card-distance">${formatDistance(application.distance_m)}</span>
    </div>
    <div class="planscope-card-address">${escapeHtml(application.address)}</div>
    <div class="planscope-card-summary">${escapeHtml(application.summary)}</div>
    <div class="planscope-card-meta">
      <span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C5.24 0 3 2.24 3 5c0 4.5 5 11 5 11s5-6.5 5-11c0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
        ${escapeHtml(application.type)}
      </span>
      <span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 2H2C.9 2 0 2.9 0 4v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM2 4h12v2H2V4zm0 10V8h12v6H2z"/>
        </svg>
        ${formatDate(application.decision_date)}
      </span>
      <span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zm0-6H7V4h2v2z"/>
        </svg>
        ${escapeHtml(application.id)}
      </span>
    </div>
  `;

  return card;
}

function getStatusClass(status: PlanningApplication['status']): string {
  switch (status) {
    case 'APPROVED':
      return 'status-approved';
    case 'REFUSED':
      return 'status-refused';
    case 'PENDING':
      return 'status-pending';
    case 'WITHDRAWN':
      return 'status-withdrawn';
  }
}

function getStatusLabel(status: PlanningApplication['status']): string {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REFUSED':
      return 'Refused';
    case 'PENDING':
      return 'Pending';
    case 'WITHDRAWN':
      return 'Withdrawn';
  }
}

function getStatusIcon(status: PlanningApplication['status']): string {
  switch (status) {
    case 'APPROVED':
      return '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 12.5l-4-4 1.5-1.5 2.5 2.5 5.5-5.5 1.5 1.5-7 7z"/></svg>';
    case 'REFUSED':
      return '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M12.5 4.5l-1-1L8 7l-3.5-3.5-1 1L7 8l-3.5 3.5 1 1L8 9l3.5 3.5 1-1L9 8l3.5-3.5z"/></svg>';
    case 'PENDING':
      return '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 9H7V4h2v5z"/></svg>';
    case 'WITHDRAWN':
      return '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3 9H5V7h6v2z"/></svg>';
  }
}
