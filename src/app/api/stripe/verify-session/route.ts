// app/api/stripe/verify-session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const PLAN_PRICE_MAP = {
  'price_1QUb8nRssdqzvr6AS6dtV3I5': PlanType.PLUS,
  'price_1QXWpzRssdqzvr6AD9HvQdKI': PlanType.PRO
};

export async function POST(req: Request) {
  try {
    console.log('Starting session verification...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { sessionId } = await req.json();
    console.log('Verifying session:', sessionId);

    // Get Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session status:', stripeSession.payment_status);

    if (stripeSession.payment_status === 'paid') {
      console.log('Payment is paid');

      // Get subscription
      const subscription = await stripe.subscriptions.retrieve(
        stripeSession.subscription as string
      );
      console.log('Found subscription:', subscription.id);

      // Get price ID from subscription
      const priceId = subscription.items.data[0].price.id;
      console.log('Price ID:', priceId);

      if (!PLAN_PRICE_MAP[priceId as keyof typeof PLAN_PRICE_MAP]) {
        throw new Error('Invalid price ID');
      }

      // Get plan type
      const planType = PLAN_PRICE_MAP[priceId as keyof typeof PLAN_PRICE_MAP];
      console.log('Plan type:', planType);

      // Update user
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          plan: planType,
          needs_subscription: false,
          stripeCustomerId: stripeSession.customer as string,
          stripeSubscriptionId: subscription.id,
          planStartDate: new Date(),
        },
      });

      console.log('Updated user:', user.id, 'to plan:', planType);

      return NextResponse.json({
        success: true,
        user: {
          plan: planType,
          needs_subscription: false
        }
      });
    }

    console.log('Payment not completed');
    return NextResponse.json({
      success: false,
      error: 'Payment not completed',
      status: stripeSession.payment_status
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}