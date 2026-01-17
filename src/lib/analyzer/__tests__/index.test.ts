import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeProfile, isUsingDemoMode, getCurrentMode } from '../index';

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
});
