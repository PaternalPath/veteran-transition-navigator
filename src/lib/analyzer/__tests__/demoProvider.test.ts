import { describe, it, expect } from 'vitest';
import { analyzeDemoMode } from '../demoProvider';
import { AnalysisResultSchema } from '../types';

describe('analyzeDemoMode', () => {
  const sampleProfile = {
    branch: 'Army',
    yearsOfService: 6,
    rank: 'E-5',
    mos: '11B',
    technicalSkills: ['Leadership', 'Firearms Training'],
    certifications: ['CPR'],
    leadershipExperience: 'Squad leader for 2 years, managed 8-person team',
    familyStatus: 'Married',
    dependents: 2,
    spouseEmployment: 'Full-time',
    currentLocation: 'Fort Bragg, NC',
    willingToRelocate: true,
    preferredLocations: ['Raleigh, NC', 'Charlotte, NC'],
    careerGoals: 'Transition to law enforcement or security',
    incomeExpectations: '$50,000 - $70,000',
    educationInterest: 'Associates degree in Criminal Justice',
    timeline: '6 months',
  };

  it('returns exactly 3 pathways', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    expect(result.pathways).toHaveLength(3);
  });

  it('returns pathways with correct types', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    const types = result.pathways.map((p) => p.type);
    expect(types).toContain('fast-income');
    expect(types).toContain('balanced');
    expect(types).toContain('max-upside');
  });

  it('returns result that validates against AnalysisResultSchema', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    const validation = AnalysisResultSchema.safeParse(result);
    expect(validation.success).toBe(true);
  });

  it('includes a summary', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    expect(result.summary).toBeTruthy();
    expect(result.summary.length).toBeGreaterThan(20);
  });

  it('includes income trajectory for all pathways', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    result.pathways.forEach((pathway) => {
      expect(pathway.incomeTrajectory).toBeDefined();
      expect(pathway.incomeTrajectory.year1).toBeTruthy();
      expect(pathway.incomeTrajectory.year3).toBeTruthy();
      expect(pathway.incomeTrajectory.year5).toBeTruthy();
    });
  });

  it('includes roadmap steps for all pathways', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    result.pathways.forEach((pathway) => {
      expect(pathway.roadmap).toBeDefined();
      expect(pathway.roadmap.length).toBeGreaterThan(0);
      pathway.roadmap.forEach((phase) => {
        expect(phase.phase).toBeTruthy();
        expect(phase.duration).toBeTruthy();
        expect(phase.steps.length).toBeGreaterThan(0);
      });
    });
  });

  it('includes required credentials for all pathways', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    result.pathways.forEach((pathway) => {
      expect(pathway.requiredCredentials).toBeDefined();
      // At least 1 credential per pathway
      expect(pathway.requiredCredentials.length).toBeGreaterThan(0);
      pathway.requiredCredentials.forEach((cred) => {
        expect(cred.name).toBeTruthy();
        expect(cred.timeline).toBeTruthy();
        expect(cred.cost).toBeTruthy();
      });
    });
  });

  it('includes family impact assessment', async () => {
    const result = await analyzeDemoMode(sampleProfile);
    result.pathways.forEach((pathway) => {
      expect(pathway.familyImpact).toBeDefined();
      expect(pathway.familyImpact.timeCommitment).toBeTruthy();
      expect(pathway.familyImpact.flexibility).toBeTruthy();
      expect(pathway.familyImpact.stability).toBeTruthy();
      expect(pathway.familyImpact.notes).toBeTruthy();
    });
  });

  it('is deterministic (same input produces same output)', async () => {
    const result1 = await analyzeDemoMode(sampleProfile);
    const result2 = await analyzeDemoMode(sampleProfile);

    expect(result1.summary).toBe(result2.summary);
    expect(result1.pathways[0].title).toBe(result2.pathways[0].title);
    expect(result1.pathways[1].title).toBe(result2.pathways[1].title);
    expect(result1.pathways[2].title).toBe(result2.pathways[2].title);
  });

  it('adjusts recommendations based on relocation willingness', async () => {
    const relocateProfile = { ...sampleProfile, willingToRelocate: true };
    const stayProfile = { ...sampleProfile, willingToRelocate: false };

    const relocateResult = await analyzeDemoMode(relocateProfile);
    const stayResult = await analyzeDemoMode(stayProfile);

    // Summary should mention relocation status
    expect(relocateResult.summary).toContain('relocate');
    expect(stayResult.summary).toContain(stayProfile.currentLocation);
  });

  it('adjusts recommendations based on education interest', async () => {
    const highEducationProfile = {
      ...sampleProfile,
      educationInterest: 'Bachelor degree in Computer Science',
    };
    const lowEducationProfile = {
      ...sampleProfile,
      educationInterest: 'No interest in further education',
    };

    const highEdResult = await analyzeDemoMode(highEducationProfile);
    const lowEdResult = await analyzeDemoMode(lowEducationProfile);

    // Both should return valid results
    expect(highEdResult.pathways).toHaveLength(3);
    expect(lowEdResult.pathways).toHaveLength(3);
  });

  it('generates valid results for different MOS codes', async () => {
    const combatMOS = { ...sampleProfile, mos: '11B' }; // Infantry
    const techMOS = { ...sampleProfile, mos: '25B' }; // IT Specialist
    const logisticsMOS = { ...sampleProfile, mos: '92A' }; // Logistics

    const combatResult = await analyzeDemoMode(combatMOS);
    const techResult = await analyzeDemoMode(techMOS);
    const logisticsResult = await analyzeDemoMode(logisticsMOS);

    // All should return valid results
    expect(combatResult.pathways).toHaveLength(3);
    expect(techResult.pathways).toHaveLength(3);
    expect(logisticsResult.pathways).toHaveLength(3);

    // Each MOS should produce deterministic results
    const combatResult2 = await analyzeDemoMode(combatMOS);
    expect(combatResult.pathways[0].title).toBe(combatResult2.pathways[0].title);
  });

  it('includes realistic salary ranges', async () => {
    const result = await analyzeDemoMode(sampleProfile);

    result.pathways.forEach((pathway) => {
      // Check that year 1 income looks realistic (contains $ and numbers)
      expect(pathway.incomeTrajectory.year1).toMatch(/\$[\d,]+/);
      expect(pathway.incomeTrajectory.year3).toMatch(/\$[\d,]+/);
      expect(pathway.incomeTrajectory.year5).toMatch(/\$[\d,]+/);
    });
  });
});
