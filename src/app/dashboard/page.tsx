// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";
import DashboardClient from "./client";


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
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch leads for the user
  const leads = await prisma.lead.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      company: true,
      position: true,
      status: true,
      linkedinUrl: true,
      message: true,
    },
  });

  // Also fetch statistics
  const stats = await prisma.$transaction([
    prisma.lead.count({ where: { userId: user.id } }),
    prisma.lead.count({ where: { userId: user.id, status: 'Messaged' } }),
    prisma.lead.count({ where: { userId: user.id, status: 'Responded' } }),
  ]);

  return (
    <DashboardClient 
      initialLeads={leads} 
      stats={{
        totalLeads: stats[0],
        messagesSent: stats[1],
        responsesReceived: stats[2]
      }}
    />
  );
}