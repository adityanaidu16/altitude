// app/api/prospects/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ProspectStatus } from '@prisma/client';

const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING_VALIDATION',
    'VALIDATION_FAILED',
    'CONNECTION_PENDING',
    'CONNECTION_SENT',
    'CONNECTION_ACCEPTED',
    'MESSAGE_QUEUED',
    'MESSAGE_SENT',
    'COMPLETED',
    'FAILED'
  ] as const)
});

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request as any });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid status',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const { status } = validationResult.data;

    // First find the prospect and verify campaign ownership
    const prospect = await prisma.prospect.findUnique({
      where: { id: params.id },
      include: {
        campaign: true
      }
    });

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    // Verify campaign ownership
    if (prospect.campaign.userId !== token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the prospect
    const updatedProspect = await prisma.prospect.update({
      where: { id: params.id },
      data: { 
        status: status as ProspectStatus,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedProspect);
    
  } catch (error) {
    console.error('Error updating prospect status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to update prospect status' },
      { status: 500 }
    );
  }
}