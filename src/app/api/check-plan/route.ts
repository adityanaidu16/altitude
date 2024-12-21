// app/api/check-plan/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if plan needs to be downgraded
    if (user.pendingDowngrade && user.planEndDate && new Date() >= user.planEndDate) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: PlanType.FREE,
          pendingDowngrade: false,
          planEndDate: null,
          stripeSubscriptionId: null
        }
      });

      return NextResponse.json({
        updated: true,
        plan: updatedUser.plan
      });
    }

    return NextResponse.json({
      updated: false,
      plan: user.plan
    });

  } catch (error) {
    console.error('Error checking plan status:', error);
    return NextResponse.json(
      { error: 'Failed to check plan status' },
      { status: 500 }
    );
  }
}