import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../_lib/stripe';
import { supabase } from '../_lib/supabase';
import { generateLicenceKey } from '../_lib/licence-generator';
import Stripe from 'stripe';

// Disable body parsing - we need raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] Webhook secret not configured');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid' && session.customer && session.subscription) {
          // Generate a new licence key
          const licenceKey = generateLicenceKey();

          // Get customer email
          const customer = await stripe.customers.retrieve(session.customer as string);
          const email = 'email' in customer ? customer.email : session.customer_email;

          // Store in database
          const { error } = await supabase
            .from('licence_keys')
            .insert({
              licence_key: licenceKey,
              email: email || 'unknown',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              is_active: true,
              created_at: new Date().toISOString(),
            });

          if (error) {
            console.error('[Webhook] Failed to create licence:', error);
          } else {
            console.log('[Webhook] Created licence for:', email);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Deactivate the licence
        const { error } = await supabase
          .from('licence_keys')
          .update({ is_active: false })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('[Webhook] Failed to deactivate licence:', error);
        } else {
          console.log('[Webhook] Deactivated licence for subscription:', subscription.id);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update licence status based on subscription status
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        const { error } = await supabase
          .from('licence_keys')
          .update({ is_active: isActive })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('[Webhook] Failed to update licence:', error);
        }
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
