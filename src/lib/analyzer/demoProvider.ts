import { AnalysisResult, VeteranProfile } from './types';

/**
 * Demo Mode Provider - Returns deterministic, realistic career pathways
 * Works with ZERO API keys required for Vercel deployment
 */

/**
 * Simple hash function for deterministic template selection
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate deterministic demo analysis based on profile
 */
export async function analyzeDemoMode(
  profile: VeteranProfile
): Promise<AnalysisResult> {
  // Hash profile to select template deterministically
  const hashInput = profile.mos + profile.branch + profile.technicalSkills.join('');
  const hash = simpleHash(hashInput);
  const templateIndex = hash % PATHWAY_TEMPLATES.length;
  const template = PATHWAY_TEMPLATES[templateIndex];

  // Customize based on profile characteristics
  const hasHighEducationInterest = profile.educationInterest
    .toLowerCase()
    .includes('bachelor') || profile.educationInterest.toLowerCase().includes('master');

  const willingToRelocate = profile.willingToRelocate;
  const yearsOfService = profile.yearsOfService;

  return {
    summary: generateSummary(profile, template),
    pathways: [
      generateFastIncome(profile, template, willingToRelocate),
      generateBalanced(profile, template, hasHighEducationInterest),
      generateMaxUpside(profile, template, hasHighEducationInterest, yearsOfService),
    ],
  };
}

function generateSummary(profile: VeteranProfile, template: PathwayTemplate): string {
  return `Based on your ${profile.yearsOfService} years of service as ${profile.rank} in the ${profile.branch} (MOS: ${profile.mos}), you have strong ${template.skillArea} skills that translate well to civilian careers. Your ${profile.leadershipExperience.toLowerCase()} positions you well for roles requiring ${template.leadershipValue}. ${
    profile.willingToRelocate
      ? 'Your flexibility to relocate opens up opportunities in high-demand markets.'
      : `Focusing on opportunities in ${profile.currentLocation} and surrounding areas.`
  }`;
}

function generateFastIncome(
  profile: VeteranProfile,
  template: PathwayTemplate,
  willingToRelocate: boolean
): AnalysisResult['pathways'][0] {
  const locationBonus = willingToRelocate ? 15000 : 0;
  const baseIncome = template.fastIncome.startingSalary + locationBonus;

  return {
    type: 'fast-income',
    title: template.fastIncome.title,
    description: template.fastIncome.description,
    incomeTrajectory: {
      year1: `$${(baseIncome).toLocaleString()} - $${(baseIncome + 10000).toLocaleString()}`,
      year3: `$${(baseIncome + 15000).toLocaleString()} - $${(baseIncome + 25000).toLocaleString()}`,
      year5: `$${(baseIncome + 30000).toLocaleString()} - $${(baseIncome + 45000).toLocaleString()}`,
    },
    roadmap: template.fastIncome.roadmap,
    requiredCredentials: template.fastIncome.credentials,
    familyImpact: {
      timeCommitment: 'Low (40-45 hrs/week)',
      flexibility: 'High - stable schedule',
      stability: 'High - immediate employment',
      notes: 'Ideal for veterans needing quick income with family responsibilities.',
    },
    whyThisPath: template.fastIncome.whyThisPath,
  };
}

function generateBalanced(
  profile: VeteranProfile,
  template: PathwayTemplate,
  hasHighEducationInterest: boolean
): AnalysisResult['pathways'][0] {
  const educationBonus = hasHighEducationInterest ? 10000 : 0;
  const baseIncome = template.balanced.startingSalary + educationBonus;

  return {
    type: 'balanced',
    title: template.balanced.title,
    description: template.balanced.description,
    incomeTrajectory: {
      year1: `$${(baseIncome).toLocaleString()} - $${(baseIncome + 12000).toLocaleString()}`,
      year3: `$${(baseIncome + 20000).toLocaleString()} - $${(baseIncome + 35000).toLocaleString()}`,
      year5: `$${(baseIncome + 45000).toLocaleString()} - $${(baseIncome + 65000).toLocaleString()}`,
    },
    roadmap: template.balanced.roadmap,
    requiredCredentials: hasHighEducationInterest
      ? [
          ...template.balanced.credentials,
          {
            name: "Bachelor's Degree (optional accelerated program)",
            timeline: '18-24 months',
            cost: '$5,000 - $15,000 (post-GI Bill)',
          },
        ]
      : template.balanced.credentials,
    familyImpact: {
      timeCommitment: 'Moderate (45-50 hrs/week + some studying)',
      flexibility: 'Moderate - some evening/weekend flexibility',
      stability: 'Growing - increasing job security over time',
      notes: hasHighEducationInterest
        ? 'Combining work with part-time education requires time management.'
        : 'Balanced approach with steady progression.',
    },
    whyThisPath: template.balanced.whyThisPath,
  };
}

function generateMaxUpside(
  profile: VeteranProfile,
  template: PathwayTemplate,
  hasHighEducationInterest: boolean,
  yearsOfService: number
): AnalysisResult['pathways'][0] {
  const experienceBonus = yearsOfService >= 8 ? 15000 : yearsOfService >= 4 ? 8000 : 0;
  const baseIncome = template.maxUpside.startingSalary + experienceBonus;

  return {
    type: 'max-upside',
    title: template.maxUpside.title,
    description: template.maxUpside.description,
    incomeTrajectory: {
      year1: `$${(baseIncome).toLocaleString()} - $${(baseIncome + 15000).toLocaleString()}`,
      year3: `$${(baseIncome + 35000).toLocaleString()} - $${(baseIncome + 60000).toLocaleString()}`,
      year5: `$${(baseIncome + 70000).toLocaleString()} - $${(baseIncome + 110000).toLocaleString()}`,
    },
    roadmap: template.maxUpside.roadmap,
    requiredCredentials: template.maxUpside.credentials,
    familyImpact: {
      timeCommitment: 'High (50-60 hrs/week + education)',
      flexibility: 'Low initially - requires significant time investment',
      stability: 'Moderate initially, High long-term',
      notes:
        'Requires upfront investment in education/training. Best for those with family support and financial runway.',
    },
    whyThisPath: template.maxUpside.whyThisPath,
  };
}

/**
 * Pathway template structure
 */
interface PathwayTemplate {
  skillArea: string;
  leadershipValue: string;
  fastIncome: PathwayOption;
  balanced: PathwayOption;
  maxUpside: PathwayOption;
}

interface PathwayOption {
  title: string;
  description: string;
  startingSalary: number;
  roadmap: Array<{
    phase: string;
    duration: string;
    steps: string[];
  }>;
  credentials: Array<{
    name: string;
    timeline: string;
    cost: string;
  }>;
  whyThisPath: string;
}

/**
 * Pre-built pathway templates (realistic, well-researched)
 */
const PATHWAY_TEMPLATES: PathwayTemplate[] = [
  // Template 1: Combat Arms / Infantry
  {
    skillArea: 'tactical operations, discipline, and teamwork',
    leadershipValue: 'crisis management and team coordination',
    fastIncome: {
      title: 'Security Operations Specialist',
      description:
        'Immediate-hire positions in corporate security, armed security, or contract security operations.',
      startingSalary: 45000,
      roadmap: [
        {
          phase: 'Month 1-2: Certifications',
          duration: '6-8 weeks',
          steps: [
            'Obtain state security guard license',
            'Complete armed security certification (if desired)',
            'First Aid/CPR certification',
            'Apply to corporate security positions',
          ],
        },
        {
          phase: 'Month 3-12: Entry Role',
          duration: '10 months',
          steps: [
            'Start as security officer or guard',
            'Build track record of reliability',
            'Network with law enforcement and security professionals',
            'Consider shift supervisor opportunities',
          ],
        },
        {
          phase: 'Year 2-3: Advancement',
          duration: '2 years',
          steps: [
            'Move to site supervisor or operations coordinator',
            'Pursue specialized training (executive protection, cybersecurity awareness)',
            'Consider federal security roles (TSA, VA Police)',
          ],
        },
      ],
      credentials: [
        {
          name: 'State Security License',
          timeline: '2-4 weeks',
          cost: '$100 - $400',
        },
        {
          name: 'CPR/First Aid Certification',
          timeline: '1 day',
          cost: '$50 - $100',
        },
      ],
      whyThisPath:
        'Fastest path to employment with your existing skills. Many companies actively recruit veterans for security roles.',
    },
    balanced: {
      title: 'Law Enforcement Officer',
      description:
        'Police officer, deputy sheriff, or state trooper combining your military discipline with public service.',
      startingSalary: 52000,
      roadmap: [
        {
          phase: 'Month 1-6: Academy Prep',
          duration: '6 months',
          steps: [
            'Research local departments (city, county, state)',
            'Complete police academy application process',
            'Physical fitness preparation',
            'Begin police academy (typically 6 months)',
          ],
        },
        {
          phase: 'Year 1-3: Probationary Officer',
          duration: '2-3 years',
          steps: [
            'Complete field training program (3-6 months)',
            'Serve as patrol officer',
            'Build community relationships',
            'Consider specializations (K-9, traffic, investigations)',
          ],
        },
        {
          phase: 'Year 4-5: Specialization',
          duration: '2 years',
          steps: [
            'Apply for detective or specialized units',
            'Pursue additional certifications (SWAT, crisis negotiation)',
            'Consider supervisory track (sergeant exam)',
          ],
        },
      ],
      credentials: [
        {
          name: 'Police Academy',
          timeline: '5-6 months',
          cost: 'Often paid by department',
        },
        {
          name: "Associate's Degree in Criminal Justice (recommended)",
          timeline: '18-24 months',
          cost: '$0 (GI Bill)',
        },
      ],
      whyThisPath:
        'Leverages your military training and discipline. Strong job security, benefits, and pension. Many departments offer veteran hiring preferences.',
    },
    maxUpside: {
      title: 'Emergency Management Director',
      description:
        'Leadership role coordinating disaster response, public safety, and crisis management for government or large organizations.',
      startingSalary: 65000,
      roadmap: [
        {
          phase: 'Year 1: Education & Entry',
          duration: '12 months',
          steps: [
            "Enroll in Bachelor's in Emergency Management or Public Administration",
            'Start as emergency management specialist or coordinator',
            'Get FEMA ICS/NIMS certifications',
            'Join professional associations (IAEM)',
          ],
        },
        {
          phase: 'Year 2-3: Build Expertise',
          duration: '2 years',
          steps: [
            'Complete degree program',
            'Work on real incident responses',
            'Obtain Certified Emergency Manager (CEM) credential',
            'Take on project management responsibilities',
          ],
        },
        {
          phase: 'Year 4-5: Leadership Track',
          duration: '2 years',
          steps: [
            "Pursue master's degree (optional but valuable)",
            'Apply for emergency management manager positions',
            'Lead multi-agency exercises and responses',
            'Build regional/national professional network',
          ],
        },
      ],
      credentials: [
        {
          name: "Bachelor's in Emergency Management",
          timeline: '24-36 months',
          cost: '$0 (GI Bill)',
        },
        {
          name: 'Certified Emergency Manager (CEM)',
          timeline: '1-2 years experience required',
          cost: '$500 - $1,000',
        },
        {
          name: 'FEMA Professional Development Series',
          timeline: 'Ongoing',
          cost: 'Free',
        },
      ],
      whyThisPath:
        'Your combat experience translates directly to crisis management. High earning potential ($90K-$150K+ with experience). Growing field with strong demand.',
    },
  },

  // Template 2: Technical / IT / Communications
  {
    skillArea: 'technical systems, communications, and troubleshooting',
    leadershipValue: 'technical team leadership and problem-solving',
    fastIncome: {
      title: 'IT Help Desk Technician',
      description:
        'Entry-level IT support role providing technical assistance to users and troubleshooting common issues.',
      startingSalary: 42000,
      roadmap: [
        {
          phase: 'Month 1-3: Certifications',
          duration: '3 months',
          steps: [
            'Study for CompTIA A+ certification (self-paced)',
            'Pass A+ exam',
            'Update resume highlighting military technical experience',
            'Apply to help desk positions (aim for 20-30 applications)',
          ],
        },
        {
          phase: 'Month 4-12: First Role',
          duration: '9 months',
          steps: [
            'Start as Tier 1 Help Desk Technician',
            'Learn ticketing systems and enterprise tools',
            'Build customer service skills',
            'Study for CompTIA Network+ (evening/weekends)',
          ],
        },
        {
          phase: 'Year 2-3: Advancement',
          duration: '2 years',
          steps: [
            'Earn Network+ certification',
            'Move to Tier 2 support or junior systems admin',
            'Specialize in area of interest (cloud, networking, security)',
            'Build home lab for hands-on practice',
          ],
        },
      ],
      credentials: [
        {
          name: 'CompTIA A+',
          timeline: '2-3 months study',
          cost: '$250 (exam voucher)',
        },
        {
          name: 'CompTIA Network+',
          timeline: '2-3 months study',
          cost: '$358 (exam voucher)',
        },
      ],
      whyThisPath:
        'Quick entry to IT field with strong demand. Certifications can be earned while job hunting. Remote work opportunities common.',
    },
    balanced: {
      title: 'Cloud Infrastructure Engineer',
      description:
        'Design and manage cloud-based systems (AWS, Azure, Google Cloud) for organizations migrating to cloud infrastructure.',
      startingSalary: 70000,
      roadmap: [
        {
          phase: 'Month 1-6: Foundation',
          duration: '6 months',
          steps: [
            'Choose cloud platform (AWS most in-demand)',
            'Earn AWS Certified Cloud Practitioner (entry)',
            'Complete hands-on labs and tutorials',
            'Apply for junior cloud or DevOps roles',
          ],
        },
        {
          phase: 'Year 1-2: Specialization',
          duration: '18 months',
          steps: [
            'Earn AWS Solutions Architect Associate',
            'Work on real cloud migration projects',
            'Learn infrastructure-as-code (Terraform, CloudFormation)',
            'Contribute to open-source projects',
          ],
        },
        {
          phase: 'Year 3-5: Senior Level',
          duration: '3 years',
          steps: [
            'Earn AWS Professional level certification',
            'Move to senior engineer or architect role',
            'Lead cloud transformation initiatives',
            'Consider specialization (security, machine learning, containers)',
          ],
        },
      ],
      credentials: [
        {
          name: 'AWS Certified Solutions Architect - Associate',
          timeline: '3-4 months study',
          cost: '$150 (exam)',
        },
        {
          name: 'AWS Certified Solutions Architect - Professional',
          timeline: '6 months study',
          cost: '$300 (exam)',
        },
      ],
      whyThisPath:
        'Cloud skills are in extremely high demand. Median salary $120K+. Remote work common. Certifications carry significant weight.',
    },
    maxUpside: {
      title: 'Cybersecurity Architect',
      description:
        'Design and implement security frameworks protecting organizations from cyber threats. High-demand role with six-figure earning potential.',
      startingSalary: 85000,
      roadmap: [
        {
          phase: 'Year 1: Security Foundation',
          duration: '12 months',
          steps: [
            'Earn Security+ and CySA+ certifications',
            'Start in SOC analyst or security engineer role',
            'Learn SIEM tools (Splunk, ELK Stack)',
            'Study common attack vectors and defensive techniques',
          ],
        },
        {
          phase: 'Year 2-3: Advanced Skills',
          duration: '2 years',
          steps: [
            "Pursue Bachelor's in Cybersecurity (optional, recommended)",
            'Earn CISSP or CEH certification',
            'Work on incident response and threat hunting',
            'Specialize in area (network security, application security, cloud security)',
          ],
        },
        {
          phase: 'Year 4-5: Architecture Level',
          duration: '2 years',
          steps: [
            'Obtain SABSA or similar architecture certification',
            'Move to security architect or senior engineer role',
            'Design zero-trust architectures and security frameworks',
            'Lead enterprise security strategy',
          ],
        },
      ],
      credentials: [
        {
          name: 'CompTIA Security+',
          timeline: '2-3 months',
          cost: '$392 (exam)',
        },
        {
          name: 'CISSP (Certified Information Systems Security Professional)',
          timeline: '6-12 months (requires experience)',
          cost: '$749 (exam)',
        },
        {
          name: "Bachelor's in Cybersecurity",
          timeline: '24-36 months',
          cost: '$0 (GI Bill)',
        },
      ],
      whyThisPath:
        'Cybersecurity professionals earn $100K-$200K+. Critical national need = job security. TS clearance from military is huge advantage. Remote work common.',
    },
  },

  // Template 3: Logistics / Supply Chain
  {
    skillArea: 'logistics, supply chain management, and operational planning',
    leadershipValue: 'process optimization and resource coordination',
    fastIncome: {
      title: 'Warehouse Operations Supervisor',
      description:
        'Oversee warehouse operations, inventory management, and team coordination for distribution centers or manufacturing facilities.',
      startingSalary: 48000,
      roadmap: [
        {
          phase: 'Month 1-2: Quick Start',
          duration: '2 months',
          steps: [
            'Apply to warehouse supervisor roles at major companies (Amazon, UPS, FedEx, etc.)',
            'Highlight military logistics and leadership experience',
            'Obtain forklift certification if needed',
            'Research local distribution centers and 3PL companies',
          ],
        },
        {
          phase: 'Month 3-12: Build Track Record',
          duration: '10 months',
          steps: [
            'Start as warehouse supervisor or shift manager',
            'Learn WMS (Warehouse Management Systems)',
            'Implement process improvements',
            'Document successes (productivity gains, cost savings)',
          ],
        },
        {
          phase: 'Year 2-3: Advancement',
          duration: '2 years',
          steps: [
            'Move to operations manager or distribution center manager',
            'Earn Certified Supply Chain Professional (CSCP) credential',
            'Consider MBA or supply chain management degree',
            'Network in supply chain professional associations',
          ],
        },
      ],
      credentials: [
        {
          name: 'OSHA Forklift Certification',
          timeline: '1-2 days',
          cost: '$50 - $150',
        },
        {
          name: 'Certified Supply Chain Professional (CSCP)',
          timeline: '3-6 months study',
          cost: '$1,000 - $1,500',
        },
      ],
      whyThisPath:
        'High demand for logistics professionals. Military logistics experience highly valued. Clear advancement path to six-figure management roles.',
    },
    balanced: {
      title: 'Supply Chain Analyst',
      description:
        'Analyze supply chain data, optimize procurement processes, and improve efficiency for manufacturing or retail companies.',
      startingSalary: 58000,
      roadmap: [
        {
          phase: 'Month 1-6: Skills & Entry',
          duration: '6 months',
          steps: [
            'Learn Excel (advanced functions, pivot tables, Power Query)',
            'Complete free/low-cost supply chain analytics courses',
            'Build portfolio with case studies',
            'Apply for analyst positions at manufacturers, retailers, or consulting firms',
          ],
        },
        {
          phase: 'Year 1-3: Analysis Expertise',
          duration: '2-3 years',
          steps: [
            'Master supply chain software (SAP, Oracle, Blue Yonder)',
            'Learn SQL and basic Python for data analysis',
            'Earn APICS CSCP or CPIM certification',
            'Lead process improvement projects',
          ],
        },
        {
          phase: 'Year 4-5: Senior Analyst or Manager',
          duration: '2 years',
          steps: [
            'Move to senior analyst or supply chain manager',
            'Specialize in demand planning, procurement, or logistics',
            "Consider MBA in Supply Chain Management or Master's in Analytics",
            'Lead strategic initiatives (network optimization, supplier consolidation)',
          ],
        },
      ],
      credentials: [
        {
          name: 'APICS CSCP (Certified Supply Chain Professional)',
          timeline: '4-6 months study',
          cost: '$1,200 - $1,800',
        },
        {
          name: 'Advanced Excel & SQL (online courses)',
          timeline: '2-3 months',
          cost: '$200 - $500',
        },
      ],
      whyThisPath:
        'Growing field with strong demand. Analytical skills transferable across industries. Path to six-figure supply chain leadership roles.',
    },
    maxUpside: {
      title: 'Director of Supply Chain Operations',
      description:
        'Executive-level role overseeing end-to-end supply chain strategy, vendor relationships, and global logistics for large organizations.',
      startingSalary: 95000,
      roadmap: [
        {
          phase: 'Year 1: Foundation & MBA',
          duration: '12 months',
          steps: [
            'Enroll in MBA program (supply chain or operations focus)',
            'Start as supply chain manager or senior analyst',
            'Join supply chain professional associations (CSCMP, APICS)',
            'Build network with industry leaders',
          ],
        },
        {
          phase: 'Year 2-3: Strategic Experience',
          duration: '2 years',
          steps: [
            'Complete MBA program',
            'Lead cross-functional supply chain projects',
            'Earn CPIM or CSCP certification',
            'Gain experience in multiple supply chain areas (procurement, logistics, planning)',
          ],
        },
        {
          phase: 'Year 4-5: Director Level',
          duration: '2 years',
          steps: [
            'Move to director of supply chain or VP of operations',
            'Oversee multi-million dollar budgets',
            'Drive digital transformation initiatives',
            'Mentor and develop supply chain teams',
          ],
        },
      ],
      credentials: [
        {
          name: 'MBA (Supply Chain/Operations Management)',
          timeline: '18-24 months',
          cost: '$0 - $20,000 (GI Bill + scholarships)',
        },
        {
          name: 'APICS CPIM (Certified in Production and Inventory Management)',
          timeline: '6-12 months',
          cost: '$1,500 - $2,500',
        },
      ],
      whyThisPath:
        'Supply chain directors earn $130K-$250K+. Critical strategic role in organizations. Your military logistics background is exceptional preparation.',
    },
  },

  // Template 4: Medical / Healthcare
  {
    skillArea: 'medical care, emergency response, and patient care',
    leadershipValue: 'high-stress decision making and team coordination',
    fastIncome: {
      title: 'Emergency Medical Technician (EMT) / Paramedic',
      description:
        'Provide emergency medical care in ambulances, hospitals, or fire departments. Fast certification path with immediate job opportunities.',
      startingSalary: 38000,
      roadmap: [
        {
          phase: 'Month 1-4: EMT Certification',
          duration: '4 months',
          steps: [
            'Enroll in EMT-Basic course (evenings/weekends available)',
            'Complete 120-150 hours of coursework',
            'Pass NREMT (National Registry) exam',
            'Apply for ambulance or fire department positions',
          ],
        },
        {
          phase: 'Month 5-18: Build Experience',
          duration: '14 months',
          steps: [
            'Work as EMT-Basic',
            'Gain patient contact hours',
            'Consider fire department EMT roles (higher pay)',
            'Enroll in Paramedic program (6-12 months)',
          ],
        },
        {
          phase: 'Year 2-5: Paramedic & Beyond',
          duration: '3-4 years',
          steps: [
            'Complete Paramedic certification',
            'Work as full Paramedic ($55K-$70K)',
            'Consider specializations (flight medic, tactical medic)',
            'Option to bridge to nursing with additional education',
          ],
        },
      ],
      credentials: [
        {
          name: 'EMT-Basic Certification',
          timeline: '3-4 months',
          cost: '$1,000 - $2,000',
        },
        {
          name: 'Paramedic Certification',
          timeline: '6-12 months',
          cost: '$5,000 - $10,000 (financial aid available)',
        },
      ],
      whyThisPath:
        'Military medic experience highly valued. Fast entry to healthcare field. Can work while pursuing further education (RN, PA).',
    },
    balanced: {
      title: 'Registered Nurse (RN)',
      description:
        'Provide direct patient care in hospitals, clinics, or specialty care settings. High demand, excellent job security, and strong earning potential.',
      startingSalary: 65000,
      roadmap: [
        {
          phase: 'Year 1-2: Nursing Degree',
          duration: '18-24 months',
          steps: [
            'Enroll in accelerated BSN program or ADN program',
            'Complete clinical rotations',
            'Study for NCLEX-RN exam',
            'Apply for new graduate RN positions',
          ],
        },
        {
          phase: 'Year 2-4: Clinical Experience',
          duration: '2-3 years',
          steps: [
            'Start in med-surg, ER, or ICU',
            'Complete nurse residency program',
            'Gain 2+ years bedside experience',
            'Consider specialty certifications (CCRN, CEN)',
          ],
        },
        {
          phase: 'Year 5: Specialization or Leadership',
          duration: 'Ongoing',
          steps: [
            'Specialize in high-demand area (ICU, ER, OR)',
            'Consider travel nursing ($90K-$120K+)',
            'Pursue leadership track (charge nurse, nurse manager)',
            'Option for advanced practice (NP, CRNA with MSN)',
          ],
        },
      ],
      credentials: [
        {
          name: 'BSN (Bachelor of Science in Nursing)',
          timeline: '18-24 months (accelerated)',
          cost: '$0 (GI Bill)',
        },
        {
          name: 'NCLEX-RN Exam',
          timeline: '2-3 months study',
          cost: '$200 (exam fee)',
        },
      ],
      whyThisPath:
        'Nursing is one of the most in-demand careers nationwide. Median RN salary $77K. Travel nursing can earn $100K+. Excellent work-life balance options.',
    },
    maxUpside: {
      title: 'Physician Assistant (PA)',
      description:
        'Practice medicine under physician supervision. Diagnose, treat, and prescribe medications. Exceptional earning potential with strong work-life balance.',
      startingSalary: 100000,
      roadmap: [
        {
          phase: 'Year 1: Prerequisites & PCE',
          duration: '12 months',
          steps: [
            'Complete any missing prerequisites (anatomy, physiology, etc.)',
            'Gain Patient Care Experience (PCE) hours if needed',
            'Study for GRE if required',
            'Apply to PA programs (highly competitive)',
          ],
        },
        {
          phase: 'Year 2-3: PA School',
          duration: '24-27 months',
          steps: [
            'Complete didactic year (classroom)',
            'Complete clinical rotations (10-12 specialties)',
            'Graduate with Master of Physician Assistant Studies',
            'Pass PANCE (PA National Certifying Exam)',
          ],
        },
        {
          phase: 'Year 4-5: Practice & Specialization',
          duration: '2+ years',
          steps: [
            'Start in primary care or specialty (ER, surgery, orthopedics)',
            'Build clinical competency',
            'Consider high-paying specialties (dermatology, surgery, ER)',
            'Option to start own practice or consulting',
          ],
        },
      ],
      credentials: [
        {
          name: "Master's in Physician Assistant Studies",
          timeline: '24-27 months',
          cost: '$0 - $30,000 (GI Bill + loans)',
        },
        {
          name: 'PANCE (PA National Certifying Exam)',
          timeline: 'After graduation',
          cost: '$550 (exam)',
        },
      ],
      whyThisPath:
        'PA median salary $121K. Work-life balance superior to physicians. Military medic experience strengthens application. Growing field with 31% job growth projected.',
    },
  },

  // Template 5: Aviation / Maintenance
  {
    skillArea: 'mechanical systems, precision maintenance, and technical operations',
    leadershipValue: 'safety compliance and quality assurance',
    fastIncome: {
      title: 'Aircraft Maintenance Technician',
      description:
        'Inspect, maintain, and repair aircraft for airlines, cargo companies, or maintenance facilities. Military aviation experience highly valued.',
      startingSalary: 52000,
      roadmap: [
        {
          phase: 'Month 1-18: A&P License',
          duration: '18 months',
          steps: [
            'Enroll in FAA-approved A&P (Airframe & Powerplant) school',
            'Complete 1,900 hours of training (can be accelerated)',
            'Pass FAA written, oral, and practical exams',
            'Apply to airlines, MROs, or cargo companies',
          ],
        },
        {
          phase: 'Year 2-3: Build Experience',
          duration: '2 years',
          steps: [
            'Start as A&P mechanic',
            'Learn specific aircraft types (Boeing, Airbus)',
            'Work toward inspection authorization (IA)',
            'Consider specializations (avionics, engines, structures)',
          ],
        },
        {
          phase: 'Year 4-5: Senior Mechanic or Inspector',
          duration: '2+ years',
          steps: [
            'Move to lead mechanic or inspector role',
            'Earn $70K-$90K+ with overtime',
            'Consider supervisory track or specialized roles',
            'Travel opportunities with airlines or contractors',
          ],
        },
      ],
      credentials: [
        {
          name: 'A&P (Airframe & Powerplant) License',
          timeline: '12-24 months',
          cost: '$15,000 - $40,000 (VA approved programs)',
        },
        {
          name: 'FCC License (for avionics)',
          timeline: '1-2 months',
          cost: '$60',
        },
      ],
      whyThisPath:
        'Military aviation mechanics can often fast-track A&P. Airline jobs offer excellent benefits and profit sharing. Overtime can push total comp to $80K-$100K+.',
    },
    balanced: {
      title: 'Commercial Pilot',
      description:
        'Fly cargo, charter, or airline aircraft. Transition military flight hours to civilian aviation career.',
      startingSalary: 60000,
      roadmap: [
        {
          phase: 'Month 1-12: Civilian Ratings',
          duration: '12 months',
          steps: [
            'Convert military flight hours to civilian credentials',
            'Obtain Commercial Pilot License and Instrument Rating',
            'Build multi-engine time if needed',
            'Apply to regional airlines or cargo operators',
          ],
        },
        {
          phase: 'Year 2-5: Regional Airline or Cargo',
          duration: '3-4 years',
          steps: [
            'Fly for regional airline or cargo company',
            'Build turbine multi-engine hours (1,500+ for ATP)',
            'Network within aviation industry',
            'Apply to major airlines when eligible',
          ],
        },
        {
          phase: 'Year 6+: Major Airline',
          duration: 'Career',
          steps: [
            'Transition to major airline (United, Delta, American, FedEx, UPS)',
            'Captain upgrade after 5-10 years',
            'Earn $200K-$400K+ as senior captain',
            'Exceptional benefits and retirement',
          ],
        },
      ],
      credentials: [
        {
          name: 'Commercial Pilot License + Instrument Rating',
          timeline: '6-12 months (military conversion)',
          cost: '$5,000 - $15,000',
        },
        {
          name: 'Airline Transport Pilot (ATP)',
          timeline: 'After 1,500 flight hours',
          cost: '$5,000 - $7,000',
        },
      ],
      whyThisPath:
        'Military pilots have huge advantage. Pilot shortage = strong demand. Senior airline captains earn $300K-$400K+. Exceptional job security and benefits.',
    },
    maxUpside: {
      title: 'Aviation Safety Inspector (FAA) / Aviation Manager',
      description:
        'Oversee aviation safety compliance, lead flight operations, or manage airline/airport operations.',
      startingSalary: 75000,
      roadmap: [
        {
          phase: 'Year 1-2: Build Civilian Credentials',
          duration: '2 years',
          steps: [
            'Obtain necessary FAA licenses (A&P, Commercial Pilot, etc.)',
            'Work in aviation industry (maintenance, flight ops, or safety)',
            "Consider Bachelor's in Aviation Management",
            'Network with FAA and aviation safety professionals',
          ],
        },
        {
          phase: 'Year 3-5: Safety or Management Role',
          duration: '3 years',
          steps: [
            'Apply for FAA Aviation Safety Inspector position',
            'OR: Move to airline safety, quality, or operations management',
            'Lead safety audits, investigations, or compliance programs',
            'Earn advanced certifications (SMS, aviation safety)',
          ],
        },
        {
          phase: 'Year 6+: Senior Leadership',
          duration: 'Career',
          steps: [
            'Progress to senior inspector, principal inspector, or director level',
            'Oversee multi-location operations or large safety programs',
            'FAA inspectors earn $100K-$140K with federal benefits',
            'Aviation directors earn $120K-$200K+',
          ],
        },
      ],
      credentials: [
        {
          name: "Bachelor's in Aviation Management or Safety",
          timeline: '24-36 months',
          cost: '$0 (GI Bill)',
        },
        {
          name: 'FAA Safety Management System (SMS) Training',
          timeline: '3-6 months',
          cost: '$1,000 - $3,000',
        },
      ],
      whyThisPath:
        'FAA inspector positions offer federal benefits, job security, and excellent work-life balance. Aviation directors at airlines earn $150K-$250K+.',
    },
  },
];
