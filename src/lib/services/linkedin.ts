// services/linkedin.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export interface Prospect {
  name: string;
  position: string;
  company: string;
  publicId: string;
  linkedinUrl: string;
}

export type ConnectionStatus = 'connected' | 'pending' | 'not_connected';

class LinkedInService {
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      // Try to parse error response if it's JSON
      if (contentType?.includes('application/json')) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API request failed');
        } catch (e) {
          // If JSON parsing fails, use text response
          const text = await response.text();
          throw new Error(text || `HTTP error ${response.status}`);
        }
      }
      // If not JSON, get text response
      const text = await response.text();
      throw new Error(text || `HTTP error ${response.status}`);
    }

    // Handle successful response
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    throw new Error('Invalid response format: expected JSON');
  }

  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Fetching ${url}...`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async searchProspects(companyName: string, targetRoles: string[]): Promise<Prospect[]> {
    try {
      const response = await this.fetchWithErrorHandling<{ prospects: Prospect[] }>('/api/prospects/search', {
        method: 'POST',
        body: JSON.stringify({ 
          companyName, 
          targetRoles 
        }),
      });
      return response.prospects;
    } catch (error) {
      console.error('Search prospects error:', error);
      throw new Error(`Failed to search prospects: ${error.message}`);
    }
  }

  async sendConnectionRequest(prospectId: string, message: string): Promise<boolean> {
    try {
      const response = await this.fetchWithErrorHandling<{ success: boolean }>('/api/connection/request', {
        method: 'POST',
        body: JSON.stringify({ 
          prospectId, 
          message 
        }),
      });
      return response.success;
    } catch (error) {
      console.error('Send connection request error:', error);
      throw new Error(`Failed to send connection request: ${error.message}`);
    }
  }

  async sendMessage(connectionId: string, message: string): Promise<boolean> {
    try {
      const response = await this.fetchWithErrorHandling<{ success: boolean }>('/api/message/send', {
        method: 'POST',
        body: JSON.stringify({ 
          connectionId, 
          message 
        }),
      });
      return response.success;
    } catch (error) {
      console.error('Send message error:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async checkConnectionStatus(publicId: string): Promise<ConnectionStatus> {
    try {
      const response = await this.fetchWithErrorHandling<{ status: ConnectionStatus }>(`/api/connection/status/${publicId}`, {
        method: 'GET',
      });
      return response.status;
    } catch (error) {
      console.error('Check connection status error:', error);
      throw new Error(`Failed to check connection status: ${error.message}`);
    }
  }
}

export const linkedInService = new LinkedInService();