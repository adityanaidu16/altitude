import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';

export async function getSession() {
  return await getServerSession(authOptions as any) as Session;
}

// You can also add a helper to get the user with full type safety
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}