import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const TIER_MAP = {
  'price_1T5QpRBDFvOSE8HiZmsVAe98': 'maker',
  'price_1T5QpRBDFvOSE8HiRbd8SwoX': 'maker',
  'price_1T5QpRBDFvOSE8HippxeqFJc': 'printlab',
  'price_1T5QpRBDFvOSE8HivlErlEbE': 'printlab',
};

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.base44_user_id;
      const billingInterval = session.metadata?.billing_interval || 'month';
      if (!userId) return Response.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const priceId = subscription.items.data[0]?.price?.id;
      const tier = TIER_MAP[priceId] || 'free';

      await base44.asServiceRole.entities.User.update(userId, {
        subscription_tier: tier,
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
        billing_interval: billingInterval
      });
      console.log(`User ${userId} upgraded to ${tier}`);
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.base44_user_id;
      if (!userId) return Response.json({ received: true });

      const priceId = subscription.items.data[0]?.price?.id;
      const tier = TIER_MAP[priceId] || 'free';
      const status = subscription.status;

      await base44.asServiceRole.entities.User.update(userId, {
        subscription_tier: ['active', 'trialing'].includes(status) ? tier : 'free',
        subscription_status: status,
      });
      console.log(`Subscription updated for user ${userId}: ${tier} / ${status}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.base44_user_id;
      if (!userId) return Response.json({ received: true });

      await base44.asServiceRole.entities.User.update(userId, {
        subscription_tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null
      });
      console.log(`Subscription canceled for user ${userId}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});