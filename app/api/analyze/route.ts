import { NextRequest, NextResponse } from 'next/server';
import { analyzeProfile, VeteranProfileSchema } from '@/src/lib/analyzer';
import { checkRateLimit, getClientIP } from '@/src/lib/rateLimit';
import { logger } from '@/src/lib/logger';
import { z } from 'zod';

/**
 * POST /api/analyze
 *
 * Analyzes a veteran profile and returns career pathway recommendations.
 *
 * **Demo Mode** (no API key): Returns deterministic pathways
 * **Real Mode** (API key present): Uses Anthropic AI for personalized analysis
 *
 * **Security**:
 * - Rate limiting: 10 requests per IP per 15 minutes
 * - Request size limit: 100KB
 * - Input validation: Zod schemas
 * - No sensitive data in logs
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting check
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          },
        }
      );
    }

    // 2. Request size check (100KB limit)
    const contentLength = request.headers.get('content-length');
    const MAX_SIZE = 100 * 1024; // 100KB

    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json(
        {
          error: 'Request too large',
          message: 'Request body exceeds 100KB limit',
        },
        { status: 413 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();

    // Additional size check after parsing (in case content-length is missing)
    const bodySize = JSON.stringify(body).length;
    if (bodySize > MAX_SIZE) {
      return NextResponse.json(
        {
          error: 'Request too large',
          message: 'Request body exceeds 100KB limit',
        },
        { status: 413 }
      );
    }

    // 4. Validate request body with Zod
    const profile = VeteranProfileSchema.parse(body);

    // 5. Analyze profile (automatically selects Demo or Real mode)
    const result = await analyzeProfile(profile);

    // 6. Return successful result with rate limit headers
    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.resetTime),
      },
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors (don't leak stack traces or sensitive info)
    logger.error(
      'Profile analysis failed',
      { endpoint: '/api/analyze' },
      error instanceof Error ? error : new Error('Unknown error')
    );

    const message =
      error instanceof Error && !error.message.includes('API')
        ? error.message
        : 'Failed to analyze profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
