import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { fetchLinkedInProfile } from "@/lib/linkedin";

const updateSettingsSchema = z.object({
  linkedinUsername: z.string()
    .min(1, 'LinkedIn username is required')
    .max(100, 'LinkedIn username is too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid LinkedIn username format'),
  careerGoal: z.enum(['job', 'internship']),
  industry: z.string().min(1, 'Industry is required'),
  targetRoles: z.array(z.string())
});

export async function PATCH(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await getToken({ req: request as any });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const { linkedinUsername } = validationResult.data;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: token.email as string }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if we need to fetch new LinkedIn data
    let profileData = undefined;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const shouldFetchProfile = 
      linkedinUsername !== user.linkedinUsername || 
      !user.updatedAt || 
      user.updatedAt < oneWeekAgo;

    if (shouldFetchProfile) {
      console.log('Fetching new LinkedIn profile data...');
      profileData = await fetchLinkedInProfile(linkedinUsername);
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: {
        email: token.email as string
      },
      data: {
        linkedinUsername,
        careerGoal: validationResult.data.careerGoal,
        industry: validationResult.data.industry,
        targetRoles: validationResult.data.targetRoles,
        ...(shouldFetchProfile && profileData && !("error" in profileData) && {
          linkedinProfile: profileData,
          updatedAt: new Date()
        })
      },
      select: {
        id: true,
        linkedinUsername: true,
        linkedinProfile: true,
        careerGoal: true,
        industry: true,
        targetRoles: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.flatten() },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}