import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 *
 * Used by load balancers, Kubernetes probes, and monitoring systems
 * to verify the application is running and responsive.
 *
 * Returns:
 * - 200 OK: Service is healthy
 * - Includes timestamp and mode for debugging
 */
export async function GET() {
  const isRealMode = !!process.env.ANTHROPIC_API_KEY;

  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mode: isRealMode ? 'real' : 'demo',
      version: process.env.npm_package_version || '0.1.0',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
