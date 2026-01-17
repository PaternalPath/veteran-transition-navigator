/**
 * In-Memory Rate Limiter
 *
 * Simple IP-based rate limiting for API routes.
 * Stores request counts in memory (resets on server restart).
 *
 * **Configuration**:
 * - 10 requests per IP per 15 minutes
 * - Auto-cleanup of old entries every 5 minutes
 *
 * **Note**: For production at scale, consider:
 * - Redis-based rate limiting
 * - Edge function rate limiting (Vercel KV)
 * - Distributed rate limiting across instances
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Auto-cleanup old entries
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return; // Already running

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(ip);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Don't prevent Node from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request from an IP is allowed
 *
 * @param ip - Client IP address
 * @returns Object with allowed status and retry-after time
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  // Start cleanup timer on first use
  startCleanup();

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No entry or expired entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(ip, newEntry);

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 *
 * Checks common headers set by proxies/load balancers:
 * - x-forwarded-for (Vercel, most CDNs)
 * - x-real-ip (nginx)
 * - cf-connecting-ip (Cloudflare)
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be comma-separated list (client, proxy1, proxy2)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // Fallback to unknown (shouldn't happen on Vercel/most hosts)
  return 'unknown';
}

/**
 * Reset rate limit for an IP (useful for testing)
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
