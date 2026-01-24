import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import * as analyzer from '@/src/lib/analyzer';
import * as rateLimit from '@/src/lib/rateLimit';

// Mock the analyzer module
vi.mock('@/src/lib/analyzer', () => ({
  analyzeProfile: vi.fn(),
  VeteranProfileSchema: {
    parse: vi.fn(),
  },
}));

// Mock the rate limit module
vi.mock('@/src/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(),
  getClientIP: vi.fn(),
}));

// Mock the logger to avoid console output during tests
vi.mock('@/src/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Valid test profile
const validProfile = {
  branch: 'Army',
  yearsOfService: 8,
  rank: 'E-6',
  mos: '11B',
  technicalSkills: ['Leadership', 'Logistics'],
  certifications: ['Security+'],
  leadershipExperience: 'Squad Leader',
  familyStatus: 'Married',
  dependents: 2,
  spouseEmployment: 'Employed',
  currentLocation: 'Fort Bragg, NC',
  willingToRelocate: true,
  preferredLocations: ['Texas', 'Virginia'],
  careerGoals: 'Transition to cybersecurity',
  incomeExpectations: '$80,000-$100,000',
  educationInterest: 'Certifications',
  timeline: '6 months',
};

// Mock analysis result
const mockAnalysisResult = {
  summary: 'Test summary',
  pathways: [
    {
      type: 'fast-income' as const,
      title: 'Security Analyst',
      description: 'Entry-level security role',
      incomeTrajectory: { year1: '$70k', year3: '$90k', year5: '$120k' },
      roadmap: [{ phase: 'Phase 1', duration: '3 months', steps: ['Get certified'] }],
      requiredCredentials: [{ name: 'Security+', timeline: '2 months', cost: '$400' }],
      familyImpact: {
        timeCommitment: 'Full-time',
        flexibility: 'Moderate',
        stability: 'High',
        notes: 'Good work-life balance',
      },
      whyThisPath: 'Leverages military security experience',
    },
    {
      type: 'balanced' as const,
      title: 'IT Project Manager',
      description: 'Mid-level management role',
      incomeTrajectory: { year1: '$75k', year3: '$95k', year5: '$130k' },
      roadmap: [{ phase: 'Phase 1', duration: '6 months', steps: ['Get PMP'] }],
      requiredCredentials: [{ name: 'PMP', timeline: '6 months', cost: '$600' }],
      familyImpact: {
        timeCommitment: 'Full-time',
        flexibility: 'High',
        stability: 'High',
        notes: 'Remote work possible',
      },
      whyThisPath: 'Leadership experience transfers well',
    },
    {
      type: 'max-upside' as const,
      title: 'Cloud Architect',
      description: 'Senior technical role',
      incomeTrajectory: { year1: '$90k', year3: '$140k', year5: '$180k' },
      roadmap: [{ phase: 'Phase 1', duration: '12 months', steps: ['AWS certs'] }],
      requiredCredentials: [{ name: 'AWS SAA', timeline: '4 months', cost: '$300' }],
      familyImpact: {
        timeCommitment: 'Full-time+',
        flexibility: 'High',
        stability: 'Medium',
        notes: 'High growth potential',
      },
      whyThisPath: 'Technical skills in high demand',
    },
  ],
};

function createMockRequest(body: unknown, options: { contentLength?: string; ip?: string } = {}) {
  const headers = new Headers();
  headers.set('content-type', 'application/json');
  if (options.contentLength) {
    headers.set('content-length', options.contentLength);
  }
  if (options.ip) {
    headers.set('x-forwarded-for', options.ip);
  }

  return new NextRequest('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(rateLimit.getClientIP).mockReturnValue('127.0.0.1');
    vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 15 * 60 * 1000,
    });
    vi.mocked(analyzer.VeteranProfileSchema.parse).mockReturnValue(validProfile);
    vi.mocked(analyzer.analyzeProfile).mockResolvedValue(mockAnalysisResult);
  });

  describe('successful requests', () => {
    it('returns 200 with valid profile', async () => {
      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.summary).toBe('Test summary');
      expect(data.pathways).toHaveLength(3);
    });

    it('includes rate limit headers in successful response', async () => {
      const resetTime = Date.now() + 15 * 60 * 1000;
      vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 7,
        resetTime,
      });

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('7');
      expect(response.headers.get('X-RateLimit-Reset')).toBe(String(resetTime));
    });

    it('calls analyzeProfile with parsed profile', async () => {
      const request = createMockRequest(validProfile);
      await POST(request);

      expect(analyzer.analyzeProfile).toHaveBeenCalledWith(validProfile);
    });
  });

  describe('rate limiting', () => {
    it('returns 429 when rate limit exceeded', async () => {
      const resetTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
      vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime,
      });

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.message).toContain('Too many requests');
    });

    it('includes Retry-After header when rate limited', async () => {
      const resetTime = Date.now() + 600 * 1000; // 10 minutes
      vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime,
      });

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeDefined();
      expect(parseInt(retryAfter!)).toBeGreaterThan(0);
      expect(parseInt(retryAfter!)).toBeLessThanOrEqual(600);
    });

    it('includes rate limit headers when rate limited', async () => {
      const resetTime = Date.now() + 600 * 1000;
      vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime,
      });

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('X-RateLimit-Reset')).toBe(String(resetTime));
    });

    it('does not call analyzeProfile when rate limited', async () => {
      vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 600 * 1000,
      });

      const request = createMockRequest(validProfile);
      await POST(request);

      expect(analyzer.analyzeProfile).not.toHaveBeenCalled();
    });
  });

  describe('request size validation', () => {
    it('returns 413 when body exceeds 100KB limit', async () => {
      // Create a large body that exceeds 100KB
      const largeProfile = {
        ...validProfile,
        leadershipExperience: 'x'.repeat(150 * 1024), // 150KB of data
      };

      // The schema parse returns the large profile so size check triggers
      vi.mocked(analyzer.VeteranProfileSchema.parse).mockReturnValue(largeProfile);

      const request = createMockRequest(largeProfile);
      const response = await POST(request);

      expect(response.status).toBe(413);
      const data = await response.json();
      expect(data.error).toBe('Request too large');
      expect(data.message).toContain('100KB');
    });

    it('does not call analyzeProfile when request too large', async () => {
      const largeProfile = {
        ...validProfile,
        leadershipExperience: 'x'.repeat(150 * 1024),
      };
      vi.mocked(analyzer.VeteranProfileSchema.parse).mockReturnValue(largeProfile);

      const request = createMockRequest(largeProfile);
      await POST(request);

      expect(analyzer.analyzeProfile).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('returns 400 for invalid request body', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['branch'],
          message: 'Required',
        } as never,
      ]);
      vi.mocked(analyzer.VeteranProfileSchema.parse).mockImplementation(() => {
        throw zodError;
      });

      const request = createMockRequest({ invalid: 'data' });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request body');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('returns field-level error details', async () => {
      const { ZodError } = await import('zod');
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['branch'],
          message: 'Branch is required',
        } as never,
        {
          code: 'invalid_type',
          expected: 'number',
          path: ['yearsOfService'],
          message: 'Expected number',
        } as never,
      ]);
      vi.mocked(analyzer.VeteranProfileSchema.parse).mockImplementation(() => {
        throw zodError;
      });

      const request = createMockRequest({});
      const response = await POST(request);

      const data = await response.json();
      expect(data.details).toHaveLength(2);
      expect(data.details[0].field).toBe('branch');
      expect(data.details[0].message).toBe('Branch is required');
      expect(data.details[1].field).toBe('yearsOfService');
    });

    it('does not call analyzeProfile on validation error', async () => {
      const { ZodError } = await import('zod');
      vi.mocked(analyzer.VeteranProfileSchema.parse).mockImplementation(() => {
        throw new ZodError([]);
      });

      const request = createMockRequest({ invalid: 'data' });
      await POST(request);

      expect(analyzer.analyzeProfile).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 500 for unexpected errors', async () => {
      vi.mocked(analyzer.analyzeProfile).mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Database connection failed');
    });

    it('sanitizes error messages containing API references', async () => {
      vi.mocked(analyzer.analyzeProfile).mockRejectedValue(
        new Error('API key invalid: sk-ant-xxxx')
      );

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to analyze profile');
      expect(data.error).not.toContain('API');
      expect(data.error).not.toContain('sk-ant');
    });

    it('handles non-Error exceptions', async () => {
      vi.mocked(analyzer.analyzeProfile).mockRejectedValue('string error');

      const request = createMockRequest(validProfile);
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to analyze profile');
    });
  });

  describe('IP extraction', () => {
    it('extracts client IP from request headers', async () => {
      const request = createMockRequest(validProfile, { ip: '192.168.1.100' });
      await POST(request);

      expect(rateLimit.getClientIP).toHaveBeenCalled();
    });

    it('uses extracted IP for rate limiting', async () => {
      vi.mocked(rateLimit.getClientIP).mockReturnValue('10.0.0.50');

      const request = createMockRequest(validProfile);
      await POST(request);

      expect(rateLimit.checkRateLimit).toHaveBeenCalledWith('10.0.0.50');
    });
  });
});
