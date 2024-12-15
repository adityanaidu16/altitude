// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client";

function LinkedInProvider(config: any) {
  return {
    id: "linkedin",
    name: "LinkedIn",
    type: "oauth",
    client: { token_endpoint_auth_method: "client_secret_post" },
    issuer: "https://www.linkedin.com",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        linkedinUsername: profile.email?.split('@')[0] || profile.sub
      };
    },
    wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
    authorization: {
      params: {
        scope: "openid profile email"
      }
    },
    style: { logo: "/linkedin.svg", bg: "#069", text: "#fff" },
    ...config,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) return false;

        console.log('Sign-in attempt for:', user.email);

        // Check for existing user
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            email: true,
            careerGoal: true,
            industry: true,
            targetRoles: true,
            plan: true,
            needs_subscription: true
          }
        });

        if (!existingUser) {
          console.log('Creating new user:', user.email);
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              plan: PlanType.FREE,
              needs_subscription: true,
              targetRoles: [],
            },
          });
        } else {
          console.log('Found existing user:', existingUser);
        }

        return true; // Always return true after handling user
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.email = user.email;
      }

      if (trigger === "update" && session) {
        // Return session data
        return { ...token, ...session };
      }

      // On every request, fetch fresh user data
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: {
          id: true,
          email: true,
          linkedinUsername: true,
          careerGoal: true,
          industry: true,
          targetRoles: true,
          plan: true,
          needs_subscription: true
        }
      });

      if (dbUser) {
        console.log('JWT callback - Found user data:', dbUser);
        return {
          ...token,
          ...dbUser
        };
      }

      return token;
    },

    async session({ session, token }) {
      console.log('Session callback - Token data:', token);
      
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.careerGoal = token.careerGoal as string;
        session.user.industry = token.industry as string;
        session.user.linkedinUsername = token.linkedinUsername as string;
        session.user.targetRoles = token.targetRoles as string[];
        session.user.plan = token.plan as string;
        session.user.needs_subscription = token.needs_subscription as boolean;
      }

      console.log('Session callback - Final session:', session);
      return session;
    }
  },

  events: {
    async signIn({ user }) {
      console.log('SignIn event:', user);
    },
    async session({ session }) {
      console.log('Session event:', session);
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };