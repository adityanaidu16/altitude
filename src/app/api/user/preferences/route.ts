// app/api/user/preferences/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchLinkedInProfile } from '@/lib/linkedin';

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
    let linkedinProfile = null;
    if (preferences.linkedinUsername) {
      console.log('Fetching LinkedIn profile for:', preferences.linkedinUsername);
      linkedinProfile = await fetchLinkedInProfile(preferences.linkedinUsername);
      
      // Log the full profile data for debugging
      console.log('LinkedIn profile response:', JSON.stringify(linkedinProfile, null, 2));

      // Only consider it a failure if we got null AND we needed the profile
      if (!linkedinProfile && preferences.linkedinUsername) {
        console.log('Failed to fetch LinkedIn profile - continuing with other updates');
      }
    }

    // Prepare update data, only including linkedinProfile if it exists
    const updateData = {
      careerGoal: preferences.careerGoal,
      industry: preferences.industry,
      targetRoles: preferences.targetRoles,
      linkedinUsername: preferences.linkedinUsername,
      updatedAt: new Date()
    };

    // Only add linkedinProfile to updateData if it exists and isn't null
    if (linkedinProfile && Object.keys(linkedinProfile).length > 0) {
      updateData['linkedinProfile'] = linkedinProfile;
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