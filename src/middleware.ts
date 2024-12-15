// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define path patterns
const PUBLIC_PATHS = new Set([
  '/',  // Landing page
  '/auth/signin',
  '/auth/signup',
  '/auth/onboarding',
  '/payment/success'
]);

const AUTH_ONLY_REDIRECT_PATHS = new Set([
  '/auth/signin',
  '/auth/signup',
  '/auth/onboarding'
]);

const PROTECTED_PATHS = new Set([
  '/dashboard',
  '/settings',
  '/profile'
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('favicon.ico') ||
    pathname.startsWith('/settings')
  ) {
    return NextResponse.next();
  }

  // Get the token and extract user state
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Handle public paths
  if (PUBLIC_PATHS.has(pathname)) {
    // Only redirect authenticated users from auth pages, not from the landing page
    if (AUTH_ONLY_REDIRECT_PATHS.has(pathname) && 
        token && 
        !token.needs_subscription && 
        token.careerGoal) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If no token, redirect to signin
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Define user states
  const hasCompletedOnboarding = Boolean(token.careerGoal);
  const needsSubscription = Boolean(token.needs_subscription);

  // Handle authentication flow
  if (!hasCompletedOnboarding && pathname !== '/auth/onboarding') {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  if (hasCompletedOnboarding && needsSubscription && pathname !== '/auth/signup') {
    return NextResponse.redirect(new URL('/auth/signup', request.url));
  }

  // Prevent access to auth pages if user is fully authenticated
  if (
    hasCompletedOnboarding &&
    !needsSubscription &&
    pathname.startsWith('/auth/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to protected routes only if fully authenticated
  if (PROTECTED_PATHS.has(pathname)) {
    if (!hasCompletedOnboarding) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url));
    }
    if (needsSubscription) {
      return NextResponse.redirect(new URL('/auth/signup', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};