// types/next-auth.d.ts
import { PlanType } from '@prisma/client'

declare module "next-auth" {
  interface Prospect {
    id: string;
    name: string;
    position: string;
    company: string;
    linkedinUrl: string;
    publicId: string;
    status: ProspectStatus;
    connectionId?: string;
    message?: {
      text: string;
      commonalities?: {
        description: string;
        key_points: string[];
      };
    };
    validationData?: {
      score: number;
      reasons: string[];
    };
    nextActionAt?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  interface Session {
    user: User & {
      email: string
      name?: string | null
      image?: string | null
    };
    }
  }

  interface User {
    id?: string
    plan?: PlanType;
    planStartDate?: Date;
    planEndDate?: Date | null;
    needs_subscription: boolean;
    linkedinUsername?: string;
    careerGoal?: string | null;
    industry?: string | null;
    targetRoles?: string[];
    pendingDowngrade?: boolean;
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