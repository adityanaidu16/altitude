// app/dashboard/client.tsx
'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignManager from '@/components/campaign/CampaignManager';
import ProspectList from '@/components/prospect/ProspectList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Target, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Prospect } from "@/types/campaign"

interface Campaign {
  id: string;
  name: string;
  targetCompany: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  prospects: Prospect[];
}

interface DashboardClientProps {
  initialCampaigns: Campaign[];
  stats: {
    totalCampaigns: number;
    totalProspects: number;
    totalConnected: number;
    messagesSent: number;
  };
  user: {
    id: string;
    name?: string;
    email: string;
    plan: 'FREE' | 'PLUS' | 'PRO';
    pendingDowngrade?: boolean;
    planEndDate?: string;
  };
}

export default function DashboardClient({
  initialCampaigns,
  stats: initialStats,
  user
}: DashboardClientProps) {
  const [stats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState('campaigns');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkPlanStatus = async () => {
      try {
        const response = await fetch('/api/check-plan', {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error('Failed to check plan status');
        }

        const data = await response.json();
        
        if (data.updated) {
          toast({
            title: "Plan Updated",
            description: "Your plan has been updated to FREE",
          });
          router.refresh(); // This will cause the page to reload with updated data
        }
      } catch (error) {
        console.error('Error checking plan status:', error);
      }
    };

    // Check plan status on component mount
    checkPlanStatus();
  }, []);

  // Get all prospects across all campaigns
  const allProspects = initialCampaigns.flatMap(campaign => 
    campaign.prospects.map(prospect => ({
      ...prospect,
      campaignId: campaign.id
    }))
  );

  return (
    <div>
      <header className="border-b" style={{ backgroundColor: '#031b1d' }}>
        <div className="container flex items-center justify-between h-16 px-4">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8">
              <img src="/altitude-white.png" alt="Altitude logo" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-white"><Link href="/">Altitude</Link></span>
          </motion.div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:text-white/80">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              asChild
            >
              <Link href="/settings">Profile</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:text-white/80"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Campaigns
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Active campaigns: {initialCampaigns.filter(c => c.status === 'ACTIVE').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Prospects
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProspects}</div>
              <p className="text-xs text-muted-foreground">
                Connected: {stats.totalConnected}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Messages Sent
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesSent}</div>
              <p className="text-xs text-muted-foreground">
                Connection rate: {stats.messagesSent + stats.totalConnected > 0 ? 
                  `${((stats.messagesSent / stats.messagesSent + stats.totalConnected) * 100).toFixed(1)}%` : 
                  'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plan Status
              </CardTitle>
              <div className="text-sm font-medium">
                {user.pendingDowngrade ? (
                  <div className="flex flex-col items-end">
                    <span>{user.plan}</span>
                    <span className="text-xs text-amber-600">
                      Downgrading to FREE on {new Date(user.planEndDate!).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  user.plan
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div>
                  {user.plan === 'FREE' && `${stats.totalCampaigns}/2 Campaigns Used`}
                  {user.plan === 'PLUS' && `${stats.totalCampaigns}/20 Campaigns Used`}
                  {user.plan === 'PRO' && `${stats.totalCampaigns} Campaigns Used (Unlimited)`}
                </div>
                {user.pendingDowngrade && (
                  <div className="mt-1">
                    Active until {new Date(user.planEndDate!).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="prospects">Prospects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns">
            <CampaignManager 
            />
          </TabsContent>
          <TabsContent value="prospects">
          <ProspectList 
            initialProspects={allProspects as Prospect[]}
          />
        </TabsContent>
        </Tabs>

        {/* Upgrade CTA for free users */}
        {(!user.pendingDowngrade && user.plan === 'FREE') && (
          <Card className="mt-6 bg-primary/5">
            <CardHeader>
              <CardTitle>Upgrade to Plus</CardTitle>
              <CardDescription>
                Get access to 20 campaigns per month and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>✓ Up to 50 prospects per campaign</li>
                  <li>✓ Advanced prospect validation</li>
                  <li>✓ Advanced message personalization</li>
                </ul>
              </div>
              <Button 
                className="w-full"
                style={{ backgroundColor: '#031b1d' }}
                asChild
              >
                <Link href="/auth/signup">Upgrade Now - $9/month</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {(!user.pendingDowngrade && user.plan === 'PLUS') && (
          <Card className="mt-6 bg-primary/5">
            <CardHeader>
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Everything in Plus plus <b>unlimited</b> campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                style={{ backgroundColor: '#031b1d' }}
                asChild
              >
                <Link href="/auth/signup">Upgrade Now - $19/month</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}