# Fortune-500 Upgrade Plan: Veteran Transition Navigator

**Date**: 2026-01-17
**Objective**: Upgrade to Fortune-500 quality with zero secrets required (Demo Mode)

---

## Current State Analysis

### Framework & Version

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5
- **Router Type**: App Router (modern, server components by default)
- **Styling**: Tailwind CSS v4

### Current API Routes & Flow

**Single API Endpoint**: `POST /api/analyze`

**Flow**:

1. Client submits `VeteranProfile` (5-step form data)
2. API route (`app/api/analyze/route.ts`) receives JSON body
3. Constructs prompt from profile data (direct string interpolation)
4. Calls Anthropic API with Claude Opus 4.5
5. Uses Tool Use (`emit_analysis`) to guarantee structured output
6. Validates response has `summary` and 3 `pathways`
7. Returns `AnalysisResult` to client
8. Client displays results in `ResultsDisplay` component

**Current Types**: `VeteranProfile`, `CareerPathway`, `AnalysisResult` (in `types/index.ts`)

### Current Environment Requirements

| Variable            | Required? | Usage           | What Breaks Without It                  |
| ------------------- | --------- | --------------- | --------------------------------------- |
| `ANTHROPIC_API_KEY` | YES       | Claude API auth | API route crashes, no analysis possible |

**Impact**: App is completely non-functional without this key.

### Current Scripts in package.json

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Missing**:

- ❌ `typecheck` - TypeScript validation
- ❌ `test` - Unit tests
- ❌ `test:e2e` - End-to-end tests
- ❌ `format` - Code formatting

---

## Gaps vs Acceptance Criteria

### 1. Clean Machine Verification

| Command             | Current Status | Gap                            |
| ------------------- | -------------- | ------------------------------ |
| `npm ci`            | ✅ Works       | None                           |
| `npm run lint`      | ✅ Works       | None                           |
| `npm run typecheck` | ❌ Missing     | Need to add script             |
| `npm run test`      | ❌ Missing     | Need testing framework + tests |
| `npm run build`     | ✅ Works       | None                           |

### 2. Vercel Readiness

- ❌ **BLOCKER**: Deployment fails without `ANTHROPIC_API_KEY`
- ❌ **BLOCKER**: No Demo Mode implemented
- Gap: Need analyzer service layer with demo/real provider selection

### 3. Responsible AI Safety

- ⚠️ No PII storage (currently stateless - OK)
- ❌ No disclosure of what gets sent to AI (missing)
- ❌ No rate limiting (exposed to abuse)
- ❌ No request size validation
- ⚠️ Input goes directly to prompt (potential injection risk)

### 4. Product UX Quality

- ⚠️ Loading state exists (`ResultsSkeleton`) but could be clearer
- ⚠️ Error states are generic (no retry, no helpful guidance)
- ⚠️ No empty state guidance on first visit
- ⚠️ Mobile-friendly but not verified for accessibility
- ❌ No example profile button
- ❌ Input labels exist but focus states need verification

### 5. Repo Maturity

- ❌ README has no screenshots/GIF
- ⚠️ `.env.local.example` exists but doesn't mark keys as optional
- ❌ No GitHub Actions CI
- ❌ No `docs/architecture.md`
- ❌ No `docs/security.md`

---

## Implementation Plan

### Task 1: Standardize Scripts & Tooling

**Duration**: 30 minutes
**Priority**: HIGH (foundation for all other work)

**Actions**:

1. Add missing scripts to `package.json`:
   - `typecheck`: `tsc --noEmit`
   - `test`: `vitest`
   - `test:e2e`: `playwright test`
   - `format`: `prettier --check .`
   - `format:fix`: `prettier --write .`
   - `lint:fix`: `eslint --fix`
2. Install dependencies:
   - `vitest` + `@vitejs/plugin-react` (unit tests)
   - `@playwright/test` (E2E tests)
   - `prettier` + `eslint-config-prettier` (formatting)
   - `zod` (runtime validation)
3. Create `.nvmrc` with Node 20 (Vercel default)
4. Create `prettier.config.js` (minimal config)
5. Create `vitest.config.ts`
6. Verify all scripts work on clean machine

**Acceptance**: All 6 scripts run without errors (tests may have 0 tests initially)

---

### Task 2: Implement Demo Mode - Service Layer

**Duration**: 2 hours
**Priority**: CRITICAL (unblocks Vercel deployment)

**Actions**:

1. Create `src/lib/analyzer/types.ts`:
   - Migrate `VeteranProfile`, `AnalysisResult`, `CareerPathway` from `types/index.ts`
   - Add Zod schemas: `VeteranProfileSchema`, `AnalysisResultSchema`
   - Export TypeScript types inferred from Zod schemas
2. Create `src/lib/analyzer/demoProvider.ts`:
   - Export `analyzeDemoMode(profile: VeteranProfile): Promise<AnalysisResult>`
   - Deterministic logic: hash profile fields to select from 3 pre-built pathway templates
   - Pathways must include real job titles, certs, salary ranges
   - Response must match `AnalysisResultSchema` exactly
3. Create `src/lib/analyzer/realProvider.ts`:
   - Export `analyzeRealMode(profile: VeteranProfile): Promise<AnalysisResult>`
   - Move existing Anthropic API logic here
   - Validate response with `AnalysisResultSchema.parse()`
4. Create `src/lib/analyzer/index.ts`:
   - Export `analyzeProfile(profile: VeteranProfile): Promise<AnalysisResult>`
   - Logic: `if (!process.env.ANTHROPIC_API_KEY) return analyzeDemoMode(profile)`
   - Otherwise: `return analyzeRealMode(profile)`
5. Update `app/api/analyze/route.ts`:
   - Import `analyzeProfile` from service layer
   - Validate request body with `VeteranProfileSchema.parse()`
   - Call `analyzeProfile(profile)`
   - Return result (already validated by provider)

**Demo Provider Design**:

```typescript
// Deterministic templates based on MOS/skills
const PATHWAYS_TEMPLATES = [
  { mos: '11B', pathway: 'Security Guard -> Law Enforcement -> Police Chief' },
  { mos: '25B', pathway: 'Help Desk -> SysAdmin -> IT Manager' },
  // ... 5 more realistic examples
];

function selectTemplate(profile: VeteranProfile): PathwayTemplate {
  // Hash MOS + skills to select template deterministically
  const hash = simpleHash(profile.mos + profile.technicalSkills.join(''));
  return PATHWAYS_TEMPLATES[hash % PATHWAYS_TEMPLATES.length];
}
```

**Acceptance**:

- `npm run build` succeeds with NO environment variables set
- Demo mode returns valid `AnalysisResult` with 3 realistic pathways

---

### Task 3: API Safety & Abuse Guards

**Duration**: 1 hour
**Priority**: HIGH (security requirement)

**Actions**:

1. Create `src/lib/rateLimit.ts`:
   - Simple in-memory Map<IP, { count, resetTime }>
   - 10 requests per IP per 15 minutes
   - Auto-cleanup old entries
2. Update `app/api/analyze/route.ts`:
   - Add request size check (reject >100KB bodies)
   - Call rate limiter before processing
   - Wrap all errors to prevent stack trace leakage
   - Never log `ANTHROPIC_API_KEY` or sensitive profile data
3. Create `docs/security.md`:
   - Demo vs Real mode behavior
   - Data handling: "No data stored. Profile sent to Anthropic in Real Mode only."
   - Rate limiting: "10 requests per IP per 15 minutes"
   - Recommendations for production deployment

**Acceptance**:

- API rejects oversized requests with 413
- API returns 429 after 10 requests from same IP
- No sensitive data in console logs

---

### Task 4: UX Polish (Professional Finish)

**Duration**: 2 hours
**Priority**: MEDIUM (user-facing quality)

**Actions**:

1. Add Mode Indicator (`components/ModeIndicator.tsx`):
   - Detect mode on client (call `/api/mode` endpoint)
   - Display subtle badge: "Demo Mode" (yellow) or "Live Mode" (green)
   - Position: top-right corner
2. Add Sample Profile Button (`components/SampleProfileButton.tsx`):
   - Pre-fills form with realistic example
   - Place below form intro text
3. Improve `IntakeForm.tsx`:
   - Add placeholder text to all inputs
   - Add input guidance (e.g., "e.g., 11B Infantry" for MOS)
   - Disable submit button when form invalid
   - Add keyboard navigation hints
4. Improve `ResultsDisplay.tsx`:
   - Add friendly error state with "Try Again" button
   - Improve empty state (should never show, but defensive)
   - Verify mobile layout on narrow screens (320px min)
5. Accessibility audit:
   - Verify all inputs have associated `<label>` elements
   - Check focus states are visible (Tailwind defaults are good)
   - Test keyboard-only navigation (Tab, Enter)
   - Add `aria-live` region for loading state

**Acceptance**:

- Mode indicator visible and accurate
- Sample profile button fills form correctly
- Form is keyboard navigable
- Error state shows "Try Again" button
- Mobile layout works at 320px width

---

### Task 5: Add Tests (Minimum Viable Coverage)

**Duration**: 3 hours
**Priority**: HIGH (CI requirement)

**Unit Tests** (Vitest):

1. `src/lib/analyzer/__tests__/types.test.ts`:
   - Valid profile passes `VeteranProfileSchema.parse()`
   - Invalid profile throws ZodError
2. `src/lib/analyzer/__tests__/demoProvider.test.ts`:
   - Returns 3 pathways
   - Result validates against `AnalysisResultSchema`
   - Same input produces same output (deterministic)
3. `src/lib/analyzer/__tests__/index.test.ts`:
   - Selects demo provider when no API key
   - Selects real provider when API key present (use env var mock)
4. `app/api/analyze/__tests__/route.test.ts`:
   - Returns 200 with valid profile in demo mode
   - Returns 400 with invalid profile
   - Returns 413 with oversized body

**E2E Tests** (Playwright):

1. `tests/e2e/smoke.spec.ts`:
   - App loads successfully
   - Fill form with sample profile -> submit -> results appear
   - Results contain expected sections (pathways, income, roadmap)
   - Invalid form submission shows error message
2. Run E2E tests with NO env vars (demo mode)

**Test Configuration**:

- `vitest.config.ts`: React plugin, coverage threshold 70%
- `playwright.config.ts`: headless, 3 retries, screenshots on failure

**Acceptance**:

- `npm run test` passes with >70% coverage
- `npm run test:e2e` passes in demo mode (no env vars)

---

### Task 6: CI Pipeline & Documentation

**Duration**: 1.5 hours
**Priority**: HIGH (repo maturity)

**GitHub Actions**:

1. Create `.github/workflows/ci.yml`:
   - Triggers: push, pull_request
   - Steps:
     - Checkout code
     - Setup Node 20
     - `npm ci`
     - `npm run lint`
     - `npm run typecheck`
     - `npm run test`
     - `npm run build`
   - Run E2E tests in separate job (heavier)
   - Upload Playwright report on failure

**Documentation**:

1. Update `README.md`:
   - Add 2-sentence pitch at top
   - Add screenshot/GIF placeholder (manual step)
   - Add Quickstart section
   - Add Demo Mode explanation
   - Add env var table:
     ```
     | Variable | Required | Description |
     | ANTHROPIC_API_KEY | No | Enable Real Mode with Claude API |
     ```
   - Add Vercel deployment steps (no env vars needed)
   - Add section on enabling Real Mode
2. Create `docs/architecture.md`:
   - Request flow diagram (text-based)
   - Demo vs Real mode decision tree
   - Component structure
   - File organization
3. Create `docs/security.md` (if not created in Task 3)

**Acceptance**:

- CI pipeline runs and passes on push
- README has clear quickstart and deployment instructions
- Architecture doc explains system design in <1 page

---

### Task 7: Vercel Deployment Configuration

**Duration**: 30 minutes
**Priority**: HIGH (acceptance criteria)

**Actions**:

1. Create `vercel.json` (optional, for optimization):
   ```json
   {
     "buildCommand": "npm run build",
     "framework": "nextjs"
   }
   ```
2. Update `.env.local.example`:
   - Add comment: "# All variables are OPTIONAL - demo mode works without any keys"
   - `ANTHROPIC_API_KEY=your_api_key_here`
3. Test deployment locally:
   - Remove all env vars
   - `npm run build`
   - `npm run start`
   - Test submit flow (should use demo mode)

**Acceptance**:

- Build succeeds with zero env vars
- Production server works in demo mode
- README has Vercel deployment instructions

---

### Task 8: Final Verification & Cleanup

**Duration**: 1 hour
**Priority**: CRITICAL (acceptance criteria validation)

**Clean Machine Test**:

1. Clone repo to new directory (or use Docker)
2. `rm -rf node_modules .next`
3. Run acceptance criteria commands:
   - `npm ci` ✅
   - `npm run lint` ✅
   - `npm run typecheck` ✅
   - `npm run test` ✅
   - `npm run build` ✅
4. Test demo mode:
   - `npm run start`
   - Submit sample profile
   - Verify results render correctly

**Code Quality Checklist**:

- [ ] No secrets in code or git history
- [ ] No `console.log` debugging statements
- [ ] All TypeScript `any` types replaced with proper types
- [ ] All TODO comments addressed or tracked
- [ ] No unused imports or variables
- [ ] Prettier formatting applied to all files
- [ ] All tests passing

**Documentation Checklist**:

- [ ] README has screenshot/GIF
- [ ] README quickstart tested by fresh clone
- [ ] Architecture doc is accurate
- [ ] Security doc covers all concerns
- [ ] PLAN.md reflects actual implementation

**Acceptance**: All acceptance criteria pass on clean machine

---

## Summary of Changes

### New Files Created

- `src/lib/analyzer/types.ts` - Zod schemas & TypeScript types
- `src/lib/analyzer/demoProvider.ts` - Demo mode implementation
- `src/lib/analyzer/realProvider.ts` - Real API mode
- `src/lib/analyzer/index.ts` - Provider selection logic
- `src/lib/rateLimit.ts` - In-memory rate limiter
- `components/ModeIndicator.tsx` - Shows demo/live mode
- `components/SampleProfileButton.tsx` - Pre-fill example
- `vitest.config.ts` - Test configuration
- `playwright.config.ts` - E2E test config
- `prettier.config.js` - Code formatting
- `.nvmrc` - Node version (20)
- `.github/workflows/ci.yml` - CI pipeline
- `docs/PLAN.md` - This file
- `docs/architecture.md` - System design
- `docs/security.md` - Security considerations
- `tests/e2e/smoke.spec.ts` - E2E tests
- `app/api/mode/route.ts` - Detect current mode (for UI indicator)

### Modified Files

- `package.json` - Add scripts and dependencies
- `app/api/analyze/route.ts` - Use service layer + validation
- `types/index.ts` - Move types to analyzer (backward compat re-export)
- `IntakeForm.tsx` - UX improvements
- `ResultsDisplay.tsx` - Better error/empty states
- `README.md` - Complete rewrite with deployment guide
- `.env.local.example` - Mark all keys as optional

### Removed Files

None (backward compatible)

---

## Risk Mitigation

### Risk: Demo Mode produces poor quality output

**Mitigation**: Pre-build 5-7 high-quality pathway templates based on common MOS codes. Ensure templates are realistic and well-researched.

### Risk: Rate limiting blocks legitimate users

**Mitigation**: Set limit to 10 req/15min (generous for demo use). Document how to disable for self-hosted deployments.

### Risk: Tests are flaky

**Mitigation**: Use Playwright retries (3x). Mock network calls in unit tests. Keep E2E tests minimal (smoke test only).

### Risk: CI takes too long

**Mitigation**: Run E2E tests in parallel job. Use Playwright sharding if needed. Cache dependencies.

---

## Out of Scope (Future Enhancements)

These are NOT part of this upgrade but could be future work:

- Database persistence of results
- User authentication
- Admin dashboard
- Advanced analytics
- Real-time streaming responses
- Multi-language support
- PDF export of career pathways
- Integration with job boards
- Mobile native app

---

## Success Metrics

Post-upgrade, the repository will have:

- ✅ **100% Demo Mode coverage**: Works with zero env vars
- ✅ **>70% test coverage**: Unit + E2E tests
- ✅ **Zero critical security issues**: Rate limiting, input validation, no leaks
- ✅ **Professional UX**: Loading, error, empty states + accessibility
- ✅ **Enterprise repo standards**: CI, docs, linting, formatting
- ✅ **One-click Vercel deploy**: No configuration required

---

**Estimated Total Time**: 8-10 hours
**Complexity**: Medium (well-defined scope, existing codebase is clean)
**Dependencies**: None (all work can proceed linearly)
