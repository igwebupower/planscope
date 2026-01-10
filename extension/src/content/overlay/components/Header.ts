/**
 * Header component with logo, title, and collapse toggle
 */

export function createHeader(onToggle: () => void): HTMLElement {
  const header = document.createElement('div');
  header.className = 'planscope-header';

  header.innerHTML = `
    <div class="planscope-header-left">
      <div class="planscope-logo">P</div>
      <span class="planscope-title">PlanScope</span>
    </div>
    <div class="planscope-toggle">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;

  header.addEventListener('click', onToggle);

  return header;
}
