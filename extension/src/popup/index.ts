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

  // Load initial data
  await loadSettings();
  await updateUsageDisplay();
  await updateCacheStats();
  await updateConnectionStatus();

  // Clear expired cache entries on popup open
  clearExpiredCache().catch(console.error);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
