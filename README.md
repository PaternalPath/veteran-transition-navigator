# Veteran Transition Navigator

**AI-powered career transition planning for veterans** - helping service members find civilian career pathways tailored to their military experience, skills, and goals.

> ✅ **Works out of the box with ZERO configuration** (Demo Mode)
> 🚀 **Deploy to Vercel in 60 seconds** - no API keys required
> 🔒 **Enterprise-grade security** - rate limiting, input validation, zero PII storage

---

## Features

### 🎯 Core Functionality

- **5-Step Intake Form**: Comprehensive questionnaire covering service background, skills, family, location, and goals
- **Three Career Pathways**: Fast-Income, Balanced, and Max-Upside strategies
- **Detailed Roadmaps**: Step-by-step action plans with timelines, credentials, and costs
- **Income Trajectories**: Year 1, 3, and 5 salary projections
- **Family Impact Analysis**: Time commitment, flexibility, and stability assessments

### 🛡️ Enterprise Quality

- ✅ **Zero-Config Demo Mode**: Works without API keys (template-based pathways)
- ✅ **Rate Limiting**: 10 requests per IP per 15 minutes
- ✅ **Input Validation**: Zod schemas with field-level error messages
- ✅ **Request Size Limits**: 100KB max to prevent abuse
- ✅ **Type Safety**: Full TypeScript coverage with strict mode
- ✅ **Comprehensive Tests**: 27+ unit tests + E2E Playwright tests
- ✅ **CI/CD Pipeline**: GitHub Actions with lint, typecheck, test, build
- ✅ **Security**: No PII storage, sanitized error messages, no stack trace leaks

---

## Quick Start (Demo Mode - No API Key Required)

```bash
# Clone repository
git clone https://github.com/your-org/veteran-transition-navigator.git
cd veteran-transition-navigator

# Install dependencies
npm ci

# Run development server (works immediately!)
npm run dev

# Open http://localhost:3000
```

**That's it!** The app works out of the box in Demo Mode with NO environment variables.

---

## Operating Modes

### Demo Mode (Default)

**When**: No `ANTHROPIC_API_KEY` environment variable is set.

**How it works**:

- Uses deterministic, template-based career pathway generation
- Zero external API calls - all processing happens locally
- 5 pre-built pathway templates (Combat, IT, Logistics, Medical, Aviation)
- Same input always produces same output (great for testing!)
- Perfect for demos, testing, and privacy-conscious deployments

**Ideal for**:

- ✅ Local development
- ✅ CI/CD pipelines
- ✅ Public demos
- ✅ Privacy-sensitive environments
- ✅ Zero-cost deployments

### Real Mode (Optional)

**When**: `ANTHROPIC_API_KEY` environment variable is set.

**How it works**:

- Uses Anthropic AI (Claude Opus 4.5) for personalized career pathway analysis
- Veteran profile data is sent to Anthropic's API over HTTPS
- AI-generated recommendations based on actual profile details
- Requires Anthropic API account ([Get one here](https://console.anthropic.com/))

**Ideal for**:

- ✅ Production deployments with personalized analysis
- ✅ Organizations with AI provider agreements
- ✅ Users who want cutting-edge AI recommendations

---

## Deployment to Vercel (Zero Config)

### Option 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**:

   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**:

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click **Deploy** (no environment variables needed!)

3. **Done!** Your app is live in Demo Mode.

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (one command!)
vercel --prod
```

**No configuration needed** - the app works immediately in Demo Mode.

### Enabling Real Mode (Optional)

If you want AI-powered personalized analysis:

1. **Get Anthropic API Key**: [console.anthropic.com](https://console.anthropic.com/)

2. **Add to Vercel**:

   - Go to your project on Vercel
   - Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = `your-api-key-here`
   - Redeploy

---

## Environment Variables

| Variable            | Required? | Default | Description                                    |
| ------------------- | --------- | ------- | ---------------------------------------------- |
| `ANTHROPIC_API_KEY` | **No**    | -       | Enable Real Mode with AI-powered analysis      |
| `NODE_ENV`          | No        | -       | Automatically set by hosting provider          |

**Important**: All variables are **optional**. The app works perfectly with zero configuration.

---

## Development Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run typecheck        # Run TypeScript compiler
npm run format           # Check Prettier formatting
npm run format:fix       # Auto-fix Prettier issues

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI

# Build & Deploy
npm run build            # Build for production
npm run start            # Start production server
npm run validate         # Run all checks (lint + typecheck + test + build)
```

---

## Tech Stack

| Layer                | Technology                 | Version  |
| -------------------- | -------------------------- | -------- |
| **Framework**        | Next.js (App Router)       | 16.1.1   |
| **Runtime**          | React                      | 19.2.3   |
| **Language**         | TypeScript                 | 5        |
| **Styling**          | Tailwind CSS               | 4        |
| **Validation**       | Zod                        | 4.3.5    |
| **AI Provider**      | Anthropic (Claude Opus 4.5)| Optional |
| **Testing (Unit)**   | Vitest                     | 4.0.17   |
| **Testing (E2E)**    | Playwright                 | 1.57.0   |
| **Deployment**       | Vercel (or any Node.js host)| -       |
| **Node Version**     | 20+                        | LTS      |

---

## Project Structure

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
│   ├── IntakeForm.tsx          # 5-step form
│   ├── ResultsDisplay.tsx      # Results viewer
│   ├── ResultsSkeleton.tsx     # Loading state
│   └── RoadmapView.tsx         # Visual roadmap
│
├── src/lib/                    # Business logic
│   ├── analyzer/               # Analysis service
│   │   ├── index.ts            # Provider selection
│   │   ├── types.ts            # Zod schemas
│   │   ├── demoProvider.ts     # Template logic
│   │   └── realProvider.ts     # Anthropic API
│   └── rateLimit.ts            # Rate limiting
│
├── tests/e2e/                  # Playwright tests
│   └── smoke.spec.ts           # E2E smoke tests
│
├── docs/                       # Documentation
│   ├── PLAN.md                 # Upgrade plan
│   ├── architecture.md         # System design
│   └── security.md             # Security guide
│
└── .github/workflows/          # CI/CD
    └── ci.yml                  # GitHub Actions
```

---

## Usage

### Step 1: Complete the 5-Step Intake Form

1. **Service Background**: Branch, years of service, rank, MOS
2. **Skills & Experience**: Technical skills, certifications, leadership roles
3. **Family Situation**: Status, dependents, spouse employment
4. **Location Preferences**: Current location, relocation willingness
5. **Career Goals**: Career goals, income expectations, education interest, timeline

### Step 2: Submit for Analysis

Click **"Generate Career Pathways"** to analyze your profile.

### Step 3: Review Your Pathways

Receive three personalized career pathways:

- **Fast-Income Path**: Quick entry to workforce, immediate income
- **Balanced Path**: Mix of short-term income and long-term growth
- **Max-Upside Path**: Higher investment for maximum career potential

Each pathway includes:

- 📈 **Income Trajectory**: Year 1, 3, and 5 salary ranges
- 🗺️ **Step-by-Step Roadmap**: Phases with specific action items
- 🎓 **Required Credentials**: Certifications, degrees, licenses (with costs and timelines)
- 👨‍👩‍👧‍👦 **Family Impact**: Time commitment, flexibility, stability assessment
- 💡 **Why This Path**: Personalized reasoning based on your profile

---

## Testing

### Run All Tests

```bash
npm run validate  # Lint + typecheck + test + build
```

### Unit Tests (27 tests)

```bash
npm run test
```

**Coverage**:

- ✅ Zod schema validation
- ✅ Demo provider determinism
- ✅ Provider selection logic
- ✅ Valid result structures

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

**Coverage**:

- ✅ App loads successfully
- ✅ Form submission flow
- ✅ Results display
- ✅ Error handling

---

## CI/CD

GitHub Actions automatically runs on every push and pull request:

- ✅ ESLint (code quality)
- ✅ TypeScript (type checking)
- ✅ Unit tests (Vitest)
- ✅ E2E tests (Playwright)
- ✅ Production build (Demo Mode)

All checks must pass before merging.

---

## Security & Privacy

### Demo Mode (Default)

- ✅ **No external API calls** - all processing is local
- ✅ **No data transmission** to third parties
- ✅ **No PII storage** - stateless architecture
- ✅ **Deterministic results** - same input = same output

### Real Mode (Optional)

- ⚠️ Profile data is sent to Anthropic over HTTPS
- ⚠️ Anthropic's privacy policy applies
- ✅ No data is stored by this application
- ✅ No training on API data (Anthropic policy)

### Rate Limiting

- 10 requests per IP per 15 minutes
- Prevents abuse and DoS attacks
- Returns HTTP 429 with `Retry-After` header

### Input Validation

- Zod schema validation on all requests
- 100KB request size limit
- Field-level error messages
- No stack traces in responses

**See `docs/security.md` for full security documentation.**

---

## Documentation

- [Architecture Guide](docs/architecture.md) - System design, request flow, data models
- [Security Guide](docs/security.md) - Data handling, privacy, compliance
- [Upgrade Plan](docs/PLAN.md) - Fortune-500 upgrade implementation plan

---

## Deployment Options

### Vercel (Recommended)

- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Free tier available

### Other Hosting Providers

Works on any Node.js host:

- **AWS**: Elastic Beanstalk, ECS, Lambda
- **Google Cloud**: App Engine, Cloud Run
- **Azure**: App Service
- **Railway, Render, Fly.io**: One-click deploy
- **Self-hosted**: Docker, VPS (requires Node 20+)

**Build command**: `npm run build`
**Start command**: `npm run start`
**Port**: 3000 (configurable)

---

## Troubleshooting

### App shows "Failed to analyze profile"

**Cause**: This error occurs in Real Mode if the API key is invalid or missing.

**Solution**:

- Verify `ANTHROPIC_API_KEY` is set correctly
- OR remove the key to use Demo Mode

### Tests failing on build

**Cause**: Font fetching may fail in restricted environments.

**Solution**:

```bash
npm run build --no-font-optimization
```

### Rate limit errors (HTTP 429)

**Cause**: Too many requests from your IP.

**Solution**:

- Wait 15 minutes for rate limit to reset
- Or self-host and disable rate limiting

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and add tests
4. **Run validation**: `npm run validate`
5. **Commit**: `git commit -m "feat: your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Open a Pull Request**

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test updates
- `chore:` Tooling/config changes

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/veteran-transition-navigator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/veteran-transition-navigator/discussions)
- **Security**: See `docs/security.md` for reporting vulnerabilities

---

## Acknowledgments

Built for veterans, by developers who care about quality, security, and accessibility.

**Tech Stack**: Next.js, React, TypeScript, Tailwind CSS, Zod, Anthropic Claude
**Testing**: Vitest, Playwright
**CI/CD**: GitHub Actions
**Hosting**: Vercel-ready

---

Made with ❤️ for America's veterans
