// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { type WebhookEvent } from '@stripe/stripe-js';

// Raw body parser config
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    
    // Get raw headers 
    const rawHeaders = req.headers;
    const signature = rawHeaders.get('stripe-signature');

    if (!signature) {
      console.error('⚠️ No Stripe signature found');
      return new Response('No signature found', { status: 400 });
    }

    let event: WebhookEvent;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      ) as WebhookEvent;
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({
          error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Webhook verified: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      try {
        // Validate required fields
        if (!session.metadata?.userId) {
          throw new Error('Missing user ID in session metadata');
        }

        // Get subscription details
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          throw new Error('Missing subscription ID in session');
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update user subscription status
        await prisma.user.update({
          where: {
            id: session.metadata.userId,
          },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            plan: PlanType.PLUS,
            planStartDate: new Date(),
            needs_subscription: false,
          },
        });

        console.log(`✅ User ${session.metadata.userId} upgraded to Plus plan`);
        
        return new Response(
          JSON.stringify({ success: true, userId: session.metadata.userId }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        console.error('❌ Error processing subscription:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process subscription' }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Handle other events
    return new Response(
      JSON.stringify({ received: true, type: event.type }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}