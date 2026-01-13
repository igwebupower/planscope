import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe, STRIPE_PRICE_ID, FRONTEND_URL } from '../_lib/stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }

  if (!STRIPE_PRICE_ID) {
    return res.status(503).json({ error: 'Price not configured' });
  }

  try {
    const { email } = req.body || {};

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
        source: 'planscope_website',
      },
      subscription_data: {
        metadata: {
          source: 'planscope_website',
        },
      },
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[Checkout] Create session error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
