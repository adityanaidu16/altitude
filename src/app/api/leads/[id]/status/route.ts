// src/app/api/leads/[id]/status/route.ts

import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Messaged", "Responded"])
});

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get token and log it for debugging
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

    // First find the lead
    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: true
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Now update it
    const updatedLead = await prisma.lead.update({
      where: {
        id: params.id
      },
      data: { 
        status,
        updatedAt: new Date() 
      },
      select: {
        id: true,
        status: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedLead);
    
  } catch (error) {
    console.error('Error updating lead status:', error);
    
    // Better error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    );
  }
}