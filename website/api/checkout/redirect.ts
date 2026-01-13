import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe, STRIPE_PRICE_ID, FRONTEND_URL } from '../_lib/stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.redirect(302, `${FRONTEND_URL}?error=payment_not_configured`);
  }

  if (!STRIPE_PRICE_ID) {
    return res.redirect(302, `${FRONTEND_URL}?error=price_not_configured`);
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
        source: 'planscope_website',
      },
      subscription_data: {
        metadata: {
          source: 'planscope_website',
        },
      },
    });

    return res.redirect(303, session.url!);
  } catch (error) {
    console.error('[Checkout] Redirect error:', error);
    return res.redirect(302, `${FRONTEND_URL}?error=checkout_failed`);
  }
}
