// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a subscription
    if (user.stripeCustomerId) {
      // Get existing subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
      });

      // Cancel existing subscription if any
      if (subscriptions.data.length > 0) {
        await Promise.all(
          subscriptions.data.map(sub => 
            stripe.subscriptions.cancel(sub.id)
          )
        );
      }
    }

    // Create or get customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auth/signup`,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    if (!stripeSession.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}