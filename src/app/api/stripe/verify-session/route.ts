// app/api/stripe/verify-session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is already upgraded
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (currentUser && !currentUser.needs_subscription) {
      return NextResponse.json({
        success: true,
        user: {
          plan: currentUser.plan,
          needs_subscription: false
        }
      });
    }

    const { sessionId } = await req.json();

    try {
      // Retrieve the Stripe session
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

      if (stripeSession.payment_status === 'paid') {
        // Update user in database
        const updatedUser = await prisma.user.update({
          where: { email: session.user.email },
          data: {
            plan: PlanType.PLUS,
            needs_subscription: false,
            stripeCustomerId: stripeSession.customer as string,
            stripeSubscriptionId: stripeSession.subscription as string,
            planStartDate: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          user: {
            plan: updatedUser.plan,
            needs_subscription: false
          }
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        status: stripeSession.payment_status
      });

    } catch (stripeError: any) {
      // Handle rate limiting
      if (stripeError.statusCode === 429) {
        return NextResponse.json({
          success: false,
          error: 'Too many requests',
          retryAfter: stripeError.headers?.['retry-after'] || 5
        }, { status: 429 });
      }

      throw stripeError;
    }
  } catch (error) {
    console.error('Stripe verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Payment verification failed'
    }, { status: 500 });
  }
}