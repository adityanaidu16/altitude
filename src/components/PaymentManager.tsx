import React, { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentManager = () => {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleUpgrade = async (planType: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planType === 'PLUS' 
            ? process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID 
            : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate upgrade";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await update();
        toast({
          title: "Subscription Cancelled",
          description: `Your subscription will end on ${new Date(data.cancelDate).toLocaleDateString()}`,
        });
        setConfirmCancel(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your subscription and billing details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Current Plan</h3>
          <p className="text-sm text-gray-600">
            {session.user.plan === 'FREE' ? (
              'Free Plan'
            ) : (
              <>
                {session?.user?.plan} Plan
                {session?.user?.pendingDowngrade && session?.user?.planEndDate && (
                  <span className="text-amber-600 ml-2">
                    (Cancels on {new Date(session.user.planEndDate).toLocaleDateString()})
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Upgrade/Cancel Options */}
        <div className="space-y-4">
          {session.user.plan === 'FREE' && (
            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                onClick={() => handleUpgrade('PLUS')}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Upgrade to Plus'
                )}
              </Button>
              <Button 
                onClick={() => handleUpgrade('PRO')}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            </div>
          )}

          {session.user.plan !== 'FREE' && !session.user.pendingDowngrade && (
            <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Cancel Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Cancellation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to cancel your subscription?</p>
                  <p className="text-sm text-gray-500">
                    You&apos;ll continue to have access to your current plan until the end of your billing period.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmCancel(false)}
                      disabled={loading}
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Confirm Cancel'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentManager;