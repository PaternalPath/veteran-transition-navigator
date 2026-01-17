import { z } from 'zod';

/**
 * Zod Schema for VeteranProfile
 */
export const VeteranProfileSchema = z.object({
  // Step 1: Service Background
  branch: z.string().min(1, 'Branch is required'),
  yearsOfService: z.number().min(0, 'Years of service must be positive'),
  rank: z.string().min(1, 'Rank is required'),
  mos: z.string().min(1, 'MOS is required'),

  // Step 2: Skills
  technicalSkills: z.array(z.string()),
  certifications: z.array(z.string()),
  leadershipExperience: z.string(),

  // Step 3: Family
  familyStatus: z.string().min(1, 'Family status is required'),
  dependents: z.number().min(0),
  spouseEmployment: z.string(),

  // Step 4: Location
  currentLocation: z.string().min(1, 'Current location is required'),
  willingToRelocate: z.boolean(),
  preferredLocations: z.array(z.string()),

  // Step 5: Goals
  careerGoals: z.string().min(1, 'Career goals are required'),
  incomeExpectations: z.string().min(1, 'Income expectations are required'),
  educationInterest: z.string().min(1, 'Education interest is required'),
  timeline: z.string().min(1, 'Timeline is required'),
});

/**
 * Zod Schema for CareerPathway
 */
export const CareerPathwaySchema = z.object({
  type: z.enum(['fast-income', 'balanced', 'max-upside']),
  title: z.string(),
  description: z.string(),
  incomeTrajectory: z.object({
    year1: z.string(),
    year3: z.string(),
    year5: z.string(),
  }),
  roadmap: z.array(
    z.object({
      phase: z.string(),
      duration: z.string(),
      steps: z.array(z.string()),
    })
  ),
  requiredCredentials: z.array(
    z.object({
      name: z.string(),
      timeline: z.string(),
      cost: z.string(),
    })
  ),
  familyImpact: z.object({
    timeCommitment: z.string(),
    flexibility: z.string(),
    stability: z.string(),
    notes: z.string(),
  }),
  whyThisPath: z.string(),
});

/**
 * Zod Schema for AnalysisResult
 */
export const AnalysisResultSchema = z.object({
  summary: z.string(),
  pathways: z.array(CareerPathwaySchema).length(3, 'Must have exactly 3 pathways'),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type VeteranProfile = z.infer<typeof VeteranProfileSchema>;
export type CareerPathway = z.infer<typeof CareerPathwaySchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
