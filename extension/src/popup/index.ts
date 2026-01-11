/**
 * PlanScope Popup Script
 * Handles settings, cache management, usage tracking, and status display
 */

import { checkApiHealth, setUseCache } from '../services/api';
import { getCacheStats, clearAllCache, clearExpiredCache } from '../services/cache';
import type { UsageStatus } from '../types';

/**
 * Get usage status via message to background script
 */
async function getUsageStatusViaBackground(): Promise<UsageStatus | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_USAGE_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting usage status:', chrome.runtime.lastError);
        resolve(null);
        return;
      }
      if (response?.success && response.data) {
        resolve(response.data);
      } else {
        resolve(null);
      }
    });
  });
}

// DOM Elements
const statusDot = document.getElementById('status-dot') as HTMLElement;
const statusText = document.getElementById('status-text') as HTMLElement;
const cacheCount = document.getElementById('cache-count') as HTMLElement;
const cacheEntries = document.getElementById('cache-entries') as HTMLElement;
const cacheOldest = document.getElementById('cache-oldest') as HTMLElement;
const cacheEnabledToggle = document.getElementById('cache-enabled') as HTMLInputElement;
const clearCacheBtn = document.getElementById('clear-cache-btn') as HTMLButtonElement;
const checkApiBtn = document.getElementById('check-api-btn') as HTMLButtonElement;
const toast = document.getElementById('toast') as HTMLElement;
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Usage DOM Elements
const usageTier = document.getElementById('usage-tier') as HTMLElement;
const usageBar = document.getElementById('usage-bar') as HTMLElement;
const usageText = document.getElementById('usage-text') as HTMLElement;
const usageReset = document.getElementById('usage-reset') as HTMLElement;
const upgradeLink = document.getElementById('upgrade-link') as HTMLAnchorElement;

// Licence DOM Elements
const licenceFreeState = document.getElementById('licence-free-state') as HTMLElement;
const licenceProState = document.getElementById('licence-pro-state') as HTMLElement;
const licenceKeyInput = document.getElementById('licence-key-input') as HTMLInputElement;
const activateBtn = document.getElementById('activate-btn') as HTMLButtonElement;
const upgradeBtn = document.getElementById('upgrade-btn') as HTMLButtonElement;
const deactivateBtn = document.getElementById('deactivate-btn') as HTMLButtonElement;
const licenceError = document.getElementById('licence-error') as HTMLElement;
const licenceEmail = document.getElementById('licence-email') as HTMLElement;
const licenceExpires = document.getElementById('licence-expires') as HTMLElement;

/**
 * Show toast notification
 */
function showToast(message: string, isError: boolean = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Update connection status display
 */
async function updateConnectionStatus() {
  statusText.textContent = 'Checking...';
  statusDot.className = 'status-dot';

  // Check if online
  if (!navigator.onLine) {
    statusDot.classList.add('offline');
    statusText.textContent = 'Offline';
    return;
  }

  try {
    const isHealthy = await checkApiHealth();

    if (isHealthy) {
      statusDot.className = 'status-dot'; // Green by default
      statusText.textContent = 'Connected';
    } else {
      statusDot.classList.add('error');
      statusText.textContent = 'API Unavailable';
    }
  } catch {
    statusDot.classList.add('error');
    statusText.textContent = 'Error';
  }
}

/**
 * Update usage display
 */
async function updateUsageDisplay() {
  try {
    const status = await getUsageStatusViaBackground();

    if (!status) {
      usageText.textContent = 'Unable to load usage';
      usageReset.textContent = '';
      return;
    }

    if (status.isUnlimited) {
      // Pro tier
      usageTier.textContent = 'Pro';
      usageTier.classList.add('pro');
      usageBar.style.width = '100%';
      usageBar.classList.remove('warning', 'full');
      usageText.textContent = 'Unlimited lookups';
      usageReset.textContent = '';
      upgradeLink.classList.add('hidden');
      usageText.parentElement?.classList.add('unlimited');
    } else {
      // Free tier
      usageTier.textContent = 'Free';
      usageTier.classList.remove('pro');
      upgradeLink.classList.remove('hidden');
      usageText.parentElement?.classList.remove('unlimited');

      const percentage = (status.used / status.limit) * 100;
      usageBar.style.width = `${percentage}%`;

      // Update bar color based on usage
      usageBar.classList.remove('warning', 'full');
      if (percentage >= 100) {
        usageBar.classList.add('full');
      } else if (percentage >= 70) {
        usageBar.classList.add('warning');
      }

      usageText.textContent = `${status.used}/${status.limit} lookups used`;
      usageReset.textContent = `Resets in ${status.daysUntilReset} day${status.daysUntilReset !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Failed to load usage status:', error);
    usageText.textContent = 'Unable to load usage';
    usageReset.textContent = '';
  }
}

/**
 * Update cache statistics display
 */
async function updateCacheStats() {
  try {
    const stats = await getCacheStats();

    cacheCount.textContent = String(stats.count);
    cacheEntries.textContent = String(stats.count);

    if (stats.oldestTimestamp) {
      const date = new Date(stats.oldestTimestamp);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffHours < 1) {
        cacheOldest.textContent = 'Just now';
      } else if (diffHours < 24) {
        cacheOldest.textContent = `${diffHours}h ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        cacheOldest.textContent = `${diffDays}d ago`;
      }
    } else {
      cacheOldest.textContent = 'N/A';
    }
  } catch {
    cacheCount.textContent = '0';
    cacheEntries.textContent = '0';
    cacheOldest.textContent = 'N/A';
  }
}

/**
 * Load saved settings
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['cacheEnabled']);
    const enabled = result.cacheEnabled !== false; // Default to true
    cacheEnabledToggle.checked = enabled;
    setUseCache(enabled);
  } catch {
    cacheEnabledToggle.checked = true;
  }
}

/**
 * Save settings
 */
async function saveSettings() {
  try {
    await chrome.storage.sync.set({
      cacheEnabled: cacheEnabledToggle.checked,
    });
    setUseCache(cacheEnabledToggle.checked);
    showToast('Settings saved');
  } catch {
    showToast('Failed to save settings', true);
  }
}

/**
 * Handle cache clear
 */
async function handleClearCache() {
  clearCacheBtn.disabled = true;
  clearCacheBtn.textContent = 'Clearing...';

  try {
    await clearAllCache();
    await updateCacheStats();
    showToast('Cache cleared');
  } catch {
    showToast('Failed to clear cache', true);
  } finally {
    clearCacheBtn.disabled = false;
    clearCacheBtn.textContent = 'Clear Cache';
  }
}

/**
 * Handle API test
 */
async function handleApiTest() {
  checkApiBtn.disabled = true;
  checkApiBtn.textContent = 'Testing...';

  try {
    const isHealthy = await checkApiHealth();

    if (isHealthy) {
      showToast('API connection successful');
    } else {
      showToast('API connection failed', true);
    }

    await updateConnectionStatus();
  } catch {
    showToast('API test failed', true);
  } finally {
    checkApiBtn.disabled = false;
    checkApiBtn.textContent = 'Test API Connection';
  }
}

/**
 * Handle tab switching
 */
function handleTabClick(e: Event) {
  const target = e.target as HTMLElement;
  const tabId = target.dataset.tab;

  if (!tabId) return;

  // Update tab buttons
  tabs.forEach(tab => tab.classList.remove('active'));
  target.classList.add('active');

  // Update tab content
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabId}-tab`);
  });
}

/**
 * Validate licence key format
 */
function isValidLicenceFormat(key: string): boolean {
  return /^PS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key.toUpperCase());
}

/**
 * Show licence error message
 */
function showLicenceError(message: string) {
  licenceError.textContent = message;
  licenceError.classList.remove('hidden');
}

/**
 * Hide licence error message
 */
function hideLicenceError() {
  licenceError.classList.add('hidden');
}

/**
 * Update licence UI based on status
 */
function updateLicenceUI(isPro: boolean, licenceData?: { email?: string; expiresAt?: string | null }) {
  if (isPro && licenceData) {
    licenceFreeState.classList.add('hidden');
    licenceProState.classList.remove('hidden');
    licenceEmail.textContent = licenceData.email || '';
    licenceExpires.textContent = licenceData.expiresAt
      ? `Expires: ${new Date(licenceData.expiresAt).toLocaleDateString()}`
      : 'Lifetime licence';
  } else {
    licenceFreeState.classList.remove('hidden');
    licenceProState.classList.add('hidden');
  }
}

/**
 * Load licence status from background
 */
async function loadLicenceStatus() {
  try {
    const response = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_LICENCE_STATUS' }, resolve);
    });

    if (response?.success && response.hasLicence && response.licence) {
      updateLicenceUI(true, response.licence);
    } else {
      updateLicenceUI(false);
    }
  } catch (error) {
    console.error('Failed to load licence status:', error);
    updateLicenceUI(false);
  }
}

/**
 * Handle upgrade button click - open Stripe Checkout
 */
async function handleUpgradeClick() {
  try {
    const response = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_CHECKOUT_URL' }, resolve);
    });

    if (response?.success && response.url) {
      chrome.tabs.create({ url: response.url });
    } else {
      // Fallback URL
      chrome.tabs.create({ url: 'https://planscope.vercel.app/#pricing' });
    }
  } catch {
    chrome.tabs.create({ url: 'https://planscope.vercel.app/#pricing' });
  }
}

/**
 * Handle licence activation
 */
async function handleActivateLicence() {
  const licenceKey = licenceKeyInput.value.trim().toUpperCase();
  hideLicenceError();

  if (!licenceKey) {
    showLicenceError('Please enter a licence key');
    return;
  }

  if (!isValidLicenceFormat(licenceKey)) {
    showLicenceError('Invalid licence key format. Expected: PS-XXXX-XXXX-XXXX-XXXX');
    return;
  }

  activateBtn.disabled = true;
  activateBtn.textContent = 'Validating...';

  try {
    const response = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage({ type: 'VALIDATE_LICENCE', licenceKey }, resolve);
    });

    if (response?.success && response.valid) {
      updateLicenceUI(true, { email: response.email, expiresAt: response.expiresAt });
      await updateUsageDisplay();
      showToast('Pro licence activated!');
      licenceKeyInput.value = '';
    } else {
      showLicenceError(response?.error || 'Invalid licence key');
    }
  } catch (error) {
    console.error('Licence activation error:', error);
    showLicenceError('Failed to validate licence. Please try again.');
  } finally {
    activateBtn.disabled = false;
    activateBtn.textContent = 'Activate';
  }
}

/**
 * Handle licence deactivation
 */
async function handleDeactivateLicence() {
  deactivateBtn.disabled = true;
  deactivateBtn.textContent = 'Deactivating...';

  try {
    const response = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage({ type: 'CLEAR_LICENCE' }, resolve);
    });

    if (response?.success) {
      updateLicenceUI(false);
      await updateUsageDisplay();
      showToast('Licence deactivated');
    } else {
      showToast('Failed to deactivate licence', true);
    }
  } catch (error) {
    console.error('Licence deactivation error:', error);
    showToast('Failed to deactivate licence', true);
  } finally {
    deactivateBtn.disabled = false;
    deactivateBtn.textContent = 'Deactivate Licence';
  }
}

/**
 * Initialize popup
 */
async function init() {
  console.log('PlanScope popup loaded');

  // Setup tab handlers
  tabs.forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });

  // Setup settings handlers
  cacheEnabledToggle.addEventListener('change', saveSettings);
  clearCacheBtn.addEventListener('click', handleClearCache);
  checkApiBtn.addEventListener('click', handleApiTest);

  // Setup licence handlers
  upgradeBtn.addEventListener('click', handleUpgradeClick);
  activateBtn.addEventListener('click', handleActivateLicence);
  deactivateBtn.addEventListener('click', handleDeactivateLicence);

  // Auto-format licence key input
  licenceKeyInput.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Add hyphens automatically
    if (value.length > 2 && !value.startsWith('PS')) {
      value = 'PS' + value.substring(2);
    }

    // Format with hyphens: PS-XXXX-XXXX-XXXX-XXXX
    const parts = [];
    if (value.length >= 2) parts.push(value.substring(0, 2));
    if (value.length > 2) parts.push(value.substring(2, 6));
    if (value.length > 6) parts.push(value.substring(6, 10));
    if (value.length > 10) parts.push(value.substring(10, 14));
    if (value.length > 14) parts.push(value.substring(14, 18));

    input.value = parts.join('-');
    hideLicenceError();
  });

  // Load initial data
  await loadSettings();
  await updateUsageDisplay();
  await updateCacheStats();
  await updateConnectionStatus();
  await loadLicenceStatus();

  // Clear expired cache entries on popup open
  clearExpiredCache().catch(console.error);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
