import { AnalysisResult, VeteranProfile } from './types';
import { analyzeDemoMode } from './demoProvider';
import { analyzeRealMode } from './realProvider';

/**
 * Main Analyzer Service - Automatically selects Demo or Real mode
 *
 * **Demo Mode** (No API key required):
 * - Works with ZERO environment variables
 * - Returns deterministic, realistic career pathways
 * - Perfect for Vercel deployment without configuration
 *
 * **Real Mode** (API key present):
 * - Uses Anthropic API for AI-powered analysis
 * - Personalized insights based on veteran profile
 * - Requires ANTHROPIC_API_KEY environment variable
 */
export async function analyzeProfile(profile: VeteranProfile): Promise<AnalysisResult> {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (hasApiKey) {
    // Real mode: Use Anthropic API
    return analyzeRealMode(profile);
  } else {
    // Demo mode: Use deterministic templates
    return analyzeDemoMode(profile);
  }
}

/**
 * Check if the application is running in Demo Mode or Real Mode
 */
export function isUsingDemoMode(): boolean {
  return !Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Get the current mode as a string
 */
export function getCurrentMode(): 'demo' | 'real' {
  return isUsingDemoMode() ? 'demo' : 'real';
}

// Re-export types for convenience
export type { VeteranProfile, AnalysisResult, CareerPathway } from './types';
export { VeteranProfileSchema, AnalysisResultSchema } from './types';
