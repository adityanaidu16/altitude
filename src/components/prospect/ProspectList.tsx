import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  MoreVertical,
  Search,
  ExternalLink,
  Copy,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Prospect } from '@/types/campaign';

// Basic Dialog Component to avoid recursion
const BasicDialog = ({ 
  isOpen,
  onClose,
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-[525px] w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connection Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const STATUS_BADGES = {
  PENDING_VALIDATION: { variant: "outline", label: "Pending" },
  VALIDATION_FAILED: { variant: "outline", label: "Failed Validation" },
  CONNECTION_PENDING: { variant: "secondary", label: "Pending Connection" },
  CONNECTION_SENT: { variant: "secondary", label: "Connection Sent" },
  CONNECTION_ACCEPTED: { variant: "default", label: "Connected" },
  MESSAGE_QUEUED: { variant: "secondary", label: "Message Queued" },
  MESSAGE_SENT: { variant: "default", label: "Message Sent" },
  COMPLETED: { variant: "default", label: "Completed" },
  FAILED: { variant: "outline", label: "Failed" }
};

const cleanName = (name: string) => {
  if (!name) return '';
  const lowerName = name.toLowerCase();
  const linkedInIndex = lowerName.indexOf('linkedin');
  if (linkedInIndex !== -1) {
    name = name.substring(0, linkedInIndex).trim();
  }
  return name.replace(/[-|]+$/, '').replace(/www\..*$/, '').trim();
};

interface ProspectListProps {
  initialProspects: Prospect[];
}

export default function ProspectList({ 
  initialProspects,
}: ProspectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewMessage = (prospect: any) => {
    setSelectedProspect(prospect);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProspect(null);
  };

  const handleCopyMessage = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    }
  };

  const filteredProspects = initialProspects.filter(prospect => {
    const matchesSearch = 
      cleanName(prospect.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_BADGES).map(([status, { label }]) => (
                <SelectItem key={status} value={status}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProspects.map((prospect) => (
              <TableRow key={prospect.id}>
                <TableCell>{cleanName(prospect.name)}</TableCell>
                <TableCell>{prospect.company}</TableCell>
                <TableCell>{prospect.position}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGES[prospect.status as keyof typeof STATUS_BADGES]?.variant as "outline" | "secondary" | "default" | "destructive"}>
                    {STATUS_BADGES[prospect.status as keyof typeof STATUS_BADGES]?.label || prospect.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(prospect.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {prospect.message && (
                        <DropdownMenuItem onClick={() => handleViewMessage(prospect)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Message
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => window.open(prospect.linkedinUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open LinkedIn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Simple Message Dialog */}
      <BasicDialog 
        isOpen={dialogOpen} 
        onClose={handleCloseDialog}
      >
        {selectedProspect?.message && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Message:</p>
              <p className="text-sm">{selectedProspect?.message?.message?.text}</p>
            </div>
            {selectedProspect.message.commonalities?.key_points && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Commonalities:</p>
                <ul className="text-sm list-disc pl-4">
                  {selectedProspect.message.commonalities.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedProspect.message.conversation_starters && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Conversation Starters:</p>
                <ul className="text-sm list-disc pl-4">
                  {selectedProspect.message.conversation_starters.map((starter, index) => (
                    <li key={index}>{starter}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleCopyMessage(selectedProspect.message?.message?.text)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Message
              </Button>
              <Button
                onClick={() => window.open(selectedProspect.linkedinUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open LinkedIn
              </Button>
            </div>
          </div>
        )}
      </BasicDialog>
    </div>
  );
}