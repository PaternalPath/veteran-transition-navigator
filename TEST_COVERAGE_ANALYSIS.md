# Test Coverage Analysis & Improvement Recommendations

## Executive Summary

The Veteran Transition Navigator has a **solid testing foundation** for its core business logic, with 31 total tests (27 unit + 4 E2E). However, there are significant gaps in security infrastructure, API layer, and component testing that should be addressed.

**Current Coverage:**
- ✅ Well tested: Demo mode provider, schema validation, provider selection
- ⚠️ Partial coverage: Form flow (E2E only), error handling
- ❌ Untested: Rate limiting, API routes, React components, real mode provider

---

## Current Test Inventory

### Unit Tests (27 tests across 3 files)

| File | Tests | Coverage |
|------|-------|----------|
| `src/lib/analyzer/__tests__/types.test.ts` | 7 | Zod schema validation |
| `src/lib/analyzer/__tests__/demoProvider.test.ts` | 13 | Demo mode functionality |
| `src/lib/analyzer/__tests__/index.test.ts` | 7 | Provider selection logic |

### E2E Tests (4 tests)

| File | Tests | Coverage |
|------|-------|----------|
| `tests/e2e/smoke.spec.ts` | 4 | App loading, form flow, results display |

---

## Priority 1: Security Infrastructure (Critical)

### 1.1 Rate Limiting (`src/lib/rateLimit.ts`)

**Current state:** 0 tests | **Risk:** High

The rate limiting module is a critical security feature that is completely untested.

**Recommended tests:**

```typescript
// src/lib/__tests__/rateLimit.test.ts
describe('checkRateLimit', () => {
  // Core functionality
  it('allows first request from a new IP');
  it('tracks request count correctly');
  it('blocks requests after exceeding limit (10 requests)');
  it('returns correct remaining count');
  it('resets limit after window expires (15 minutes)');

  // Edge cases
  it('handles concurrent requests from same IP');
  it('treats different IPs independently');
  it('handles empty string IP gracefully');
});

describe('getClientIP', () => {
  it('extracts IP from x-forwarded-for header');
  it('handles comma-separated x-forwarded-for (returns first IP)');
  it('falls back to x-real-ip when x-forwarded-for missing');
  it('falls back to cf-connecting-ip for Cloudflare');
  it('returns "unknown" when no headers present');
  it('trims whitespace from extracted IP');
});

describe('clearAllRateLimits', () => {
  it('clears all stored rate limit entries');
});
```

**Why this matters:** Rate limiting prevents abuse. Without tests, changes could break this security measure silently.

---

## Priority 2: API Route Handlers (High)

### 2.1 POST /api/analyze (`app/api/analyze/route.ts`)

**Current state:** 0 tests | **Risk:** High

The main API endpoint has complex logic including rate limiting, size validation, and error handling.

**Recommended tests:**

```typescript
// app/api/analyze/__tests__/route.test.ts
describe('POST /api/analyze', () => {
  // Success cases
  it('returns 200 with valid profile data');
  it('includes rate limit headers in response');
  it('returns valid AnalysisResult structure');

  // Rate limiting
  it('returns 429 when rate limit exceeded');
  it('includes Retry-After header on 429');
  it('includes X-RateLimit-* headers');

  // Size limits
  it('returns 413 when content-length exceeds 100KB');
  it('returns 413 when parsed body exceeds 100KB');

  // Validation errors
  it('returns 400 with invalid profile data');
  it('returns detailed Zod error messages');
  it('maps error paths correctly (e.g., "branch")');

  // Error handling
  it('returns 500 on unexpected errors');
  it('does not leak API error messages');
  it('sanitizes error messages in production');
});
```

### 2.2 GET /api/mode (`app/api/mode/route.ts`)

**Current state:** 0 tests | **Risk:** Low

Simple endpoint but should have basic coverage.

```typescript
// app/api/mode/__tests__/route.test.ts
describe('GET /api/mode', () => {
  it('returns current mode (demo/real)');
  it('returns 200 status');
});
```

---

## Priority 3: Real Mode Provider (Medium)

### 3.1 Anthropic API Integration (`src/lib/analyzer/realProvider.ts`)

**Current state:** 0 tests | **Risk:** Medium

Cannot test with real API calls, but should test with mocks.

**Recommended tests:**

```typescript
// src/lib/analyzer/__tests__/realProvider.test.ts
import { vi } from 'vitest';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk');

describe('analyzeRealMode', () => {
  // API key validation
  it('throws error when ANTHROPIC_API_KEY missing');
  it('throws error when ANTHROPIC_API_KEY is empty');

  // Prompt construction
  it('constructs prompt with all profile fields');
  it('handles missing optional fields gracefully');
  it('formats boolean fields correctly (Yes/No)');

  // Response parsing
  it('extracts tool_use from response');
  it('throws error when no tool_use in response');
  it('validates response against AnalysisResultSchema');

  // Error handling
  it('handles API timeout gracefully');
  it('handles API rate limit errors');
  it('handles malformed API responses');
});
```

---

## Priority 4: React Components (Medium)

### 4.1 IntakeForm Component (`components/IntakeForm.tsx`)

**Current state:** E2E only | **Risk:** Medium

Complex multi-step form with state management should have unit tests.

**Recommended tests:**

```typescript
// components/__tests__/IntakeForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('IntakeForm', () => {
  // Navigation
  it('renders step 1 initially');
  it('advances to next step on Next click');
  it('goes back on Previous click');
  it('disables Previous on step 1');
  it('shows Submit button on step 5');

  // Progress indicator
  it('shows correct progress bar state');
  it('displays correct step count');

  // Field updates
  it('updates branch selection');
  it('updates yearsOfService number input');
  it('updates text inputs (rank, mos)');

  // Array field management
  it('adds skill on Enter key press');
  it('removes skill on X button click');
  it('prevents duplicate skills');
  it('trims whitespace from skills');

  // Form submission
  it('calls onComplete with profile data');
  it('includes all form fields in submitted profile');

  // Conditional rendering
  it('shows preferred locations only when willing to relocate');
  it('hides preferred locations when not willing to relocate');
});
```

### 4.2 ResultsDisplay Component (`components/ResultsDisplay.tsx`)

**Current state:** E2E only | **Risk:** Low

```typescript
// components/__tests__/ResultsDisplay.test.tsx
describe('ResultsDisplay', () => {
  it('renders summary section');
  it('renders all three pathways');
  it('displays income trajectory for each pathway');
  it('displays roadmap phases');
  it('displays required credentials');
  it('displays family impact information');
  it('handles missing optional fields gracefully');
});
```

---

## Priority 5: Edge Cases & Error Scenarios (Low)

### 5.1 Schema Validation Edge Cases

```typescript
// Additional tests for types.test.ts
describe('VeteranProfileSchema edge cases', () => {
  it('accepts empty technicalSkills array');
  it('accepts empty certifications array');
  it('accepts empty preferredLocations array');
  it('rejects negative yearsOfService');
  it('rejects negative dependents');
  it('accepts 0 dependents');
  it('accepts 0 yearsOfService');
});
```

### 5.2 Demo Provider Edge Cases

```typescript
// Additional tests for demoProvider.test.ts
describe('analyzeDemoMode edge cases', () => {
  it('handles very long career goals string');
  it('handles special characters in inputs');
  it('handles empty strings for optional text fields');
  it('handles all military branches');
  it('handles all rank formats (E-1 through O-10)');
});
```

---

## Implementation Roadmap

### Phase 1: Security Tests (Immediate)
1. Create `src/lib/__tests__/rateLimit.test.ts`
2. Add rate limit behavior tests
3. Add IP extraction tests
4. Estimated new tests: ~15

### Phase 2: API Route Tests (Next)
1. Create `app/api/analyze/__tests__/route.test.ts`
2. Mock dependencies (analyzer, rate limiter)
3. Test all response scenarios
4. Estimated new tests: ~15

### Phase 3: Real Provider Tests
1. Create mock for Anthropic SDK
2. Test prompt construction
3. Test response parsing
4. Estimated new tests: ~10

### Phase 4: Component Tests
1. Set up React Testing Library
2. Add IntakeForm unit tests
3. Add ResultsDisplay unit tests
4. Estimated new tests: ~20

---

## Testing Infrastructure Improvements

### 1. Add React Testing Library

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Update `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    // ...
  },
});
```

Create `tests/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest';
```

### 2. Add API Route Testing Utilities

Consider using `next-test-api-route-handler` or similar for testing Next.js API routes.

### 3. Coverage Threshold Adjustments

Current thresholds are 70%. After implementing recommendations:
- Increase to 80% once Phase 1-2 complete
- Target 85% after all phases

---

## Summary Metrics

| Metric | Current | After Improvements |
|--------|---------|-------------------|
| Unit Tests | 27 | ~75+ |
| E2E Tests | 4 | 4-6 |
| Files with Tests | 3 | 10+ |
| Coverage Threshold | 70% | 85% |
| Security Tests | 0 | 15+ |
| Component Tests | 0 | 20+ |

---

## Conclusion

The most critical gaps are:

1. **Rate limiting has zero tests** - This is a security feature that should be tested thoroughly
2. **API routes are untested** - Request validation and error handling are critical
3. **React components lack unit tests** - Only E2E coverage, which is slower and less granular

By implementing these recommendations, the test suite will provide better confidence in:
- Security measures working correctly
- API contract stability
- Component behavior in isolation
- Regression prevention

The existing tests are well-written and follow good patterns (descriptive names, proper assertions, edge case coverage). The new tests should follow the same style for consistency.
