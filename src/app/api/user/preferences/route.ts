// app/api/user/preferences/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      console.log('Preferences update - Session:', session);
      
      if (!session?.user?.email) {
        console.log('No session or email found');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
  
      // Log the user lookup attempt
      console.log('Looking up user with email:', session.user.email);
  
      const existingUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
  
      if (!existingUser) {
        console.log('User not found in database:', session.user.email);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
  
      const preferences = await req.json();
      console.log('Updating preferences:', preferences);
  
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          careerGoal: preferences.careerGoal,
          industry: preferences.industry,
          targetRoles: preferences.targetRoles,
          linkedinUsername: preferences.linkedinUsername,
        },
      });
  
      console.log('User updated successfully:', updatedUser);
  
      return NextResponse.json({ success: true, user: updatedUser });
  
    } catch (error) {
      console.error('Error in preferences update:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update preferences' },
        { status: 500 }
      );
    }
  }