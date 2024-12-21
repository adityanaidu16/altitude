// src/app/api/generate-message/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/auth";
import { z } from "zod";
import { Session } from 'next-auth';

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

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    return NextResponse.json({
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