import type { FilterState, ApplicationStatus } from '../../../types';

/**
 * Filter controls for status and application type
 */

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REFUSED', label: 'Refused' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export function createFilters(
  filters: FilterState,
  onChange: (filters: FilterState) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'planscope-filters';

  // Status filter buttons
  for (const option of STATUS_OPTIONS) {
    const button = document.createElement('button');
    button.className = 'planscope-filter-btn';
    button.textContent = option.label;

    if (filters.status.includes(option.value)) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      const newStatus = filters.status.includes(option.value)
        ? filters.status.filter((s) => s !== option.value)
        : [...filters.status, option.value];

      onChange({
        ...filters,
        status: newStatus,
      });
    });

    container.appendChild(button);
  }

  return container;
}

/**
 * Update filter buttons active state
 */
export function updateFiltersUI(container: HTMLElement, filters: FilterState): void {
  const buttons = container.querySelectorAll('.planscope-filter-btn');

  buttons.forEach((button, index) => {
    if (index < STATUS_OPTIONS.length) {
      const status = STATUS_OPTIONS[index].value;
      if (filters.status.includes(status)) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  });
}
