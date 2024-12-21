// app/api/campaigns/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { linkedInService } from '@/lib/services/linkedin';
import { authOptions } from '../auth/[...nextauth]/auth';
import { z } from 'zod';
import { CampaignStatus, ProspectStatus } from '@prisma/client';
import { rateLimit } from '@/lib/rate-limit';

interface Prospect {
  name: string;
  position: string;
  company: string;
  linkedinUrl: string;
  publicId: string;
}

// Helper function to calculate campaign stats
async function calculateCampaignStats(campaignId: string) {
  console.log(`Calculating stats for campaign ${campaignId}`);
  const stats = await prisma.prospect.groupBy({
    by: ['status'],
    where: {
      campaignId,
    },
    _count: {
      _all: true,
    },
  });

  console.log('Raw stats:', stats);

  const total = stats.reduce((acc, curr) => acc + curr._count._all, 0);
  const connected = stats.find(s => s.status === 'CONNECTION_ACCEPTED')?._count._all || 0;
  const pending = stats.find(s => s.status === 'PENDING_VALIDATION')?._count._all || 0;
  const messaged = stats.find(s => s.status === 'MESSAGE_SENT')?._count._all || 0;

  const calculatedStats = {
    total,
    connected,
    pending,
    messaged
  };
  console.log('Calculated stats:', calculatedStats);
  return calculatedStats;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function formatCampaignResponse(campaign: any) {
  console.log(`Formatting campaign response for campaign ${campaign.id}`);
  const stats = await calculateCampaignStats(campaign.id);
  
  return {
    ...campaign,
    stats,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prospects: campaign.prospects?.map((prospect: any) => ({
      ...prospect,
      status: prospect.status || 'PENDING_VALIDATION'
    }))
  };
}

interface ValidationResult {
  score: number;
  factors: { name: string; score: number; weight: number }[];
}

function calculateValidationScore(
  prospect: Prospect, 
  targetCompany: string,
  userPreferences: {
    careerGoal: 'job' | 'internship';
    industry: string;
    targetRoles: string[];
  }
): ValidationResult {
  const factors: { name: string; score: number; weight: number }[] = [];
  let totalScore = 0;

  // Company match (40%)
  const companyScore = calculateCompanyScore(prospect.company, targetCompany);
  factors.push({ 
    name: 'Company Match', 
    score: companyScore, 
    weight: 0.4 
  });
  totalScore += companyScore * 0.4;

  // Role relevance (30%)
  const roleScore = calculateRoleScore(prospect.position, userPreferences);
  factors.push({ 
    name: 'Role Relevance', 
    score: roleScore, 
    weight: 0.3 
  });
  totalScore += roleScore * 0.3;

  // Seniority match (20%)
  const seniorityScore = calculateSeniorityScore(prospect.position, userPreferences.careerGoal);
  factors.push({ 
    name: 'Seniority Match', 
    score: seniorityScore, 
    weight: 0.2 
  });
  totalScore += seniorityScore * 0.2;

  // Profile completeness (10%)
  const completenessScore = calculateCompletenessScore(prospect);
  factors.push({ 
    name: 'Profile Completeness', 
    score: completenessScore, 
    weight: 0.1 
  });
  totalScore += completenessScore * 0.1;

  return {
    score: totalScore,
    factors
  };
}

function calculateCompanyScore(prospectCompany: string, targetCompany: string): number {
  const prospect = prospectCompany.toLowerCase();
  const target = targetCompany.toLowerCase();
  
  // Exact match
  if (prospect === target) return 1;
  
  // Subsidiary/parent company match (e.g., "Google" vs "Google Cloud")
  if (prospect.includes(target) || target.includes(prospect)) return 0.8;
  
  return 0;
}

function calculateRoleScore(position: string, preferences: { industry: string; targetRoles: string[] }): number {
  const pos = position.toLowerCase();
  
  // Define role keywords based on industry and target roles
  const roleKeywords = getRoleKeywords(preferences.industry, preferences.targetRoles);
  
  // Check for keyword matches
  const matches = roleKeywords.filter(keyword => pos.includes(keyword.toLowerCase()));
  
  if (matches.length === 0) return 0;
  if (matches.length === 1) return 0.7;
  return 1;
}

function getRoleKeywords(industry: string, targetRoles: string[]): string[] {
  const industryKeywords = {
    'tech': ['software', 'developer', 'engineer', 'data', 'product', 'technical'],
    'banking': ['investment', 'analyst', 'associate', 'trading', 'research'],
    'consulting': ['consultant', 'strategy', 'advisory', 'associate']
  };

  const roleSpecificKeywords = {
    'swe': ['software', 'developer', 'engineer', 'full-stack', 'backend', 'frontend'],
    'pm': ['product', 'program', 'manager', 'owner'],
    'data': ['data', 'scientist', 'analyst', 'machine learning', 'ai'],
    'ib': ['investment', 'banking', 'financial', 'analyst'],
    'sales': ['sales', 'trading', 'markets'],
    'strategy': ['strategy', 'management', 'consulting']
  };

  const baseKeywords = industryKeywords[industry as keyof typeof industryKeywords] || [];
  const additionalKeywords = targetRoles.flatMap(role => 
    roleSpecificKeywords[role as keyof typeof roleSpecificKeywords] || []
  );

  return [...new Set([...baseKeywords, ...additionalKeywords])];
}

function calculateSeniorityScore(position: string, careerGoal: 'job' | 'internship'): number {
  const pos = position.toLowerCase();
  
  const internshipKeywords = ['intern', 'internship', 'student', 'graduate'];
  const entryLevelKeywords = ['junior', 'associate', 'entry', 'graduate'];
  const seniorKeywords = ['senior', 'lead', 'manager', 'director', 'head'];
  
  if (careerGoal === 'internship') {
    if (internshipKeywords.some(keyword => pos.includes(keyword))) return 1;
    if (entryLevelKeywords.some(keyword => pos.includes(keyword))) return 0.5;
    if (seniorKeywords.some(keyword => pos.includes(keyword))) return 0;
    return 0.3; // Default for unclear positions
  } else {
    // For full-time jobs
    if (seniorKeywords.some(keyword => pos.includes(keyword))) return 0.3;
    if (entryLevelKeywords.some(keyword => pos.includes(keyword))) return 1;
    if (internshipKeywords.some(keyword => pos.includes(keyword))) return 0.2;
    return 0.7; // Default for unclear positions
  }
}

function calculateCompletenessScore(prospect: Prospect): number {
  const requiredFields = ['name', 'position', 'company', 'linkedinUrl'];
  const optionalFields = ['location', 'summary', 'experience'];
  
  const requiredScore = requiredFields.filter(field => !!prospect[field as keyof Prospect]).length / requiredFields.length;
  const optionalScore = optionalFields.filter(field => !!prospect[field as keyof Prospect]).length / optionalFields.length;
  
  return (requiredScore * 0.7) + (optionalScore * 0.3);
}

function getValidationReasons(prospect: Prospect, targetCompany: string): string[] {
  const reasons: string[] = [];
  
  if (prospect.company.toLowerCase() === targetCompany.toLowerCase()) {
    reasons.push('Target company match');
  }
  
  if (prospect.position.toLowerCase().includes('engineer') || 
      prospect.position.toLowerCase().includes('developer') ||
      prospect.position.toLowerCase().includes('manager')) {
    reasons.push('Relevant position');
  }
  
  if (prospect.name && prospect.position && prospect.company) {
    reasons.push('Complete profile information');
  }
  
  return reasons;
}

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  targetCompany: z.string().min(1, "Target company is required"),
  autoApprove: z.boolean().default(false)  // Keep only this automation option
});

// GET - Fetch all campaigns
export async function GET() {
  console.log('GET /api/campaigns - Fetching campaigns');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Unauthorized - No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Fetching campaigns for user ${session.user.email}`);
    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.user.id as string },
      include: {
        prospects: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${campaigns.length} campaigns`);

    // Format each campaign with stats
    const formattedCampaigns = await Promise.all(
      campaigns.map(formatCampaignResponse)
    );

    return NextResponse.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST - Create new campaign
export async function POST(req: Request) {
  console.log('POST /api/campaigns - Creating new campaign');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Unauthorized - No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting check...
    console.log('Checking rate limit...');
    const rateLimitResult = await rateLimit(session.user.id as string, 'create_campaign');
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded:', rateLimitResult);
      return NextResponse.json({
        error: 'Rate limit exceeded. Please try again later.',
        reset: rateLimitResult.reset,
        remaining: rateLimitResult.remaining
      }, { status: 429 });
    }

    const body = await req.json();
    console.log('Validating request body:', body);
    const validatedData = campaignSchema.parse(body);

    console.log('Fetching user details...');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, targetRoles: true, plan: true }
    });

    if (!user?.targetRoles?.length) {
      console.log('No target roles set for user');
      return NextResponse.json(
        { error: 'Please set your target roles in profile settings' },
        { status: 400 }
      );
    }

    // Check plan limits...
    console.log('Checking plan limits...');
    const campaignCount = await prisma.campaign.count({
      where: { userId: user.id }
    });

    if (user.plan !== 'PRO') {
      const campaignLimit = user.plan === 'PLUS' ? 20 : 2;
      if (campaignCount >= campaignLimit) {
        console.log(`Campaign limit reached: ${campaignCount}/${campaignLimit}`);
        return NextResponse.json(
          { error: 'Campaign limit reached for your plan' },
          { status: 403 }
        );
      }
    }

    // Search for prospects before transaction
    let prospects: Prospect[] = [];
    try {
      console.log('Searching for prospects...');
      prospects = await linkedInService.searchProspects(
        validatedData.targetCompany,
        user.targetRoles
      );
      console.log(`Found ${prospects.length} prospects`);

      // Validate prospect data
      prospects = prospects.filter(prospect => 
        prospect.name && 
        prospect.position && 
        prospect.company &&
        prospect.linkedinUrl &&
        prospect.publicId
      );

      // Cap prospects at 15 for FREE users
      if (user.plan === 'FREE' && prospects.length > 15) {
        console.log(`Capping prospects to 15 for FREE plan (was ${prospects.length})`);
        prospects = prospects.slice(0, 15);
      }
    } catch (error) {
      console.error('Error searching prospects:', error);
      prospects = [];
    }

    // Create campaign with prospects in transaction
    const campaign = await prisma.$transaction(async (tx) => {
      const newCampaign = await tx.campaign.create({
        data: {
          ...validatedData,
          userId: user.id,
          status: CampaignStatus.ACTIVE,
        }
      });
      console.log('Created campaign:', newCampaign.id);

      if (prospects.length > 0) {
        console.log(`Creating ${prospects.length} prospects...`);
        await tx.prospect.createMany({
          data: prospects.map(prospect => {
            // Check if prospect is optimal for auto-approval
            const validationResult = calculateValidationScore(
              prospect,
              validatedData.targetCompany,
              {
                careerGoal: session.user.careerGoal as 'job' | 'internship',
                industry: session.user.industry || '',
                targetRoles: session.user.targetRoles || []
              }
            );
            console.log(validationResult)
            
            const shouldAutoApprove = validatedData.autoApprove && validationResult.score >= 0.7;
            
            return {
              name: prospect.name,
              position: prospect.position,
              company: prospect.company,
              linkedinUrl: prospect.linkedinUrl,
              publicId: prospect.publicId,
              campaignId: newCampaign.id,
              status: shouldAutoApprove ? ProspectStatus.CONNECTION_PENDING : ProspectStatus.PENDING_VALIDATION,
              validationData: {
                score: validationResult.score,
                reasons: getValidationReasons(prospect, validatedData.targetCompany)
              }
            };
          })
        });
      }

      return await tx.campaign.findUnique({
        where: { id: newCampaign.id },
        include: { prospects: true }
      });
    });

    const formattedCampaign = await formatCampaignResponse(campaign);
    return NextResponse.json(formattedCampaign);

  } catch (error) {
    console.error('Error creating campaign:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid campaign data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
