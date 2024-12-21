// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import DashboardClient from "./client";
import type { Campaign, Prospect, CampaignStats } from "@/types/campaign";

// Helper function to calculate campaign stats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateCampaignStats(prospects: any[]): CampaignStats {
  return {
    total: prospects.length,
    pending: prospects.filter(p => p.status === 'PENDING_VALIDATION' || p.status === 'CONNECTION_PENDING').length,
    connected: prospects.filter(p => p.status === 'CONNECTION_ACCEPTED').length,
    messaged: prospects.filter(p => p.status === 'MESSAGE_SENT').length
  };
}

// Transform Prisma prospect data to match Prospect interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProspect(prospect: any): Prospect {
  return {
    id: prospect.id,
    name: prospect.name,
    position: prospect.position || '',
    company: prospect.company || '',
    status: prospect.status,
    linkedinUrl: prospect.linkedinUrl,
    publicId: prospect.publicId || '', // Default value since it's required
    message: prospect.message || {
      message: { text: '' }
    },
    validationData: prospect.validationData,
    nextActionAt: prospect.nextActionAt?.toISOString(),
    createdAt: prospect.createdAt.toISOString(),
    updatedAt: prospect.createdAt.toISOString(), // Using createdAt as fallback
    connectionId: prospect.connectionId
  };
}

async function getCampaignData(userId: string) {
  const prismaData = await prisma.campaign.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      targetCompany: true,
      status: true,
      messageTemplate: true,
      autoApprove: true,
      createdAt: true,
      updatedAt: true,
      prospects: {
        select: {
          id: true,
          name: true,
          position: true,
          company: true,
          status: true,
          linkedinUrl: true,
          publicId: true,
          connectionId: true,
          message: true,
          validationData: true,
          nextActionAt: true,
          createdAt: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform the data to match the Campaign interface
  return prismaData.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    targetCompany: campaign.targetCompany,
    status: campaign.status,
    messageTemplate: campaign.messageTemplate || undefined,
    autoApprove: campaign.autoApprove,
    prospects: campaign.prospects.map(transformProspect),
    stats: calculateCampaignStats(campaign.prospects),
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString()
  } as Campaign));
}

async function getDashboardStats(userId: string) {
  const [campaignCount, prospectCount, connectedCount, messagedCount] = await Promise.all([
    prisma.campaign.count({
      where: { userId }
    }),
    prisma.prospect.count({
      where: {
        campaign: { userId }
      }
    }),
    prisma.prospect.count({
      where: {
        campaign: { userId },
        status: 'CONNECTION_ACCEPTED'
      }
    }),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any) as Session;
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

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
        name: user.name || '',
        email: user.email,
        plan: user.plan,
        pendingDowngrade: user.pendingDowngrade,
        planEndDate: user.planEndDate?.toISOString()
      }}
    />
  );
}