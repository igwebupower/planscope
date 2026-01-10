/**
 * PlanScope Popup Script
 * Handles settings, cache management, and status display
 */

import { checkApiHealth, setUseCache } from '../services/api';
import { getCacheStats, clearAllCache, clearExpiredCache } from '../services/cache';

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
  await updateCacheStats();
  await updateConnectionStatus();

  // Clear expired cache entries on popup open
  clearExpiredCache().catch(console.error);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
