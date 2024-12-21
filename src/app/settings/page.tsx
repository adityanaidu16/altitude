// src/app/settings/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaymentManager from '@/components/PaymentManager';

export default function SettingsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [formData, setFormData] = useState({
    linkedinUsername: '',
    careerGoal: 'internship' as 'job' | 'internship',
    industry: '',
    targetRoles: [] as string[]
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user && !isInitialized) {
      setFormData({
        linkedinUsername: session.user.linkedinUsername || '',
        careerGoal: (session.user.careerGoal as 'job' | 'internship') || 'internship',
        industry: session.user.industry || '',
        targetRoles: session.user.targetRoles || []
      });
      setIsInitialized(true);
    }
  }, [session, isInitialized]);

  const isLoadingInitialData = status === 'loading' || !isInitialized;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const INDUSTRIES = [
    { id: 'tech', name: 'Technology' },
    { id: 'banking', name: 'Banking' },
    { id: 'consulting', name: 'Consulting' },
  ] as const;

  const TARGET_ROLES = {
    tech: [
      { id: 'swe', name: 'Software Engineering' },
      { id: 'pm', name: 'Product Management' },
      { id: 'data', name: 'Data Science' },
      { id: 'quant-dev', name: 'Quantitative Developer' },
    ],
    banking: [
      { id: 'ib', name: 'Investment Banking' },
      { id: 'sales', name: 'Sales & Trading' },
      { id: 'research', name: 'Research' },
      { id: 'quant-trading', name: 'Quantitative Trading' },
    ],
    consulting: [
      { id: 'strategy', name: 'Strategy Consulting' },
      { id: 'tech-consulting', name: 'Technology Consulting' },
      { id: 'audit', name: 'Audit Consulting' },
    ],
  } as const;

  // Update the handleSubmit function to include all fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 400) {
          const errorDetails = data.details?.fieldErrors?.linkedinUsername?.[0];
          toast({
            title: "Invalid input",
            description: errorDetails || "Please check your input values",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error || 'Failed to update settings');
      }
  
      toast({
        title: "Settings updated",
        description: "Your profile settings have been updated successfully.",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              {isLoadingInitialData ? 'Loading your profile...' : 'Update your LinkedIn profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInitialData ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Username</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedinUsername}
                    onChange={(e) => handleInputChange('linkedinUsername', e.target.value)}
                    placeholder="your-linkedin-username"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label>Career Goal</Label>
                  <Select
                    value={formData.careerGoal}
                    onValueChange={(value: 'job' | 'internship') => 
                      handleInputChange('careerGoal', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job">Full-time Job</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => {
                      handleInputChange('industry', value);
                      handleInputChange('targetRoles', []); // Reset target roles when industry changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Roles</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {TARGET_ROLES[formData.industry as keyof typeof TARGET_ROLES]?.map((role) => (
                      <Button
                        key={role.id}
                        variant={formData.targetRoles.includes(role.id) ? 'default' : 'outline'}
                        onClick={() => {
                          const newRoles = formData.targetRoles.includes(role.id)
                            ? formData.targetRoles.filter(r => r !== role.id)
                            : [...formData.targetRoles, role.id];
                          handleInputChange('targetRoles', newRoles);
                        }}
                        style={formData.targetRoles.includes(role.id) ? { backgroundColor: '#031b1d' } : {}}
                        type="button"
                      >
                        {role.name}
                      </Button>
                    ))}
                  </div>
                </div>

              <PaymentManager />

              <Button 
              type="submit" 
              disabled={isLoading}
              style={{ backgroundColor: '#031b1d', color: 'white' }}
              >
              {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}