import { NextResponse } from 'next/server';
import { getCurrentMode } from '@/src/lib/analyzer';

/**
 * GET /api/mode
 *
 * Returns the current operating mode (demo or real)
 */
export async function GET() {
  const mode = getCurrentMode();

  return NextResponse.json({
    mode,
    description:
      mode === 'demo'
        ? 'Running in Demo Mode - using deterministic templates (no API key required)'
        : 'Running in Real Mode - using Anthropic AI for personalized analysis',
  });
}
