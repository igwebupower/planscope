/**
 * Usage tracking service for PlanScope
 * Manages monthly lookup limits and subscription tiers
 */

import { track } from './analytics';

// Subscription tier types
export type SubscriptionTier = 'free' | 'pro';

// Usage data stored in chrome.storage.sync
export interface UsageData {
  monthlyLookups: number;
  resetDate: string; // ISO date string
  tier: SubscriptionTier;
}

// Usage limits per tier
const USAGE_LIMITS: Record<SubscriptionTier, number> = {
  free: 10,
  pro: Infinity,
};

// Reset period in days
const RESET_PERIOD_DAYS = 30;

// Storage key
const STORAGE_KEY = 'planscope_usage';

/**
 * Get default usage data for new users
 */
function getDefaultUsageData(): UsageData {
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() + RESET_PERIOD_DAYS);

  return {
    monthlyLookups: 0,
    resetDate: resetDate.toISOString(),
    tier: 'free',
  };
}

/**
 * Get current usage data from storage
 */
export async function getUsageData(): Promise<UsageData> {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const data = result[STORAGE_KEY] as UsageData | undefined;

  if (!data) {
    // Initialize for new users
    const defaultData = getDefaultUsageData();
    await chrome.storage.sync.set({ [STORAGE_KEY]: defaultData });
    return defaultData;
  }

  return data;
}

/**
 * Check if reset date has passed and reset if needed
 */
export async function checkAndResetMonthly(): Promise<UsageData> {
  const data = await getUsageData();
  const now = new Date();
  const resetDate = new Date(data.resetDate);

  if (now >= resetDate) {
    // Reset the counter
    const newResetDate = new Date();
    newResetDate.setDate(newResetDate.getDate() + RESET_PERIOD_DAYS);

    const updatedData: UsageData = {
      ...data,
      monthlyLookups: 0,
      resetDate: newResetDate.toISOString(),
    };

    await chrome.storage.sync.set({ [STORAGE_KEY]: updatedData });
    console.log('[PlanScope Usage] Monthly counter reset');
    return updatedData;
  }

  return data;
}

/**
 * Check if user can perform a lookup (under limit)
 */
export async function canPerformLookup(): Promise<boolean> {
  const data = await checkAndResetMonthly();
  const limit = USAGE_LIMITS[data.tier];

  return data.monthlyLookups < limit;
}

/**
 * Increment the lookup counter
 */
export async function incrementLookup(): Promise<UsageData> {
  const data = await checkAndResetMonthly();

  const updatedData: UsageData = {
    ...data,
    monthlyLookups: data.monthlyLookups + 1,
  };

  await chrome.storage.sync.set({ [STORAGE_KEY]: updatedData });
  console.log('[PlanScope Usage] Lookup count:', updatedData.monthlyLookups);

  // Track analytics
  track('lookup_completed', { tier: data.tier, count: updatedData.monthlyLookups });

  return updatedData;
}

/**
 * Get remaining lookups for display
 */
export async function getRemainingLookups(): Promise<{ remaining: number; limit: number; isUnlimited: boolean }> {
  const data = await checkAndResetMonthly();
  const limit = USAGE_LIMITS[data.tier];
  const isUnlimited = limit === Infinity;

  return {
    remaining: isUnlimited ? Infinity : Math.max(0, limit - data.monthlyLookups),
    limit: isUnlimited ? Infinity : limit,
    isUnlimited,
  };
}

/**
 * Get days until reset
 */
export async function getDaysUntilReset(): Promise<number> {
  const data = await getUsageData();
  const now = new Date();
  const resetDate = new Date(data.resetDate);

  const diffMs = resetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Set subscription tier (for future Stripe integration)
 */
export async function setTier(tier: SubscriptionTier): Promise<UsageData> {
  const data = await getUsageData();

  const updatedData: UsageData = {
    ...data,
    tier,
  };

  await chrome.storage.sync.set({ [STORAGE_KEY]: updatedData });
  console.log('[PlanScope Usage] Tier updated to:', tier);

  return updatedData;
}

/**
 * Get full usage status for UI display
 */
export async function getUsageStatus(): Promise<{
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  tier: SubscriptionTier;
  daysUntilReset: number;
  resetDate: string;
}> {
  const data = await checkAndResetMonthly();
  const limit = USAGE_LIMITS[data.tier];
  const isUnlimited = limit === Infinity;

  const now = new Date();
  const resetDate = new Date(data.resetDate);
  const diffMs = resetDate.getTime() - now.getTime();
  const daysUntilReset = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    used: data.monthlyLookups,
    limit: isUnlimited ? Infinity : limit,
    remaining: isUnlimited ? Infinity : Math.max(0, limit - data.monthlyLookups),
    isUnlimited,
    tier: data.tier,
    daysUntilReset,
    resetDate: data.resetDate,
  };
}

/**
 * Reset usage data (for testing/debugging)
 */
export async function resetUsageData(): Promise<UsageData> {
  const defaultData = getDefaultUsageData();
  await chrome.storage.sync.set({ [STORAGE_KEY]: defaultData });
  console.log('[PlanScope Usage] Usage data reset');
  return defaultData;
}
