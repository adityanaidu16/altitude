// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";
import DashboardClient from "./client";

async function getCampaignData(userId: string) {
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    include: {
      prospects: {
        select: {
          id: true,
          name: true,
          position: true,
          company: true,
          status: true,
          linkedinUrl: true,
          message: true,
          validationData: true,
          nextActionAt: true,
          createdAt: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return campaigns;
}

async function getDashboardStats(userId: string) {
  const [campaignCount, prospectCount, connectedCount, messagedCount] = await Promise.all([
    // Get total campaigns
    prisma.campaign.count({
      where: { userId }
    }),
    // Get total prospects
    prisma.prospect.count({
      where: {
        campaign: { userId }
      }
    }),
    // Get connected prospects
    prisma.prospect.count({
      where: {
        campaign: { userId },
        status: 'CONNECTION_ACCEPTED'
      }
    }),
    // Get messaged prospects
    prisma.prospect.count({
      where: {
        campaign: { userId },
        status: 'MESSAGE_SENT'
      }
    })
  ]);

  return {
    totalCampaigns: campaignCount,
    totalProspects: prospectCount,
    totalConnected: connectedCount,
    messagesSent: messagedCount
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any) as Session;

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      pendingDowngrade: true,
      planEndDate: true
    }
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch all necessary data
  const [campaigns, stats] = await Promise.all([
    getCampaignData(user.id),
    getDashboardStats(user.id)
  ]);

  return (
    <DashboardClient 
      initialCampaigns={campaigns} 
      stats={stats}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        pendingDowngrade: user.pendingDowngrade,
        planEndDate: user.planEndDate?.toISOString()
      }}
    />
  );
}