/**
 * Stripe client for payment processing
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('[PlanScope API] Stripe secret key not configured');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
  : null;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'https://planscope.vercel.app';
