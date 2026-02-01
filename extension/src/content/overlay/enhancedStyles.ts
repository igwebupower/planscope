/**
 * CSS styles for enhanced insights components
 * Includes development score gauge, tabbed interface, and all insight visualizations
 */

export function getEnhancedStyles(): string {
  return `
    /* ===== Development Score Hero Section ===== */
    .planscope-dev-score {
      padding: 16px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-bottom: 1px solid #86efac;
    }

    .planscope-dev-score.score-excellent {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-bottom-color: #86efac;
    }

    .planscope-dev-score.score-good {
      background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
      border-bottom-color: #6ee7b7;
    }

    .planscope-dev-score.score-fair {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-bottom-color: #fde68a;
    }

    .planscope-dev-score.score-challenging {
      background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
      border-bottom-color: #fdba74;
    }

    .planscope-dev-score.score-difficult {
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
      border-bottom-color: #fca5a5;
    }

    .planscope-dev-score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .planscope-dev-score-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #374151;
    }

    .planscope-dev-score-value {
      font-size: 28px;
      font-weight: 700;
      color: #166534;
    }

    .planscope-dev-score.score-fair .planscope-dev-score-value {
      color: #92400e;
    }

    .planscope-dev-score.score-challenging .planscope-dev-score-value {
      color: #c2410c;
    }

    .planscope-dev-score.score-difficult .planscope-dev-score-value {
      color: #991b1b;
    }

    /* Score gauge */
    .planscope-score-gauge {
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
      position: relative;
    }

    .planscope-score-gauge-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease-out;
    }

    .planscope-dev-score.score-excellent .planscope-score-gauge-fill,
    .planscope-dev-score.score-good .planscope-score-gauge-fill {
      background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .planscope-dev-score.score-fair .planscope-score-gauge-fill {
      background: linear-gradient(90deg, #eab308, #ca8a04);
    }

    .planscope-dev-score.score-challenging .planscope-score-gauge-fill {
      background: linear-gradient(90deg, #f97316, #ea580c);
    }

    .planscope-dev-score.score-difficult .planscope-score-gauge-fill {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .planscope-score-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 16px;
    }

    /* Breakdown factors */
    .planscope-score-breakdown {
      display: flex;
      gap: 8px;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .planscope-score-factor {
      flex: 1;
      background: white;
      border-radius: 6px;
      padding: 8px 6px;
      text-align: center;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .planscope-score-factor-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }

    .planscope-score-factor-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .planscope-score-summary {
      font-size: 13px;
      color: #374151;
      text-align: center;
      font-style: italic;
    }

    /* ===== Enhanced Insights Tabbed Container ===== */
    .planscope-enhanced-insights {
      border-bottom: 1px solid #e5e7eb;
    }

    .planscope-enhanced-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 12px 12px 8px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .planscope-enhanced-tab {
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      font-size: 11px;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .planscope-enhanced-tab:hover {
      border-color: #6366f1;
      color: #6366f1;
    }

    .planscope-enhanced-tab.active {
      background: #6366f1;
      border-color: #6366f1;
      color: white;
    }

    .planscope-enhanced-tab-icon {
      font-size: 12px;
    }

    .planscope-enhanced-content {
      padding: 16px;
      background: white;
    }

    .planscope-enhanced-panel {
      display: none;
    }

    .planscope-enhanced-panel.active {
      display: block;
    }

    /* ===== Trend Analysis Tab ===== */
    .planscope-trend-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .planscope-trend-arrow {
      font-size: 24px;
      font-weight: bold;
    }

    .planscope-trend-arrow.improving {
      color: #16a34a;
    }

    .planscope-trend-arrow.stable {
      color: #6b7280;
    }

    .planscope-trend-arrow.declining {
      color: #dc2626;
    }

    .planscope-trend-change {
      font-size: 18px;
      font-weight: 600;
    }

    .planscope-trend-change.positive {
      color: #16a34a;
    }

    .planscope-trend-change.negative {
      color: #dc2626;
    }

    .planscope-trend-change.neutral {
      color: #6b7280;
    }

    .planscope-trend-period {
      font-size: 12px;
      color: #6b7280;
    }

    .planscope-trend-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .planscope-trend-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .planscope-trend-card-label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .planscope-trend-card-value {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    .planscope-trend-card-sub {
      font-size: 10px;
      color: #9ca3af;
    }

    /* ===== Type Success Rates Tab ===== */
    .planscope-type-rates {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .planscope-type-rate {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .planscope-type-rate-label {
      width: 80px;
      font-size: 12px;
      font-weight: 500;
      color: #374151;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .planscope-type-rate-bar-container {
      flex: 1;
      height: 20px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .planscope-type-rate-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease-out;
    }

    .planscope-type-rate-bar.rank-best {
      background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .planscope-type-rate-bar.rank-good {
      background: linear-gradient(90deg, #84cc16, #65a30d);
    }

    .planscope-type-rate-bar.rank-average {
      background: linear-gradient(90deg, #eab308, #ca8a04);
    }

    .planscope-type-rate-bar.rank-poor {
      background: linear-gradient(90deg, #f97316, #ea580c);
    }

    .planscope-type-rate-bar.rank-worst {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .planscope-type-rate-value {
      width: 65px;
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      text-align: right;
    }

    .planscope-type-rate-count {
      color: #9ca3af;
      font-weight: normal;
    }

    .planscope-type-insight {
      margin-top: 12px;
      padding: 10px;
      background: #f0fdf4;
      border-radius: 6px;
      font-size: 12px;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .planscope-type-insight-icon {
      font-size: 14px;
    }

    /* ===== Property Precedent Tab ===== */
    .planscope-precedent-summary {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 10px 12px;
      background: #f0fdf4;
      border-radius: 6px;
      font-size: 13px;
      color: #166534;
    }

    .planscope-precedent-summary.negative {
      background: #fef2f2;
      color: #991b1b;
    }

    .planscope-precedent-summary.neutral {
      background: #f3f4f6;
      color: #4b5563;
    }

    .planscope-precedent-summary-icon {
      font-size: 16px;
    }

    .planscope-precedent-section {
      margin-bottom: 16px;
    }

    .planscope-precedent-section:last-child {
      margin-bottom: 0;
    }

    .planscope-precedent-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .planscope-precedent-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .planscope-precedent-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #22c55e;
      font-size: 12px;
    }

    .planscope-precedent-item.refused {
      border-left-color: #ef4444;
    }

    .planscope-precedent-item-status {
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 3px;
    }

    .planscope-precedent-item.refused .planscope-precedent-item-status {
      background: #fee2e2;
      color: #991b1b;
    }

    .planscope-precedent-item:not(.refused) .planscope-precedent-item-status {
      background: #dcfce7;
      color: #166534;
    }

    .planscope-precedent-item-type {
      flex: 1;
      color: #374151;
    }

    .planscope-precedent-item-date {
      color: #9ca3af;
      font-size: 11px;
    }

    .planscope-precedent-empty {
      padding: 16px;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }

    /* ===== Cost Estimates Tab ===== */
    .planscope-cost-estimates {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .planscope-cost-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
    }

    .planscope-cost-card-title {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .planscope-cost-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 12px;
    }

    .planscope-cost-label {
      color: #6b7280;
    }

    .planscope-cost-value {
      font-weight: 500;
      color: #1f2937;
    }

    .planscope-cost-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 8px 0;
    }

    .planscope-cost-total {
      font-weight: 600;
    }

    .planscope-cost-total .planscope-cost-value {
      color: #6366f1;
      font-size: 14px;
    }

    .planscope-cost-note {
      margin-top: 12px;
      padding: 10px;
      background: #dbeafe;
      border-radius: 6px;
      font-size: 11px;
      color: #1e40af;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    .planscope-cost-note-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    /* ===== Refusal Reasons Tab ===== */
    .planscope-refusals {
      padding: 12px;
      background: #fef2f2;
      border-radius: 8px;
    }

    .planscope-refusals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .planscope-refusals-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #991b1b;
    }

    .planscope-refusals-count {
      font-size: 11px;
      color: #b91c1c;
    }

    .planscope-refusal-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .planscope-refusal-item {
      position: relative;
    }

    .planscope-refusal-item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .planscope-refusal-item-rank {
      width: 20px;
      height: 20px;
      background: #fecaca;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: #991b1b;
    }

    .planscope-refusal-item-name {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
    }

    .planscope-refusal-bar-container {
      height: 8px;
      background: #fecaca;
      border-radius: 4px;
      overflow: hidden;
    }

    .planscope-refusal-bar {
      height: 100%;
      background: linear-gradient(90deg, #ef4444, #dc2626);
      border-radius: 4px;
    }

    .planscope-refusal-percentage {
      position: absolute;
      right: 0;
      top: 2px;
      font-size: 12px;
      font-weight: 600;
      color: #991b1b;
    }

    .planscope-refusals-tip {
      margin-top: 14px;
      padding: 10px;
      background: white;
      border-radius: 6px;
      font-size: 11px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .planscope-refusals-tip-icon {
      color: #6366f1;
      font-size: 14px;
    }

    .planscope-refusals-empty {
      padding: 20px;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }

    /* ===== Benchmarks Tab ===== */
    .planscope-benchmarks {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .planscope-benchmark-summary {
      padding: 14px;
      border-radius: 8px;
      text-align: center;
    }

    .planscope-benchmark-summary.above-average {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #86efac;
    }

    .planscope-benchmark-summary.average {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 1px solid #d1d5db;
    }

    .planscope-benchmark-summary.below-average {
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
      border: 1px solid #fca5a5;
    }

    .planscope-benchmark-headline {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .planscope-benchmark-summary.above-average .planscope-benchmark-headline {
      color: #166534;
    }

    .planscope-benchmark-summary.average .planscope-benchmark-headline {
      color: #4b5563;
    }

    .planscope-benchmark-summary.below-average .planscope-benchmark-headline {
      color: #991b1b;
    }

    .planscope-benchmark-subtext {
      font-size: 12px;
      color: #6b7280;
    }

    .planscope-benchmark-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .planscope-benchmark-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .planscope-benchmark-card-label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .planscope-benchmark-card-value {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .planscope-benchmark-card-diff {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 10px;
      display: inline-block;
    }

    .planscope-benchmark-card-diff.positive {
      background: #dcfce7;
      color: #166534;
    }

    .planscope-benchmark-card-diff.neutral {
      background: #f3f4f6;
      color: #4b5563;
    }

    .planscope-benchmark-card-diff.negative {
      background: #fee2e2;
      color: #991b1b;
    }

    /* ===== Not Enough Data State ===== */
    .planscope-enhanced-empty {
      padding: 24px 16px;
      text-align: center;
      color: #6b7280;
    }

    .planscope-enhanced-empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .planscope-enhanced-empty-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #4b5563;
    }

    .planscope-enhanced-empty-message {
      font-size: 12px;
      color: #9ca3af;
    }
  `;
}
