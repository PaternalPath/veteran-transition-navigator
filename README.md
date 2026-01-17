# Veteran Transition Intelligence Navigator

A Next.js application that helps veterans transition to civilian careers by analyzing their military background, skills, family situation, and goals to generate three personalized career pathways using Claude AI.

## Features

- **5-Step Intake Form**: Comprehensive questionnaire covering service background, skills, family, location, and goals
- **AI-Powered Analysis**: Uses Claude Opus 4.5 to generate intelligent career recommendations
- **Three Career Pathways**:
  - Fast-Income Path: Quick entry to workforce
  - Balanced Path: Mix of short-term income and long-term growth
  - Max-Upside Path: Higher investment for maximum career potential
- **Detailed Results**: Each pathway includes:
  - Income trajectory (Years 1, 3, and 5)
  - Step-by-step roadmap
  - Required credentials with timelines and costs
  - Family impact analysis
  - Personalized recommendations

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Local Development

1. Clone the repository:

```bash
git clone <your-repo-url>
cd veteran-transition-navigator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

4. Add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. In the "Environment Variables" section, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. Add environment variable:

```bash
vercel env add ANTHROPIC_API_KEY
```

5. Deploy to production:

```bash
vercel --prod
```

## Environment Variables

| Variable            | Description                          | Required |
| ------------------- | ------------------------------------ | -------- |
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude AI | Yes      |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude Opus 4.5 via Anthropic SDK
- **Deployment**: Vercel

## Project Structure

```
veteran-transition-navigator/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # API endpoint for Claude integration
│   ├── page.tsx                  # Main page component
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── IntakeForm.tsx            # 5-step intake form
│   └── ResultsDisplay.tsx        # Career pathways display
├── types/
│   └── index.ts                  # TypeScript type definitions
└── public/                       # Static assets
```

## Usage

1. Complete the 5-step intake form:
   - Step 1: Service Background (branch, years, rank, MOS)
   - Step 2: Skills & Experience (technical skills, certifications, leadership)
   - Step 3: Family Situation (status, dependents, spouse employment)
   - Step 4: Location Preferences (current location, relocation willingness)
   - Step 5: Career Goals (goals, income expectations, education interest, timeline)

2. Click "Generate Career Pathways" to analyze your profile

3. Review three personalized career pathways with detailed information

4. Print or save the results as PDF for future reference

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
