import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  ExternalLink,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Prospect, ProspectStatus } from '@/types/campaign';
import { ProgressDialog } from './ProgressDialog';
import { useToast } from '@/hooks/use-toast';

interface Column {
  id: keyof typeof ProspectStatuses;
  title: string;
  description: string;
}

// Define ProspectStatuses as a const object to use as a type-safe enum
const ProspectStatuses = {
  PENDING_VALIDATION: 'PENDING_VALIDATION',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONNECTION_PENDING: 'CONNECTION_PENDING',
  CONNECTION_SENT: 'CONNECTION_SENT',
  CONNECTION_ACCEPTED: 'CONNECTION_ACCEPTED',
  MESSAGE_QUEUED: 'MESSAGE_QUEUED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

const columns: Column[] = [
  {
    id: 'PENDING_VALIDATION',
    title: 'Pending Validation',
    description: 'Prospects awaiting validation'
  },
  {
    id: 'CONNECTION_PENDING',
    title: 'Ready to Connect',
    description: 'Validated prospects ready for connection'
  },
  {
    id: 'CONNECTION_SENT',
    title: 'Connection Sent',
    description: 'Waiting for connection acceptance'
  },
  {
    id: 'CONNECTION_ACCEPTED',
    title: 'Connected',
    description: 'Ready for messaging'
  },
  {
    id: 'MESSAGE_SENT',
    title: 'Message Sent',
    description: 'Waiting for response'
  },
];

interface PipelineViewProps {
  campaignId: string;
  prospects: Prospect[];
  onProspectAction: (prospectId: string, action: string, data?: any) => Promise<void>;
  onProspectsUpdate: (updatedProspects: Prospect[]) => void;
  onStatsUpdate: () => void;
}

export function PipelineView({ campaignId, prospects, onProspectAction, onProspectsUpdate, onStatsUpdate }: PipelineViewProps) {
  const [expandedProspect, setExpandedProspect] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressTitle, setProgressTitle] = useState('');
  const [progressStages, setProgressStages] = useState<{ name: string; duration: number }[]>([]);

  const { toast } = useToast();

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      // Use PATCH endpoint to update prospect status
      const response = await fetch(`/api/prospects/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: destination.droppableId as ProspectStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update prospect status');
      }

      const updatedProspect = await response.json();

      // Update local state
      const updatedProspects = prospects.map(p => 
        p.id === draggableId ? updatedProspect : p
      );
      onProspectsUpdate(updatedProspects);
      onStatsUpdate();

    } catch (error) {
      console.error('Failed to update prospect status:', error);
      toast({
        title: "Error",
        description: "Failed to update prospect status",
        variant: "destructive"
      });
      
      // Optionally refresh the entire campaign data to ensure UI is in sync
      if (onProspectAction) {
        await onProspectAction(draggableId, 'refresh');
      }
    }
  };

  const getProspectsByStatus = (status: ProspectStatus) => {
    return prospects.filter(p => p.status === status);
  };

  const handleAddLead = async () => {
    if (!linkedinUsername) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn username",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Fetch profile from Flask backend
      const profileResponse = await fetch('http://localhost:8000/api/fetch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: linkedinUsername }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }

      const profileData = await profileResponse.json();

      // Add prospect using the correct endpoint
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: `https://linkedin.com/in/${linkedinUsername}`,
          publicId: linkedinUsername,
          name: profileData.basic_info?.name || linkedinUsername,
          position: profileData.experience?.[0]?.title || 'Unknown Position',
          company: profileData.experience?.[0]?.company || 'Unknown Company',
          campaignId: campaignId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add prospect');
      }

      const newProspect = await response.json();
      
      // Update the local prospects array with the new prospect
      const updatedProspects = [...prospects, newProspect];
      onProspectsUpdate(updatedProspects);

      setShowAddLeadModal(false);
      setLinkedinUsername('');
      
      toast({
        title: "Success",
        description: "Lead added successfully",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add lead",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendConnection = async (prospectId: string) => {
    setIsActionInProgress(true);
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId,
          type: 'connect'
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to process connection request');
      }
  
      const { prospect, manualAction } = await response.json();
      
      // Update local state
      const updatedProspects = prospects.map(p => 
        p.id === prospectId ? prospect : p
      );
      onProspectsUpdate(updatedProspects);
      onStatsUpdate();
  
      // Open LinkedIn in a new tab
      window.open(manualAction.url, '_blank');
  
      toast({
        title: "Next Step",
        description: manualAction.instructions,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process connection request",
        variant: "destructive"
      });
    } finally {
      setIsActionInProgress(false);
    }
  };
  
  const handleSendMessage = async (prospectId: string, message: string) => {
    setIsActionInProgress(true);
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId,
          type: 'message',
          message
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to process message');
      }
  
      const { prospect, manualAction } = await response.json();
      
      // Update local state
      const updatedProspects = prospects.map(p => 
        p.id === prospectId ? prospect : p
      );
      onProspectsUpdate(updatedProspects);
      onStatsUpdate();
  
      // Open LinkedIn messaging in a new tab
      window.open(manualAction.url, '_blank');
  
      setShowMessageModal(false);
      setMessage('');
      setSelectedProspectId(null);
  
      toast({
        title: "Next Step",
        description: manualAction.instructions,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive"
      });
    } finally {
      setIsActionInProgress(false);
    }
  };


  const handleGenerateMessage = async (prospectId: string) => {
    setIsActionInProgress(true);
    setSelectedProspectId(prospectId);
    setProgressTitle('Generating Message');
    setProgressStages([
      { name: 'Fetching profile data', duration: 3000 },
      { name: 'Analyzing profile information', duration: 2000 },
      { name: 'Generating personalized message', duration: 3000 },
      { name: 'Saving message', duration: 1000 }
    ]);
    setShowProgress(true);
  
    try {
      // Rest of your existing code...
      const prospect = prospects.find(p => p.id === prospectId);
      if (!prospect) {
        throw new Error('Prospect not found');
      }
  
      // Generate message using the existing API format
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: prospect.linkedinUrl,
          targetUsername: prospect.publicId,
          tone: 'professional'
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate message');
      }
  
      const data = await response.json();
  
      // Update prospect with generated message
      const updateResponse = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: data.message
        })
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to save generated message');
      }
  
      const updatedProspect = await updateResponse.json();
  
      // Update local state
      const updatedProspects = prospects.map(p => 
        p.id === prospectId ? updatedProspect : p
      );
      onProspectsUpdate(updatedProspects);
      onStatsUpdate();

      toast({
        title: "Success",
        description: "Message generated successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate message",
        variant: "destructive"
      });
    } finally {
      setIsActionInProgress(false);
      setSelectedProspectId(null);
      setShowProgress(false);
    }
  };

  const handleMarkAsConnected = async (prospectId: string) => {
    setIsActionInProgress(true);
    setSelectedProspectId(prospectId);
    setProgressTitle('Updating Connection Status');
    setProgressStages([
      { name: 'Updating connection status', duration: 1000 },
      { name: 'Fetching profile data', duration: 3000 },
      { name: 'Generating personalized message', duration: 4000 },
      { name: 'Saving changes', duration: 1000 }
    ]);
    setShowProgress(true);
    
    try {
      // Rest of your existing code...
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: ProspectStatuses.CONNECTION_ACCEPTED
        })
      });
  
  
      if (!response.ok) {
        throw new Error('Failed to update connection status');
      }

      console.log(prospects.find(p => p.id === prospectId)?.linkedinUrl)
  
      // Generate the message
      const messageResponse = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: prospects.find(p => p.id === prospectId)?.linkedinUrl,
          targetUsername: prospects.find(p => p.id === prospectId)?.publicId,
          tone: 'professional'
        })
      });

      console.log(messageResponse)
  
      if (!messageResponse.ok) {
        throw new Error('Failed to generate message');
      }
  
      const messageData = await messageResponse.json();
  
      // Update the prospect with the generated message
      const updateResponse = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageData.message
        })
      });
  
      if (!updateResponse.ok) {
        throw new Error('Failed to save generated message');
      }
  
      const updatedProspect = await updateResponse.json();
  
      // Update local state with both status and message changes
      const updatedProspects = prospects.map(p => 
        p.id === prospectId ? {
          ...p,
          ...updatedProspect,
          message: messageData.message  // Ensure message is included in local state
        } : p
      );
      
      onProspectsUpdate(updatedProspects);
      onStatsUpdate();
  
      toast({
        title: "Success",
        description: "Connection marked as accepted and message generated",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update connection status",
        variant: "destructive"
      });
    } finally {
      setIsActionInProgress(false);
      setSelectedProspectId(null);
      setShowProgress(false);
    }
  };

  const handleMessageSent = async (prospectId: string) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: ProspectStatuses.MESSAGE_SENT
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      const updatedProspect = await response.json();
      const updatedProspects = prospects.map(p => 
        p.id === prospectId ? updatedProspect : p
      );
      onProspectsUpdate(updatedProspects);
      onStatsUpdate();

      toast({
        title: "Success",
        description: "Status updated to message sent",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };
  
  // Modify the prospect card actions section
  const renderProspectActions = (prospect: Prospect) => {
    switch (prospect.status) {
      case ProspectStatuses.PENDING_VALIDATION:
      case ProspectStatuses.CONNECTION_PENDING:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSendConnection(prospect.id)}
            disabled={isActionInProgress}
          >
            {isActionInProgress && selectedProspectId === prospect.id ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            Send Connection
          </Button>
        );

      case ProspectStatuses.CONNECTION_SENT:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkAsConnected(prospect.id)}
            disabled={isActionInProgress}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Mark as Connected
          </Button>
        );
        
        case ProspectStatuses.CONNECTION_ACCEPTED:
          return (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (prospect.message) {
                    setShowMessageDialog(true);
                  } else {
                    handleGenerateMessage(prospect.id);
                  }
                }}
                disabled={isActionInProgress}
                className="w-full"
              >
                {isActionInProgress && selectedProspectId === prospect.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-1" />
                )}
                {prospect.message ? 'View Message' : 'Generate Message'}
              </Button>

              {prospect.message && (
                <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Generated Message</DialogTitle>
                      <DialogDescription>
                        Review and send your personalized message
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Message Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Message</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(prospect.message.message.text);
                              toast({
                                title: "Copied",
                                description: "Message copied to clipboard",
                              });
                            }}
                          >
                            Copy Message
                          </Button>
                        </div>
                        <div className="rounded-md bg-muted p-4">
                          <p className="text-sm">{prospect.message.message.text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          {prospect.message.message.reasoning}
                        </p>
                      </div>

                      {/* Commonalities Section */}
                      <div className="space-y-2">
                        <Label>Commonalities</Label>
                        <div className="rounded-md bg-muted p-4 space-y-2">
                          <p className="text-sm">{prospect.message.commonalities.description}</p>
                          <ul className="list-disc pl-4 space-y-1">
                            {prospect.message.commonalities.key_points.map((point, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Conversation Starters */}
                      <div className="space-y-2">
                        <Label>Conversation Starters</Label>
                        <div className="rounded-md bg-muted p-4">
                          <ul className="list-disc pl-4 space-y-1">
                            {prospect.message.conversation_starters.map((starter, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                {starter}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <DialogFooter className="sm:justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setShowMessageDialog(false)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            const messageUrl = `https://www.linkedin.com/messaging/compose?recipient=${prospect.publicId}`;
                            window.open(messageUrl, '_blank');
                            handleMessageSent(prospect.id);
                            setShowMessageDialog(false);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send on LinkedIn
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          );

        default:
          return null;
    }
  };  

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="absolute inset-0 overflow-auto px-6 mt-16 pb-8">
        <div className="mb-4">
          <Button 
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>

        <div className="inline-flex gap-4 p-4 min-h-full" style={{ width: `${columns.length * 320 + 32}px` }}>
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="mb-2">
                <h3 className="font-semibold text-sm flex items-center">
                  {column.title}
                  <Badge variant="secondary" className="ml-2">
                    {getProspectsByStatus(column.id).length}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {column.description}
                </p>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`h-[calc(80vh-180px)] overflow-y-auto p-2 rounded-lg space-y-2 ${
                      snapshot.isDraggingOver ? 'bg-muted' : 'bg-muted/50'
                    }`}
                  >
                    {getProspectsByStatus(column.id).map((prospect, index) => (
                      <Draggable
                        key={prospect.id}
                        draggableId={prospect.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 last:mb-0"
                          >
                            <Card className={snapshot.isDragging ? 'shadow-lg' : ''}>
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">
                                      {prospect.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {prospect.position}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {prospect.company}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                    {prospect.validationData?.score && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge variant={
                                              prospect.validationData.score > 0.7 ? 'default' :
                                              prospect.validationData.score > 0.4 ? 'secondary' :
                                              'destructive'
                                            }>
                                              {Math.round(prospect.validationData.score * 100)}%
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Match Score</p>
                                            {prospect.validationData.reasons.map((reason, i) => (
                                              <p key={i} className="text-xs">{reason}</p>
                                            ))}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(prospect.linkedinUrl, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {expandedProspect === prospect.id && (
                                  <div className="pt-2 space-y-2">
                                    {prospect.message && (
                                      <div className="text-xs">
                                        <p className="text-muted-foreground">
                                          {prospect.message.text}
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div className="flex justify-start space-x-2">
                                      {renderProspectActions(prospect)}
                                    </div>
                                  </div>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => setExpandedProspect(
                                    expandedProspect === prospect.id ? null : prospect.id
                                  )}
                                >
                                  {expandedProspect === prospect.id ? 'Less' : 'More'}
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

<Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Send Message</DialogTitle>
        <DialogDescription>
          Send a personalized message to your connection
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            disabled={isActionInProgress}
          />
          <p className="text-sm text-muted-foreground">
            Keep your message professional and personalized
          </p>
        </div>

        {message.length > 300 && (
          <Alert variant="destructive">
            <AlertDescription>
              Message must be under 300 characters (currently {message.length})
            </AlertDescription>
          </Alert>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setShowMessageModal(false);
            setMessage('');
            setSelectedProspectId(null);
          }}
          disabled={isActionInProgress}
        >
          Cancel
        </Button>
        <Button
          onClick={() => selectedProspectId && handleSendMessage(selectedProspectId, message)}
          disabled={isActionInProgress || message.length > 300 || message.length === 0}
        >
          {isActionInProgress ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
        </div>
      </div>

      <Dialog open={showAddLeadModal} onOpenChange={setShowAddLeadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUsername">LinkedIn Username</Label>
              <Input
                id="linkedinUsername"
                placeholder="e.g. john-doe"
                value={linkedinUsername}
                onChange={(e) => setLinkedinUsername(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Enter the username from linkedin.com/in/username
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddLeadModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLead}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProgressDialog 
        open={showProgress}
        title={progressTitle}
        stages={progressStages}
      />
    </DragDropContext>
  );
}