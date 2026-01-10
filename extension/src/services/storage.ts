/**
 * Chrome storage wrapper for PlanScope settings
 */

export interface PlanscopeSettings {
  overlayPosition: 'right' | 'left';
  defaultRadius: number;
  showMap: boolean;
}

const DEFAULT_SETTINGS: PlanscopeSettings = {
  overlayPosition: 'right',
  defaultRadius: 500,
  showMap: true,
};

/**
 * Get PlanScope settings from Chrome storage
 */
export async function getSettings(): Promise<PlanscopeSettings> {
  try {
    const result = await chrome.storage.sync.get('planscope_settings');
    return { ...DEFAULT_SETTINGS, ...result.planscope_settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save PlanScope settings to Chrome storage
 */
export async function saveSettings(settings: Partial<PlanscopeSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.sync.set({ planscope_settings: updated });
}

/**
 * Get overlay open state from session storage
 */
export function getOverlayState(): boolean {
  return sessionStorage.getItem('planscope_open') !== 'false';
}

/**
 * Save overlay open state to session storage
 */
export function saveOverlayState(isOpen: boolean): void {
  sessionStorage.setItem('planscope_open', String(isOpen));
}
