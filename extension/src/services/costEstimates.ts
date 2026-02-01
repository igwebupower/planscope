import type { CostEstimate } from '../types';
import { UK_PLANNING_FEES, PROFESSIONAL_FEE_ESTIMATES } from '../types/enhanced';

/**
 * Get cost estimates for common application types
 */
export function getCostEstimates(): CostEstimate[] {
  const estimates: CostEstimate[] = [];

  // Extension
  estimates.push(createEstimate('EXTENSION'));

  // Loft Conversion
  estimates.push(createEstimate('LOFT_CONVERSION'));

  // New Build
  estimates.push(createEstimate('NEW_BUILD'));

  // Change of Use
  estimates.push(createEstimate('CHANGE_OF_USE'));

  return estimates;
}

/**
 * Get cost estimate for a specific application type
 */
export function getCostEstimateForType(applicationType: string): CostEstimate | null {
  const normalizedType = normalizeType(applicationType);

  if (!UK_PLANNING_FEES[normalizedType]) {
    return null;
  }

  return createEstimate(normalizedType);
}

/**
 * Create a cost estimate for a given type
 */
function createEstimate(type: string): CostEstimate {
  const feeData = UK_PLANNING_FEES[type] || UK_PLANNING_FEES['OTHER'];
  const profFees = PROFESSIONAL_FEE_ESTIMATES[type] || PROFESSIONAL_FEE_ESTIMATES['OTHER'];

  // Use householder fee if available, otherwise full fee
  const planningFee = feeData.householder || feeData.full || 258;

  return {
    applicationType: type,
    displayName: feeData.displayName,
    planningFee,
    professionalFees: {
      min: profFees.min,
      max: profFees.max,
    },
    totalEstimate: {
      min: planningFee + profFees.min,
      max: planningFee + profFees.max,
    },
  };
}

/**
 * Normalize application type string to match our keys
 */
function normalizeType(type: string): string {
  const typeMap: Record<string, string> = {
    extension: 'EXTENSION',
    extensions: 'EXTENSION',
    loft: 'LOFT_CONVERSION',
    'loft conversion': 'LOFT_CONVERSION',
    'loft_conversion': 'LOFT_CONVERSION',
    'new build': 'NEW_BUILD',
    new_build: 'NEW_BUILD',
    newbuild: 'NEW_BUILD',
    'change of use': 'CHANGE_OF_USE',
    change_of_use: 'CHANGE_OF_USE',
    changeofuse: 'CHANGE_OF_USE',
  };

  const normalized = type.toLowerCase().trim();
  return typeMap[normalized] || type.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`;
}

/**
 * Format currency range for display
 */
export function formatCurrencyRange(min: number, max: number): string {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}
