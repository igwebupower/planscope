/**
 * Analytics service for tracking extension usage
 * Privacy-focused: uses anonymous ID, no PII captured
 */

const ANALYTICS_URL = 'https://planscope.co.uk/api/analytics/event';

let anonymousId: string | null = null;

/**
 * Get or create a persistent anonymous ID for this installation
 */
async function getAnonymousId(): Promise<string> {
  if (anonymousId) return anonymousId;

  try {
    const result = await chrome.storage.local.get('analyticsId');
    if (result.analyticsId) {
      anonymousId = result.analyticsId as string;
      return anonymousId;
    } else {
      const newId = crypto.randomUUID();
      anonymousId = newId;
      await chrome.storage.local.set({ analyticsId: newId });
      return newId;
    }
  } catch {
    // Fallback if storage fails
    return 'unknown';
  }
}

/**
 * Track an analytics event
 * @param event - Event name (e.g., 'lookup_completed', 'upgrade_clicked')
 * @param properties - Optional properties to include with the event
 */
export async function track(event: string, properties?: Record<string, unknown>): Promise<void> {
  try {
    const id = await getAnonymousId();

    // Fire and forget - don't await to avoid blocking
    fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: properties || {},
        anonymousId: id
      })
    }).catch(() => {
      // Silent fail - analytics should never break the app
    });
  } catch {
    // Silent fail
  }
}

/**
 * Track extension installation/startup
 */
export async function trackInstall(): Promise<void> {
  const result = await chrome.storage.local.get('hasTrackedInstall');
  if (!result.hasTrackedInstall) {
    await track('extension_installed');
    await chrome.storage.local.set({ hasTrackedInstall: true });
  }
}
