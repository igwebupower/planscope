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
  `;
}
