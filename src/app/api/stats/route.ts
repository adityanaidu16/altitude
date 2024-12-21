// app/api/stats/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        campaigns: {
          include: {
            prospects: true
          }
        }
      }
    });

    const stats = {
      totalCampaigns: user?.campaigns.length || 0,
      totalProspects: user?.campaigns.reduce((acc, campaign) => 
        acc + campaign.prospects.length, 0) || 0,
      responsesReceived: user?.campaigns.reduce((acc, campaign) => 
        acc + campaign.prospects.filter(p => p.status === 'MESSAGE_SENT').length, 0) || 0,
      totalLeads: user?.campaigns.reduce((acc, campaign) => 
        acc + campaign.prospects.length, 0) || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}