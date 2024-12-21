// app/api/campaigns/[id]/[action]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CampaignStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, action } = params;

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
    console.error(`Error ${params.action}ing campaign:`, error);
    return NextResponse.json(
      { error: `Failed to ${params.action} campaign` },
      { status: 500 }
    );
  }
}