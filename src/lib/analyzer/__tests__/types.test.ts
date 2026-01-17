import { describe, it, expect } from 'vitest';
import { VeteranProfileSchema, AnalysisResultSchema } from '../types';

describe('VeteranProfileSchema', () => {
  it('validates a complete valid profile', () => {
    const validProfile = {
      branch: 'Army',
      yearsOfService: 6,
      rank: 'E-5',
      mos: '11B',
      technicalSkills: ['Leadership', 'Firearms'],
      certifications: ['CPR'],
      leadershipExperience: 'Squad leader for 2 years',
      familyStatus: 'Married',
      dependents: 2,
      spouseEmployment: 'Full-time',
      currentLocation: 'Fort Bragg, NC',
      willingToRelocate: true,
      preferredLocations: ['Raleigh, NC', 'Charlotte, NC'],
      careerGoals: 'Law enforcement',
      incomeExpectations: '$50,000+',
      educationInterest: 'Associates degree',
      timeline: '6 months',
    };

    const result = VeteranProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects profile with missing required fields', () => {
    const invalidProfile = {
      branch: 'Army',
      // Missing yearsOfService, rank, mos, etc.
    };

    const result = VeteranProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('rejects profile with invalid data types', () => {
    const invalidProfile = {
      branch: 'Army',
      yearsOfService: '6', // Should be number
      rank: 'E-5',
      mos: '11B',
      technicalSkills: 'Leadership', // Should be array
      certifications: [],
      leadershipExperience: 'Squad leader',
      familyStatus: 'Married',
      dependents: 2,
      spouseEmployment: 'Full-time',
      currentLocation: 'Fort Bragg, NC',
      willingToRelocate: true,
      preferredLocations: [],
      careerGoals: 'Law enforcement',
      incomeExpectations: '$50,000+',
      educationInterest: 'Associates',
      timeline: '6 months',
    };

    const result = VeteranProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('accepts empty arrays for optional array fields', () => {
    const validProfile = {
      branch: 'Navy',
      yearsOfService: 4,
      rank: 'E-4',
      mos: '25B',
      technicalSkills: [], // Empty is valid
      certifications: [], // Empty is valid
      leadershipExperience: 'None',
      familyStatus: 'Single',
      dependents: 0,
      spouseEmployment: 'N/A',
      currentLocation: 'San Diego, CA',
      willingToRelocate: false,
      preferredLocations: [], // Empty is valid
      careerGoals: 'IT career',
      incomeExpectations: '$60,000',
      educationInterest: 'None',
      timeline: '3 months',
    };

    const result = VeteranProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });
});

describe('AnalysisResultSchema', () => {
  it('validates a complete valid result', () => {
    const validResult = {
      summary: 'Strong technical background with leadership experience.',
      pathways: [
        {
          type: 'fast-income',
          title: 'IT Help Desk Technician',
          description: 'Entry-level IT support role.',
          incomeTrajectory: {
            year1: '$42,000 - $52,000',
            year3: '$57,000 - $77,000',
            year5: '$72,000 - $97,000',
          },
          roadmap: [
            {
              phase: 'Month 1-3: Certifications',
              duration: '3 months',
              steps: ['Get CompTIA A+', 'Apply to jobs'],
            },
          ],
          requiredCredentials: [
            {
              name: 'CompTIA A+',
              timeline: '2-3 months',
              cost: '$250',
            },
          ],
          familyImpact: {
            timeCommitment: 'Low (40-45 hrs/week)',
            flexibility: 'High',
            stability: 'High',
            notes: 'Good work-life balance',
          },
          whyThisPath: 'Fast entry with good growth potential.',
        },
        {
          type: 'balanced',
          title: 'Cloud Engineer',
          description: 'Mid-level cloud infrastructure role.',
          incomeTrajectory: {
            year1: '$70,000 - $82,000',
            year3: '$90,000 - $115,000',
            year5: '$115,000 - $155,000',
          },
          roadmap: [
            {
              phase: 'Year 1: Foundation',
              duration: '12 months',
              steps: ['AWS certifications', 'Build portfolio'],
            },
          ],
          requiredCredentials: [
            {
              name: 'AWS Solutions Architect',
              timeline: '4-6 months',
              cost: '$150',
            },
          ],
          familyImpact: {
            timeCommitment: 'Moderate (45-50 hrs/week)',
            flexibility: 'Moderate',
            stability: 'Growing',
            notes: 'Some evening study required',
          },
          whyThisPath: 'Balanced approach with strong long-term potential.',
        },
        {
          type: 'max-upside',
          title: 'Cybersecurity Architect',
          description: 'High-level security role.',
          incomeTrajectory: {
            year1: '$85,000 - $100,000',
            year3: '$120,000 - $155,000',
            year5: '$155,000 - $225,000',
          },
          roadmap: [
            {
              phase: 'Year 1: Security Foundation',
              duration: '12 months',
              steps: ['Security+', 'SOC analyst role'],
            },
          ],
          requiredCredentials: [
            {
              name: 'CISSP',
              timeline: '6-12 months',
              cost: '$749',
            },
          ],
          familyImpact: {
            timeCommitment: 'High (50-60 hrs/week)',
            flexibility: 'Low',
            stability: 'Moderate',
            notes: 'Requires significant time investment',
          },
          whyThisPath: 'Maximum earning potential for those willing to invest.',
        },
      ],
    };

    const result = AnalysisResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it('rejects result with wrong number of pathways', () => {
    const invalidResult = {
      summary: 'Good background.',
      pathways: [
        // Only 1 pathway (needs exactly 3)
        {
          type: 'fast-income',
          title: 'Test',
          description: 'Test',
          incomeTrajectory: { year1: '$40k', year3: '$50k', year5: '$60k' },
          roadmap: [],
          requiredCredentials: [],
          familyImpact: {
            timeCommitment: 'Low',
            flexibility: 'High',
            stability: 'High',
            notes: 'Test',
          },
          whyThisPath: 'Test',
        },
      ],
    };

    const result = AnalysisResultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
  });

  it('rejects pathway with invalid type', () => {
    const invalidResult = {
      summary: 'Test summary.',
      pathways: [
        {
          type: 'invalid-type', // Should be 'fast-income', 'balanced', or 'max-upside'
          title: 'Test',
          description: 'Test',
          incomeTrajectory: { year1: '$40k', year3: '$50k', year5: '$60k' },
          roadmap: [],
          requiredCredentials: [],
          familyImpact: {
            timeCommitment: 'Low',
            flexibility: 'High',
            stability: 'High',
            notes: 'Test',
          },
          whyThisPath: 'Test',
        },
        {
          type: 'balanced',
          title: 'Test',
          description: 'Test',
          incomeTrajectory: { year1: '$40k', year3: '$50k', year5: '$60k' },
          roadmap: [],
          requiredCredentials: [],
          familyImpact: {
            timeCommitment: 'Low',
            flexibility: 'High',
            stability: 'High',
            notes: 'Test',
          },
          whyThisPath: 'Test',
        },
        {
          type: 'max-upside',
          title: 'Test',
          description: 'Test',
          incomeTrajectory: { year1: '$40k', year3: '$50k', year5: '$60k' },
          roadmap: [],
          requiredCredentials: [],
          familyImpact: {
            timeCommitment: 'Low',
            flexibility: 'High',
            stability: 'High',
            notes: 'Test',
          },
          whyThisPath: 'Test',
        },
      ],
    };

    const result = AnalysisResultSchema.safeParse(invalidResult);
    expect(result.success).toBe(false);
  });
});
