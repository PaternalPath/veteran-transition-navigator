import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { VeteranProfile, AnalysisResult } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Validate that the result has required top-level keys
 */
function validateAnalysisResult(data: any): data is AnalysisResult {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.summary === 'string' &&
    Array.isArray(data.pathways) &&
    data.pathways.length === 3
  );
}

export async function POST(request: NextRequest) {
  try {
    const profile: VeteranProfile = await request.json();

    const prompt = `You are a career transition advisor for veterans. Analyze the following veteran profile and generate THREE distinct career pathways:

1. FAST-INCOME PATH: Quick entry to workforce with immediate income
2. BALANCED PATH: Mix of short-term income and long-term growth
3. MAX-UPSIDE PATH: Higher investment in education/training for maximum career potential

VETERAN PROFILE:
Branch: ${profile.branch}
Years of Service: ${profile.yearsOfService}
Rank: ${profile.rank}
MOS/Job Code: ${profile.mos}

Technical Skills: ${profile.technicalSkills.join(', ')}
Certifications: ${profile.certifications.join(', ')}
Leadership Experience: ${profile.leadershipExperience}

Family Status: ${profile.familyStatus}
Dependents: ${profile.dependents}
Spouse Employment: ${profile.spouseEmployment}

Current Location: ${profile.currentLocation}
Willing to Relocate: ${profile.willingToRelocate ? 'Yes' : 'No'}
${profile.willingToRelocate ? `Preferred Locations: ${profile.preferredLocations.join(', ')}` : ''}

Career Goals: ${profile.careerGoals}
Income Expectations: ${profile.incomeExpectations}
Education Interest: ${profile.educationInterest}
Timeline: ${profile.timeline}

Call the tool emit_analysis with the complete analysis payload. Do not output prose. Make each pathway specific, actionable, and realistic. Consider the veteran's military background, skills, family situation, and goals. Include real job titles, actual certifications, and market-based salary ranges.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: [
        {
          name: 'emit_analysis',
          description: 'Emit the complete career pathway analysis for the veteran',
          input_schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description: 'A brief 2-3 sentence overview of this veteran\'s strengths and transition outlook',
              },
              pathways: {
                type: 'array',
                description: 'Three distinct career pathways',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['fast-income', 'balanced', 'max-upside'],
                      description: 'The type of pathway',
                    },
                    title: {
                      type: 'string',
                      description: 'The career title for this pathway',
                    },
                    description: {
                      type: 'string',
                      description: '2-3 sentence description of this pathway',
                    },
                    incomeTrajectory: {
                      type: 'object',
                      properties: {
                        year1: { type: 'string', description: 'Expected income in year 1' },
                        year3: { type: 'string', description: 'Expected income in year 3' },
                        year5: { type: 'string', description: 'Expected income in year 5' },
                      },
                      required: ['year1', 'year3', 'year5'],
                    },
                    roadmap: {
                      type: 'array',
                      description: 'Step-by-step roadmap phases',
                      items: {
                        type: 'object',
                        properties: {
                          phase: { type: 'string', description: 'Phase name' },
                          duration: { type: 'string', description: 'Duration of this phase' },
                          steps: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Specific steps in this phase',
                          },
                        },
                        required: ['phase', 'duration', 'steps'],
                      },
                    },
                    requiredCredentials: {
                      type: 'array',
                      description: 'Required credentials for this pathway',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: 'Credential name' },
                          timeline: { type: 'string', description: 'Time to obtain' },
                          cost: { type: 'string', description: 'Estimated cost' },
                        },
                        required: ['name', 'timeline', 'cost'],
                      },
                    },
                    familyImpact: {
                      type: 'object',
                      properties: {
                        timeCommitment: { type: 'string', description: 'Time commitment per week' },
                        flexibility: {
                          type: 'string',
                          enum: ['High', 'Medium', 'Low'],
                          description: 'Schedule flexibility',
                        },
                        stability: { type: 'string', description: 'Job stability description' },
                        notes: { type: 'string', description: 'Family considerations' },
                      },
                      required: ['timeCommitment', 'flexibility', 'stability', 'notes'],
                    },
                    whyThisPath: {
                      type: 'string',
                      description: '2-3 sentences on why this path fits this veteran',
                    },
                  },
                  required: [
                    'type',
                    'title',
                    'description',
                    'incomeTrajectory',
                    'roadmap',
                    'requiredCredentials',
                    'familyImpact',
                    'whyThisPath',
                  ],
                },
              },
            },
            required: ['summary', 'pathways'],
          },
        },
      ],
      tool_choice: {
        type: 'tool',
        name: 'emit_analysis',
      },
    });

    // Extract tool use from response
    const toolUse = message.content.find(
      (block) => block.type === 'tool_use' && block.name === 'emit_analysis'
    );

    if (!toolUse || toolUse.type !== 'tool_use') {
      const rawPreview = JSON.stringify(message.content).slice(0, 300);
      return NextResponse.json(
        {
          error: 'No tool use found in response',
          rawPreview,
        },
        { status: 500 }
      );
    }

    const result = toolUse.input;

    // Validate the payload shape
    if (!validateAnalysisResult(result)) {
      const rawPreview = JSON.stringify(result).slice(0, 300);
      return NextResponse.json(
        {
          error: 'Invalid analysis result structure',
          rawPreview,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing veteran profile:', error);
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}
