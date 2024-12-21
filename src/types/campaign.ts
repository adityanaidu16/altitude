// types/campaign.ts
export interface CampaignFormData {
    name: string;
    targetCompany: string;
    dailyLimit: number;
    messageTemplate?: string;
    autoApprove: boolean;
    autoMessage: boolean;
  }
  
  export interface CampaignStats {
    total: number;
    pending: number;
    connected: number;
    messaged: number;
  }
  
  export interface Campaign {
    id: string;
    name: string;
    targetCompany: string;
    status: CampaignStatus;
    dailyLimit: number;
    messageTemplate?: string;
    autoApprove: boolean;
    autoMessage: boolean;
    prospects: Prospect[];
    stats: CampaignStats;
    createdAt: string;
    updatedAt: string;
  }
  
  export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  
  export interface Prospect {
    id: string;
    name: string;
    position: string;
    company: string;
    status: ProspectStatus;
    linkedinUrl: string;
    publicId: string;
    connectionId?: string;
    validationData?: {
      score: number;
      reasons: string[];
    };
    message: {
      message: {
        text: string;
        reasoning?: string;
      };
      commonalities?: {
        description: string;
        key_points: string[];
      };
      conversation_starters?: string[];
    };
    nextActionAt?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export type ProspectStatus = 
    | 'PENDING_VALIDATION'
    | 'VALIDATION_FAILED'
    | 'CONNECTION_PENDING'
    | 'CONNECTION_SENT'
    | 'CONNECTION_ACCEPTED'
    | 'MESSAGE_QUEUED'
    | 'MESSAGE_SENT'
    | 'COMPLETED'
    | 'FAILED';
  
  export interface ProspectAction {
    type: 'approve' | 'reject' | 'updateMessage' | 'sendConnection' | 'sendMessage';
    prospectId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
  }
  
  export interface CampaignAction {
    type: 'pause' | 'resume' | 'delete';
    campaignId: string;
  }