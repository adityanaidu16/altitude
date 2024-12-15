// app/api/create-subscription/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PlanType } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    
    const validPlan = plan.toUpperCase() as PlanType;
    if (!['FREE', 'PLUS'].includes(validPlan)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const planEndDate = validPlan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plan: validPlan,
        planStartDate: new Date(),
        planEndDate,
      },
    });

    // Create initial monthly usage record
    const now = new Date();
    await prisma.monthlyUsage.create({
      data: {
        userId: user.id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        plan: validPlan,
      },
    });

    return NextResponse.json({ success: true, plan: validPlan });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}