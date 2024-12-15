// src/app/api/generate-message/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import { Session } from 'next-auth';
import { PlanType } from '@prisma/client';

// Type definitions
interface FlaskResponse {
  message: {
    commonalities: {
      description: string;
      key_points: string[];
    };
    message: {
      text: string;
      reasoning: string;
    };
    conversation_starters: string[];
  };
  profileInfo: {
    name: string;
    company: string;
    position: string;
  };
}

// Input validation schema
const requestSchema = z.object({
  linkedinUrl: z.string()
    .url()
    .includes("linkedin.com/in/")
    .min(5)
    .max(500),
  tone: z.enum(["professional", "casual", "formal"])
    .default("professional")
});

// Usage tracking functions
async function canGenerateLead(userId: string): Promise<boolean> {
    const now = new Date();
    const currentUsage = await prisma.monthlyUsage.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }
      },
      include: {
        user: {
          select: {
            plan: true
          }
        }
      }
    });
  
    if (!currentUsage) {
      return true; // No usage yet this month
    }
  
    // Get total leads count (active + deleted)
    const totalLeads = await prisma.lead.count({
      where: {
        userId,
        monthlyUsage: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }
      }
    });
  
    const deletedLeads = await prisma.deletedLead.count({
      where: {
        userId,
        monthlyUsage: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }
      }
    });
  
    const totalLeadCount = totalLeads + deletedLeads;
    const limit = currentUsage.user.plan === PlanType.PLUS ? 100 : 10;
    
    return totalLeadCount < limit;
  }

async function trackLeadGeneration(userId: string): Promise<any> {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true }
  });

  return await prisma.monthlyUsage.upsert({
    where: {
      userId_year_month: {
        userId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }
    },
    update: {
      leadCount: { increment: 1 }
    },
    create: {
      userId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      leadCount: 1,
      plan: user?.plan || PlanType.FREE
    }
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as Session;
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to perform this action' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validationResult.error.flatten()
      }, { status: 400 });
    }

    const { linkedinUrl, tone } = validationResult.data;

    // Get the sender's profile from the database
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!sender?.linkedinProfile) {
      return NextResponse.json(
        { error: 'Sender profile not found' }, 
        { status: 404 }
      );
    }

    // Check if user can generate more leads
    const canGenerate = await canGenerateLead(sender.id);
    if (!canGenerate) {
      return NextResponse.json({
        error: 'Monthly lead generation limit reached',
        details: 'Upgrade your plan to generate more leads'
      }, { status: 403 });
    }

    // Extract LinkedIn username
    const targetUsername = linkedinUrl.match(/linkedin\.com\/in\/([^\/]+)/)?.[1];
    if (!targetUsername) {
      return NextResponse.json({
        error: 'Could not extract LinkedIn username from URL'
      }, { status: 400 });
    }

    // Call Flask API
    const flaskResponse = await fetchWithRetry(
      'http://127.0.0.1:8000/api/generate-message',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, targetUsername, tone })
      }
    );

    const messageData = await flaskResponse.json();

    // Use a transaction to ensure both lead and usage are created/updated atomically
    const result = await prisma.$transaction(async (tx) => {
      // Track the lead generation
      const usage = await trackLeadGeneration(sender.id);

      // Create lead with correct schema
      const lead = await tx.lead.create({
        data: {
          name: messageData.profileInfo.name,
          company: messageData.profileInfo.company,
          position: messageData.profileInfo.position,
          linkedinUrl,
          message: messageData.message,
          userId: sender.id,
          usageId: usage.id // Link to the monthly usage record
        }
      });

      return { lead, usage };
    });

    return NextResponse.json({
      id: result.lead.id,
      message: messageData.message,
      profileInfo: messageData.profileInfo
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Helper function for retrying failed requests
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  timeout = 30000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;

    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Request timeout on attempt ${attempt}`);
      } else {
        console.warn(`Request failed on attempt ${attempt}:`, error);
      }

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
      }

      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000))
      );
    }
  }

  throw lastError || new Error('Unknown error in fetchWithRetry');
}