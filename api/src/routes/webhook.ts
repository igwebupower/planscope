/**
 * Stripe webhook handler for payment events
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';
import { generateLicenceKey } from '../lib/licence-generator.js';

export const webhookRouter = Router();

/**
 * POST /webhook/stripe
 * Handle Stripe webhook events
 */
webhookRouter.post('/stripe', async (req: Request, res: Response) => {
  if (!stripe) {
    console.error('[Webhook] Stripe not configured');
    res.status(503).json({ error: 'Service not configured' });
    return;
  }

  if (!supabase) {
    console.error('[Webhook] Supabase not configured');
    res.status(503).json({ error: 'Service not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Signature verification failed:', message);
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  console.log('[Webhook] Received event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle successful checkout - generate and store licence key
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Processing checkout.session.completed');

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Generate unique licence key
  let licenceKey = generateLicenceKey();
  let attempts = 0;
  const maxAttempts = 5;

  // Ensure uniqueness
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('licence_keys')
      .select('licence_key')
      .eq('licence_key', licenceKey)
      .single();

    if (!existing) break;

    licenceKey = generateLicenceKey();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique licence key');
  }

  // Store licence in database
  const { error } = await supabase.from('licence_keys').insert({
    licence_key: licenceKey,
    email: session.customer_email || session.customer_details?.email || '',
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string || null,
    is_active: true,
    expires_at: null, // Subscription managed by Stripe
  });

  if (error) {
    console.error('[Webhook] Failed to store licence:', error);
    throw error;
  }

  console.log(`[Webhook] Licence key created: ${licenceKey} for ${session.customer_email}`);

  // Note: Stripe will send receipt email automatically
  // The licence key can be shown on the success page by querying the session
}

/**
 * Handle subscription cancellation - deactivate licence
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing customer.subscription.deleted');

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('licence_keys')
    .update({ is_active: false })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('[Webhook] Failed to deactivate licence:', error);
    throw error;
  }

  console.log(`[Webhook] Licence deactivated for subscription: ${subscription.id}`);
}

/**
 * Handle subscription updates (e.g., payment failed, renewed)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing customer.subscription.updated');

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Reactivate if subscription becomes active again
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  const { error } = await supabase
    .from('licence_keys')
    .update({ is_active: isActive })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('[Webhook] Failed to update licence status:', error);
    throw error;
  }

  console.log(`[Webhook] Licence status updated to ${isActive} for subscription: ${subscription.id}`);
}
