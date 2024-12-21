// app/api/user/preferences/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { fetchLinkedInProfile } from '@/lib/linkedin';
import type { Prisma } from '@prisma/client';

// Interface matching Prisma's expected JSON structure
type LinkedInProfile = {
  basic_info?: {
    name: string;
    industry?: string;
    location?: string;
    headline?: string;
    email?: string;
  };
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    location?: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
  }>;
  skills?: string[];
  honors?: Array<{
    title: string;
    issuer?: string;
    year?: number;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Add index signature for Prisma JSON compatibility
};

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
    console.log('Received preferences:', preferences);

    // Fetch LinkedIn profile data if username is provided
    let linkedinProfile: LinkedInProfile | null = null;
    if (preferences.linkedinUsername) {
      console.log('Fetching LinkedIn profile for:', preferences.linkedinUsername);
      linkedinProfile = await fetchLinkedInProfile(preferences.linkedinUsername);
      console.log('LinkedIn profile response:', JSON.stringify(linkedinProfile, null, 2));

      if (!linkedinProfile && preferences.linkedinUsername) {
        console.log('Failed to fetch LinkedIn profile - continuing with other updates');
      }
    }

    // Prepare the update data using Prisma's types
    const updateData: Prisma.UserUpdateInput = {
      careerGoal: preferences.careerGoal,
      industry: preferences.industry,
      targetRoles: preferences.targetRoles,
      linkedinUsername: preferences.linkedinUsername,
      updatedAt: new Date()
    };

    // Add linkedinProfile to updateData if it exists and isn't empty
    if (linkedinProfile && Object.keys(linkedinProfile).length > 0) {
      updateData.linkedinProfile = linkedinProfile as Prisma.InputJsonValue;
    }

    console.log('Updating user with data:', JSON.stringify(updateData, null, 2));

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in preferences update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update preferences' },
      { status: 500 }
    );
  }
}