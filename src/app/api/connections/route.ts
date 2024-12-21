// app/api/connections/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/auth';
import { ProspectStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospectId, type, message } = await req.json();

    // Get prospect and verify ownership
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      include: { campaign: true }
    });

    if (!prospect || prospect.campaign.userId !== session.user.id) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    switch (type) {
      case 'connect':
        const updatedProspect = await prisma.prospect.update({
          where: { id: prospectId },
          data: {
            status: ProspectStatus.CONNECTION_SENT,
            updatedAt: new Date(),
            nextActionAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Check back in 7 days
            notes: `Connection request initiated at ${new Date().toISOString()}`
          }
        });
        
        return NextResponse.json({
          success: true,
          prospect: updatedProspect,
          manualAction: {
            type: 'connect',
            url: `https://www.linkedin.com/in/${prospect.publicId}`,
            instructions: 'Open LinkedIn profile and send connection request'
          }
        });

      case 'message':
        if (!message) {
          return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const messageUpdatedProspect = await prisma.prospect.update({
          where: { id: prospectId },
          data: {
            status: ProspectStatus.MESSAGE_SENT,
            message: { text: message },
            updatedAt: new Date(),
            nextActionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Check back in 3 days
            notes: `Message sent at ${new Date().toISOString()}`
          }
        });

        return NextResponse.json({
          success: true,
          prospect: messageUpdatedProspect,
          manualAction: {
            type: 'message',
            url: `https://www.linkedin.com/messaging/compose?recipient=${prospect.publicId}`,
            instructions: 'Open LinkedIn messages to send your message'
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in connection action:', error);
    return NextResponse.json(
      { error: 'Failed to process connection action' },
      { status: 500 }
    );
  }
}