// components/campaign/CampaignManager.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  PlayCircle, 
  PauseCircle, 
  UserCheck, 
  MessageSquare, 
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash,
  RefreshCw,
  ExternalLink,
  SearchX,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import CampaignCard from './CampaignCard';
import { PipelineView } from './PipelineView';

interface CampaignFormData {
    name: string;
    targetCompany: string;
    dailyLimit: number;
    autoApprove: boolean;
    autoMessage: boolean;
  }

interface Prospect {
  id: string;
  name: string;
  position: string;
  company: string;
  status: string;
  linkedinUrl: string;
  message?: {
    text: string;
    commonalities?: {
      description: string;
      key_points: string[];
    };
  };
  validationData?: {
    score: number;
    reasons: string[];
  };
  nextActionAt?: string;
}

interface Campaign {
    id: string;
    name: string;
    targetCompany: string;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
    dailyLimit: number;
    autoApprove: boolean;
    autoMessage: boolean;
    prospects: Prospect[];
    stats: {
      total: number;
      pending: number;
      connected: number;
      messaged: number;
    };
}

export default function CampaignManager() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    targetCompany: '',
    dailyLimit: 25,
    autoApprove: false,
    autoMessage: false
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && campaign.status === 'ACTIVE') ||
      (filter === 'paused' && campaign.status === 'PAUSED');
  
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.targetCompany.toLowerCase().includes(searchQuery.toLowerCase());
  
    return matchesFilter && matchesSearch;
  });

  const handleStatsUpdate = async () => {
    await fetchCampaigns(); // This will refresh all campaign data including stats
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);  // Set loading state
    try {
        const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create campaign');
        }

        const campaign = await response.json();
        setCampaigns([...campaigns, campaign]);
        setShowNewCampaign(false);
        setFormData({ name: '', targetCompany: '', dailyLimit: 25 });
        
        toast({
            title: "Success",
            description: "Campaign created successfully",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to create campaign",
            variant: "destructive"
        });
    } finally {
        setIsCreating(false);  // Reset loading state
    }
  };

  const handleProspectAction = async (action: string, prospectId: string, data?: any) => {
    try {
      let response;
      
      if (action === 'approve') {
        // First approve the prospect
        response = await fetch(`/api/prospects/${prospectId}/approve`, {
          method: 'POST',
        });
  
        if (!response.ok) throw new Error('Failed to approve prospect');
  
        const updatedProspect = await response.json();
  
        // Then generate message if connection is accepted
        if (updatedProspect.status === 'CONNECTION_ACCEPTED') {
          const messageResponse = await fetch('/api/generate-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              linkedinUrl: updatedProspect.linkedinUrl,
              tone: 'professional'
            }),
          });
  
          if (!messageResponse.ok) throw new Error('Failed to generate message');
  
          const messageData = await messageResponse.json();
          
          // Update prospect with generated message
          response = await fetch(`/api/prospects/${prospectId}/update-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: messageData.message
            }),
          });
  
          if (!response.ok) throw new Error('Failed to update prospect message');
        }
      } else {
        // Handle other actions (reject, update-message, etc.)
        response = await fetch(`/api/prospects/${prospectId}/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) throw new Error(`Failed to ${action} prospect`);
      }
  
      // Update local state with the response
      const updatedProspect = await response.json();
      setCampaigns(campaigns.map(campaign => ({
        ...campaign,
        prospects: campaign.prospects.map(p => 
          p.id === prospectId ? updatedProspect : p
        )
      })));
  
      toast({
        title: "Success",
        description: `Prospect ${action}d successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} prospect: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error(`Failed to ${action} campaign`);

      const updatedCampaign = await response.json();
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? updatedCampaign : c
      ));

      toast({
        title: "Success",
        description: `Campaign ${action}d successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} campaign`,
        variant: "destructive"
      });
    }
  };

  const filteredProspects = (prospects: Prospect[]) => {
    switch (activeTab) {
      case 'pending':
        return prospects.filter(p => p.status === 'PENDING_VALIDATION');
      case 'connecting':
        return prospects.filter(p => ['CONNECTION_PENDING', 'CONNECTION_SENT'].includes(p.status));
      case 'messaging':
        return prospects.filter(p => ['CONNECTION_ACCEPTED', 'MESSAGE_QUEUED'].includes(p.status));
      case 'completed':
        return prospects.filter(p => p.status === 'MESSAGE_SENT');
      default:
        return prospects;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-gray-500">Manage your outreach campaigns</p>
        </div>
        <Button onClick={() => setShowNewCampaign(true)}>
          Create Campaign
        </Button>
      </div>



      {/* Campaign Details Dialog */}
      {selectedCampaign && (
        <Dialog 
            open={!!selectedCampaign} 
            onOpenChange={() => setSelectedCampaign(null)}
        >
            <DialogContent className="max-w-7xl h-[80vh]">
            <DialogHeader>
                <DialogTitle>{selectedCampaign.name}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="pipeline">

                <TabsContent value="pipeline" className="h-[calc(80vh-120px)]">
                <PipelineView
                    campaignId={selectedCampaign.id}
                    prospects={selectedCampaign.prospects}
                    onProspectAction={handleProspectAction}
                    onProspectsUpdate={(updatedProspects) => {
                    setSelectedCampaign({
                        ...selectedCampaign,
                        prospects: updatedProspects
                    });
                    
                    // Also update the campaigns list if needed
                    setCampaigns(prevCampaigns => 
                        prevCampaigns.map(campaign => 
                        campaign.id === selectedCampaign.id 
                            ? { ...campaign, prospects: updatedProspects }
                            : campaign
                        )
                    );
                    }}
                    onStatsUpdate={handleStatsUpdate}
                />
                </TabsContent>
            </Tabs>
            </DialogContent>
        </Dialog>
      )}

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateCampaign} className="space-y-6">
            <div className="grid gap-4">
                <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                    id="name"
                    placeholder="E.g., Q1 Software Engineer Outreach"
                    value={formData.name}
                    onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value
                    })}
                    required
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="targetCompany">Target Company</Label>
                <Input
                    id="targetCompany"
                    placeholder="E.g., Google"
                    value={formData.targetCompany}
                    onChange={(e) => setFormData({
                    ...formData,
                    targetCompany: e.target.value
                    })}
                    required
                />
                <p className="text-sm text-gray-500">
                    Enter the company name exactly as it appears on LinkedIn
                </p>
                </div>

                <div className="space-y-2">
                <Label>Campaign Settings</Label>
                <Card>
                    <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="font-medium">Auto-approve optimal prospects</p>
                        <p className="text-sm text-gray-500">
                            Automatically approve prospects that match your criteria
                        </p>
                        </div>
                        <Switch
                        checked={formData.autoApprove}
                        onCheckedChange={(checked) => setFormData({
                            ...formData,
                            autoApprove: checked
                        })}
                        />
                    </div>
                    </CardContent>
                </Card>
                </div>
            </div>

            <DialogFooter>
                <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowNewCampaign(false)}
                >
                Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Campaign"
                    )}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Campaign Stats Component */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Campaigns"
          value={campaigns.filter(c => c.status === 'ACTIVE').length}
          icon={<PlayCircle className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Prospects"
          value={campaigns.reduce((acc, c) => acc + c.stats.total, 0)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Connected"
          value={campaigns.reduce((acc, c) => acc + c.stats.connected, 0)}
          icon={<UserCheck className="h-5 w-5" />}
        />
        <StatsCard
          title="Messages Sent"
          value={campaigns.reduce((acc, c) => acc + c.stats.messaged, 0)}
          icon={<MessageSquare className="h-5 w-5" />}
        />
      </div>

      {/* Campaign List with Filtering */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Campaigns
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'paused' ? 'default' : 'outline'}
              onClick={() => setFilter('paused')}
            >
              Paused
            </Button>
          </div>
          <Input
            placeholder="Search campaigns..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtered Campaign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onAction={handleCampaignAction}
              onSelect={() => setSelectedCampaign(campaign)}
            />
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <SearchX className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">No campaigns found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {campaigns.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">No campaigns yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first campaign to start connecting with prospects
          </p>
          <Button onClick={() => setShowNewCampaign(true)}>
            Create First Campaign
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatsCard({ title, value, change, icon }: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}