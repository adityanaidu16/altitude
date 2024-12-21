import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts username from a LinkedIn profile URL
 * @param linkedinUrl - Full LinkedIn profile URL
 * @returns username or null if invalid URL
 */
export function extractUsername(linkedinUrl: string): string | null {
  try {
    const url = new URL(linkedinUrl);
    if (!url.hostname.includes('linkedin.com')) {
      return null;
    }
    
    // Extract username from path
    const match = url.pathname.match(/\/in\/([^\/]+)/);
    return match ? match[1] : null;
    
  } catch {
    return null;
  }
}