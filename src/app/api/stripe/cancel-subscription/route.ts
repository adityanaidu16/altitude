// app/api/stripe/cancel-subscription/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Cancel at period end to allow usage until the end of current billing period
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update user record - maintain current plan until end date
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Don't change the current plan yet
        pendingDowngrade: true,
        planEndDate: new Date(subscription.current_period_end * 1000),
        needs_subscription: false,
      },
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      cancelDate: new Date(subscription.current_period_end * 1000)
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}