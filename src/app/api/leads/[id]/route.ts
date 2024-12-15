// src/app/api/leads/[id]/route.ts

import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get token and verify authentication
    const token = await getToken({ req: request as any });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;

    // First find the lead to ensure it exists and get related data
    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: true,
        monthlyUsage: true
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Start a transaction to handle the deletion while preserving the count
    await prisma.$transaction(async (tx) => {
      // Delete the lead
      await tx.lead.delete({
        where: {
          id: params.id
        }
      });

      // Create a placeholder record to maintain the count
      await tx.deletedLead.create({
        data: {
          originalLeadId: params.id,
          userId: lead.userId,
          monthlyUsageId: lead.usageId,
          deletedAt: new Date()
        }
      });
    });

    return NextResponse.json({
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting lead:', error);
    
    // Handle Prisma specific errors
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}