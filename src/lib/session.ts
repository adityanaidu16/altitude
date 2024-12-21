import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { Session } from 'next-auth';

export async function getSession() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await getServerSession(authOptions as any) as Session;
}

// You can also add a helper to get the user with full type safety
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}