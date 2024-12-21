// app/api/prospects/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { linkedInService } from '@/lib/services/linkedin';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { ProspectStatus } from '@prisma/client';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const messageSchema = z.object({
  message: z.string().min(1).max(300)
});

// Helper function to extract prospect ID from URL pattern
function extractProspectId(request: Request): string {
  const urlParts = new URL(request.url).pathname.split('/');
  return urlParts[urlParts.length - 1];
}

// PATCH - Update prospect
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prospectId = extractProspectId(request);
    const body = await request.json();
    
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      include: { campaign: true }
    });

    if (!prospect || prospect.campaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    const updatedProspect = await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        status: body.status as ProspectStatus,
        message: body.message,
        validationData: body.validationData,
        nextActionAt: body.nextActionAt,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedProspect);
  } catch (error) {
    console.error('Error updating prospect:', error);
    return NextResponse.json(
      { error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}

// POST - Perform prospect actions
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prospectId = extractProspectId(request);
    const { action, data } = await request.json();
    
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      include: { campaign: true }
    });

    if (!prospect || prospect.campaign.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'approve':
        // Rate limit check for connection requests
        const { success } = await rateLimit(
          `connect_${session.user.id}`,
          'connection_request',
          { interval: 86400, limit: 100 }
        );
        
        if (!success) {
          return NextResponse.json(
            { error: 'Connection rate limit exceeded' },
            { status: 429 }
          );
        }

        // Send connection request
        const connected = await linkedInService.sendConnectionRequest(
          session.user.id,
          prospect.publicId,
          prospect.campaign.messageTemplate || ''
        );

        if (connected) {
          await prisma.prospect.update({
            where: { id: prospectId },
            data: {
              status: ProspectStatus.CONNECTION_SENT,
              nextActionAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          });
        }
        break;

      case 'message':
        const validatedMessage = messageSchema.parse(data);
        
        const messageSent = await linkedInService.sendMessage(
          session.user.id,
          prospect.connectionId!,
          validatedMessage.message
        );

        if (messageSent) {
          await prisma.prospect.update({
            where: { id: prospectId },
            data: {
              status: ProspectStatus.MESSAGE_SENT,
              message: { text: validatedMessage.message }
            }
          });
        }
        break;

      case 'reject':
        await prisma.prospect.update({
          where: { id: prospectId },
          data: {
            status: ProspectStatus.VALIDATION_FAILED
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedProspect = await prisma.prospect.findUnique({
      where: { id: prospectId }
    });

    return NextResponse.json(updatedProspect);
  } catch (error) {
    console.error('Error performing prospect action:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}