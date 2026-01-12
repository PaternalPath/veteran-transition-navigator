export interface VeteranProfile {
  // Step 1: Service Background
  branch: string;
  yearsOfService: number;
  rank: string;
  mos: string; // Military Occupational Specialty

  // Step 2: Skills
  technicalSkills: string[];
  certifications: string[];
  leadershipExperience: string;

  // Step 3: Family
  familyStatus: string;
  dependents: number;
  spouseEmployment: string;

  // Step 4: Location
  currentLocation: string;
  willingToRelocate: boolean;
  preferredLocations: string[];

  // Step 5: Goals
  careerGoals: string;
  incomeExpectations: string;
  educationInterest: string;
  timeline: string;
}

export interface CareerPathway {
  type: 'fast-income' | 'balanced' | 'max-upside';
  title: string;
  description: string;
  incomeTrajectory: {
    year1: string;
    year3: string;
    year5: string;
  };
  roadmap: {
    phase: string;
    duration: string;
    steps: string[];
  }[];
  requiredCredentials: {
    name: string;
    timeline: string;
    cost: string;
  }[];
  familyImpact: {
    timeCommitment: string;
    flexibility: string;
    stability: string;
    notes: string;
  };
  whyThisPath: string;
}

export interface AnalysisResult {
  pathways: CareerPathway[];
  summary: string;
}
