// app/api/campaigns/[id]/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { CampaignStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract id and action from URL
    const urlParts = req.url.split('/');
    const id = urlParts[urlParts.length - 2];
    const action = urlParts[urlParts.length - 1];

    // Verify campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    let newStatus: CampaignStatus;
    // Determine new status based on action
    switch (action.toLowerCase()) {
      case 'pause':
        newStatus = 'PAUSED';
        break;
      case 'resume':
        newStatus = 'ACTIVE';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date()
      },
      include: {
        prospects: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Calculate stats for response
    const stats = {
      total: updatedCampaign.prospects.length,
      pending: updatedCampaign.prospects.filter(p => p.status === 'PENDING_VALIDATION').length,
      connected: updatedCampaign.prospects.filter(p => p.status === 'CONNECTION_ACCEPTED').length,
      messaged: updatedCampaign.prospects.filter(p => p.status === 'MESSAGE_SENT').length
    };

    return NextResponse.json({
      ...updatedCampaign,
      stats
    });

  } catch (error) {
    const urlParts = req.url.split('/');
    const action = urlParts[urlParts.length - 1];
    console.error(`Error ${action}ing campaign:`, error);
    return NextResponse.json(
      { error: `Failed to ${action} campaign` },
      { status: 500 }
    );
  }
}