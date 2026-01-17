import { NextRequest, NextResponse } from 'next/server';
import { analyzeProfile, VeteranProfileSchema } from '@/src/lib/analyzer';
import { z } from 'zod';

/**
 * POST /api/analyze
 *
 * Analyzes a veteran profile and returns career pathway recommendations.
 *
 * **Demo Mode** (no API key): Returns deterministic pathways
 * **Real Mode** (API key present): Uses Anthropic AI for personalized analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body with Zod
    const profile = VeteranProfileSchema.parse(body);

    // Analyze profile (automatically selects Demo or Real mode)
    const result = await analyzeProfile(profile);

    // Return successful result
    return NextResponse.json(result);
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

    // Handle other errors (don't leak stack traces)
    const message = error instanceof Error ? error.message : 'Failed to analyze profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
