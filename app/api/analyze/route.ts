import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { VeteranProfile, AnalysisResult } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

Please respond with a JSON object ONLY (no markdown, no code blocks) in the following format:
{
  "summary": "A brief 2-3 sentence overview of this veteran's strengths and transition outlook",
  "pathways": [
    {
      "type": "fast-income",
      "title": "Career Title",
      "description": "2-3 sentence description of this pathway",
      "incomeTrajectory": {
        "year1": "$XX,XXX",
        "year3": "$XX,XXX",
        "year5": "$XX,XXX"
      },
      "roadmap": [
        {
          "phase": "Phase Name",
          "duration": "X months",
          "steps": ["Step 1", "Step 2", "Step 3"]
        }
      ],
      "requiredCredentials": [
        {
          "name": "Credential name",
          "timeline": "X months",
          "cost": "$X,XXX"
        }
      ],
      "familyImpact": {
        "timeCommitment": "X hours/week",
        "flexibility": "High/Medium/Low",
        "stability": "Description",
        "notes": "Family considerations"
      },
      "whyThisPath": "2-3 sentences on why this path fits this veteran"
    }
  ]
}

Make each pathway specific, actionable, and realistic. Consider the veteran's military background, skills, family situation, and goals. Include real job titles, actual certifications, and market-based salary ranges.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const result: AnalysisResult = JSON.parse(content.text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing veteran profile:', error);
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}
