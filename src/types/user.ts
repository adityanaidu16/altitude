// types/user.ts
export type CareerGoal = 'job' | 'internship';

export interface Industry {
  id: string;
  name: string;
}

export interface TargetRole {
  id: string;
  name: string;
  industryId: string;
}

export interface UserPreferences {
  careerGoal: CareerGoal;
  industry: string;
  targetRoles: string[];
  linkedinUsername: string;
}