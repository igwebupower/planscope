import type { EnhancedInsightsData, EnhancedInsightTab, TabConfig } from '../../../types';
import { createTrendChart } from './TrendChart';
import { createTypeSuccessRates } from './TypeSuccessRates';
import { createPrecedent } from './Precedent';
import { createCostEstimates } from './CostEstimates';
import { createRefusalReasons } from './RefusalReasons';
import { createBenchmarks } from './Benchmarks';

/**
 * Tab configuration for enhanced insights
 */
const TABS: TabConfig[] = [
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'types', label: 'Types', icon: '📊' },
  { id: 'precedent', label: 'Precedent', icon: '🏠' },
  { id: 'costs', label: 'Costs', icon: '💷' },
  { id: 'refusals', label: 'Refusals', icon: '⚠' },
  { id: 'benchmarks', label: 'Benchmarks', icon: '🏆' },
];

/**
 * Enhanced insights tabbed container component
 */
export function createEnhancedInsights(
  data: EnhancedInsightsData,
  refusalCount: number
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-enhanced-insights';

  if (!data.hasEnoughData) {
    container.innerHTML = `
      <div class="planscope-enhanced-empty">
        <div class="planscope-enhanced-empty-icon">📊</div>
        <div class="planscope-enhanced-empty-title">More Data Needed</div>
        <div class="planscope-enhanced-empty-message">
          Enhanced insights require at least ${data.minimumApplications} applications nearby.
          Only cost estimates are available.
        </div>
      </div>
    `;
    return container;
  }

  // Create tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'planscope-enhanced-tabs';

  const contentContainer = document.createElement('div');
  contentContainer.className = 'planscope-enhanced-content';

  let activeTab: EnhancedInsightTab = 'trends';

  // Create tab buttons
  TABS.forEach((tab) => {
    const tabBtn = document.createElement('button');
    tabBtn.className = `planscope-enhanced-tab${tab.id === activeTab ? ' active' : ''}`;
    tabBtn.dataset.tab = tab.id;
    tabBtn.innerHTML = `
      <span class="planscope-enhanced-tab-icon">${tab.icon}</span>
      <span>${tab.label}</span>
    `;

    tabBtn.addEventListener('click', () => {
      // Update active states
      tabsContainer.querySelectorAll('.planscope-enhanced-tab').forEach((t) => {
        t.classList.remove('active');
      });
      tabBtn.classList.add('active');

      contentContainer.querySelectorAll('.planscope-enhanced-panel').forEach((p) => {
        p.classList.remove('active');
      });

      const panel = contentContainer.querySelector(`[data-panel="${tab.id}"]`);
      if (panel) {
        panel.classList.add('active');
      }

      activeTab = tab.id;
    });

    tabsContainer.appendChild(tabBtn);
  });

  container.appendChild(tabsContainer);

  // Create content panels
  TABS.forEach((tab) => {
    const panel = document.createElement('div');
    panel.className = `planscope-enhanced-panel${tab.id === activeTab ? ' active' : ''}`;
    panel.dataset.panel = tab.id;

    const content = createPanelContent(tab.id, data, refusalCount);
    panel.appendChild(content);

    contentContainer.appendChild(panel);
  });

  container.appendChild(contentContainer);

  return container;
}

/**
 * Create content for a specific tab panel
 */
function createPanelContent(
  tabId: EnhancedInsightTab,
  data: EnhancedInsightsData,
  refusalCount: number
): HTMLElement {
  switch (tabId) {
    case 'trends':
      if (data.trendAnalysis) {
        return createTrendChart(data.trendAnalysis);
      }
      return createEmptyPanel('Trends', 'Not enough historical data for trend analysis');

    case 'types':
      return createTypeSuccessRates(data.typeSuccessRates);

    case 'precedent':
      if (data.propertyPrecedent) {
        return createPrecedent(data.propertyPrecedent);
      }
      return createEmptyPanel('Precedent', 'No precedent data available');

    case 'costs':
      return createCostEstimates(data.costEstimates);

    case 'refusals':
      return createRefusalReasons(data.refusalReasons, refusalCount);

    case 'benchmarks':
      if (data.benchmarks) {
        return createBenchmarks(data.benchmarks);
      }
      return createEmptyPanel('Benchmarks', 'Benchmark data not available');

    default:
      return createEmptyPanel('Unknown', 'This tab is not available');
  }
}

/**
 * Create an empty panel with a message
 */
function createEmptyPanel(title: string, message: string): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'planscope-enhanced-empty';
  panel.innerHTML = `
    <div class="planscope-enhanced-empty-icon">📭</div>
    <div class="planscope-enhanced-empty-title">${title}</div>
    <div class="planscope-enhanced-empty-message">${message}</div>
  `;
  return panel;
}
