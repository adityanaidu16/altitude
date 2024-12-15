// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In your handleFreePlan function in signup page
  const handleFreePlan = async () => {
    try {
      setLoading(true);
      setError(null);
  
      console.log('Current session before update:', session);
  
      const response = await fetch('/api/user/update-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          plan: 'FREE',
          needs_subscription: false
        })
      });
  
      const data = await response.json();
      console.log('Server response:', data);
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
  
      // Wait for the session to update
      await update({
        ...session,
        user: {
          ...session?.user,
          plan: 'FREE',
          needs_subscription: false,
          ...data.user
        }
      });
  
      // Add a delay to ensure session is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Force reload the session
      const newSession = await update();
      console.log('Updated session:', newSession);
  
      // Use window.location for a hard navigation
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to select plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePlusPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  // Early return if no session
  if (!session) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select the plan that best fits your needs
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li>✓ 25 message generations per month</li>
                <li>✓ Basic analytics</li>
                <li>✓ Standard support</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={handleFreePlan}
                disabled={loading}
                style={{ backgroundColor: '#031b1d' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Select Free Plan'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plus Plan</CardTitle>
              <CardDescription>For power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li>✓ Unlimited message generations</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority support</li>
                <li>✓ Custom templates</li>
              </ul>
              <Button 
                className="w-full"
                onClick={handlePlusPlan}
                disabled={loading}
                style={{ backgroundColor: '#031b1d' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Select Plus Plan ($10/month)'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}