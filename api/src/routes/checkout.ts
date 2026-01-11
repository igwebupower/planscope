/**
 * Stripe Checkout routes for PlanScope Pro subscriptions
 */

import { Router, Request, Response } from 'express';
import { stripe, STRIPE_PRICE_ID, FRONTEND_URL } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';

export const checkoutRouter = Router();

/**
 * POST /checkout/create-session
 * Create a Stripe Checkout session for Pro subscription
 */
checkoutRouter.post('/create-session', async (req: Request, res: Response) => {
  if (!stripe) {
    res.status(503).json({ error: 'Payment service not configured' });
    return;
  }

  if (!STRIPE_PRICE_ID) {
    res.status(503).json({ error: 'Price not configured' });
    return;
  }

  try {
    const { email } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancelled`,
      metadata: {
        source: 'planscope_extension',
      },
      subscription_data: {
        metadata: {
          source: 'planscope_extension',
        },
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[Checkout] Create session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /checkout/redirect
 * Redirect to Stripe Checkout (for use from extension)
 */
checkoutRouter.get('/redirect', async (req: Request, res: Response) => {
  if (!stripe) {
    res.redirect(`${FRONTEND_URL}?error=payment_not_configured`);
    return;
  }

  if (!STRIPE_PRICE_ID) {
    res.redirect(`${FRONTEND_URL}?error=price_not_configured`);
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancelled`,
      metadata: {
        source: 'planscope_extension',
      },
      subscription_data: {
        metadata: {
          source: 'planscope_extension',
        },
      },
    });

    res.redirect(303, session.url!);
  } catch (error) {
    console.error('[Checkout] Redirect error:', error);
    res.redirect(`${FRONTEND_URL}?error=checkout_failed`);
  }
});

/**
 * GET /checkout/get-licence
 * Get licence key for a completed checkout session
 */
checkoutRouter.get('/get-licence', async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    res.status(400).json({ error: 'Session ID required' });
    return;
  }

  if (!stripe) {
    res.status(503).json({ error: 'Service not configured' });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: 'Database not configured' });
    return;
  }

  try {
    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      res.status(400).json({ error: 'Payment not completed' });
      return;
    }

    // Look up licence by subscription ID or customer ID
    const { data, error } = await supabase
      .from('licence_keys')
      .select('licence_key, email')
      .or(`stripe_subscription_id.eq.${session.subscription},stripe_customer_id.eq.${session.customer}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Licence might not be created yet (webhook delay)
      res.status(202).json({
        pending: true,
        message: 'Licence is being generated. Please check your email.',
      });
      return;
    }

    res.json({
      licenceKey: data.licence_key,
      email: data.email,
    });
  } catch (error) {
    console.error('[Checkout] Get licence error:', error);
    res.status(500).json({ error: 'Failed to retrieve licence' });
  }
});
