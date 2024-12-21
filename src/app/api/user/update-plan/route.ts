// app/api/user/update-plan/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { PlanType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plan, needs_subscription } = await req.json();
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    // First get the current user data
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        careerGoal: true,
        industry: true,
        targetRoles: true
      }
    });

    // Update user while preserving existing fields
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plan: plan as PlanType,
        needs_subscription: needs_subscription ?? false,
        planStartDate: new Date(),
        // Preserve existing fields
        careerGoal: currentUser?.careerGoal,
        industry: currentUser?.industry,
        targetRoles: currentUser?.targetRoles
      },
      select: {
        id: true,
        email: true,
        plan: true,
        needs_subscription: true,
        careerGoal: true,
        industry: true,
        targetRoles: true
      }
    });

    // Add logging to debug session data
    console.log('Updated user data:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}