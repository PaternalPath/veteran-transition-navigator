# Architecture Documentation

This document describes the system architecture, request flow, and key design decisions for the Veteran Transition Navigator.

---

## System Overview

**Veteran Transition Navigator** is a Next.js 16 (App Router) application that helps veterans transition to civilian careers by providing personalized career pathway recommendations.

**Key Features**:

- ✅ **Zero-config Demo Mode**: Works with no API keys required
- ✅ **AI-powered Real Mode**: Optional Claude integration for personalized analysis
- ✅ **5-step intake form**: Comprehensive veteran profile collection
- ✅ **3 pathway strategy**: Fast-income, balanced, and max-upside career paths
- ✅ **Rate limiting**: 10 requests per IP per 15 minutes
- ✅ **Mobile-responsive**: Works on all screen sizes

---

## Technology Stack

| Layer                | Technology                      | Version  |
| -------------------- | ------------------------------- | -------- |
| **Framework**        | Next.js (App Router)            | 16.1.1   |
| **Runtime**          | React                           | 19.2.3   |
| **Language**         | TypeScript                      | 5        |
| **Styling**          | Tailwind CSS                    | 4        |
| **Validation**       | Zod                             | 4.3.5    |
| **AI Provider**      | Anthropic (Claude Opus 4.5)     | Optional |
| **Testing (Unit)**   | Vitest                          | 4.0.17   |
| **Testing (E2E)**    | Playwright                      | 1.57.0   |
| **Deployment**       | Vercel (or any Node.js host)    | -        |
| **Node Version**     | 20+                             | LTS      |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          User (Browser)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js Frontend                          │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │ IntakeForm   │  │ ResultsDisplay│  │ RoadmapView        │   │
│  │ (5 steps)    │──│               │──│                    │   │
│  └──────────────┘  └───────────────┘  └────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /api/analyze
                             │ { VeteranProfile }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Routes (Next.js)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  POST /api/analyze                                        │  │
│  │  ├─ Rate Limiting (10 req / 15 min)                       │  │
│  │  ├─ Request Size Check (100KB max)                        │  │
│  │  ├─ Zod Validation (VeteranProfileSchema)                 │  │
│  │  └─ Call analyzeProfile()                                 │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  GET /api/mode                                            │  │
│  │  └─ Returns { mode: 'demo' | 'real' }                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Analyzer Service Layer                       │
│           (src/lib/analyzer/index.ts)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  analyzeProfile(profile: VeteranProfile)                 │   │
│  │  ├─ if (process.env.ANTHROPIC_API_KEY exists)            │   │
│  │  │   └─ analyzeRealMode() ──────────────────────┐        │   │
│  │  │                                               │        │   │
│  │  └─ else                                         │        │   │
│  │      └─ analyzeDemoMode() ────────────┐          │        │   │
│  └────────────────────────────────────────┼──────────┼────────┘   │
│                                           │          │            │
│  ┌────────────────────────────────────────┼──────────┼─────────┐  │
│  │  Demo Provider                         │          │         │  │
│  │  (demoProvider.ts)                     │          │         │  │
│  │                                        │          │         │  │
│  │  1. Hash profile (MOS + skills)        │          │         │  │
│  │  2. Select template (5 options)     ◀──┘          │         │  │
│  │  3. Customize based on profile                    │         │  │
│  │  4. Return AnalysisResult                         │         │  │
│  └───────────────────────────────────────────────────┘         │  │
│                                                                 │  │
│  ┌────────────────────────────────────────────────────────────┐│  │
│  │  Real Provider                                             ││  │
│  │  (realProvider.ts)                                         ││  │
│  │                                                            ││  │
│  │  1. Build prompt from profile                             ││  │
│  │  2. Call Anthropic API (Claude Opus 4.5)  ◀───────────────┘│  │
│  │  3. Use Tool Use for structured output                     │  │
│  │  4. Validate with Zod                                      │  │
│  │  5. Return AnalysisResult                                  │  │
│  └────────────────┬───────────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ HTTPS (only in Real Mode)
                    ▼
      ┌──────────────────────────────┐
      │   Anthropic API              │
      │   (Claude Opus 4.5)          │
      └──────────────────────────────┘
```

---

## Request Flow

### Demo Mode Flow

```
1. User fills out 5-step intake form
   └─ VeteranProfile collected

2. Frontend sends POST /api/analyze with profile
   └─ JSON body: { branch, yearsOfService, rank, mos, ... }

3. API Route validates and processes
   ├─ Rate limit check (IP-based)
   ├─ Request size check (100KB max)
   ├─ Zod validation (VeteranProfileSchema)
   └─ Call analyzeProfile(profile)

4. Analyzer Service selects provider
   ├─ Check if ANTHROPIC_API_KEY exists
   └─ No key found → Use Demo Provider

5. Demo Provider generates result
   ├─ Hash profile (MOS + skills + branch)
   ├─ Select template (0-4) based on hash
   ├─ Customize pathways:
   │  ├─ Adjust salary for relocation preference
   │  ├─ Add education if user interested
   │  └─ Adjust based on years of service
   └─ Return AnalysisResult

6. API Route returns JSON
   └─ { summary: "...", pathways: [...] }

7. Frontend displays results
   ├─ Summary section
   ├─ 3 pathway cards (fast-income, balanced, max-upside)
   └─ Roadmap visualization

**Total Time**: <100ms (no external API calls)
**Network Calls**: 0 (fully local)
```

### Real Mode Flow

```
1-3. Same as Demo Mode (form, validation, rate limiting)

4. Analyzer Service selects provider
   ├─ Check if ANTHROPIC_API_KEY exists
   └─ Key found → Use Real Provider

5. Real Provider calls Anthropic API
   ├─ Build prompt from profile
   ├─ POST to api.anthropic.com/v1/messages
   │  ├─ Model: claude-opus-4-5-20251101
   │  ├─ Max Tokens: 16,000
   │  └─ Tool Use: emit_analysis
   ├─ Receive structured response
   ├─ Validate with AnalysisResultSchema (Zod)
   └─ Return AnalysisResult

6-7. Same as Demo Mode (return JSON, display results)

**Total Time**: 3-10 seconds (depends on AI generation)
**Network Calls**: 1 (Anthropic API)
```

---

## Component Structure

### Frontend Components

```
app/
├── page.tsx                    # Home page (client component)
│   ├─ Renders IntakeForm
│   └─ Renders ResultsDisplay when analysis complete
│
├── layout.tsx                  # Root layout
│   └─ Wraps all pages with HTML structure
│
components/
├── IntakeForm.tsx              # 5-step multi-stage form
│   ├─ Step 1: Service Background (branch, years, rank, MOS)
│   ├─ Step 2: Skills (technical skills, certs, leadership)
│   ├─ Step 3: Family (status, dependents, spouse employment)
│   ├─ Step 4: Location (current, willing to relocate, preferred)
│   └─ Step 5: Goals (career goals, income, education, timeline)
│
├── ResultsDisplay.tsx          # Analysis results viewer
│   ├─ Summary section
│   ├─ Pathway cards (3 types)
│   └─ Conditional rendering based on pathway type
│
├── ResultsSkeleton.tsx         # Loading skeleton
│   └─ Shown while waiting for API response
│
└── RoadmapView.tsx             # Visual roadmap timeline
    └─ Displays phases and steps for each pathway
```

### Backend Services

```
app/api/
├── analyze/
│   └── route.ts                # POST /api/analyze
│       ├─ Rate limiting
│       ├─ Validation
│       └─ Calls analyzeProfile()
│
└── mode/
    └── route.ts                # GET /api/mode
        └─ Returns current mode (demo/real)

src/lib/
├── analyzer/
│   ├── index.ts                # Main service (provider selection)
│   ├── types.ts                # Zod schemas + TypeScript types
│   ├── demoProvider.ts         # Template-based analysis
│   └── realProvider.ts         # Anthropic API wrapper
│
└── rateLimit.ts                # In-memory rate limiter
    ├─ IP-based tracking
    ├─ 10 requests / 15 min
    └─ Auto-cleanup
```

---

## Data Models

### VeteranProfile (Input)

```typescript
{
  // Service Background
  branch: string;
  yearsOfService: number;
  rank: string;
  mos: string;

  // Skills
  technicalSkills: string[];
  certifications: string[];
  leadershipExperience: string;

  // Family
  familyStatus: string;
  dependents: number;
  spouseEmployment: string;

  // Location
  currentLocation: string;
  willingToRelocate: boolean;
  preferredLocations: string[];

  // Goals
  careerGoals: string;
  incomeExpectations: string;
  educationInterest: string;
  timeline: string;
}
```

### AnalysisResult (Output)

```typescript
{
  summary: string;
  pathways: [
    {
      type: 'fast-income' | 'balanced' | 'max-upside';
      title: string;
      description: string;
      incomeTrajectory: {
        year1: string;
        year3: string;
        year5: string;
      };
      roadmap: [
        {
          phase: string;
          duration: string;
          steps: string[];
        }
      ];
      requiredCredentials: [
        {
          name: string;
          timeline: string;
          cost: string;
        }
      ];
      familyImpact: {
        timeCommitment: string;
        flexibility: string;
        stability: string;
        notes: string;
      };
      whyThisPath: string;
    }
    // ... 3 total pathways
  ];
}
```

---

## Mode Selection Logic

```typescript
// Pseudocode
function analyzeProfile(profile: VeteranProfile): AnalysisResult {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

  if (hasApiKey) {
    // Real Mode: Anthropic API
    return analyzeRealMode(profile);
  } else {
    // Demo Mode: Templates
    return analyzeDemoMode(profile);
  }
}
```

**Decision Tree**:

```
┌─────────────────────────┐
│ Environment Variable    │
│ ANTHROPIC_API_KEY       │
│ exists?                 │
└───────┬─────────────────┘
        │
    ┌───┴───┐
    │       │
   Yes     No
    │       │
    ▼       ▼
┌──────┐ ┌─────┐
│ Real │ │Demo │
│ Mode │ │Mode │
└──────┘ └─────┘
```

---

## Security Measures

1. **Rate Limiting**
   - In-memory, per-IP tracking
   - 10 requests / 15 minutes
   - HTTP 429 with Retry-After header

2. **Request Validation**
   - Zod schema validation
   - 100KB size limit
   - Type checking at runtime

3. **Error Handling**
   - No stack traces to client
   - No API keys in logs
   - Generic error messages

4. **Environment Isolation**
   - Secrets in env variables only
   - Never committed to git
   - Vercel project settings for production

---

## Deployment Architecture

### Vercel (Recommended)

```
┌────────────────────────────────────────────┐
│  Vercel Edge Network (Global CDN)          │
│  ├─ Static assets (CSS, JS, images)       │
│  └─ Edge caching                           │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│  Vercel Serverless Functions              │
│  ├─ /api/analyze (Node.js)                │
│  ├─ /api/mode                             │
│  └─ Auto-scaling                          │
└────────────────────────────────────────────┘
```

**Environment Variables** (Vercel Project Settings):

- `ANTHROPIC_API_KEY` (optional)
- `NODE_ENV=production` (automatic)

### Alternative Hosting

Works on any Node.js host:

- AWS (Elastic Beanstalk, ECS, Lambda)
- Google Cloud (App Engine, Cloud Run)
- Azure (App Service)
- Railway, Render, Fly.io
- Self-hosted (Docker, VPS)

**Requirements**:

- Node.js 20+
- `npm ci && npm run build && npm run start`

---

## File Organization

```
veteran-transition-navigator/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes
│   │   ├── analyze/route.ts    # Main analysis endpoint
│   │   └── mode/route.ts       # Mode detection
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/                 # React components
│   ├── IntakeForm.tsx
│   ├── ResultsDisplay.tsx
│   ├── ResultsSkeleton.tsx
│   └── RoadmapView.tsx
│
├── src/lib/                    # Business logic
│   ├── analyzer/               # Analysis service
│   │   ├── index.ts            # Provider selection
│   │   ├── types.ts            # Schemas + types
│   │   ├── demoProvider.ts     # Template logic
│   │   └── realProvider.ts     # Anthropic wrapper
│   └── rateLimit.ts            # Rate limiting
│
├── types/                      # Legacy type exports
│   └── index.ts                # Re-exports from src/lib/analyzer
│
├── tests/                      # Test suites
│   └── e2e/                    # Playwright tests
│
├── docs/                       # Documentation
│   ├── PLAN.md                 # Upgrade plan
│   ├── architecture.md         # This file
│   └── security.md             # Security docs
│
├── .github/workflows/          # CI/CD
│   └── ci.yml                  # GitHub Actions
│
├── package.json                # Dependencies + scripts
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── vitest.config.ts            # Vitest config
└── playwright.config.ts        # Playwright config
```

---

## Design Decisions

### Why Next.js App Router?

- **Server Components**: Better performance, smaller bundles
- **Built-in API routes**: No separate backend needed
- **TypeScript first**: Excellent DX with type safety
- **Vercel optimization**: Deploy in seconds

### Why Demo Mode?

- **Zero friction**: Anyone can try it without API keys
- **Privacy**: No data sent to third parties
- **Reliability**: Works even if Anthropic API is down
- **Cost control**: No surprise API bills

### Why Template-Based Demo Mode (vs Random)?

- **Deterministic**: Same input = same output (better UX)
- **Quality**: Curated, researched pathways
- **Realistic**: Based on actual veteran transitions
- **Testable**: Predictable output for tests

### Why Zod for Validation?

- **Runtime safety**: TypeScript alone doesn't validate at runtime
- **Type inference**: Single source of truth for types
- **Error messages**: Clear field-level errors
- **Schema reuse**: Same schema for frontend + backend

---

## Future Enhancements (Out of Scope)

- **Database**: Persist results, track outcomes
- **Authentication**: User accounts, saved profiles
- **PDF Export**: Downloadable career plans
- **Email Notifications**: Send pathways to veterans
- **Admin Dashboard**: Analytics, usage metrics
- **Multi-language**: Spanish, other languages
- **Job Board Integration**: Link to actual job postings

---

**Last Updated**: 2026-01-17
