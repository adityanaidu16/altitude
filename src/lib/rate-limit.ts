// lib/rate-limit.ts
import { prisma } from '@/lib/prisma';

interface RateLimitConfig {
  interval: number; // in seconds
  limit: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  'create_campaign': { interval: 3600, limit: 10 }, // 10 campaigns per hour
  'connection_request': { interval: 86400, limit: 100 }, // 100 connections per day
  'message_send': { interval: 3600, limit: 50 }, // 50 messages per hour
};

export async function rateLimit(
  userId: string,
  identifier: string,
  config: RateLimitConfig = DEFAULT_LIMITS[identifier] || { interval: 3600, limit: 100 }
) {
  try {
    const key = `${identifier}`;
    const now = new Date();
    const intervalStart = new Date(now.getTime() - (config.interval * 1000));

    // Clean up old rate limit entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up on each request
      await prisma.rateLimit.deleteMany({
        where: {
          timestamp: {
            lt: intervalStart
          }
        }
      });
    }

    // Get or create rate limit record
    const rateLimit = await prisma.$transaction(async (tx) => {
      const existing = await tx.rateLimit.findUnique({
        where: {
          key_userId: {
            key,
            userId
          }
        }
      });

      if (!existing || existing.timestamp < intervalStart) {
        // Create new rate limit record if none exists or interval has passed
        return tx.rateLimit.upsert({
          where: {
            key_userId: {
              key,
              userId
            }
          },
          create: {
            key,
            userId,
            count: 1,
            timestamp: now
          },
          update: {
            count: 1,
            timestamp: now
          }
        });
      }

      // Update existing rate limit record
      if (existing.count >= config.limit) {
        return existing;
      }

      return tx.rateLimit.update({
        where: {
          id: existing.id
        },
        data: {
          count: {
            increment: 1
          }
        }
      });
    });

    const remaining = Math.max(0, config.limit - rateLimit.count);
    const reset = new Date(rateLimit.timestamp.getTime() + (config.interval * 1000));

    return {
      success: rateLimit.count <= config.limit,
      remaining,
      reset,
      limit: config.limit
    };

  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open if database is unavailable
    return {
      success: true,
      remaining: 1,
      reset: new Date(Date.now() + 3600000),
      limit: config.limit
    };
  }
}

// Helper to get remaining limits
export async function getRateLimitInfo(userId: string, identifier: string) {
  const key = `${identifier}`;
  const config = DEFAULT_LIMITS[identifier] || { interval: 3600, limit: 100 };
  
  try {
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        key_userId: {
          key,
          userId
        }
      }
    });

    if (!rateLimit) {
      return {
        remaining: config.limit,
        reset: new Date(Date.now() + (config.interval * 1000)),
        limit: config.limit
      };
    }

    const now = new Date();
    const intervalStart = new Date(now.getTime() - (config.interval * 1000));

    if (rateLimit.timestamp < intervalStart) {
      return {
        remaining: config.limit,
        reset: new Date(now.getTime() + (config.interval * 1000)),
        limit: config.limit
      };
    }

    return {
      remaining: Math.max(0, config.limit - rateLimit.count),
      reset: new Date(rateLimit.timestamp.getTime() + (config.interval * 1000)),
      limit: config.limit
    };
  } catch (error) {
    console.error('Rate limit info error:', error);
    return {
      remaining: config.limit,
      reset: new Date(Date.now() + (config.interval * 1000)),
      limit: config.limit
    };
  }
}