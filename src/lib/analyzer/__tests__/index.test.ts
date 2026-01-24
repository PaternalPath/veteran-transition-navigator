import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeProfile, isUsingDemoMode, getCurrentMode } from '../index';
import * as realProvider from '../realProvider';
import { logger } from '../../logger';

// Mock the logger
vi.mock('../../logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Provider Selection', () => {
  const sampleProfile = {
    branch: 'Army',
    yearsOfService: 4,
    rank: 'E-4',
    mos: '25B',
    technicalSkills: ['Networking', 'Troubleshooting'],
    certifications: [],
    leadershipExperience: 'Team lead for network operations',
    familyStatus: 'Single',
    dependents: 0,
    spouseEmployment: 'N/A',
    currentLocation: 'Fort Hood, TX',
    willingToRelocate: true,
    preferredLocations: ['Austin, TX', 'Dallas, TX'],
    careerGoals: 'IT career in civilian sector',
    incomeExpectations: '$60,000+',
    educationInterest: 'Certifications (CompTIA, Cisco)',
    timeline: '3-6 months',
  };

  let originalEnv: string | undefined;

  beforeEach(() => {
    // Save original ANTHROPIC_API_KEY
    originalEnv = process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalEnv;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  describe('isUsingDemoMode', () => {
    it('returns true when ANTHROPIC_API_KEY is not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(isUsingDemoMode()).toBe(true);
    });

    it('returns false when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';
      expect(isUsingDemoMode()).toBe(false);
    });

    it('returns true when ANTHROPIC_API_KEY is empty string', () => {
      process.env.ANTHROPIC_API_KEY = '';
      expect(isUsingDemoMode()).toBe(true);
    });
  });

  describe('getCurrentMode', () => {
    it('returns "demo" when no API key is set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(getCurrentMode()).toBe('demo');
    });

    it('returns "real" when API key is set', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';
      expect(getCurrentMode()).toBe('real');
    });
  });

  describe('analyzeProfile', () => {
    it('uses demo mode when ANTHROPIC_API_KEY is not set', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const result = await analyzeProfile(sampleProfile);

      // Verify result is valid
      expect(result).toBeDefined();
      expect(result.summary).toBeTruthy();
      expect(result.pathways).toHaveLength(3);

      // Verify it's deterministic (demo mode behavior)
      const result2 = await analyzeProfile(sampleProfile);
      expect(result.summary).toBe(result2.summary);
    });

    it('returns valid result structure in demo mode', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const result = await analyzeProfile(sampleProfile);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('pathways');
      expect(Array.isArray(result.pathways)).toBe(true);
      expect(result.pathways.length).toBe(3);

      // Check pathway types
      const types = result.pathways.map((p) => p.type);
      expect(types).toContain('fast-income');
      expect(types).toContain('balanced');
      expect(types).toContain('max-upside');
    });

    // Note: We don't test real mode here because it would require actual API calls
    // That's tested separately with mocks or integration tests
  });

  describe('graceful degradation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('falls back to demo mode when real mode throws an error', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';

      // Mock realProvider to throw an error
      const mockAnalyzeRealMode = vi
        .spyOn(realProvider, 'analyzeRealMode')
        .mockRejectedValue(new Error('API rate limit exceeded'));

      const result = await analyzeProfile(sampleProfile);

      // Should still return valid results (from demo mode)
      expect(result).toBeDefined();
      expect(result.summary).toBeTruthy();
      expect(result.pathways).toHaveLength(3);

      // Verify real mode was attempted
      expect(mockAnalyzeRealMode).toHaveBeenCalledWith(sampleProfile);

      mockAnalyzeRealMode.mockRestore();
    });

    it('logs a warning when falling back to demo mode', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';

      const mockAnalyzeRealMode = vi
        .spyOn(realProvider, 'analyzeRealMode')
        .mockRejectedValue(new Error('Connection timeout'));

      await analyzeProfile(sampleProfile);

      // Verify warning was logged
      expect(logger.warn).toHaveBeenCalledWith(
        'Real mode failed, falling back to demo mode',
        expect.objectContaining({
          error: 'Connection timeout',
          errorType: 'Error',
        })
      );

      mockAnalyzeRealMode.mockRestore();
    });

    it('handles non-Error exceptions gracefully', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';

      const mockAnalyzeRealMode = vi
        .spyOn(realProvider, 'analyzeRealMode')
        .mockRejectedValue('string error');

      const result = await analyzeProfile(sampleProfile);

      // Should still return valid results
      expect(result).toBeDefined();
      expect(result.pathways).toHaveLength(3);

      // Verify warning was logged with unknown error
      expect(logger.warn).toHaveBeenCalledWith(
        'Real mode failed, falling back to demo mode',
        expect.objectContaining({
          error: 'Unknown error',
          errorType: 'Unknown',
        })
      );

      mockAnalyzeRealMode.mockRestore();
    });

    it('returns demo mode results that are deterministic after fallback', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';

      const mockAnalyzeRealMode = vi
        .spyOn(realProvider, 'analyzeRealMode')
        .mockRejectedValue(new Error('API error'));

      const result1 = await analyzeProfile(sampleProfile);
      const result2 = await analyzeProfile(sampleProfile);

      // Demo mode is deterministic, so results should be identical
      expect(result1.summary).toBe(result2.summary);
      expect(result1.pathways[0].title).toBe(result2.pathways[0].title);

      mockAnalyzeRealMode.mockRestore();
    });

    it('does not fall back when real mode succeeds', async () => {
      process.env.ANTHROPIC_API_KEY = 'sk-test-key';

      const mockResult = {
        summary: 'Real mode result',
        pathways: [
          {
            type: 'fast-income' as const,
            title: 'Real Job',
            description: 'From API',
            incomeTrajectory: { year1: '$70k', year3: '$90k', year5: '$110k' },
            roadmap: [{ phase: 'Phase 1', duration: '3 months', steps: ['Step 1'] }],
            requiredCredentials: [{ name: 'Cert', timeline: '1 month', cost: '$100' }],
            familyImpact: {
              timeCommitment: 'Full-time',
              flexibility: 'High',
              stability: 'Good',
              notes: 'Notes',
            },
            whyThisPath: 'Reason',
          },
          {
            type: 'balanced' as const,
            title: 'Balanced Job',
            description: 'From API',
            incomeTrajectory: { year1: '$75k', year3: '$95k', year5: '$115k' },
            roadmap: [{ phase: 'Phase 1', duration: '6 months', steps: ['Step 1'] }],
            requiredCredentials: [{ name: 'Cert', timeline: '2 months', cost: '$200' }],
            familyImpact: {
              timeCommitment: 'Full-time',
              flexibility: 'Medium',
              stability: 'Good',
              notes: 'Notes',
            },
            whyThisPath: 'Reason',
          },
          {
            type: 'max-upside' as const,
            title: 'Max Job',
            description: 'From API',
            incomeTrajectory: { year1: '$80k', year3: '$120k', year5: '$150k' },
            roadmap: [{ phase: 'Phase 1', duration: '12 months', steps: ['Step 1'] }],
            requiredCredentials: [{ name: 'Cert', timeline: '6 months', cost: '$500' }],
            familyImpact: {
              timeCommitment: 'Full-time+',
              flexibility: 'Low',
              stability: 'Medium',
              notes: 'Notes',
            },
            whyThisPath: 'Reason',
          },
        ],
      };

      const mockAnalyzeRealMode = vi
        .spyOn(realProvider, 'analyzeRealMode')
        .mockResolvedValue(mockResult);

      const result = await analyzeProfile(sampleProfile);

      // Should return real mode result
      expect(result.summary).toBe('Real mode result');
      expect(result.pathways[0].title).toBe('Real Job');

      // Warning should NOT be logged
      expect(logger.warn).not.toHaveBeenCalled();

      mockAnalyzeRealMode.mockRestore();
    });
  });
});
