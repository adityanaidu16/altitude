// app/auth/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  ],
  banking: [
    { id: 'ib', name: 'Investment Banking' },
    { id: 'sales', name: 'Sales & Trading' },
    { id: 'research', name: 'Research' },
  ],
  consulting: [
    { id: 'strategy', name: 'Strategy Consulting' },
    { id: 'tech-consulting', name: 'Technology Consulting' },
    { id: 'audit', name: 'Audit Consulting' },
  ],
  // Add more industries and roles as needed
} as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserPreferences>({
    careerGoal: 'internship',
    industry: '',
    targetRoles: [],
    linkedinUsername: ''
  });

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        console.log('Sending form data:', formData);
        console.log('Current session before update:', session);
  
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData),
        });
  
        const responseData = await response.json();
        console.log('Server response:', responseData);
  
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to save preferences');
        }
  
        await update();
        console.log('Session updated');
  
        router.push('/auth/signup');
      } catch (error) {
        console.error('Error in handleNext:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save preferences",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!session) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Step {currentStep} of 4</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">What's your career goal?</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={formData.careerGoal === 'job' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, careerGoal: 'job' })}
                  style={formData.careerGoal === 'job' ? { backgroundColor: '#031b1d' } : {}}
                >
                  Full-time Job
                </Button>
                <Button
                  variant={formData.careerGoal === 'internship' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, careerGoal: 'internship' })}
                  style={formData.careerGoal === 'internship' ? { backgroundColor: '#031b1d' } : {}}
                >
                  Internship
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select your industry</h2>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value, targetRoles: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select target roles</h2>
              <div className="grid grid-cols-1 gap-2">
                {TARGET_ROLES[formData.industry as keyof typeof TARGET_ROLES]?.map((role) => (
                  <Button
                    key={role.id}
                    variant={formData.targetRoles.includes(role.id) ? 'default' : 'outline'}
                    onClick={() => {
                      const newRoles = formData.targetRoles.includes(role.id)
                        ? formData.targetRoles.filter(r => r !== role.id)
                        : [...formData.targetRoles, role.id];
                      setFormData({ ...formData, targetRoles: newRoles });
                    }}
                    style={formData.targetRoles.includes(role.id) ? { backgroundColor: '#031b1d' } : {}}
                  >
                    {role.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Enter your LinkedIn username</h2>
                <Input
                value={formData.linkedinUsername}
                onChange={(e) => {
                    // Sanitize the LinkedIn username
                    const rawInput = e.target.value;
                    let sanitizedUsername = rawInput
                    // Remove any URL parts
                    .replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//, '')
                    // Remove trailing slash if present
                    .replace(/\/$/, '')
                    // Remove @ symbol if present
                    .replace('@', '')
                    // Remove any query parameters
                    .split('?')[0];

                    setFormData({ ...formData, linkedinUsername: sanitizedUsername });
                }}
                placeholder="your-linkedin-username"
                />
                <p className="text-sm text-gray-500">
                Enter the username from linkedin.com/in/username
                </p>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              style={{ backgroundColor: '#031b1d' }}
            >
              {currentStep === 4 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}