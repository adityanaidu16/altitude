import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, PauseCircle } from "lucide-react";

interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    targetCompany: string;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
    stats: {
      total: number;
      pending: number;
      connected: number;
      messaged: number;
    };
  };
  onAction: (campaignId: string, action: string) => void;
  onSelect: () => void;
}

export default function CampaignCard({ campaign, onAction, onSelect }: CampaignCardProps) {
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return "bg-green-100 text-green-800 border-green-600";
      case 'PAUSED':
        return "bg-yellow-100 text-yellow-800 border-yellow-600";
      case 'COMPLETED':
        return "bg-blue-100 text-blue-800 border-blue-600";
      case 'FAILED':
        return "bg-red-100 text-red-800 border-red-600";
      default:
        return "bg-gray-100 text-gray-800 border-gray-600";
    }
  };

  const stats = campaign.stats || { total: 0, connected: 0, pending: 0, messaged: 0 };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
          <Badge className={`${getBadgeColor(campaign.status)}`}>
            {campaign.status}
          </Badge>
        </div>
        <CardDescription>{campaign.targetCompany}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Prospects</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Connected</p>
              <p className="text-2xl font-bold">{stats.connected}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(
                campaign.id,
                campaign.status === 'ACTIVE' ? 'pause' : 'resume'
              )}
            >
              {campaign.status === 'ACTIVE' ? 
                <PauseCircle className="h-4 w-4" /> : 
                <PlayCircle className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}