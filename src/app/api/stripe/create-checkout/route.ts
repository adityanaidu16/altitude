// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { stripe } from '@/lib/stripe';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Define price ID - should match your Stripe product
const PRICE_ID = 'price_1QUb8nRssdqzvr6AS6dtV3I5'; // Replace with your actual price ID

export async function POST(req: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID, // Use the defined price ID
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auth/signup`,
      customer_email: session.user.email,
      metadata: {
        userId: user.id,
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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}