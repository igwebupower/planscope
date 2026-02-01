import type { PropertyPrecedent, PlanningApplication } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils';

/**
 * Property precedent component showing previous applications at this address and street
 */
export function createPrecedent(precedent: PropertyPrecedent): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-precedent';

  const hasAnyPrecedent =
    precedent.sameAddress.length > 0 || precedent.sameStreet.length > 0;

  if (!hasAnyPrecedent) {
    container.innerHTML = `
      <div class="planscope-precedent-empty">
        <div class="planscope-enhanced-empty-icon">🏠</div>
        <div class="planscope-enhanced-empty-title">No Direct Precedent</div>
        <div class="planscope-enhanced-empty-message">No previous applications found at this address or on this street</div>
      </div>
    `;
    return container;
  }

  // Summary section
  const summaryClass = precedent.hasPositivePrecedent
    ? ''
    : precedent.sameStreet.some((a) => a.status === 'REFUSED')
      ? 'negative'
      : 'neutral';

  const summaryIcon = precedent.hasPositivePrecedent ? '✓' : summaryClass === 'negative' ? '⚠' : 'ℹ';

  const summary = document.createElement('div');
  summary.className = `planscope-precedent-summary ${summaryClass}`;
  summary.innerHTML = `
    <span class="planscope-precedent-summary-icon">${summaryIcon}</span>
    <span>${escapeHtml(precedent.summary)}</span>
  `;
  container.appendChild(summary);

  // Same address section
  if (precedent.sameAddress.length > 0) {
    const section = createPrecedentSection(
      'Previous at this address:',
      precedent.sameAddress
    );
    container.appendChild(section);
  }

  // Same street section
  if (precedent.sameStreet.length > 0) {
    const section = createPrecedentSection(
      'Similar on this street:',
      precedent.sameStreet
    );
    container.appendChild(section);
  }

  return container;
}

/**
 * Create a section of precedent items
 */
function createPrecedentSection(
  title: string,
  applications: PlanningApplication[]
): HTMLElement {
  const section = document.createElement('div');
  section.className = 'planscope-precedent-section';

  const titleEl = document.createElement('div');
  titleEl.className = 'planscope-precedent-section-title';
  titleEl.textContent = title;
  section.appendChild(titleEl);

  const list = document.createElement('div');
  list.className = 'planscope-precedent-list';

  for (const app of applications) {
    const item = document.createElement('div');
    item.className = `planscope-precedent-item ${app.status === 'REFUSED' ? 'refused' : ''}`;

    const statusLabel = app.status === 'APPROVED' ? 'Approved' : 'Refused';
    const typeLabel = formatType(app.type);
    const dateLabel = formatDate(app.decision_date);

    item.innerHTML = `
      <span class="planscope-precedent-item-status">${statusLabel}</span>
      <span class="planscope-precedent-item-type">${escapeHtml(typeLabel)}</span>
      <span class="planscope-precedent-item-date">${dateLabel}</span>
    `;

    list.appendChild(item);
  }

  section.appendChild(list);
  return section;
}

/**
 * Format application type for display
 */
function formatType(type: string): string {
  const typeMap: Record<string, string> = {
    EXTENSION: 'Extension',
    LOFT_CONVERSION: 'Loft Conversion',
    NEW_BUILD: 'New Build',
    CHANGE_OF_USE: 'Change of Use',
    DEMOLITION: 'Demolition',
    OTHER: 'Other',
  };

  return typeMap[type] || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
