// app/api/campaigns/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { Linkedin } from 'linkedin-api-client';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1),
  targetCompany: z.string().min(1),
});

// Initialize LinkedIn client
const linkedin = new Linkedin({
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
});

async function searchProspects(companyName: string, targetRoles: string[]) {
  const searchParams = {
    keywords: targetRoles.join(' OR '),
    filters: {
      currentCompany: [companyName],
    },
  };

  try {
    const results = await linkedin.search(searchParams);
    return results.map(result => ({
      id: result.publicId,
      name: result.firstName + ' ' + result.lastName,
      position: result.title,
      company: result.company,
      linkedinUrl: `https://www.linkedin.com/in/${result.publicId}`,
      status: 'pending_validation'
    }));
  } catch (error) {
    console.error('Error searching prospects:', error);
    return [];
  }
}

async function validateProspect(prospect: any) {
  // Implement prospect validation logic
  // Example: Check if they match certain criteria
  return {
    isValid: true,
    reason: 'Meets target role criteria'
  };
}

async function sendConnectionRequest(prospect: any) {
  try {
    const success = await linkedin.addConnection(
      prospect.id,
      'I noticed your work at ' + prospect.company + ' and would love to connect!'
    );
    return !success; // API returns true for error
  } catch (error) {
    console.error('Error sending connection:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = campaignSchema.parse(body);

    // Get user's target roles
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { targetRoles: true }
    });

    if (!user?.targetRoles?.length) {
      return NextResponse.json(
        { error: 'Please set your target roles in profile settings' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        targetCompany: validatedData.targetCompany,
        status: 'active',
        userId: session.user.id
      }
    });

    // Search for prospects
    const prospects = await searchProspects(
      validatedData.targetCompany,
      user.targetRoles
    );

    // Add prospects to campaign
    await prisma.prospect.createMany({
      data: prospects.map(prospect => ({
        ...prospect,
        campaignId: campaign.id
      }))
    });

    return NextResponse.json(campaign);

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}