// app/payment/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

const MAX_ATTEMPTS = 5;
// Implement exponential backoff
const getBackoffDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const verifyPayment = async () => {
      if (!mounted || attempts >= MAX_ATTEMPTS) return;

      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          setError('No session ID found');
          return;
        }

        // First, check if session is already updated
        if (session && !session.user?.needs_subscription) {
          router.push('/dashboard');
          return;
        }

        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId,
            attempt: attempts 
          }),
        });

        if (response.status === 429) {
          // Handle rate limit - wait longer before retrying
          const delay = getBackoffDelay(attempts);
          if (mounted && attempts < MAX_ATTEMPTS) {
            setAttempts(prev => prev + 1);
            timeoutId = setTimeout(verifyPayment, delay);
          }
          return;
        }

        const data = await response.json();

        if (data.success) {
          // Force session refresh
          await update();
          
          // Add a small delay before checking the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if the update was successful
          if (!session?.user?.needs_subscription) {
            setIsVerifying(false);
            router.push('/dashboard');
            return;
          }
        }

        // If still not verified, try again with backoff
        if (mounted && attempts < MAX_ATTEMPTS) {
          setAttempts(prev => prev + 1);
          timeoutId = setTimeout(verifyPayment, getBackoffDelay(attempts));
        } else if (attempts >= MAX_ATTEMPTS) {
          setError(
            'Verification is taking longer than expected. Your payment may have been successful, but please contact support if you continue to see this message.'
          );
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('There was an issue verifying your payment. Please contact support.');
      }
    };

    if (status === 'loading') return;

    if (session && !session.user.needs_subscription) {
      router.push('/dashboard');
    } else if (isVerifying && attempts < MAX_ATTEMPTS) {
      verifyPayment();
    }

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session, status, searchParams, attempts, update, router, isVerifying]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Notice</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="mt-4 text-sm text-gray-500">
              Order Reference: {searchParams.get('session_id')}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Confirming Your Subscription
            </h1>
            <p className="text-gray-600 mb-4">
              {attempts > 0 
                ? "We're still processing your payment. This may take a moment..."
                : "Please wait while we confirm your subscription."}
            </p>
            {attempts > 0 && (
              <p className="text-sm text-gray-500">
                Verification in progress... ({attempts}/{MAX_ATTEMPTS})
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}