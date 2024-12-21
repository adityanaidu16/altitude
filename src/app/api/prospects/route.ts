// app/api/prospects/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { ProspectStatus } from '@prisma/client';
import { z } from 'zod';

const prospectSchema = z.object({
  name: z.string(),
  position: z.string(),
  company: z.string(),
  linkedinUrl: z.string().url(),
  publicId: z.string(),
  campaignId: z.string()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received prospect creation request:', body);

    // Validate request data
    const validatedData = prospectSchema.parse(body);

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: validatedData.campaignId,
        userId: session.user.id
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the prospect
    const prospect = await prisma.prospect.create({
      data: {
        name: validatedData.name,
        position: validatedData.position,
        company: validatedData.company,
        linkedinUrl: validatedData.linkedinUrl,
        publicId: validatedData.publicId,
        campaignId: validatedData.campaignId,
        status: ProspectStatus.PENDING_VALIDATION,
      }
    });

    console.log('Created prospect:', prospect);
    return NextResponse.json(prospect);

  } catch (error) {
    console.error('Error creating prospect:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create prospect' },
      { status: 500 }
    );
  }
}