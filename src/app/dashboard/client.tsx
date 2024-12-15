// src/app/dashboard/client.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { signOut } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Lead = {
  id: string;
  name: string;
  company: string;
  position: string;
  status: string;
  linkedinUrl: string;
  message: {
    commonalities: {
      description: string;
      key_points: string[];
    };
    conversation_starters: string[];
    message: {
      text: string;
      reasoning: string;
    };
  } | null;
  loading: boolean;
  error: string | null;
  linkedinUsername?: string;
};

interface DashboardClientProps {
  initialLeads: {
    id: string;
    name: string;
    company: string;
    position: string;
    status: string;
    linkedinUrl: string;
    message: any;
  }[];
  stats: {
    totalLeads: number;
    messagesSent: number;
    responsesReceived: number;
  };
}

export default function DashboardClient({ initialLeads, stats }: DashboardClientProps) {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [formData, setFormData] = useState({ linkedinUrl: '', tone: 'professional' });
  const [formErrors, setFormErrors] = useState({ linkedinUrl: '', tone: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>(
    initialLeads.map(lead => ({
      ...lead,
      loading: false,
      error: null
    }))
  );

  const validateLinkedInUrl = (url: string) => {
    const regex = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w\-\_]+\/?$/;
    return regex.test(url);
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleToneChange = (value: any) => {
    setFormData(prev => ({ ...prev, tone: value }));
    setFormErrors(prev => ({ ...prev, tone: '' }));
  };

  const handleAddLead = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    console.log("clicked add lead")
    
    // Validate form
    const errors = { linkedinUrl: '', tone: '' };
    if (!formData.linkedinUrl) {
      errors.linkedinUrl = 'LinkedIn URL is required';
    } else if (!validateLinkedInUrl(formData.linkedinUrl)) {
      errors.linkedinUrl = 'Please enter a valid LinkedIn profile URL';
    }
    if (!formData.tone) {
      errors.tone = 'Please select a tone';
    }

    if (errors.linkedinUrl !== '' || errors.tone !== '') {
      setFormErrors(errors);
      return;
    }

    const tempId = Date.now().toString();
    const newLead = {
      id: tempId,
      name: 'New Lead',
      company: 'Unknown Company',
      position: 'Unknown Position',
      linkedinUrl: formData.linkedinUrl,
      status: 'Pending',
      loading: true,
      error: null,
      message: null
    };

    setLeads(prev => [...prev, newLead]);
    setAddLeadOpen(false);
    setFormData({ linkedinUrl: '', tone: 'professional' });

    try {
      console.log("Sending request with:", formData);
      
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinUrl: formData.linkedinUrl,
          tone: formData.tone
        }),
      });

      const messageData = await response.json();
      console.log("Received response:", messageData);

      if (messageData.error) {
        throw new Error(messageData.error);
      }

      setLeads(prev => prev.map(lead => 
        lead.id === tempId
          ? { 
              ...lead, 
              id: messageData.id,
              loading: false,
              name: messageData.profileInfo.name,
              company: messageData.profileInfo.company,
              position: messageData.profileInfo.position,
              message: {
                commonalities: messageData.message.commonalities,
                conversation_starters: messageData.message.conversation_starters,
                message: messageData.message.message
              }
            }
          : lead
      ));
      
    } catch (error) {
      console.error('Error:', error);
      setLeads(prev => prev.map(lead => 
        lead.id === tempId
          ? { 
              ...lead,
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to load lead information',
              message: null
            } 
          : lead
      ));
    }
};

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      // Optionally show an error message to the user
    }
  };

  const handleDeleteClick = (leadId: string) => {
    setLeadToDelete(leadId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;

    try {
      const response = await fetch(`/api/leads/${leadToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      setLeads(prev => prev.filter(lead => lead.id !== leadToDelete));
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
      // Optionally show an error message to the user
    }
  };

  const AddLeadForm = () => (
    <form onSubmit={handleAddLead} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">LinkedIn URL</label>
        <Input
          name="linkedinUrl"
          value={formData.linkedinUrl}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/username"
        />
        {formErrors.linkedinUrl && (
          <p className="text-sm text-red-500">{formErrors.linkedinUrl}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message Tone</label>
        <Select value={formData.tone} onValueChange={handleToneChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.tone && (
          <p className="text-sm text-red-500">{formErrors.tone}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        style={{ backgroundColor: '#031b1d', color: 'white' }}
      >
        Add Lead
      </Button>
    </form>
  );
  return (
    <div className="min-h-screen bg-background">
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
              variant="ghost" className="text-white hover:text-white/80"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <div className="container grid lg:grid-cols-5 gap-12 px-4 py-6">
        <aside className="hidden lg:block">
          <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#031b1d' }}>
            <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="text-white">
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <div className="text-sm opacity-80">Total Leads</div>
              </div>
              <div className="text-white">
                <div className="text-2xl font-bold">{stats.messagesSent}</div>
                <div className="text-sm opacity-80">Messages Sent</div>
              </div>
              <div className="text-white">
                <div className="text-2xl font-bold">{stats.responsesReceived}</div>
                <div className="text-sm opacity-80">Responses Received</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Internship Outreach Dashboard</h1>
            <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#031b1d', color: 'white' }}>
                  Add New Lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <AddLeadForm />
              </DialogContent>
            </Dialog>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.loading ? 'Loading...' : lead.name}</TableCell>
                  <TableCell>{lead.loading ? 'Loading...' : lead.company}</TableCell>
                  <TableCell>{lead.loading ? 'Loading...' : lead.position}</TableCell>
                  <TableCell>
                    <Select 
                      value={lead.status}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <Badge 
                            style={{
                              backgroundColor: lead.status === 'Responded' ? '#031b1d' : 'transparent',
                              color: lead.status === 'Responded' ? 'white' : '#031b1d',
                              border: '1px solid #031b1d'
                            }}
                          >
                            {lead.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Messaged">Messaged</SelectItem>
                        <SelectItem value="Responded">Responded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={lead.loading || !lead.message?.message?.text}
                      style={{ borderColor: '#031b1d', color: '#031b1d' }}
                    >
                      {lead.loading ? 'Loading...' : 'View Message'}
                    </Button>

                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Connection Message</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {lead.message && (
                          <>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Message:</p>
                              <p className="text-sm">{lead.message.message?.text}</p>
                            </div>
                            {lead.message.commonalities?.key_points?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Commonalities:</p>
                                <ul className="text-sm list-disc pl-4">
                                  {lead.message.commonalities.key_points.map((point, index) => (
                                    <li key={index}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {lead.message.conversation_starters?.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Conversation Starters:</p>
                                <ul className="text-sm list-disc pl-4">
                                  {lead.message.conversation_starters.map((starter, index) => (
                                    <li key={index}>{starter}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <Button
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(lead.message?.message?.text || '')}
                              >
                                Copy Message
                              </Button>
                              <Button
                                onClick={() => window.open(lead.linkedinUrl, '_blank')}
                                style={{ backgroundColor: '#031b1d', color: 'white' }}
                              >
                                Open LinkedIn
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteClick(lead.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </main>
      </div>
      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to remove this lead? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}