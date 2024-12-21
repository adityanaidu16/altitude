// app/payment/success/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

const MAX_ATTEMPTS = 5;
const getBackoffDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

// Separate component for payment verification logic
function PaymentVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const verifyPayment = async () => {
      if (!mounted || attempts >= MAX_ATTEMPTS) return;

      try {
        console.log('Starting payment verification...');
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          console.error('No session ID found in URL');
          setError('No session ID found');
          return;
        }

        console.log('Verifying session ID:', sessionId);
        console.log('Current user session:', session);

        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            sessionId,
            attempt: attempts 
          }),
        });

        console.log('Verify response status:', response.status);
        const data = await response.json();
        console.log('Verify response data:', data);

        if (data.success) {
          console.log('Payment verified successfully');
          console.log('Updating session...');
          
          await update();
          console.log('Session updated');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          window.location.href = '/dashboard';
          return;
        }

        if (response.status === 429) {
          const delay = getBackoffDelay(attempts);
          console.log(`Rate limited, retrying in ${delay}ms`);
          if (mounted && attempts < MAX_ATTEMPTS) {
            setAttempts(prev => prev + 1);
            timeoutId = setTimeout(verifyPayment, delay);
          }
          return;
        }

        if (mounted && attempts < MAX_ATTEMPTS) {
          const delay = getBackoffDelay(attempts);
          console.log(`Verification not successful, retrying in ${delay}ms`);
          setAttempts(prev => prev + 1);
          timeoutId = setTimeout(verifyPayment, delay);
        } else if (attempts >= MAX_ATTEMPTS) {
          console.error('Max verification attempts reached');
          setError(
            'Verification is taking longer than expected. Please contact support if you continue to see this message.'
          );
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('There was an issue verifying your payment. Please contact support.');
      }
    };

    if (status === 'loading') {
      console.log('Session loading...');
      return;
    }

    console.log('Starting verification process');
    verifyPayment();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session, status, searchParams, attempts, update, router]);

  return (
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
              Verification attempt {attempts} of {MAX_ATTEMPTS}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
      <div className="mb-6">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Loading...
      </h1>
    </div>
  );
}

// Main page component
export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Suspense fallback={<LoadingState />}>
        <PaymentVerification />
      </Suspense>
    </div>
  );
}