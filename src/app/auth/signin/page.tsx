// src/app/auth/signin/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const SignIn = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 mb-2">
            <img src="/altitude.png" alt="Altitude logo" className="w-full h-full" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Altitude</CardTitle>
          <CardDescription className="text-slate-600">
            Connect with potential employers and streamline your internship outreach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn('linkedin', { callbackUrl: '/dashboard' })}
            className="w-full h-12 bg-[#0A66C2] hover:bg-[#004182] transition-colors duration-200"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M15 0H5C2.2 0 0 2.2 0 5v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM8 15H5V7h3v8zm-1.5-9C5.7 6 5 5.3 5 4.5S5.7 3 6.5 3 8 3.7 8 4.5 7.3 6 6.5 6zm9.5 9h-3v-4.6c0-1.1 0-2.5-1.5-2.5S10 9.1 10 10.2V15H7V7h3v1.3c.4-.8 1.5-1.5 3-1.5 3.2 0 3 2.7 3 4.2V15z" />
              </svg>
              <span className="font-semibold">Continue with LinkedIn</span>
            </div>
          </Button>
          <p className="text-center text-sm text-slate-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;