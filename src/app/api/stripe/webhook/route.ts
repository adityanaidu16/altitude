// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processSubscriptionChange(subscription: any) {
  console.log('Processing subscription change:', subscription.id);
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!user) {
    console.log('No user found for subscription:', subscription.id);
    return;
  }

  const now = new Date();
  const endDate = new Date(subscription.current_period_end * 1000);
  
  // Check if subscription has ended or is cancelled and the period has ended
  const hasEnded = subscription.status === 'canceled' ||
    (subscription.cancel_at_period_end && now >= endDate);

  console.log('Subscription status:', {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: endDate,
    hasEnded
  });

  if (hasEnded) {
    console.log(`Downgrading user ${user.id} to FREE plan`);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: PlanType.FREE,
        pendingDowngrade: false,
        planEndDate: null,
        stripeSubscriptionId: null
      }
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaid(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!user) return;

  // Update the user's subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      planEndDate: new Date(subscription.current_period_end * 1000),
      // Reset pendingDowngrade if payment was successful
      pendingDowngrade: false
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoiceFailed(invoice: any) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer }
  });

  if (!user) return;

  // You might want to notify the user or take other actions
  console.log(`Payment failed for user ${user.id}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = (await headersList).get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Received webhook event:', event.type);
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json(
        { error: `Webhook verification failed: ${(err as Error).message}` },
        { status: 400 }
      );
    }

    // Handle various subscription and billing events
    switch (event.type) {
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        await processSubscriptionChange(event.data.object);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        // Handle trial ending soon
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}