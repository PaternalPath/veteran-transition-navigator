# Deployment Guide

## Step-by-Step Deployment to Vercel

### Step 1: Push to GitHub

1. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name your repository (e.g., `veteran-transition-navigator`)
   - Choose "Public" or "Private"
   - Do NOT initialize with README, .gitignore, or license
   - Click "Create repository"

2. Push your code to GitHub:
```bash
# Add the GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/veteran-transition-navigator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in (or sign up)

2. Click "Add New..." → "Project"

3. Import your GitHub repository:
   - If this is your first time, you'll need to connect your GitHub account
   - Find and select your `veteran-transition-navigator` repository
   - Click "Import"

4. Configure your project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variable:
   - Click "Environment Variables"
   - Add a new variable:
     - **Name**: `ANTHROPIC_API_KEY`
     - **Value**: Your Anthropic API key from https://console.anthropic.com/
   - Make sure it's checked for Production, Preview, and Development

6. Click "Deploy"

7. Wait for the deployment to complete (usually 1-2 minutes)

8. Once deployed, you'll receive a URL like: `https://veteran-transition-navigator-xyz.vercel.app`

#### Option B: Via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `veteran-transition-navigator`
   - In which directory is your code located? `./`

5. Add the environment variable:
```bash
vercel env add ANTHROPIC_API_KEY production
```
   - Paste your Anthropic API key when prompted

6. Deploy to production:
```bash
vercel --prod
```

### Step 3: Verify Deployment

1. Visit your deployed URL

2. Test the application:
   - Fill out the 5-step intake form
   - Submit the form
   - Verify that the career pathways are generated correctly

3. If you encounter any errors:
   - Check the Vercel logs: Project → Deployments → Click on deployment → "Logs" tab
   - Verify the `ANTHROPIC_API_KEY` environment variable is set correctly
   - Check the API key has sufficient credits at https://console.anthropic.com/

### Step 4: Configure Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"

2. Add your custom domain:
   - Enter your domain name
   - Follow the instructions to configure DNS records

3. Wait for DNS propagation (can take a few minutes to 48 hours)

## Updating Your Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes to your code locally

2. Commit and push to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push
```

3. Vercel will automatically detect the push and deploy the new version

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for Claude AI access |

## Troubleshooting

### Build Failures

**Issue**: Build fails during deployment
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### API Errors

**Issue**: "Failed to analyze profile" error
**Solution**:
- Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables
- Check API key is valid at https://console.anthropic.com/
- Verify you have available API credits

### Empty or Missing Pathways

**Issue**: API returns empty or malformed data
**Solution**:
- Check Vercel function logs for errors
- Verify the API route is working: visit `your-domain.vercel.app/api/analyze`
- Ensure the Claude API response is being parsed correctly

## Cost Considerations

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth per month
  - Serverless function execution

- **Anthropic API**:
  - Claude Opus 4.5: ~$15 per million input tokens, ~$75 per million output tokens
  - Each analysis uses approximately 500-1000 input tokens and 4000-8000 output tokens
  - Estimated cost per analysis: $0.30-$0.70

## Support

For deployment issues:
- Vercel: https://vercel.com/docs
- Anthropic: https://docs.anthropic.com/

For application issues:
- Open an issue on GitHub
