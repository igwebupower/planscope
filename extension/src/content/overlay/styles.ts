/**
 * CSS styles for the PlanScope overlay
 * Injected into Shadow DOM to prevent host page interference
 */

export function getOverlayStyles(): string {
  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .planscope-container {
      position: fixed;
      top: 80px;
      right: 16px;
      width: 380px;
      max-height: calc(100vh - 100px);
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      transition: transform 0.3s ease, opacity 0.2s ease;
    }

    .planscope-container.collapsed {
      max-height: none;
    }

    .planscope-container.collapsed .planscope-body {
      display: none;
    }

    /* Header */
    .planscope-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      cursor: pointer;
      user-select: none;
    }

    .planscope-header:hover {
      background: linear-gradient(135deg, #5558e3, #7c4fe8);
    }

    .planscope-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .planscope-header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .planscope-logo {
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .planscope-title {
      font-weight: 600;
      font-size: 15px;
    }

    .planscope-toggle {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .planscope-container.collapsed .planscope-toggle {
      transform: rotate(180deg);
    }

    /* Body */
    .planscope-body {
      flex: 1;
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }

    /* Climate Summary */
    .planscope-climate {
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .planscope-climate-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .planscope-climate-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .planscope-climate-stat {
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .planscope-climate-label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .planscope-climate-value {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .planscope-climate-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .climate-pro {
      background: #dcfce7;
      color: #166534;
    }

    .climate-moderate {
      background: #fef3c7;
      color: #92400e;
    }

    .climate-restrictive {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Filters */
    .planscope-filters {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .planscope-filter-btn {
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid #d1d5db;
      background: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: #4b5563;
    }

    .planscope-filter-btn:hover {
      border-color: #6366f1;
      color: #6366f1;
    }

    .planscope-filter-btn.active {
      background: #6366f1;
      border-color: #6366f1;
      color: white;
    }

    /* Application List */
    .planscope-list {
      padding: 8px;
    }

    .planscope-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      color: #6b7280;
      font-size: 12px;
    }

    /* Application Card */
    .planscope-card {
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: box-shadow 0.15s ease;
    }

    .planscope-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .planscope-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .planscope-card-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-approved {
      background: #dcfce7;
      color: #166534;
    }

    .status-refused {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-withdrawn {
      background: #f3f4f6;
      color: #4b5563;
    }

    .planscope-card-distance {
      font-size: 12px;
      color: #6b7280;
    }

    .planscope-card-address {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .planscope-card-summary {
      font-size: 13px;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .planscope-card-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #6b7280;
    }

    .planscope-card-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Map */
    .planscope-map-container {
      height: 200px;
      border-bottom: 1px solid #e5e7eb;
    }

    .planscope-map {
      width: 100%;
      height: 100%;
    }

    /* Insights */
    .planscope-insights {
      padding: 12px 16px;
      background: #fffbeb;
      border-bottom: 1px solid #fde68a;
    }

    .planscope-insight {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 0;
      font-size: 13px;
    }

    .planscope-insight-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .insight-positive .planscope-insight-icon {
      background: #dcfce7;
      color: #166534;
    }

    .insight-warning .planscope-insight-icon {
      background: #fee2e2;
      color: #991b1b;
    }

    .insight-info .planscope-insight-icon {
      background: #dbeafe;
      color: #1e40af;
    }

    /* Loading */
    .planscope-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .planscope-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Error */
    .planscope-error {
      padding: 20px;
      text-align: center;
      color: #991b1b;
      background: #fee2e2;
    }

    /* Empty */
    .planscope-empty {
      padding: 40px 20px;
      text-align: center;
      color: #6b7280;
    }

    /* Scrollbar */
    .planscope-body::-webkit-scrollbar {
      width: 6px;
    }

    .planscope-body::-webkit-scrollbar-track {
      background: #f3f4f6;
    }

    .planscope-body::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .planscope-body::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }

    /* Constraints */
    .planscope-constraints {
      padding: 12px 16px;
      background: #faf5ff;
      border-bottom: 1px solid #e9d5ff;
    }

    .planscope-constraints-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .planscope-constraints-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }

    .planscope-constraints-count {
      font-size: 11px;
      color: #8b5cf6;
      font-weight: 500;
    }

    .planscope-constraints-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #9ca3af;
      font-size: 13px;
    }

    .planscope-constraints-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .planscope-constraint-group {
      background: white;
      border-radius: 6px;
      padding: 8px;
      border: 1px solid #e5e7eb;
    }

    .planscope-constraint-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 4px;
      color: white;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .planscope-constraint-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 3px;
      font-size: 10px;
      font-weight: 700;
    }

    .planscope-constraint-label {
      flex: 1;
    }

    .planscope-constraint-count {
      background: rgba(255, 255, 255, 0.25);
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 10px;
    }

    .planscope-constraint-details {
      padding-left: 4px;
    }

    .planscope-constraint-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
      color: #4b5563;
      border-bottom: 1px solid #f3f4f6;
    }

    .planscope-constraint-item:last-child {
      border-bottom: none;
    }

    .planscope-constraint-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .planscope-constraint-grade {
      background: #fef3c7;
      color: #92400e;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
    }

    .planscope-constraint-link {
      color: #6366f1;
      text-decoration: none;
      font-size: 11px;
      font-weight: 500;
    }

    .planscope-constraint-link:hover {
      text-decoration: underline;
    }

    /* Compact constraint badges */
    .planscope-constraint-badges {
      display: flex;
      gap: 4px;
      margin-left: 8px;
    }

    .planscope-badge-mini {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      color: white;
      font-size: 10px;
      font-weight: 700;
    }

    /* Application URL Link */
    .planscope-card-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #6366f1;
      text-decoration: none;
      font-size: 11px;
      font-weight: 500;
      margin-top: 8px;
    }

    .planscope-card-link:hover {
      text-decoration: underline;
    }

    /* Skeleton Loaders */
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    .planscope-skeleton {
      background: linear-gradient(
        90deg,
        #f3f4f6 25%,
        #e5e7eb 50%,
        #f3f4f6 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .planscope-skeleton-loading {
      padding: 16px;
    }

    .planscope-skeleton-climate {
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .planscope-skeleton-title {
      height: 12px;
      width: 120px;
      margin-bottom: 12px;
    }

    .planscope-skeleton-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .planscope-skeleton-stat {
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .planscope-skeleton-label {
      height: 10px;
      width: 60%;
      margin-bottom: 8px;
    }

    .planscope-skeleton-value {
      height: 20px;
      width: 40%;
    }

    .planscope-skeleton-filters {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }

    .planscope-skeleton-filter {
      height: 28px;
      width: 60px;
      border-radius: 16px;
    }

    .planscope-skeleton-list {
      padding: 8px;
    }

    .planscope-skeleton-card {
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .planscope-skeleton-card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .planscope-skeleton-status {
      height: 22px;
      width: 70px;
      border-radius: 4px;
    }

    .planscope-skeleton-distance {
      height: 14px;
      width: 40px;
    }

    .planscope-skeleton-address {
      height: 16px;
      width: 80%;
      margin-bottom: 8px;
    }

    .planscope-skeleton-summary {
      height: 12px;
      width: 100%;
      margin-bottom: 4px;
    }

    .planscope-skeleton-summary-short {
      height: 12px;
      width: 60%;
    }

    /* Enhanced Error States */
    .planscope-error {
      padding: 24px 16px;
      text-align: center;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
    }

    .planscope-error-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #dc2626;
      font-size: 24px;
    }

    .planscope-error-title {
      font-weight: 600;
      color: #991b1b;
      margin-bottom: 4px;
    }

    .planscope-error-message {
      font-size: 13px;
      color: #b91c1c;
      margin-bottom: 16px;
    }

    .planscope-error-retry {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .planscope-error-retry:hover {
      background: #b91c1c;
    }

    /* Offline Banner */
    .planscope-offline-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #fef3c7;
      border-bottom: 1px solid #fde68a;
      font-size: 12px;
      color: #92400e;
    }

    .planscope-offline-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Cache Indicator */
    .planscope-cache-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
      margin-left: 8px;
    }

    /* Rate Limit Warning */
    .planscope-rate-limit {
      padding: 16px;
      background: #fff7ed;
      border-bottom: 1px solid #fed7aa;
      text-align: center;
    }

    .planscope-rate-limit-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .planscope-rate-limit-title {
      font-weight: 600;
      color: #c2410c;
      margin-bottom: 4px;
    }

    .planscope-rate-limit-message {
      font-size: 13px;
      color: #ea580c;
    }

    .planscope-rate-limit-timer {
      font-weight: 600;
      font-size: 18px;
      color: #c2410c;
      margin-top: 8px;
    }
  `;
}
