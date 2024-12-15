// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { PlanType } from '@prisma/client'

declare module "next-auth" {
  interface Session {
    user: User & {
      email: string
      name?: string | null
      image?: string | null
    };
    }
  }

  interface User {
    plan?: PlanType;
    planStartDate?: Date;
    planEndDate?: Date | null;
    needs_subscription: boolean;
    linkedinUsername?: string;
    careerGoal?: string | null;
    industry?: string | null;
    targetRoles?: string[];
    linkedinProfile?: {
      basic_info?: {
        name: string;
        industry?: string;
        location?: string;
        headline?: string;
        email?: string;
      };
      experience?: Array<{
        title: string;
        company: string;
        duration: string;
        location?: string;
        description?: string;
      }>;
      education?: Array<{
        school: string;
        degree?: string;
        field?: string;
      }>;
      skills?: string[];
      honors?: Array<{
        title: string;
        issuer?: string;
        year?: number;
      }>;
    };
  }