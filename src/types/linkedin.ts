export interface LinkedInBasicInfo {
    name: string;
    industry?: string;
    location?: string;
    headline?: string;
    email?: string;
  }
  
  export interface LinkedInExperience {
    title: string;
    company: string;
    duration: string;
    location?: string;
    description?: string;
  }
  
  export interface LinkedInEducation {
    school: string;
    degree?: string;
    field?: string;
  }
  
  export interface LinkedInHonor {
    title: string;
    issuer?: string;
    year?: number;
  }
  
  export interface LinkedInProfile {
    basic_info: LinkedInBasicInfo;
    experience: LinkedInExperience[];
    education?: LinkedInEducation[];
    skills?: string[];
    honors?: LinkedInHonor[];
  }
  
  export interface MessageResponse {
    commonalities: {
      description: string;
      key_points: string[];
    };
    message: {
      text: string;
      reasoning: string;
    };
    conversation_starters: string[];
  }
  
  export interface ProfileInfo {
    name: string;
    company: string;
    position: string;
  }
  
  export interface GenerateMessageResponse {
    id: string;
    message: MessageResponse;
    profileInfo: ProfileInfo;
  }
  
  export type MessageTone = 'formal' | 'casual' | 'professional';