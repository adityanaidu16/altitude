// app/api/campaigns/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { CampaignStatus } from '@prisma/client';

// Helper function to extract campaign ID from URL pattern
function extractCampaignId(request: Request): string {
  const urlParts = new URL(request.url).pathname.split('/');
  return urlParts[urlParts.length - 1];
}

// GET - Fetch single campaign
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignId = extractCampaignId(request);
    
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId: session.user.id
      },
      include: {
        prospects: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PATCH - Update campaign
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignId = extractCampaignId(request);
    const body = await request.json();
    const { status, messageTemplate, autoApprove } = body;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId: session.user.id
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: status as CampaignStatus,
        messageTemplate,
        autoApprove,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignId = extractCampaignId(request);

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId: session.user.id
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.prospect.deleteMany({
        where: { campaignId }
      }),
      prisma.campaign.delete({
        where: { id: campaignId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}