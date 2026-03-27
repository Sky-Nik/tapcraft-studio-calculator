import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { price_id, billing_interval } = await req.json();

    if (!price_id) {
      return Response.json({ error: 'price_id is required' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { base44_user_id: user.id }
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${origin}/?page=Subscription&success=true`,
      cancel_url: `${origin}/?page=Subscription&canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        base44_user_id: user.id,
        billing_interval: billing_interval || 'month'
      },
      subscription_data: {
        metadata: {
          base44_user_id: user.id,
          billing_interval: billing_interval || 'month'
        }
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});